
function parseNum(val: any, fallback: number = 0): number {
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? fallback : num;
  }
  return fallback;
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { Product, ProductDocument } from '../schemas/product.schema';
import {
  ProductCategory,
  ProductCategoryDocument,
} from '../schemas/product-category.schema';
import { SearchProductsQueryDto } from '../dto/search-products-query.dto';
import {
  isValidBarcode,
  toProductDetail,
  toProductListItem,
} from '../utils/product.util';
import { GeminiAnalysisService, GeminiProductResult } from './gemini-analysis.service';
import { getHealthMeta } from '../config/product-masters.config';
import { HighlightType } from '../../../common/constants';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private categoryModel: Model<ProductCategoryDocument>,
    private readonly geminiService: GeminiAnalysisService,
  ) {}

  async analyzeImage(imageBase64: string) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const imageHash = crypto.createHash('md5').update(cleanBase64.slice(0, 10000) + cleanBase64.length).digest('hex');

    // 1. Check DB by imageHash first
    const existingProductByHash = await this.productModel.findOne({
      $or: [{ imageHash }, { barcode: 'HASH_' + imageHash }],
    });

    if (existingProductByHash) {
      const category = await this.categoryModel.findById(existingProductByHash.categoryId);
      const alternatives = await this.resolveAlternatives(existingProductByHash);
      return {
        message: 'Product found in database cache',
        data: toProductDetail(existingProductByHash, category?.name ?? '', alternatives),
        source: 'database_cache',
      };
    }

    // 2. Call Gemini AI
    const aiResult: GeminiProductResult | null = await this.geminiService.analyzeProductImage(imageBase64);

    if (!aiResult) {
      return {
        message: 'AI analysis temporary unavailable. Please retry scan.',
        data: null,
        source: 'error',
      };
    }

    // 3. Non-food detection check
    const isInvalid = aiResult.isFoodProduct === false ||
      (aiResult.name && (aiResult.name.toLowerCase().includes('no food') || aiResult.name.toLowerCase().includes('no product')));

    if (isInvalid) {
      return {
        message: 'No packaged food product detected',
        data: {
          isFoodProduct: false,
          name: aiResult.name || 'No Food Product Image Detected',
          brand: 'Unknown',
          category: 'Unknown',
          healthScore: 0,
        },
        source: 'invalid_image',
      };
    }

    // 4. Check DB by name & brand fuzzy match
    const cleanName = (aiResult.name || '').trim();
    const cleanBrand = (aiResult.brand || '').trim();

    const brandWords = cleanBrand.toLowerCase().split(/\s+/).filter(w => w.length > 2);
    const nameWords = cleanName.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (brandWords.length > 0 && nameWords.length > 0) {
      const regexBrand = brandWords[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regexName = nameWords.slice(0, 4).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

      const existingFuzzyProduct = await this.productModel.findOne({
        brand: { $regex: new RegExp(regexBrand, 'i') },
        name: { $regex: new RegExp(regexName, 'i') },
      });

      if (existingFuzzyProduct) {
        await this.productModel.findByIdAndUpdate((existingFuzzyProduct as any)._id, { imageHash });
        const category = await this.categoryModel.findById(existingFuzzyProduct.categoryId);
        const alternatives = await this.resolveAlternatives(existingFuzzyProduct);
        return {
          message: 'Product found in database',
          data: toProductDetail(existingFuzzyProduct, category?.name ?? '', alternatives),
          source: 'database',
        };
      }
    }

    // 5. Create new product in DB with imageHash & imageUrl
    let category = await this.categoryModel.findOne({
      name: { $regex: new RegExp('^' + (aiResult.category || 'General').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
    });

    if (!category) {
      const categoryName = aiResult.category || 'General Snacks';
      const categorySlug =
        categoryName
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'general-snacks';

      category = await this.categoryModel.create({
        name: categoryName,
        slug: categorySlug,
      });
    }

    let ingredientsStr = '';
    if (Array.isArray(aiResult.ingredients)) {
      ingredientsStr = aiResult.ingredients.join(', ');
    } else if (typeof aiResult.ingredients === 'string') {
      ingredientsStr = aiResult.ingredients;
    }

    const rawHighlights = Array.isArray(aiResult.highlights) ? aiResult.highlights : [];
    const validHighlights = rawHighlights.map((h: any) => {
      let label = '';
      let detail = '';
      let type = HighlightType.WARNING;
      if (typeof h === 'string') {
        label = h;
        detail = h;
      } else if (typeof h === 'object' && h !== null) {
        label = h.label || h.text || h.title || 'Highlight';
        detail = h.detail || h.description || h.text || label;
        if (h.type === 'good' || h.type === 'success') type = HighlightType.SUCCESS;
        else if (h.type === 'danger') type = HighlightType.DANGER;
        else if (h.type === 'warning' || h.type === 'moderate') type = HighlightType.WARNING;
        else if (h.type === 'info') type = HighlightType.INFO;
      }
      return { label, detail, type };
    }).filter(h => h.label && h.detail);

    const dataUri = imageBase64.startsWith('data:') ? imageBase64 : 'data:image/jpeg;base64,' + imageBase64;
    const generatedBarcode = '890' + Math.floor(1000000000 + Math.random() * 9000000000);

    const createdProduct: any = await this.productModel.create({
      barcode: generatedBarcode,
      name: aiResult.name || 'Scanned Product',
      brand: aiResult.brand || 'Generic',
      categoryId: category._id,
      imageUrl: dataUri,
      imageHash: imageHash,
      netWeight: aiResult.netWeight || '—',
      servingSize: aiResult.servingSize || '20g (1.6 tbsp)',
      servingsPerPack: aiResult.servingsPerPack || '1',
      healthScore: aiResult.healthScore ?? 5.0,
      isVeg: aiResult.isVeg ?? true,
      ingredients: ingredientsStr,
      allergens: Array.isArray(aiResult.allergens) ? aiResult.allergens : [],
      nutritionPer100g: {
        calories: parseNum(aiResult.nutritionPer100g?.calories ?? (aiResult.nutritionPer100g as any)?.energy, 425),
        protein: parseNum(aiResult.nutritionPer100g?.protein, 5.8),
        carbohydrates: parseNum(aiResult.nutritionPer100g?.carbohydrates ?? (aiResult.nutritionPer100g as any)?.carbs, 76.5),
        fat: parseNum(aiResult.nutritionPer100g?.fat, 10.2),
        saturatedFat: parseNum(aiResult.nutritionPer100g?.saturatedFat, 6.8),
        fiber: parseNum(aiResult.nutritionPer100g?.fiber, 2.5),
        sugar: parseNum(aiResult.nutritionPer100g?.sugar ?? (aiResult.nutritionPer100g as any)?.totalSugar, 54.0),
        sodium: parseNum(aiResult.nutritionPer100g?.sodium, 140),
      },
      highlights: validHighlights,
      suitableFor: (aiResult.suitableFor && typeof aiResult.suitableFor === 'object' && !Array.isArray(aiResult.suitableFor)) ? { toddler: Boolean(aiResult.suitableFor.toddler ?? false), child: Boolean(aiResult.suitableFor.child ?? true), adult: Boolean(aiResult.suitableFor.adult ?? true) } : { toddler: false, child: true, adult: true },
      alternatives: [],
    } as any);

    const formattedAlternatives = (aiResult.alternatives && Array.isArray(aiResult.alternatives) && aiResult.alternatives.length > 0)
      ? aiResult.alternatives.map((alt, idx) => ({
          productId: 'alt_' + (createdProduct._id ? createdProduct._id.toString() : Date.now()) + '_' + idx,
          name: alt.name,
          brand: alt.brand,
          healthScore: alt.healthScore,
          reason: alt.reason,
          imageUrl: alt.imageUrl,
          isAffiliate: false,
        }))
      : [];

    return {
      message: 'Product analyzed and saved to database successfully',
      data: {
        ...toProductDetail(createdProduct, category.name, formattedAlternatives),
        alternatives: formattedAlternatives,
      },
      source: 'ai_analysis',
    };
  }

  async getByBarcode(barcode: string) {
    const product = await this.productModel.findOne({ barcode });
    if (!product) {
      throw new NotFoundException('Product not found for barcode: ' + barcode);
    }
    const category = await this.categoryModel.findById(product.categoryId);
    const alternatives = await this.resolveAlternatives(product);

    return {
      message: 'Product fetched successfully',
      data: toProductDetail(product, category?.name ?? '', alternatives),
    };
  }

  async search(query: SearchProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: Record<string, unknown> = {};

    if (query.q) {
      const searchRegex = new RegExp(query.q, 'i');
      filter.$or = [{ name: searchRegex }, { brand: searchRegex }, { barcode: searchRegex }];
    }

    if (query.category) {
      if (Types.ObjectId.isValid(query.category)) {
        filter.categoryId = new Types.ObjectId(query.category);
      } else {
        const catObj = await this.categoryModel.findOne({ name: new RegExp(query.category, 'i') });
        if (catObj) {
          filter.categoryId = catObj._id;
        }
      }
    }

    const total = await this.productModel.countDocuments(filter);
    const products = await this.productModel
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const categories = await this.categoryModel.find();
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

    return {
      message: 'Products searched successfully',
      data: {
        products: products.map((product) =>
          toProductListItem(product, categoryMap.get(product.categoryId.toString())),
        ),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 0,
        },
      },
    };
  }

  async getCategories() {
    const categories = await this.categoryModel.find().sort({ name: 1 });
    const counts = await Promise.all(
      categories.map(async (category) => ({
        id: category._id.toString(),
        name: category.name,
        productCount: await this.productModel.countDocuments({ categoryId: category._id }),
      })),
    );

    return {
      message: 'Categories fetched successfully',
      data: { categories: counts },
    };
  }

  async findById(productId: string): Promise<ProductDocument | null> {
    if (!Types.ObjectId.isValid(productId)) {
      return null;
    }
    return this.productModel.findById(productId);
  }

  private async resolveAlternatives(product: ProductDocument) {
    if (!product.alternatives?.length) {
      return [];
    }

    const altIds = product.alternatives.map((alt) => alt.productId);
    const altProducts = await this.productModel.find({ _id: { $in: altIds } });
    const altMap = new Map(altProducts.map((p) => [p._id.toString(), p]));

    return product.alternatives
      .map((alt) => {
        const altProduct = altMap.get(alt.productId.toString());
        if (!altProduct) return null;

        return {
          productId: altProduct._id.toString(),
          name: altProduct.name,
          brand: altProduct.brand,
          healthScore: altProduct.healthScore,
          imageUrl: altProduct.imageUrl,
          isAffiliate: alt.isAffiliate,
          affiliateUrl: alt.affiliateUrl,
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      name: string;
      brand: string;
      healthScore: number;
      imageUrl?: string;
      isAffiliate: boolean;
      affiliateUrl?: string;
    }>;
  }
}
