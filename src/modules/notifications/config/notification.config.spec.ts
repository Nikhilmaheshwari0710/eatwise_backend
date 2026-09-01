import { formatTimeAgo, getDefaultPreferences } from '../config/notification.config';

describe('notification.config', () => {
  it('should return default preferences for all setting keys', () => {
    const prefs = getDefaultPreferences();
    expect(prefs.high_sugar_alert).toBe(true);
    expect(prefs.monthly_report_ready).toBe(false);
    expect(prefs.growth_milestone).toBe(true);
  });

  it('should format time ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');
  });
});
