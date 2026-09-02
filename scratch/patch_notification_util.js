const fs = require('fs');
const file = 'c:/Users/Darshan/eatwise_backend/src/modules/notifications/utils/notification.util.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'const meta = NOTIFICATION_TYPE_META[notification.type];',
  'const meta = NOTIFICATION_TYPE_META[notification.type as keyof typeof NOTIFICATION_TYPE_META] ?? {\n    icon: "bell",\n    tint: "#FFF0EA",\n    iconColor: "#FF521B",\n  };'
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Patched toNotificationResponse fallback in backend!');
