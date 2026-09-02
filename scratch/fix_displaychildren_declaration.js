const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/home/presentation/screens/HomeScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `  if (isLoading || !dashboard) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }`;

const declaration = `

  const displayChildren = (dashboard.children && dashboard.children.length > 0)
    ? dashboard.children
    : (childrenList || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        details: c.ageText || 'Child Profile',
        status: c.status || 'Active',
        weight: c.weight || '—',
        height: c.height || '—',
        avatar: c.avatar || (c.gender === 'Girl' ? require('../../../../shared/assets/child_myra.png') : require('../../../../shared/assets/child_aarav.png')),
      }));`;

if (content.includes(target) && !content.includes('const displayChildren =')) {
  content = content.replace(target, target + declaration);
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Declared displayChildren inside HomeScreen component');
} else {
  console.log('ℹ️ Target not found or displayChildren already declared');
}
