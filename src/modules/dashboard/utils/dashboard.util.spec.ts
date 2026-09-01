import { Gender } from '../../../common/constants';
import {
  deriveChildStatus,
  formatActivityTimestamp,
  formatChildDetails,
  formatTodayDate,
  formatTodayDay,
  truncatePreview,
} from './dashboard.util';

describe('dashboard.util', () => {
  it('should format today date and day', () => {
    const date = new Date('2025-09-01T10:00:00Z');
    expect(formatTodayDate(date)).toBe('2025-09-01');
    expect(formatTodayDay(date)).toMatch(/Monday|Sunday/);
  });

  it('should format child details', () => {
    const details = formatChildDetails(
      {
        gender: Gender.MALE,
      } as any,
      '3 years 2 months',
    );
    expect(details).toBe('3 years 2 months - Boy');
  });

  it('should derive child status from health score', () => {
    expect(
      deriveChildStatus({
        healthScore: 8,
        growthRecords: [],
      } as any),
    ).toBe('Healthy');

    expect(
      deriveChildStatus({
        healthScore: 5,
        growthRecords: [],
      } as any),
    ).toBe('Active');
  });

  it('should format activity timestamp for today', () => {
    const now = new Date();
    now.setHours(9, 42, 0, 0);
    expect(formatActivityTimestamp(now)).toContain('Today');
  });

  it('should truncate preview text', () => {
    const text = 'Add iron-rich foods like spinach and lentils for better growth';
    expect(truncatePreview(text, 40).endsWith('...')).toBe(true);
  });
});
