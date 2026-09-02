const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/presentation/screens/ScanScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add scan history state & API loader
const historyLoaderCode = `
  const [dbHistoryScans, setDbHistoryScans] = useState<any[]>([]);
  const [historySummary, setHistorySummary] = useState<any>({ totalScans: 0, healthyCount: 0, moderateCount: 0, highRiskCount: 0 });

  const loadScanHistoryFromApi = React.useCallback(async (filterMode = historyFilterMode) => {
    try {
      const session = authMemoryStore.getSession();
      if (!session?.accessToken) return;
      const res = await scansDS.getScanHistory(session.accessToken, filterMode);
      setDbHistoryScans(res.scans);
      setHistorySummary(res.summary);
    } catch (err: any) {
      console.log('Load scan history API error:', err?.message);
    }
  }, [historyFilterMode, scansDS]);

  React.useEffect(() => {
    if (viewMode === 'scanHistory') {
      loadScanHistoryFromApi(historyFilterMode);
    }
  }, [viewMode, historyFilterMode, loadScanHistoryFromApi]);
`;

if (!content.includes('loadScanHistoryFromApi')) {
  content = content.replace(
    "const [selectedFavItemDetail, setSelectedFavItemDetail] = useState<any>(null);",
    "const [selectedFavItemDetail, setSelectedFavItemDetail] = useState<any>(null);\n" + historyLoaderCode
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('✅ Added scan history API fetch hook to ScanScreen.tsx!');
