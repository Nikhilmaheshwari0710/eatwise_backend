const fs = require('fs');

const vmFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\hooks\\useProfileViewModel.ts';
const notifFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\NotificationSettingsScreen.tsx';
const profileScreenFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\ProfileScreen.tsx';

// 1. Fix console.error in useProfileViewModel.ts
let vmContent = fs.readFileSync(vmFile, 'utf8');
vmContent = vmContent.replace(
  `console.error('Error loading user profile:', err);`,
  `if (err?.message?.includes('Unauthorized') || err?.message?.includes('not authenticated')) {
          console.log('Profile requires active auth session');
        } else {
          console.error('Error loading user profile:', err);
        }`
);
fs.writeFileSync(vmFile, vmContent, 'utf8');
console.log('Fixed useProfileViewModel.ts error logging');

// 2. Fix token passing in NotificationSettingsScreen.tsx
let notifContent = fs.readFileSync(notifFile, 'utf8');
if (!notifContent.includes('authMemoryStore')) {
  notifContent = `import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';\n` + notifContent;
}

notifContent = notifContent.replace(
  `const response: any = await apiClient.request('/notifications/settings', { method: 'GET' });`,
  `const token = authMemoryStore.getSession()?.accessToken;
        const response: any = await apiClient.request('/notifications/settings', { method: 'GET' }, token);`
);

notifContent = notifContent.replace(
  `await apiClient.request('/notifications/settings', {
        method: 'PUT',`,
  `const token = authMemoryStore.getSession()?.accessToken;
      await apiClient.request('/notifications/settings', {
        method: 'PUT',`
);
notifContent = notifContent.replace(
  `body: JSON.stringify({
          settings:`,
  `body: JSON.stringify({
          settings:`,
);

// update PUT call to pass token
notifContent = notifContent.replace(
  `}],
        }),
      });`,
  `}],
        }),
      }, token);`
);

fs.writeFileSync(notifFile, notifContent, 'utf8');
console.log('Fixed NotificationSettingsScreen.tsx token passing');

// 3. Fix token passing in ProfileScreen.tsx for Change Password
let profileContent = fs.readFileSync(profileScreenFile, 'utf8');
if (!profileContent.includes('authMemoryStore')) {
  profileContent = `import { authMemoryStore } from '../../../../shared/storage/authMemoryStore';\n` + profileContent;
}

profileContent = profileContent.replace(
  `await apiClient.request('/auth/forgot-password', {
                          method: 'POST',
                          body: JSON.stringify({ email: userData.email }),
                        });`,
  `const token = authMemoryStore.getSession()?.accessToken;
                        await apiClient.request('/auth/forgot-password', {
                          method: 'POST',
                          body: JSON.stringify({ email: userData.email }),
                        }, token);`
);

fs.writeFileSync(profileScreenFile, profileContent, 'utf8');
console.log('Fixed ProfileScreen.tsx token passing');
