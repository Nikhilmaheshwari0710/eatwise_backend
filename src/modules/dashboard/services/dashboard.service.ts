import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { Child, ChildDocument } from '../../children/schemas/child.schema';
import { Notification, NotificationDocument } from '../../notifications/schemas/notification.schema';
import { Scan, ScanDocument } from '../../scans/schemas/scan.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { NotificationType } from '../../../common/constants';
import { resolveAvatarUrl } from '../../profile/utils/profile.util';
import {
  calculateAgeDisplay,
  resolveChildAvatarUrl,
} from '../../children/utils/child.util';
import { NOTIFICATION_TYPE_META } from '../../notifications/config/notification.config';
import {
  deriveChildStatus,
  formatActivityTimestamp,
  formatChildDetails,
  formatGrowthValue,
  formatTodayDate,
  formatTodayDay,
  truncatePreview,
} from '../utils/dashboard.util';

const RECENT_ACTIVITY_LIMIT = 10;
const DASHBOARD_ACTIVITY_NOTIFICATION_TYPES = [
  NotificationType.WEEKLY_REPORT,
  NotificationType.MONTHLY_REPORT,
  NotificationType.AI_TIP,
];

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(Scan.name) private scanModel: Model<ScanDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private configService: ConfigService,
  ) {}

  async getDashboard(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException();
    }

    const cdnBaseUrl = this.getCdnBaseUrl();
    const [children, unreadCount, recentActivity] = await Promise.all([
      this.childModel
        .find({ parentId: new Types.ObjectId(userId) })
        .sort({ createdAt: 1 }),
      this.notificationModel.countDocuments({
        userId: new Types.ObjectId(userId),
        isRead: false,
      }),
      this.buildRecentActivity(userId),
    ]);

    return {
      message: 'Dashboard fetched successfully',
      data: {
        user: {
          userId: user._id.toString(),
          name: user.fullName,
          avatarUrl: resolveAvatarUrl(user, cdnBaseUrl),
          avatarPresetId: user.avatarPresetId ?? null,
        },
        todayDate: formatTodayDate(),
        todayDay: formatTodayDay(),
        notificationUnreadCount: unreadCount,
        children: children.map((child) => this.toDashboardChild(child, cdnBaseUrl)),
        recentActivity,
      },
    };
  }

  private toDashboardChild(child: ChildDocument, cdnBaseUrl: string) {
    const latestGrowth = child.growthRecords?.length
      ? child.growthRecords[child.growthRecords.length - 1]
      : undefined;
    const ageDisplay = calculateAgeDisplay(child.dateOfBirth);

    return {
      id: child._id.toString(),
      name: child.name,
      details: formatChildDetails(child, ageDisplay),
      status: deriveChildStatus(child),
      weight: formatGrowthValue(latestGrowth?.weight, latestGrowth?.weightUnit) ?? null,
      height: formatGrowthValue(latestGrowth?.height, latestGrowth?.heightUnit) ?? null,
      avatarUrl: resolveChildAvatarUrl(child, cdnBaseUrl) ?? null,
      avatarPresetId: child.avatarPresetId ?? null,
    };
  }

  private async buildRecentActivity(userId: string) {
    const [scans, notifications] = await Promise.all([
      this.scanModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ scannedAt: -1 })
        .limit(RECENT_ACTIVITY_LIMIT),
      this.notificationModel
        .find({
          userId: new Types.ObjectId(userId),
          type: { $in: DASHBOARD_ACTIVITY_NOTIFICATION_TYPES },
        })
        .sort({ createdAt: -1 })
        .limit(RECENT_ACTIVITY_LIMIT),
    ]);

    const productIds = [...new Set(scans.map((scan) => scan.productId.toString()))];
    const products = await this.productModel.find({
      _id: { $in: productIds.map((id) => new Types.ObjectId(id)) },
    });
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    const scanActivities = scans.map((scan) => {
      const product = productMap.get(scan.productId.toString());

      return {
        id: scan._id.toString(),
        icon: 'scan',
        title: product ? `Scanned ${product.name}` : 'Scanned product',
        timestamp: formatActivityTimestamp(scan.scannedAt),
        badge: product ? `${product.healthScore}/10` : null,
        tint: '#FFF0EA',
        isPdf: false,
        previewText: null,
        sortAt: scan.scannedAt,
      };
    });

    const notificationActivities = notifications.map((notification) => {
      const meta = NOTIFICATION_TYPE_META[notification.type];
      const isReport =
        notification.type === NotificationType.WEEKLY_REPORT ||
        notification.type === NotificationType.MONTHLY_REPORT;

      return {
        id: notification._id.toString(),
        icon: notification.type === NotificationType.AI_TIP ? 'ai' : 'report',
        title: notification.title,
        timestamp: formatActivityTimestamp(notification.createdAt ?? new Date()),
        badge: null,
        tint: meta.tint,
        isPdf: isReport,
        previewText:
          notification.type === NotificationType.AI_TIP
            ? truncatePreview(notification.message)
            : null,
        sortAt: notification.createdAt ?? new Date(),
      };
    });

    return [...scanActivities, ...notificationActivities]
      .sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime())
      .slice(0, RECENT_ACTIVITY_LIMIT)
      .map(({ sortAt, ...activity }) => activity);
  }

  private getCdnBaseUrl(): string {
    return (
      this.configService.get<string>('avatar.cdnBaseUrl') || 'https://cdn.eatwise.app'
    );
  }
}
