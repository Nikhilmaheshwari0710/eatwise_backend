const fs = require('fs');
const f = 'd:/backup project/eatwise/eatwise_app/src/app/AppContainer.tsx';
let c = fs.readFileSync(f, 'utf8');
c = c.replace(
  "setCurrentScreen('home');\n            } catch {\n              // Error is already shown on the login screen.\n            }",
  "setCurrentScreen('home');\n              loadChildren(); // Load real children from API\n            } catch {\n              // Error is already shown on the login screen.\n            }"
);
fs.writeFileSync(f, c, 'utf8');
console.log('Done - loadChildren added after login');
