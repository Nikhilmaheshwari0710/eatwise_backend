const fs = require('fs');

// 1. Update app.module.ts default limit
const appModFile = 'c:/Users/Darshan/eatwise_backend/src/app.module.ts';
let appMod = fs.readFileSync(appModFile, 'utf8');

appMod = appMod.replace(
  "limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),",
  "limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),"
);

fs.writeFileSync(appModFile, appMod, 'utf8');
console.log('✅ 1. app.module.ts THROTTLE_LIMIT default increased to 100');

// 2. Update .env file if it contains THROTTLE_LIMIT
const envFile = 'c:/Users/Darshan/eatwise_backend/.env';
if (fs.existsSync(envFile)) {
  let env = fs.readFileSync(envFile, 'utf8');
  if (env.includes('THROTTLE_LIMIT')) {
    env = env.replace(/THROTTLE_LIMIT=\d+/g, 'THROTTLE_LIMIT=100');
  } else {
    env += '\nTHROTTLE_LIMIT=100\n';
  }
  fs.writeFileSync(envFile, env, 'utf8');
  console.log('✅ 2. .env file THROTTLE_LIMIT set to 100');
}
