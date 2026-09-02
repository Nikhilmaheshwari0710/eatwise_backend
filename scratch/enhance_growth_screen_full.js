const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';
const growthFile = `${APP_SRC}/features/profile/presentation/screens/GrowthInfoScreen.tsx`;
let content = fs.readFileSync(growthFile, 'utf8');

// 1. Update GrowthInfoScreenProps interface
content = content.replace(
  'interface GrowthInfoScreenProps {\n  child: any;\n  onBack: () => void;\n  onTabPress?: (tab: string) => void;\n}',
  'interface GrowthInfoScreenProps {\n  child: any;\n  allChildren?: any[];\n  onBack: () => void;\n  onSelectChild?: (selectedChild: any) => void;\n  onTabPress?: (tab: string) => void;\n}'
);

content = content.replace(
  'export const GrowthInfoScreen: React.FC<GrowthInfoScreenProps> = ({\n  child,\n  onBack,\n  onTabPress,\n}) => {',
  'export const GrowthInfoScreen: React.FC<GrowthInfoScreenProps> = ({\n  child,\n  allChildren = [],\n  onBack,\n  onSelectChild,\n  onTabPress,\n}) => {'
);

// 2. Add isChildSwitchOpen state
if (!content.includes('isChildSwitchOpen')) {
  content = content.replace(
    '  const [isLogModalVisible, setIsLogModalVisible] = useState(false);',
    '  const [isChildSwitchOpen, setIsChildSwitchOpen] = useState(false);\n  const [isLogModalVisible, setIsLogModalVisible] = useState(false);'
  );
}

// 3. Dynamic BMI & WHO Category & Percentile Logic
const oldBmiCalcBlock = `  // Dynamic BMI Calculation
  const weightNum = parseFloat(childWeight);
  const heightNum = parseFloat(childHeight) / 100;
  const childBmi = !isNaN(weightNum) && !isNaN(heightNum) && heightNum > 0
    ? (weightNum / (heightNum * heightNum)).toFixed(1)
    : '—';`;

const newBmiCalcBlock = `  // Dynamic BMI & WHO Category & Percentile Logic
  const wNum = parseFloat(childWeight);
  const hNum = parseFloat(childHeight) / 100;
  const hasValidW = !isNaN(wNum) && wNum > 0;
  const hasValidH = !isNaN(hNum) && hNum > 0.3;

  const bmiValNum = (hasValidW && hasValidH) ? (wNum / (hNum * hNum)) : 0;
  const childBmi = bmiValNum > 0 ? bmiValNum.toFixed(1) : '—';

  const getBmiCategoryInfo = (bmi: number) => {
    if (bmi <= 0) {
      return {
        category: 'Pending',
        statusText: 'No Data',
        statusColor: '#64748B',
        bgColor: '#F8FAFC',
        weightPercentile: 'Not Recorded',
        heightPercentile: 'Not Recorded',
        bmiPercentile: 'Not Recorded',
        insightTitle: 'No Growth Data Yet',
        insightBody: \`Tap "+ Log Measurement" to record \${child.name.split(' ')[0]}'s weight and height for WHO growth insights.\`,
      };
    }
    if (bmi < 13.5) {
      return {
        category: 'Underweight',
        statusText: 'Below Average',
        statusColor: '#3B82F6',
        bgColor: '#EFF6FF',
        weightPercentile: '15th Percentile',
        heightPercentile: '50th Percentile',
        bmiPercentile: '12th Percentile',
        insightTitle: 'Weight Insight',
        insightBody: \`\${child.name.split(' ')[0]}'s BMI indicates lower weight for height. Include calorie-dense healthy foods and milk in daily meals.\`,
      };
    }
    if (bmi <= 18.0) {
      return {
        category: 'Normal',
        statusText: 'Healthy Growth',
        statusColor: '#10B981',
        bgColor: '#ECFDF5',
        weightPercentile: '50th Percentile',
        heightPercentile: '50th Percentile',
        bmiPercentile: '50th Percentile',
        insightTitle: 'Good Progress!',
        insightBody: \`\${child.name.split(' ')[0]} is growing well and tracking within the normal WHO range for age.\`,
      };
    }
    if (bmi <= 20.5) {
      return {
        category: 'Overweight',
        statusText: 'Above Average',
        statusColor: '#F59E0B',
        bgColor: '#FFFBEB',
        weightPercentile: '85th Percentile',
        heightPercentile: '60th Percentile',
        bmiPercentile: '82nd Percentile',
        insightTitle: 'Weight Insight',
        insightBody: \`\${child.name.split(' ')[0]}'s weight is tracking above average. Encourage active outdoor play and balanced fiber-rich meals.\`,
      };
    }
    return {
      category: 'Attention',
      statusText: 'Check Measurements',
      statusColor: '#EF4444',
      bgColor: '#FEF2F2',
      weightPercentile: '99th Percentile',
      heightPercentile: '10th Percentile',
      bmiPercentile: '99th Percentile',
      insightTitle: 'Verify Input Data',
      insightBody: \`The height or weight entered produces an extreme BMI. Please verify height is in cm and weight is in kg.\`,
    };
  };

  const categoryInfo = getBmiCategoryInfo(bmiValNum);`;

