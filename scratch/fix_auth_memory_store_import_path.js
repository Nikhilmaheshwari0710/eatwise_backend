const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import { authMemoryStore } from '../../auth/data/datasources/AuthMemoryStore';",
  "import { authMemoryStore } from '../../../../auth/data/datasources/AuthMemoryStore';"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Corrected authMemoryStore import path to ../../../../auth/data/datasources/AuthMemoryStore in ScanScreen.tsx!');
