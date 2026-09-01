import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../schemas/product.schema';
import { ProductCategory, ProductCategoryDocument } from '../schemas/product-category.schema';
import { PRODUCT_CATEGORIES } from '../config/product-masters.config';
import { PRODUCT_SEED_DATA } from '../data/product-seed.data';

@Injectable()
export class ProductSeedService implements OnModuleInit {
  private readonly logger = new Logger(ProductSeedService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private categoryModel: Model<ProductCategoryDocument>,
  ) {}

  async onModuleInit() {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      await this.seed();
    }
  }

  async seed() {
    const categoryMap = new Map<string, ProductCategoryDocument>();

    for (const category of PRODUCT_CATEGORIES) {
      const doc = await this.categoryModel.findOneAndUpdate(
        { slug: category.slug },
        { name: category.name, slug: category.slug },
        { upsert: true, returnDocument: 'after' },
      );
      categoryMap.set(category.slug, doc);
    }

    const barcodeToId = new Map<string, Types.ObjectId>();

    for (const item of PRODUCT_SEED_DATA) {
      const category = categoryMap.get(item.categorySlug);
      if (!category) continue;

      const product = await this.productModel.findOneAndUpdate(
        { barcode: item.barcode },
        {
          barcode: item.barcode,
          name: item.name,
          brand: item.brand,
          categoryId: category._id,
          imageUrl: item.imageUrl,
          netWeight: item.netWeight,
          healthScore: item.healthScore,
          isVeg: item.isVeg,
          servingSize: item.servingSize,
          ingredients: item.ingredients,
          allergens: item.allergens,
          nutritionPer100g: item.nutritionPer100g,
          highlights: item.highlights,
          suitableFor: item.suitableFor,
          alternatives: [],
        },
        { upsert: true, returnDocument: 'after' },
      );

      barcodeToId.set(item.barcode, product._id);
    }

    for (const item of PRODUCT_SEED_DATA) {
      if (!item.alternativeBarcodes?.length) continue;

      const product = await this.productModel.findOne({ barcode: item.barcode });
      if (!product) continue;

      product.alternatives = item.alternativeBarcodes
        .map((barcode) => {
          const altId = barcodeToId.get(barcode);
          if (!altId) return null;

          const altSeed = PRODUCT_SEED_DATA.find((seed) => seed.barcode === barcode);
          return {
            productId: altId,
            isAffiliate: altSeed?.isAffiliate ?? false,
            affiliateUrl: altSeed?.affiliateUrl,
          };
        })
        .filter(Boolean) as ProductDocument['alternatives'];

      await product.save();
    }

    this.logger.log(
      `Seeded ${PRODUCT_SEED_DATA.length} products and ${PRODUCT_CATEGORIES.length} categories`,
    );
  }
}
