const fs = require('fs');
const file = 'd:/backup project/eatwise/eatwise_app/src/features/profile/presentation/screens/NotificationSettingsScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import React, { useCallback, useEffect, useState } from 'react';",
  "import React, { useCallback, useEffect, useMemo, useState } from 'react';"
);

content = content.replace(
  "const notifDS = React.useMemo(() => new NotificationsRemoteDataSource(), []);",
  "const notifDS = useMemo(() => new NotificationsRemoteDataSource(), []);"
);

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Cleaned up React hooks in NotificationSettingsScreen.tsx!');
