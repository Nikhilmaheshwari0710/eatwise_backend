import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import {
  ProductCategory,
  ProductCategorySchema,
} from './schemas/product-category.schema';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { ProductSeedService } from './services/product-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ProductSeedService],
  exports: [ProductsService],
})
export class ProductsModule {}
