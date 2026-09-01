import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import {
  NotificationSettings,
  NotificationSettingsSchema,
} from './schemas/notification-settings.schema';
import { PushToken, PushTokenSchema } from './schemas/push-token.schema';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationSettings.name, schema: NotificationSettingsSchema },
      { name: PushToken.name, schema: PushTokenSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
