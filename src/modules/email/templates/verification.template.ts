export function generateVerificationEmail(input: {
  fullName?: string;
  otp: string;
  expiresInMinutes: number;
}) {
  const greeting = input.fullName ? `Hi ${input.fullName},` : 'Hi,';
  const subject = 'Verify your EatWise email';
  const text = [
    greeting,
    '',
    'Welcome to EatWise.',
    `Use this OTP to verify your email address: ${input.otp}`,
    `This OTP expires in ${input.expiresInMinutes} minutes.`,
    '',
    'If you did not request this, please ignore this email.',
    '',
    'EatWise Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">EatWise Email Verification</h2>
      <p>${greeting}</p>
      <p>Welcome to EatWise. Use the OTP below to verify your email address.</p>
      <p>
        <strong style="font-size: 24px; letter-spacing: 3px;">${input.otp}</strong>
      </p>
      <p>This OTP expires in <strong>${input.expiresInMinutes} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p style="margin-top: 24px;">EatWise Team</p>
    </div>
  `;

  return { subject, text, html };
}
