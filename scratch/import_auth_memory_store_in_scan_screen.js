const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('AuthMemoryStore')) {
  content = "import { authMemoryStore } from '../../auth/data/datasources/AuthMemoryStore';\n" + content;
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Added authMemoryStore import at the top of ScanScreen.tsx!');
} else {
  console.log('Already imported.');
}
