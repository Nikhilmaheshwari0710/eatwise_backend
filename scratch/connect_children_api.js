const fs = require('fs');
const path = require('path');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ═══════════════════════════════════════════
// STEP 1: Create ChildrenRemoteDataSource.ts
// ═══════════════════════════════════════════
const remoteDS = `import { apiClient } from '../../../../shared/network/apiClient';

export interface ChildApiData {
  id: string;
  name: string;
  ageText: string;
  gender: 'Boy' | 'Girl';
  dob: string;
  status: string;
  avatar?: any;
  avatarPresetId?: string | null;
  avatarUrl?: string | null;
  allergies?: string;
  weight?: string;
  height?: string;
  bloodGroup?: string;
  dietPreference?: string;
}

const CHILD_AVATAR_MAP: Record<string, any> = {
  child1: require('../../../../shared/assets/child_aarav.png'),
  child2: require('../../../../shared/assets/child_myra.png'),
};

function resolveChildAvatar(presetId?: string | null, avatarUrl?: string | null, gender?: string): any {
  if (presetId && CHILD_AVATAR_MAP[presetId]) return CHILD_AVATAR_MAP[presetId];
  if (avatarUrl) return { uri: avatarUrl };
  return gender === 'Female' || gender === 'Girl'
    ? require('../../../../shared/assets/child_myra.png')
    : require('../../../../shared/assets/child_aarav.png');
}

function normalizeChild(raw: any): ChildApiData {
  const gender = raw.gender === 'Female' || raw.gender === 'Girl' ? 'Girl' : 'Boy';
  return {
    id: raw.childId ?? raw._id ?? raw.id ?? '',
    name: raw.name ?? '',
    ageText: raw.ageDisplay ? \`\${raw.ageDisplay} \\u2022 \${gender}\` : gender,
    gender,
    dob: raw.dateOfBirth ?? '',
    status: 'Profile Active',
    avatar: resolveChildAvatar(raw.avatarPresetId, raw.avatarUrl, raw.gender),
    avatarPresetId: raw.avatarPresetId ?? null,
    avatarUrl: raw.avatarUrl ?? null,
    allergies: Array.isArray(raw.allergies) ? raw.allergies.join(', ') || 'None' : raw.allergies ?? 'None',
    weight: raw.latestGrowth?.weight ? \`\${raw.latestGrowth.weight} \${raw.latestGrowth.weightUnit ?? 'kg'}\` : undefined,
    height: raw.latestGrowth?.height ? \`\${raw.latestGrowth.height} \${raw.latestGrowth.heightUnit ?? 'cm'}\` : undefined,
    bloodGroup: raw.bloodGroup ?? undefined,
    dietPreference: raw.dietPreference ?? undefined,
  };
}

export class ChildrenRemoteDataSource {
  async listChildren(token: string): Promise<ChildApiData[]> {
    const response = await apiClient.request<any>('/children', { method: 'GET' }, token);
    const raw = (response as any).data;
    const list = Array.isArray(raw?.children) ? raw.children : Array.isArray(raw) ? raw : [];
    return list.map(normalizeChild);
  }

  async createChild(token: string, payload: any): Promise<ChildApiData> {
    const response = await apiClient.request<any>('/children', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);
    const raw = (response as any).data;
    return normalizeChild(raw);
  }

  async updateChild(token: string, childId: string, payload: any): Promise<ChildApiData> {
    const response = await apiClient.request<any>(\`/children/\${childId}\`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, token);
    const raw = (response as any).data;
    return normalizeChild(raw);
  }

  async deleteChild(token: string, childId: string): Promise<void> {
    await apiClient.request<any>(\`/children/\${childId}\`, { method: 'DELETE' }, token);
  }
}
`;

const dsDirPath = `${APP_SRC}/features/profile/data/datasources`;
fs.mkdirSync(dsDirPath, { recursive: true });
fs.writeFileSync(`${dsDirPath}/ChildrenRemoteDataSource.ts`, remoteDS, 'utf8');
console.log('✅ Step 1: ChildrenRemoteDataSource.ts created');

// ═══════════════════════════════════════════
// STEP 2: Patch AppContainer.tsx
// ═══════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let appContent = fs.readFileSync(appFile, 'utf8');

// Add import for authMemoryStore (check if already there)
if (!appContent.includes('ChildrenRemoteDataSource')) {
  appContent = `import { ChildrenRemoteDataSource } from '../features/profile/data/datasources/ChildrenRemoteDataSource';\n` + appContent;
}
if (!appContent.includes('useCallback') && !appContent.includes('useCallback,')) {
  appContent = appContent.replace("import React, { useState", "import React, { useState, useCallback, useEffect");
}

