import { maskEmail } from './account.util';

describe('account.util', () => {
  it('should mask email for display', () => {
    expect(maskEmail('ritika.sharma@gmail.com')).toBe('ritika.sha***@gmail.com');
    expect(maskEmail('ab@example.com')).toBe('a***@example.com');
  });
});
