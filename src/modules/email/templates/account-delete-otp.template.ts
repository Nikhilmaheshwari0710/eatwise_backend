export function generateAccountDeleteOtpEmail(input: {
  fullName?: string;
  otp: string;
  expiresInMinutes: number;
}) {
  const greeting = input.fullName ? `Hi ${input.fullName},` : 'Hi,';
  const subject = 'Confirm your EatWise account deletion';
  const text = [
    greeting,
    '',
    'You requested to permanently delete your EatWise account.',
    `Use this OTP to verify the request: ${input.otp}`,
    `This OTP expires in ${input.expiresInMinutes} minutes.`,
    '',
    'If you did not request this, please secure your account immediately.',
    '',
    'EatWise Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Confirm Account Deletion</h2>
      <p>${greeting}</p>
      <p>You requested to permanently delete your EatWise account. Use the OTP below to verify.</p>
      <p>
        <strong style="font-size: 24px; letter-spacing: 3px;">${input.otp}</strong>
      </p>
      <p>This OTP expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
      <p>If you did not request this, please secure your account immediately.</p>
      <p style="margin-top: 24px;">EatWise Team</p>
    </div>
  `;

  return { subject, text, html };
}
