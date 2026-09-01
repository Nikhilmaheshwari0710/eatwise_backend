import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ProductsModule } from '../products/products.module';
import { MastersController } from './controllers/masters.controller';
import { MastersService } from './services/masters.service';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [MastersController],
  providers: [MastersService],
})
export class MastersModule {}
