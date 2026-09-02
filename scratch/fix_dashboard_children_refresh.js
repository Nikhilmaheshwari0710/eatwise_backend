const fs = require('fs');

const APP_SRC = 'd:/backup project/eatwise/eatwise_app/src';

// ══════════════════════════════════════════════════════════════
// 1. useHomeViewModel.ts: Add useCallback and refreshDashboard
// ══════════════════════════════════════════════════════════════
const vmFile = `${APP_SRC}/features/home/presentation/hooks/useHomeViewModel.ts`;
let vm = fs.readFileSync(vmFile, 'utf8');

// Ensure useCallback is imported
if (!vm.includes('useCallback')) {
  vm = vm.replace("import { useEffect, useMemo, useRef, useState }", "import { useCallback, useEffect, useMemo, useRef, useState }");
}

const oldEffect = `  useEffect(() => {
    let isMounted = true;

    const loadHome = async () => {
      const session = authMemoryStore.getSession();

      if (!session?.accessToken) {
        onUnauthorizedRef.current();
        return;
      }

      try {
        let currentUser: AuthUser | null = session.user ?? null;

        try {
          currentUser = await getCurrentUserUseCase.execute(session.accessToken);
        } catch {
          // Fallback to session user if getCurrentUser fails
          if (!currentUser) {
            throw new Error('Failed to fetch current user');
          }
        }

        // Fetch real dashboard data from backend API
        const dashboardData = await getDashboardDataUseCase.execute(session.accessToken);

        if (!isMounted) {
          return;
        }

        if (currentUser) {
          authMemoryStore.setSession({
            ...session,
            user: currentUser,
          });
        }

        setUser(currentUser);
        setDashboard(dashboardData);
      } catch (err: any) {
        if (
          err?.message?.includes('Unauthorized') ||
          err?.message?.includes('401') ||
          err?.message?.includes('not authenticated')
        ) {
          authMemoryStore.clearSession();
          onUnauthorizedRef.current();
        } else {
          console.error('Dashboard load error:', err?.message ?? err);
          // Even if API fails, do not kick user out - show empty state
          if (isMounted) {
            setDashboard({
              dateLabel: '',
              children: [],
              quickActions: [
                { id: 'scan', label: 'Scan a Product', icon: 'scan', tint: '#FFF1E8' },
                { id: 'ai', label: 'Ask AI Assistant', icon: 'ai', tint: '#F3EEFF' },
                { id: 'reports', label: 'View Reports', icon: 'reports', tint: '#EAF8EE' },
                { id: 'recipes', label: 'Healthy Recipes', icon: 'recipes', tint: '#FFF0EA' },
              ],
              recentActivity: [],
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadHome();

    return () => {
      isMounted = false;
    };
  }, [getCurrentUserUseCase, getDashboardDataUseCase]);

  return {
    user,
    dashboard,
    isLoading,
  };`;

const newEffect = `  const loadHome = useCallback(async () => {
    const session = authMemoryStore.getSession();

    if (!session?.accessToken) {
      onUnauthorizedRef.current();
      return;
    }

    try {
      let currentUser: AuthUser | null = session.user ?? null;

      try {
        currentUser = await getCurrentUserUseCase.execute(session.accessToken);
      } catch {
        if (!currentUser) {
          throw new Error('Failed to fetch current user');
        }
      }

      // Fetch real dashboard data from backend API
      const dashboardData = await getDashboardDataUseCase.execute(session.accessToken);

      if (currentUser) {
        authMemoryStore.setSession({
          ...session,
          user: currentUser,
        });
      }

      setUser(currentUser);
      setDashboard(dashboardData);
    } catch (err: any) {
      if (
        err?.message?.includes('Unauthorized') ||
        err?.message?.includes('401') ||
        err?.message?.includes('not authenticated')
      ) {
        authMemoryStore.clearSession();
        onUnauthorizedRef.current();
      } else {
        console.error('Dashboard load error:', err?.message ?? err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserUseCase, getDashboardDataUseCase]);

  useEffect(() => {
    loadHome();
  }, [loadHome]);

  return {
    user,
    dashboard,
    isLoading,
    refreshDashboard: loadHome,
  };`;

if (vm.includes('return {\n    user,\n    dashboard,\n    isLoading,\n  };')) {
  vm = vm.replace(oldEffect, newEffect);
  fs.writeFileSync(vmFile, vm, 'utf8');
  console.log('✅ 1. useHomeViewModel.ts updated with refreshDashboard()');
}

// ══════════════════════════════════════════════════════════════
// 2. HomeScreen.tsx: Refresh dashboard on focus/mount
// ══════════════════════════════════════════════════════════════
const homeFile = `${APP_SRC}/features/home/presentation/screens/HomeScreen.tsx`;
let home = fs.readFileSync(homeFile, 'utf8');

home = home.replace(
  'const { dashboard, isLoading, user } = useHomeViewModel({',
  'const { dashboard, isLoading, user, refreshDashboard } = useHomeViewModel({'
);

if (!home.includes('refreshDashboard();')) {
  home = home.replace(
    'const { dashboard, isLoading, user, refreshDashboard } = useHomeViewModel({',
    'const { dashboard, isLoading, user, refreshDashboard } = useHomeViewModel({\n    onUnauthorized,\n  });\n\n  React.useEffect(() => {\n    refreshDashboard();\n  }, [refreshDashboard]);\n\n  const dummyParam = {'
  );
  // Remove duplicate onUnauthorized
  home = home.replace(
    '  onUnauthorized,\n  });\n\n  React.useEffect(() => {\n    refreshDashboard();\n  }, [refreshDashboard]);\n\n  const dummyParam = {\n    onUnauthorized,\n  });',
    '  onUnauthorized,\n  });\n\n  React.useEffect(() => {\n    refreshDashboard();\n  }, [refreshDashboard]);'
  );
  fs.writeFileSync(homeFile, home, 'utf8');
  console.log('✅ 2. HomeScreen.tsx updated to refresh dashboard automatically!');
}

console.log('Done patching Home Dashboard children sync!');
