import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(ProductCategory.name)
    private categoryModel: Model<ProductCategoryDocument>,
  ) {}

  async getByBarcode(barcode: string) {
    if (!isValidBarcode(barcode)) {
      throw new BadRequestException('Invalid barcode format');
    }

    const product = await this.productModel.findOne({ barcode });
    if (!product) {
      throw new NotFoundException(`Product not found for barcode: ${barcode}`);
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
    const limit = query.limit ?? 20;
    const searchTerm = query.q.trim();

    if (!searchTerm) {
      throw new BadRequestException('Search query is required');
    }

    const mongoFilter: Record<string, unknown> = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { brand: { $regex: searchTerm, $options: 'i' } },
        { barcode: searchTerm },
      ],
    };

    if (query.isVeg !== undefined) {
      mongoFilter.isVeg = query.isVeg;
    }

    if (query.category) {
      const category = await this.categoryModel.findOne({
        name: { $regex: `^${query.category}$`, $options: 'i' },
      });
      if (category) {
        mongoFilter.categoryId = category._id;
      } else {
        return {
          message: 'Products fetched successfully',
          data: {
            products: [],
            pagination: { total: 0, page, limit, totalPages: 0 },
          },
        };
      }
    }

    const [total, products] = await Promise.all([
      this.productModel.countDocuments(mongoFilter),
      this.productModel
        .find(mongoFilter)
        .sort({ healthScore: -1, name: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    const categoryIds = [...new Set(products.map((p) => p.categoryId.toString()))];
    const categories = await this.categoryModel.find({
      _id: { $in: categoryIds.map((id) => new Types.ObjectId(id)) },
    });
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

    return {
      message: 'Products fetched successfully',
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
