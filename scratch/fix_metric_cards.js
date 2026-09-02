const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/GrowthInfoScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Text style={styles.metricValue}>{childWeight ? " ? "}</Text>',
  '<Text style={styles.metricValue}>{childWeight ? childWeight : "—"}</Text>'
);

content = content.replace(
  '<Text style={styles.metricValue}>{childHeight ? " ? "}</Text>',
  '<Text style={styles.metricValue}>{childHeight ? childHeight : "—"}</Text>'
);

content = content.replace(
  '<Text style={styles.metricValue}>{childBmi ? " ? "}</Text>',
  '<Text style={styles.metricValue}>{childBmi !== "—" ? childBmi : "—"}</Text>'
);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed metric cards!');