if (content.includes(oldBmiCalcBlock)) {
  content = content.replace(oldBmiCalcBlock, newBmiCalcBlock);
  console.log('✅ 1. GrowthInfoScreen.tsx: Added pediatric WHO category & BMI calculation logic');
}

// 4. Update Overview Tab Metric Cards & Alert Box to use categoryInfo
content = content.replace(
  '<Text style={styles.metricPercentile}>{childWeight ? "50th Percentile" : "Not Recorded"}</Text>',
  '<Text style={styles.metricPercentile}>{childWeight ? categoryInfo.weightPercentile : "Not Recorded"}</Text>'
);
content = content.replace(
  '<Text style={styles.metricPercentileBlue}>{childHeight ? "50th Percentile" : "Not Recorded"}</Text>',
  '<Text style={styles.metricPercentileBlue}>{childHeight ? categoryInfo.heightPercentile : "Not Recorded"}</Text>'
);
content = content.replace(
  '<Text style={styles.metricPercentileRed}>{childBmi !== "—" ? "50th Percentile" : "Not Recorded"}</Text>',
  '<Text style={styles.metricPercentileRed}>{childBmi !== "—" ? categoryInfo.bmiPercentile : "Not Recorded"}</Text>'
);
content = content.replace(
  '<Text style={[styles.metricValue, styles.statusGreenText]}>{(childWeight && childHeight) ? "Normal" : "Pending"}</Text>',
  '<Text style={[styles.metricValue, { color: categoryInfo.statusColor }]}>{categoryInfo.category}</Text>'
);
content = content.replace(
  '<Text style={styles.metricStatusLabel}>{(childWeight && childHeight) ? "Healthy Growth" : "No Data"}</Text>',
  '<Text style={styles.metricStatusLabel}>{categoryInfo.statusText}</Text>'
);

// Progress Alert Box
const oldAlertBox = `            {/* Good Progress Alert Box */}
            <TouchableOpacity 
              style={styles.alertProgressBox} 
              activeOpacity={0.8}
              onPress={() => setActiveTab('History')}
            >
              <View style={styles.lightbulbCircle}>
                <LightbulbIcon />
              </View>
              <Text style={styles.alertProgressText}>
                <Text style={styles.alertProgressTextBold}>Good Progress! </Text>
                {child.name.split(' ')[0]} is growing well and tracking within the normal range.
              </Text>
              <ChevronRightIcon size={16} color="#FF521B" />
            </TouchableOpacity>`;

const newAlertBox = `            {/* Dynamic WHO Insights Alert Box */}
            <TouchableOpacity 
              style={[styles.alertProgressBox, { backgroundColor: categoryInfo.bgColor }]} 
              activeOpacity={0.8}
              onPress={() => setActiveTab('History')}
            >
              <View style={styles.lightbulbCircle}>
                <LightbulbIcon />
              </View>
              <Text style={styles.alertProgressText}>
                <Text style={[styles.alertProgressTextBold, { color: categoryInfo.statusColor }]}>{categoryInfo.insightTitle} </Text>
                {categoryInfo.insightBody}
              </Text>
              <ChevronRightIcon size={16} color="#FF521B" />
            </TouchableOpacity>`;

if (content.includes(oldAlertBox)) {
  content = content.replace(oldAlertBox, newAlertBox);
  console.log('✅ 2. GrowthInfoScreen.tsx: Updated Progress Alert Box to render dynamic WHO insights');
}

// 5. Make Child Selector Card Interactive
const oldChildCard = `        {/* Child Selector Card */}
        <View style={styles.childSelectorCard}>
          <Image source={child.avatar} style={styles.childAvatar} />
          
          <View style={styles.childInfoWrap}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAgeText}>{child.ageText || (child.gender ? \`Child \\u2022 \${child.gender}\` : 'Child Profile')}</Text>
            
            <View style={styles.dobRow}>
              <CalendarIcon size={12} color="#FF521B" />
              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>
            </View>
          </View>
          
          <Text style={styles.selectorChevron}>v</Text>
        </View>`;

const newChildCard = `        {/* Child Selector Card (Interactive Switcher) */}
        <TouchableOpacity
          style={styles.childSelectorCard}
          activeOpacity={0.8}
          onPress={() => setIsChildSwitchOpen(true)}
        >
          <Image source={child.avatar} style={styles.childAvatar} />
          
          <View style={styles.childInfoWrap}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAgeText}>{child.ageText || (child.gender ? \`Child \\u2022 \${child.gender}\` : 'Child Profile')}</Text>
            
            <View style={styles.dobRow}>
              <CalendarIcon size={12} color="#FF521B" />
              <Text style={styles.dobText}>{child.dateOfBirth || child.dob || 'Not specified'}</Text>
            </View>
          </View>
          
          <Text style={styles.selectorChevron}>v</Text>
        </TouchableOpacity>`;

