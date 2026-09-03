import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Product, ProductSchema } from './schemas/product.schema';
import {
  ProductCategory,
  ProductCategorySchema,
} from './schemas/product-category.schema';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { ProductSeedService } from './services/product-seed.service';
import { GeminiAnalysisService } from './services/gemini-analysis.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductSeedService, GeminiAnalysisService],
  exports: [ProductsService],
})
export class ProductsModule {}
