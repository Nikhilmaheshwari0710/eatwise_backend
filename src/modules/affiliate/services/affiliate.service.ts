import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import { AffiliatePlatformId, AffiliateTransactionStatus } from '../../../common/constants';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { getAffiliatePlatform } from '../config/affiliate.config';
import { EnrollAffiliateDto } from '../dto/enroll-affiliate.dto';
import { GenerateAffiliateLinkDto } from '../dto/generate-affiliate-link.dto';
import { TrackAffiliateClickDto } from '../dto/track-affiliate-click.dto';
import { UpdateBankDetailsDto } from '../dto/update-bank-details.dto';
import {
  AffiliateProfile,
  AffiliateProfileDocument,
} from '../schemas/affiliate-profile.schema';
import {
  AffiliatePlatformConnection,
  AffiliatePlatformConnectionDocument,
} from '../schemas/affiliate-platform-connection.schema';
import {
  AffiliateGeneratedLink,
  AffiliateGeneratedLinkDocument,
} from '../schemas/affiliate-generated-link.schema';
import { AffiliateClick, AffiliateClickDocument } from '../schemas/affiliate-click.schema';
import {
  AffiliateTransaction,
  AffiliateTransactionDocument,
} from '../schemas/affiliate-transaction.schema';
import {
  buildGeneratedLink,
  buildPagination,
  buildShortCode,
  calculateConversionRate,
  formatDateOnly,
  generateAffiliateId,
  getLastPaidDate,
  getNextPayoutDate,
  getPlatformsResponse,
  getThisMonthEarnings,
  isBankLinked,
  roundCurrency,
  sumEarningsByStatus,
  toPlatformConnectionResponse,
  toTransactionResponse,
} from '../utils/affiliate.util';

