const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { ScansRemoteDataSource, ProductDetailApi, ScanHistoryItemApi } from '../data/datasources/ScansRemoteDataSource';",
  "import { ScansRemoteDataSource, ProductDetailApi, ScanHistoryItemApi } from '../../data/datasources/ScansRemoteDataSource';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Fixed import path in ScanScreen.tsx!');
