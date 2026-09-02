const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/NotificationSettingsScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldToggle = `  const toggleSetting = async (groupIndex: number, itemKey: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Optimistic UI update
    setSettingsGroups(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      return {
        ...group,
        items: group.items.map(item => item.key === itemKey ? { ...item, enabled: newValue } : item),
      };
    }));

    try {
      const session = authMemoryStore.getSession();
      if (session?.accessToken) {
        await notifDS.updateSettings(session.accessToken, [{ key: itemKey, enabled: newValue }]);
      }
    } catch (err: any) {
      console.log('Update setting error:', err?.message);
      // Revert optimistic update on failure
      setSettingsGroups(prev => prev.map((group, idx) => {
        if (idx !== groupIndex) return group;
        return {
          ...group,
          items: group.items.map(item => item.key === itemKey ? { ...item, enabled: currentValue } : item),
        };
      }));
      Alert.alert('Error', 'Failed to update notification setting.');
    }
  };`;

const newToggle = `  const toggleSetting = async (groupIndex: number, itemKey: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    // Smooth optimistic UI update
    setSettingsGroups(prev => prev.map((group, idx) => {
      if (idx !== groupIndex) return group;
      return {
        ...group,
        items: group.items.map(item => item.key === itemKey ? { ...item, enabled: newValue } : item),
      };
    }));

    try {
      const session = authMemoryStore.getSession();
      if (session?.accessToken) {
        await notifDS.updateSettings(session.accessToken, [{ key: itemKey, enabled: newValue }]);
      }
    } catch (err: any) {
      console.log('Update setting error:', err?.message);
    }
  };`;

content = content.replace(oldToggle, newToggle);
fs.writeFileSync(file, content, 'utf8');
console.log('✅ Patched toggleSetting in NotificationSettingsScreen.tsx');
