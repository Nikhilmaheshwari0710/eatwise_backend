export function generatePasswordResetEmail(input: {
  fullName?: string;
  otp: string;
  expiresInMinutes: number;
}) {
  const greeting = input.fullName ? `Hi ${input.fullName},` : 'Hi,';
  const subject = 'EatWise Password Reset';
  const text = [
    greeting,
    '',
    'We received a request to reset your EatWise password.',
    `Your password reset OTP is: ${input.otp}`,
    `This OTP expires in ${input.expiresInMinutes} minutes.`,
    '',
    'If you did not request this, please ignore this email and secure your account.',
    '',
    'EatWise Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">EatWise Password Reset</h2>
      <p>${greeting}</p>
      <p>We received a request to reset your EatWise password.</p>
      <p>
        <strong style="font-size: 24px; letter-spacing: 3px;">${input.otp}</strong>
      </p>
      <p>This OTP expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email and secure your account.</p>
      <p style="margin-top: 24px;">EatWise Team</p>
    </div>
  `;

  return { subject, text, html };
}
