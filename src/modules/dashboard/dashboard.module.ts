import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Child, ChildSchema } from '../children/schemas/child.schema';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';
import { Scan, ScanSchema } from '../scans/schemas/scan.schema';
import { Product, ProductSchema } from '../products/schemas/product.schema';
import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Child.name, schema: ChildSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: Scan.name, schema: ScanSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
