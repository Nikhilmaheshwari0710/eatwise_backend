import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { NotificationsService } from '../services/notifications.service';
import { GetNotificationsQueryDto } from '../dto/get-notifications-query.dto';
import { UpdateNotificationSettingsDto } from '../dto/update-notification-settings.dto';
import { RegisterPushTokenDto } from '../dto/register-push-token.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Notifications list returned' })
  async getNotifications(
    @CurrentUser('id') userId: string,
    @Query() query: GetNotificationsQueryDto,
  ) {
    return this.notificationsService.getNotifications(userId, query);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get notification preference settings' })
  @ApiResponse({ status: 200, description: 'Notification settings returned' })
  async getSettings(@CurrentUser('id') userId: string) {
    return this.notificationsService.getSettings(userId);
  }

  @Put('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateNotificationSettingsDto,
  ) {
    return this.notificationsService.updateSettings(userId, dto);
  }

  @Post('push-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register device push notification token' })
  @ApiResponse({ status: 200, description: 'Push token registered' })
  async registerPushToken(
    @CurrentUser('id') userId: string,
    @Body() dto: RegisterPushTokenDto,
  ) {
    return this.notificationsService.registerPushToken(userId, dto);
  }

  @Put('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications cleared' })
  async clearAll(@CurrentUser('id') userId: string) {
    return this.notificationsService.clearAll(userId);
  }

  @Put(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.markAsRead(userId, notificationId);
  }

  @Delete(':notificationId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a single notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(
    @CurrentUser('id') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(userId, notificationId);
  }
}