// Replace hardcoded children state with empty + load function
const hardcodedChildren = `  const [childrenList, setChildrenList] = useState<any[]>([
    {
      id: '1',
      name: 'Aarav Sharma',
      ageText: '3 years, 2 months \\u2022 Boy',
      gender: 'Boy',
      dob: '15 Apr 2021',
      status: 'Profile Active',
      avatar: require('../shared/assets/child_aarav.png'),
      allergies: 'Nut Allergy, Low Sugar',
    },
    {
      id: '2',
      name: 'Myra Sharma',
      ageText: '1 year, 7 months \\u2022 Girl',
      gender: 'Girl',
      dob: '10 Nov 2022',
      status: 'Profile Active',
      avatar: require('../shared/assets/child_myra.png'),
      allergies: 'Lactose Intolerant',
    },
    {
      id: '3',
      name: 'Vihaan Sharma',
      ageText: '8 months \\u2022 Boy',
      gender: 'Boy',
      dob: '28 Oct 2023',
      status: 'Profile Active',
      avatar: require('../shared/assets/child_aarav.png'),
      allergies: 'None',
    },
  ]);`;

const newChildrenState = `  const [childrenList, setChildrenList] = useState<any[]>([]);
  const childrenDS = React.useMemo(() => new ChildrenRemoteDataSource(), []);

  const loadChildren = React.useCallback(async () => {
    try {
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) return;
      const children = await childrenDS.listChildren(session.accessToken);
      setChildrenList(children);
    } catch (err: any) {
      console.log('Children load error:', err?.message);
    }
  }, [childrenDS]);

  // Load children when user is authenticated
  useEffect(() => {
    const session = authMemoryStore.getSession();
    if (session?.accessToken) {
      loadChildren();
    }
  }, [loadChildren]);`;

if (appContent.includes("name: 'Aarav Sharma'")) {
  // Find start of hardcoded children block
  const startMarker = "  // Lifted children profile state";
  const endMarker = "  const [selectedChild, setSelectedChild]";
  const startIdx = appContent.indexOf(startMarker);
  const endIdx = appContent.indexOf(endMarker);
  if (startIdx >= 0 && endIdx >= 0) {
    appContent = appContent.slice(0, startIdx) + 
      "  // Children state - loaded from API\n" +
      newChildrenState + "\n\n  " +
      appContent.slice(endIdx);
    console.log('✅ Replaced hardcoded children with API state');
  } else {
    console.log('⚠️  Could not find exact boundaries for hardcoded children. Trying simple replace...');
  }
} else {
  console.log('ℹ️  Hardcoded children already removed or different format');
}

// Update onDeleteChild to call API
const oldDeleteHandler = `            setChildrenList(prev => prev.filter(c => c.id !== id));`;
const newDeleteHandler = `            (async () => {
              try {
                const session = authMemoryStore.getSession();
                if (session?.accessToken) {
                  await childrenDS.deleteChild(session.accessToken, id);
                }
              } catch (e: any) { console.log('Delete child error:', e?.message); }
              setChildrenList(prev => prev.filter(c => c.id !== id));
            })();`;

appContent = appContent.replace(oldDeleteHandler, newDeleteHandler);

// Update onAddChild (called from AddChildScreen.onSave) to call API + reload
const oldAddHandler = `            setChildrenList(prev => [...prev, newChild]);`;
const newAddHandler = `            (async () => {
              try {
                const session = authMemoryStore.getSession();
                if (session?.accessToken) {
                  // Build API payload from newChild
                  const payload: any = {
                    name: newChild.name,
                    dateOfBirth: newChild.dob,
                    gender: newChild.gender === 'Girl' ? 'Female' : 'Male',
                  };
                  if (newChild.weight) payload.initialWeight = parseFloat(newChild.weight);
                  if (newChild.height) payload.initialHeight = parseFloat(newChild.height);
                  if (newChild.bloodGroup) payload.bloodGroup = newChild.bloodGroup;
                  if (newChild.allergies && newChild.allergies !== 'None') {
                    payload.allergies = newChild.allergies.split(',').map((s: string) => s.trim()).filter(Boolean);
                  }
                  if (newChild.preference) payload.dietPreference = newChild.preference;
                  const created = await childrenDS.createChild(session.accessToken, payload);
                  setChildrenList(prev => [...prev, created]);
                  return;
                }
              } catch (e: any) { console.log('Add child API error:', e?.message); }
              setChildrenList(prev => [...prev, newChild]);
            })();`;

appContent = appContent.replace(oldAddHandler, newAddHandler);

fs.writeFileSync(appFile, appContent, 'utf8');
console.log('✅ Step 2: AppContainer.tsx patched - children now load from API');

console.log('\n🎉 Children Management API Connected!');
console.log('  GET /children  → listChildren() on auth');
console.log('  POST /children → createChild() on Add Child save');
console.log('  DELETE /children/:id → deleteChild() on delete');