@Injectable()
export class AffiliateService {
  constructor(
    @InjectModel(AffiliateProfile.name)
    private profileModel: Model<AffiliateProfileDocument>,
    @InjectModel(AffiliatePlatformConnection.name)
    private connectionModel: Model<AffiliatePlatformConnectionDocument>,
    @InjectModel(AffiliateGeneratedLink.name)
    private linkModel: Model<AffiliateGeneratedLinkDocument>,
    @InjectModel(AffiliateClick.name)
    private clickModel: Model<AffiliateClickDocument>,
    @InjectModel(AffiliateTransaction.name)
    private transactionModel: Model<AffiliateTransactionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  getPlatforms() {
    return {
      message: 'Platforms fetched successfully.',
      data: { platforms: getPlatformsResponse() },
    };
  }

  async getProfile(userId: string) {
    await this.getActiveUser(userId);
    const userObjectId = new Types.ObjectId(userId);

    const [profile, connections, transactions] = await Promise.all([
      this.profileModel.findOne({ userId: userObjectId }),
      this.connectionModel.find({ userId: userObjectId }),
      this.transactionModel.find({ userId: userObjectId }),
    ]);

    if (!profile?.isEnrolled) {
      return {
        message: 'Affiliate profile fetched successfully.',
        data: {
          userId,
          affiliateId: null,
          isEnrolled: false,
          totalEarnings: 0,
          pendingEarnings: 0,
          paidEarnings: 0,
          totalClicks: 0,
          totalOrders: 0,
          conversionRate: 0,
          thisMonthEarnings: 0,
          lastPaidDate: null,
          nextPayoutDate: formatDateOnly(getNextPayoutDate()),
          bankLinked: false,
          connectedPlatforms: [],
        },
      };
    }

    const totalEarnings = roundCurrency(
      transactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    );
    const pendingEarnings = sumEarningsByStatus(
      transactions,
      AffiliateTransactionStatus.PENDING,
    );
    const paidEarnings = sumEarningsByStatus(transactions, AffiliateTransactionStatus.PAID);

    return {
      message: 'Affiliate profile fetched successfully.',
      data: {
        userId,
        affiliateId: profile.affiliateId,
        isEnrolled: profile.isEnrolled,
        totalEarnings,
        pendingEarnings,
        paidEarnings,
        totalClicks: profile.totalClicks,
        totalOrders: profile.totalOrders,
        conversionRate: calculateConversionRate(profile.totalOrders, profile.totalClicks),
        thisMonthEarnings: getThisMonthEarnings(transactions),
        lastPaidDate: getLastPaidDate(transactions),
        nextPayoutDate: formatDateOnly(getNextPayoutDate()),
        bankLinked: isBankLinked(profile.bankDetails),
        connectedPlatforms: connections.map(toPlatformConnectionResponse),
      },
    };
  }

  async enroll(userId: string, dto: EnrollAffiliateDto) {
    if (!dto.agreedToTerms) {
      throw new BadRequestException('You must agree to the terms to enroll');
    }

    const user = await this.getActiveUser(userId);
    const userObjectId = user._id;

    const existing = await this.profileModel.findOne({ userId: userObjectId });
    if (existing?.isEnrolled) {
      throw new ConflictException('You are already enrolled in the affiliate program');
    }

    if (!getAffiliatePlatform(dto.preferredPlatform)) {
      throw new BadRequestException('Invalid platform selected');
    }

    const enrolledAt = new Date();
    const affiliateId = generateAffiliateId();

    const profile = await this.profileModel.findOneAndUpdate(
      { userId: userObjectId },
      {
        userId: userObjectId,
        affiliateId,
        isEnrolled: true,
        enrolledAt,
        agreedToTerms: true,
        preferredPlatform: dto.preferredPlatform,
      },
      { upsert: true, returnDocument: 'after' },
    );

    await this.connectionModel.findOneAndUpdate(
      { userId: userObjectId, platformId: dto.preferredPlatform },
      {
        userId: userObjectId,
        platformId: dto.preferredPlatform,
        affiliateTag: dto.affiliateTag.trim(),
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return {
      message: 'You are now enrolled in the EatWise Affiliate Program!',
      data: {
        affiliateId: profile!.affiliateId,
        enrolledAt: profile!.enrolledAt,
      },
    };
  }

  async generateLink(userId: string, dto: GenerateAffiliateLinkDto) {
    const userObjectId = new Types.ObjectId(userId);
    const profile = await this.profileModel.findOne({ userId: userObjectId });

    if (!profile?.isEnrolled) {
      throw new BadRequestException('Enroll in the affiliate program before generating links');
    }

    const platform = getAffiliatePlatform(dto.platformId);
    if (!platform) {
      throw new BadRequestException('Invalid platform selected');
    }

    const affiliateTag = dto.affiliateTag.trim();
    const generatedLink = buildGeneratedLink(dto.platformId, affiliateTag, dto.productUrl);
    const shortCode = buildShortCode(affiliateTag, userId);
    const shortLinkBase =
      this.configService.get<string>('affiliate.shortLinkBase') || 'https://eatwise.link';
    const shortLink = `${shortLinkBase.replace(/\/$/, '')}/a/${shortCode}`;

    await this.connectionModel.findOneAndUpdate(
      { userId: userObjectId, platformId: dto.platformId },
      {
        userId: userObjectId,
        platformId: dto.platformId,
        affiliateTag,
        isVerified: true,
      },
      { upsert: true, returnDocument: 'after' },
    );

    const link = await this.linkModel.findOneAndUpdate(
      { userId: userObjectId, platformId: dto.platformId, affiliateTag },
      {
        userId: userObjectId,
        platformId: dto.platformId,
        affiliateTag,
        generatedLink,
        shortLink,
        shortCode,
        productUrl: dto.productUrl,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    );

    return {
      message: 'Affiliate link generated successfully.',
      data: {
        generatedLink: link!.generatedLink,
        shortLink: link!.shortLink,
        platformId: link!.platformId,
        affiliateTag: link!.affiliateTag,
        createdAt: link!.createdAt,
      },
    };
  }

  async trackClick(dto: TrackAffiliateClickDto) {
    const link = await this.linkModel.findOne({ shortLink: dto.shortLink });
    if (!link) {
      throw new NotFoundException('Affiliate link not found');
    }

    await this.clickModel.create({
      linkId: link._id,
      shortLink: dto.shortLink,
      source: dto.source,
      deviceType: dto.deviceType,
    });

    await this.profileModel.updateOne(
      { userId: link.userId },
      { $inc: { totalClicks: 1 } },
    );

    await this.connectionModel.updateOne(
      { userId: link.userId, platformId: link.platformId },
      { $inc: { totalClicks: 1 } },
    );

    return { message: 'Click tracked.' };
  }

  async getTransactions(
    userId: string,
    page = 1,
    limit = 20,
    platformId?: AffiliatePlatformId,
    status?: AffiliateTransactionStatus,
  ) {
    await this.getActiveUser(userId);

    const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
    if (platformId) filter.platformId = platformId;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      this.transactionModel
        .find(filter)
        .sort({ periodStart: -1 })
        .skip(skip)
        .limit(limit),
      this.transactionModel.countDocuments(filter),
    ]);

    return {
      message: 'Transactions fetched successfully.',
      data: {
        transactions: transactions.map(toTransactionResponse),
        pagination: buildPagination(total, page, limit),
      },
    };
  }

  async updateBankDetails(userId: string, dto: UpdateBankDetailsDto) {
    const userObjectId = new Types.ObjectId(userId);
    const profile = await this.profileModel.findOne({ userId: userObjectId });

    if (!profile?.isEnrolled) {
      throw new BadRequestException('Enroll in the affiliate program before saving bank details');
    }

    profile.bankDetails = {
      accountHolderName: dto.accountHolderName.trim(),
      bankName: dto.bankName.trim(),
      accountNumber: dto.accountNumber.trim(),
      ifscCode: dto.ifscCode.trim().toUpperCase(),
      upiId: dto.upiId?.trim(),
    };
    await profile.save();

    return { message: 'Bank details saved successfully.' };
  }

  private async getActiveUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
