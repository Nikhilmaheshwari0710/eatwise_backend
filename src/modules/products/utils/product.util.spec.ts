import { getHealthMeta, getHealthFilterRange } from '../config/product-masters.config';
import { isValidBarcode } from '../utils/product.util';
import { ScanHistoryFilter } from '../../../common/constants';

describe('product masters and utils', () => {
  it('should validate barcode format', () => {
    expect(isValidBarcode('8901063112119')).toBe(true);
    expect(isValidBarcode('123')).toBe(false);
    expect(isValidBarcode('abc12345678')).toBe(false);
  });

  it('should map health score to label and color', () => {
    expect(getHealthMeta(8.1).healthLabel).toBe('Excellent');
    expect(getHealthMeta(4.2).healthLabel).toBe('High Risk');
    expect(getHealthMeta(4.2).healthColor).toBe('#EF4444');
  });

  it('should map scan history filters to score ranges', () => {
    expect(getHealthFilterRange(ScanHistoryFilter.HEALTHY)).toEqual({ min: 6 });
    expect(getHealthFilterRange(ScanHistoryFilter.RISK)).toEqual({ max: 3.99 });
    expect(getHealthFilterRange(ScanHistoryFilter.ALL)).toBeNull();
  });
});
