const fs = require('fs');

// ══════════════════════════════════════════════════════════════
// 1. Backend dashboard.service.ts: Pass dateOfBirth & gender
// ══════════════════════════════════════════════════════════════
const dashServiceFile = 'c:/Users/Darshan/eatwise_backend/src/modules/dashboard/services/dashboard.service.ts';
let ds = fs.readFileSync(dashServiceFile, 'utf8');

const oldToDashChild = `    return {
      id: child._id.toString(),
      name: child.name,
      details: formatChildDetails(child, ageDisplay),
      status: deriveChildStatus(child),
      weight: formatGrowthValue(latestGrowth?.weight, latestGrowth?.weightUnit) ?? null,
      height: formatGrowthValue(latestGrowth?.height, latestGrowth?.heightUnit) ?? null,
      avatarUrl: resolveChildAvatarUrl(child, cdnBaseUrl) ?? null,
      avatarPresetId: child.avatarPresetId ?? null,
    };`;

const newToDashChild = `    return {
      id: child._id.toString(),
      name: child.name,
      dateOfBirth: child.dateOfBirth,
      gender: child.gender,
      details: formatChildDetails(child, ageDisplay),
      status: deriveChildStatus(child),
      weight: formatGrowthValue(latestGrowth?.weight, latestGrowth?.weightUnit) ?? null,
      height: formatGrowthValue(latestGrowth?.height, latestGrowth?.heightUnit) ?? null,
      avatarUrl: resolveChildAvatarUrl(child, cdnBaseUrl) ?? null,
      avatarPresetId: child.avatarPresetId ?? null,
    };`;

if (ds.includes(oldToDashChild)) {
  ds = ds.replace(oldToDashChild, newToDashChild);
  fs.writeFileSync(dashServiceFile, ds, 'utf8');
  console.log('✅ 1. Backend dashboard.service.ts updated to return dateOfBirth & gender');
}

// ══════════════════════════════════════════════════════════════
// 2. Frontend DashboardRemoteDataSource.ts: Map dob & gender
// ══════════════════════════════════════════════════════════════
const rdsFile = 'd:/backup project/eatwise/eatwise_app/src/features/home/data/datasources/DashboardRemoteDataSource.ts';
let rds = fs.readFileSync(rdsFile, 'utf8');

rds = rds.replace(
  'interface RawDashboardChild {\n  id: string;\n  name: string;',
  'interface RawDashboardChild {\n  id: string;\n  name: string;\n  dateOfBirth?: string;\n  gender?: string;'
);

rds = rds.replace(
  '    children: (raw.children ?? []).map((child) => ({\n      id: child.id,\n      name: child.name,',
  '    children: (raw.children ?? []).map((child) => ({\n      id: child.id,\n      name: child.name,\n      dob: child.dateOfBirth ?? "",\n      gender: child.gender ?? "",\n      ageText: child.details ?? "",'
);

fs.writeFileSync(rdsFile, rds, 'utf8');
console.log('✅ 2. Frontend DashboardRemoteDataSource.ts updated to preserve dob & gender');

// ══════════════════════════════════════════════════════════════
// 3. Frontend GrowthInfoScreen.tsx: Fix DOB & Age fallbacks
// ══════════════════════════════════════════════════════════════
const growthFile = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let growth = fs.readFileSync(growthFile, 'utf8');

growth = growth.replace(
  "<Text style={styles.childAgeText}>{child.ageText || '1 year \\u2022 Girl'}</Text>",
  "<Text style={styles.childAgeText}>{child.ageText || (child.gender ? `Child \\u2022 \${child.gender}` : 'Child Profile')}</Text>"
);

growth = growth.replace(
  "<Text style={styles.dobText}>{child.dob || '18 Aug 2022'}</Text>",
  "<Text style={styles.dobText}>{child.dob || 'Not specified'}</Text>"
);

fs.writeFileSync(growthFile, growth, 'utf8');
console.log('✅ 3. GrowthInfoScreen.tsx updated with real DOB & Gender display');

console.log('\n🎉 Growth Data Display Fix Applied!');
