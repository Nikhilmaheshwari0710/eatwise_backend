import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './modules/email/email.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ChildrenModule } from './modules/children/children.module';
import { AccountModule } from './modules/account/account.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductsModule } from './modules/products/products.module';
import { ScansModule } from './modules/scans/scans.module';
import { MastersModule } from './modules/masters/masters.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CommunityModule } from './modules/community/community.module';
import { AffiliateModule } from './modules/affiliate/affiliate.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    }]),
    DatabaseModule,
    EmailModule,
    AuthModule,
    ProfileModule,
    ChildrenModule,
    AccountModule,
    NotificationsModule,
    ProductsModule,
    ScansModule,
    MastersModule,
    DashboardModule,
    CommunityModule,
    AffiliateModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
