import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { Scan, ScanSchema } from './schemas/scan.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { Child, ChildSchema } from '../children/schemas/child.schema';
import { ScansController } from './controllers/scans.controller';
import { ScansService } from './services/scans.service';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    MongooseModule.forFeature([
      { name: Scan.name, schema: ScanSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Child.name, schema: ChildSchema },
    ]),
  ],
  controllers: [ScansController],
  providers: [ScansService],
})
export class ScansModule {}
