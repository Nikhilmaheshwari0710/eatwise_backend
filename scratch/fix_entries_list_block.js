const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

const badEntriesBlock = `              {entries.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>N ? growth entries recorded yet</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 ? "+ Log Measurement" to record child growth.</Text>
                </View>
              ) : entries.slice(0, 3).map((ent) => (
                <View key={ent.id} style={styles.entryRow}>
                  <View style={styles.entryDateBox}>
                    <Text ? ')[0]}</Text>
                    <Text ? ').slice(1, 3).join(' ')}</Text>
                  </View>`;

const goodEntriesBlock = `              {entries.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B' }}>No growth entries recorded yet</Text>
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Tap "+ Log Measurement" to record child growth.</Text>
                </View>
              ) : entries.slice(0, 3).map((ent) => (
                <View key={ent.id} style={styles.entryRow}>
                  <View style={styles.entryDateBox}>
                    <Text style={styles.entryDateDay}>{ent.date.split(' ')[0]}</Text>
                    <Text style={styles.entryDateMonth}>{ent.date.split(' ').slice(1, 3).join(' ')}</Text>
                  </View>`;

content = content.replace(badEntriesBlock, goodEntriesBlock);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed entries list block!');
