const fs = require('fs');

const file = 'd:/backup project/eatwise/eatwise_app/src/features/scan/data/datasources/ScansRemoteDataSource.ts';

const code = `import { apiClient } from '../../../../shared/network/apiClient';

export interface NutritionFactsApi {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  saturatedFat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium?: number;
}

export interface HighlightApi {
  label: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  detail: string;
}

export interface SuitableForApi {
  toddler: boolean;
  child: boolean;
  adult: boolean;
}

export interface AlternativeApi {
  productId: string;
  name: string;
  brand: string;
  healthScore: number;
  imageUrl?: string;
  isAffiliate?: boolean;
  affiliateUrl?: string;
}

export interface ProductDetailApi {
  productId: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  imageUrl?: string;
  netWeight: string;
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  isVeg: boolean;
  servingSize?: string;
  ingredients?: string;
  allergens: string[];
  nutritionPer100g: NutritionFactsApi;
  highlights: HighlightApi[];
  suitableFor: SuitableForApi;
  alternatives: AlternativeApi[];
}

export interface ScanHistoryItemApi {
  scanId: string;
  productId: string;
  productName: string;
  productBrand: string;
  productImageUrl?: string;
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  childId?: string | null;
  childName?: string | null;
  scannedAt: string;
}

export interface ScanHistorySummaryApi {
  totalScans: number;
  healthyCount: number;
  moderateCount: number;
  highRiskCount: number;
}

export interface GetScanHistoryResult {
  scans: ScanHistoryItemApi[];
  summary: ScanHistorySummaryApi;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class ScansRemoteDataSource {
  async getProductByBarcode(token: string, barcode: string): Promise<ProductDetailApi> {
    const response = await apiClient.request<any>(\`/products/barcode/\${barcode}\`, { method: 'GET' }, token);
    return (response as any).data;
  }

  async searchProducts(token: string, query: string): Promise<ProductDetailApi[]> {
    const response = await apiClient.request<any>(\`/products/search?q=\${encodeURIComponent(query)}\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return Array.isArray(raw?.products) ? raw.products : [];
  }

  async saveScan(
    token: string,
    payload: { productId: string; barcode: string; childId?: string; scannedAt?: string }
  ): Promise<{ scanId: string; productId: string; scannedAt: string }> {
    const response = await apiClient.request<any>('/scans', {
      method: 'POST',
      body: JSON.stringify({
        productId: payload.productId,
        barcode: payload.barcode,
        childId: payload.childId,
        scannedAt: payload.scannedAt || new Date().toISOString(),
      }),
    }, token);
    return (response as any).data;
  }

  async getScanHistory(
    token: string,
    filter: string = 'all',
    childId?: string
  ): Promise<GetScanHistoryResult> {
    const queryParams: string[] = [];
    if (filter && filter !== 'all') queryParams.push(\`filter=\${filter.toLowerCase()}\`);
    if (childId) queryParams.push(\`childId=\${childId}\`);
    const query = queryParams.length > 0 ? \`?\${queryParams.join('&')}\` : '';

    const response = await apiClient.request<any>(\`/scans/history\${query}\`, { method: 'GET' }, token);
    const raw = (response as any).data;
    return {
      scans: Array.isArray(raw?.scans) ? raw.scans : [],
      summary: raw?.summary ?? { totalScans: 0, healthyCount: 0, moderateCount: 0, highRiskCount: 0 },
      pagination: raw?.pagination ?? { total: 0, page: 1, limit: 20, totalPages: 1 },
    };
  }
}
`;

fs.writeFileSync(file, code, 'utf8');
console.log('✅ Created ScansRemoteDataSource.ts!');
