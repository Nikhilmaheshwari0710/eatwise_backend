import { AffiliatePlatformId } from '../../../common/constants';
import {
  buildGeneratedLink,
  buildShortCode,
  calculateConversionRate,
  roundCurrency,
} from './affiliate.util';

describe('affiliate.util', () => {
  describe('buildGeneratedLink', () => {
    it('builds Amazon affiliate link from tag', () => {
      expect(buildGeneratedLink(AffiliatePlatformId.AMAZON, 'ritika123-21')).toBe(
        'https://amzn.to/3RYZbsc?tag=ritika123-21',
      );
    });

    it('appends tag to product URL for Amazon', () => {
      expect(
        buildGeneratedLink(
          AffiliatePlatformId.AMAZON,
          'ritika123-21',
          'https://amazon.in/dp/B012345',
        ),
      ).toBe('https://amazon.in/dp/B012345?tag=ritika123-21');
    });
  });

  describe('buildShortCode', () => {
    it('sanitizes affiliate tags into short codes', () => {
      expect(buildShortCode('ritika123-21', '507f1f77bcf86cd799439011')).toBe(
        'ritika12321439011',
      );
    });
  });

  describe('calculateConversionRate', () => {
    it('returns zero when there are no clicks', () => {
      expect(calculateConversionRate(10, 0)).toBe(0);
    });

    it('calculates conversion rate as a percentage', () => {
      expect(calculateConversionRate(7, 100)).toBe(7);
    });
  });

  describe('roundCurrency', () => {
    it('rounds to two decimal places', () => {
      expect(roundCurrency(2480.505)).toBe(2480.51);
    });
  });
});
