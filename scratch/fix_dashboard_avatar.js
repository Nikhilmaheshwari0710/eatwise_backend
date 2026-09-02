const fs = require('fs');

// ── 1. DashboardData.ts: add userAvatarPresetId & userAvatarUrl ──
const dataFile = 'd:/backup project/eatwise/eatwise_app/src/features/home/domain/entities/DashboardData.ts';
let data = fs.readFileSync(dataFile, 'utf8');
data = data.replace(
  'export interface DashboardData {',
  'export interface DashboardData {\n  userAvatarPresetId?: string | null;\n  userAvatarUrl?: string | null;'
);
fs.writeFileSync(dataFile, data, 'utf8');
console.log('1. DashboardData.ts updated');

// ── 2. DashboardRemoteDataSource.ts: pass user avatar in normalizeDashboard ──
const dsFile = 'd:/backup project/eatwise/eatwise_app/src/features/home/data/datasources/DashboardRemoteDataSource.ts';
let ds = fs.readFileSync(dsFile, 'utf8');

// Add to normalizeDashboard return
ds = ds.replace(
  'return {\n    dateLabel: raw.todayDate ?? \'\',\n    formattedDate: raw.todayDate ?? \'\',\n    dayOfWeek: raw.todayDay ?? \'\',\n    notificationUnreadCount: raw.notificationUnreadCount ?? 0,',
  'return {\n    dateLabel: raw.todayDate ?? \'\',\n    formattedDate: raw.todayDate ?? \'\',\n    dayOfWeek: raw.todayDay ?? \'\',\n    notificationUnreadCount: raw.notificationUnreadCount ?? 0,\n    userAvatarPresetId: raw.user?.avatarPresetId ?? null,\n    userAvatarUrl: raw.user?.avatarUrl ?? null,'
);
fs.writeFileSync(dsFile, ds, 'utf8');
console.log('2. DashboardRemoteDataSource.ts updated');

// ── 3. HomeScreen.tsx: replace hardcoded parent_ritika.png with dynamic avatar ──
const homeFile = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let home = fs.readFileSync(homeFile, 'utf8');

// Add PARENT_AVATAR_MAP after imports (before component definition)
// Find a good insertion point - after the last import
const AVATAR_MAP_CODE = `
// Parent avatar preset map
const PARENT_AVATAR_MAP: Record<string, any> = {
  ritika: require('../../../../shared/assets/parent_ritika.png'),
  arjun: require('../../../../shared/assets/parent_arjun.jpg'),
};
function resolveParentAvatar(presetId?: string | null, avatarUrl?: string | null): any {
  if (presetId && PARENT_AVATAR_MAP[presetId]) return PARENT_AVATAR_MAP[presetId];
  if (avatarUrl) return { uri: avatarUrl };
  return require('../../../../shared/assets/parent_ritika.png'); // default
}

`;

// Insert before "const HomeIconSymbol"
home = home.replace('const HomeIconSymbol', AVATAR_MAP_CODE + 'const HomeIconSymbol');

// Replace hardcoded avatar in greeting (line ~202) - main avatar
home = home.replace(
  "source={user?.avatarPresetId ? require('../../../../shared/assets/parent_ritika.png') : require('../../../../shared/assets/parent_ritika.png')}",
  "source={resolveParentAvatar(dashboard.userAvatarPresetId, dashboard.userAvatarUrl)}"
);

// Replace hardcoded avatar in drawer (line ~455)
home = home.replace(
  "source={require('../../../../shared/assets/parent_ritika.png')}\n                style={styles.drawerAvatar}",
  "source={resolveParentAvatar(dashboard.userAvatarPresetId, dashboard.userAvatarUrl)}\n                style={styles.drawerAvatar}"
);

fs.writeFileSync(homeFile, home, 'utf8');
console.log('3. HomeScreen.tsx updated - avatar now dynamic');

console.log('\nAll done! Dashboard will now show the same avatar as Profile screen.');
