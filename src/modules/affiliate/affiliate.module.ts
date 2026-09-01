import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AffiliateController } from './controllers/affiliate.controller';
import { AffiliateService } from './services/affiliate.service';
import {
  AffiliateProfile,
  AffiliateProfileSchema,
} from './schemas/affiliate-profile.schema';
import {
  AffiliatePlatformConnection,
  AffiliatePlatformConnectionSchema,
} from './schemas/affiliate-platform-connection.schema';
import {
  AffiliateGeneratedLink,
  AffiliateGeneratedLinkSchema,
} from './schemas/affiliate-generated-link.schema';
import { AffiliateClick, AffiliateClickSchema } from './schemas/affiliate-click.schema';
import {
  AffiliateTransaction,
  AffiliateTransactionSchema,
} from './schemas/affiliate-transaction.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AffiliateProfile.name, schema: AffiliateProfileSchema },
      { name: AffiliatePlatformConnection.name, schema: AffiliatePlatformConnectionSchema },
      { name: AffiliateGeneratedLink.name, schema: AffiliateGeneratedLinkSchema },
      { name: AffiliateClick.name, schema: AffiliateClickSchema },
      { name: AffiliateTransaction.name, schema: AffiliateTransactionSchema },
    ]),
  ],
  controllers: [AffiliateController],
  providers: [AffiliateService],
  exports: [AffiliateService],
})
export class AffiliateModule {}