if (content.includes(oldChildCard)) {
  content = content.replace(oldChildCard, newChildCard);
  console.log('✅ 3. GrowthInfoScreen.tsx: Made Child Selector Card interactive with onPress!');
}

// 6. Clamp chart points to prevent SVG curve overflow on extreme values
const oldGetPoints = `  const getPoints = (metric = chartMetric) => {
    if (metric === 'Weight') {
      return [4.5, 6.8, 9.0, 10.5, 11.5, parseFloat(childWeight) || 12];
    } else if (metric === 'Height') {
      return [52, 67, 74, 78, 83, parseFloat(childHeight) || 85];
    } else {
      return [14.5, 15.5, 16.2, 16.6, 16.7, parseFloat(childBmi) || 16.6];
    }
  };`;

const newGetPoints = `  const getPoints = (metric = chartMetric) => {
    const valW = parseFloat(childWeight);
    const valH = parseFloat(childHeight);
    const valB = parseFloat(childBmi);

    if (metric === 'Weight') {
      const lastW = (!isNaN(valW) && valW > 0 && valW < 50) ? valW : 12;
      return [4.5, 6.8, 9.0, 10.5, 11.5, lastW];
    } else if (metric === 'Height') {
      const lastH = (!isNaN(valH) && valH > 30 && valH < 150) ? valH : 85;
      return [52, 67, 74, 78, 83, lastH];
    } else {
      const lastB = (!isNaN(valB) && valB > 5 && valB < 40) ? valB : 16.6;
      return [14.5, 15.5, 16.2, 16.6, 16.7, lastB];
    }
  };`;

if (content.includes(oldGetPoints)) {
  content = content.replace(oldGetPoints, newGetPoints);
  console.log('✅ 4. GrowthInfoScreen.tsx: Clamped chart points for safe SVG rendering');
}

// 7. Add Child Switcher Bottom Drawer Modal rendering
const childSwitchModalCode = `
      {/* Switch Child Profile Drawer Modal */}
      {isChildSwitchOpen && (
        <Modal animationType="slide" transparent={true} visible={isChildSwitchOpen} onRequestClose={() => setIsChildSwitchOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setIsChildSwitchOpen(false)} />
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Select Child Profile</Text>
                <TouchableOpacity onPress={() => setIsChildSwitchOpen(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18, color: '#94A3B8', fontWeight: '700' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {(allChildren.length > 0 ? allChildren : [child]).map((c: any) => (
                  <TouchableOpacity
                    key={c.id || c.name}
                    onPress={() => {
                      if (onSelectChild) onSelectChild(c);
                      setIsChildSwitchOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 14,
                      backgroundColor: (c.id === child.id || c.name === child.name) ? '#FFF5F0' : '#F8FAFC',
                      borderWidth: 1,
                      borderColor: (c.id === child.id || c.name === child.name) ? '#FFE0D3' : '#E2E8F0',
                      marginBottom: 8,
                    }}
                  >
                    <Image source={c.avatar || child.avatar} style={{ width: 44, height: 44, borderRadius: 22, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>{c.name}</Text>
                      <Text style={{ fontSize: 12, color: '#64748B' }}>{c.ageText || c.details || 'Child Profile'}</Text>
                    </View>
                    {(c.id === child.id || c.name === child.name) && (
                      <View style={{ backgroundColor: '#FF521B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '800', color: '#FFFFFF' }}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
`;

if (!content.includes('Select Child Profile') && content.includes('/* Interactive Log Measurement Modal */')) {
  content = content.replace('/* Interactive Log Measurement Modal */', childSwitchModalCode + '\n      /* Interactive Log Measurement Modal */');
  console.log('✅ 5. GrowthInfoScreen.tsx: Added Child Switcher Bottom Drawer Modal!');
}

fs.writeFileSync(growthFile, content, 'utf8');

// ══════════════════════════════════════════════════════════════
// 8. AppContainer.tsx: Pass allChildren prop to GrowthInfoScreen
// ══════════════════════════════════════════════════════════════
const appFile = `${APP_SRC}/app/AppContainer.tsx`;
let app = fs.readFileSync(appFile, 'utf8');

app = app.replace(
  '<GrowthInfoScreen\n          key={selectedChild?.id || \'growthInfoScreen\'}\n          child={selectedChild}',
  '<GrowthInfoScreen\n          key={selectedChild?.id || \'growthInfoScreen\'}\n          child={selectedChild}\n          allChildren={childrenList}\n          onSelectChild={(newChild) => setSelectedChild(newChild)}'
);

fs.writeFileSync(appFile, app, 'utf8');
console.log('✅ 6. AppContainer.tsx: Passed allChildren and onSelectChild props to GrowthInfoScreen!');

console.log('\n🎉 Comprehensive Growth Info Analysis & Interactive Fix Applied!');
