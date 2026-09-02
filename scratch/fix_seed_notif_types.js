const fs = require('fs');
const file = 'c:/Users/Darshan/eatwise_backend/src/database/seeds/seed.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("type: 'GROWTH_MILESTONE'", "type: 'growth_milestone'");
content = content.replace("type: 'HEALTH_ALERT'", "type: 'health_alert'");
content = content.replace("type: 'AI_TIP'", "type: 'ai_tip'");
content = content.replace("type: 'WEEKLY_REPORT'", "type: 'weekly_report'");

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Updated seed.ts to use valid lowercase NotificationType enum values!');
