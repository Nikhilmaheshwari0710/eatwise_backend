const fs = require('fs');
const envFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\shared\\config\\env.ts';

const content = `import { BASE_URL } from '@env';

export const env = {
  baseUrl: 'http://10.0.2.2:3000/api/v1',
};
`;

fs.writeFileSync(envFile, content, 'utf8');
console.log('Updated env.ts to 10.0.2.2:3000 successfully!');
