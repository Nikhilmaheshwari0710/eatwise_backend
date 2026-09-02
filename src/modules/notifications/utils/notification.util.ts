import { NotificationDocument } from '../schemas/notification.schema';
import {
  NOTIFICATION_TYPE_META,
  formatTimeAgo,
} from '../config/notification.config';

export function toNotificationResponse(notification: NotificationDocument) {
  const meta = NOTIFICATION_TYPE_META[notification.type as keyof typeof NOTIFICATION_TYPE_META] ?? {
    icon: "bell",
    tint: "#FFF0EA",
    iconColor: "#FF521B",
  };

  return {
    notificationId: notification._id.toString(),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    icon: meta.icon,
    tint: meta.tint,
    iconColor: meta.iconColor,
    childId: notification.childId?.toString() ?? null,
    childName: notification.childName ?? null,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    timeAgo: notification.createdAt ? formatTimeAgo(notification.createdAt) : null,
    actionUrl: notification.actionUrl ?? null,
  };
}
