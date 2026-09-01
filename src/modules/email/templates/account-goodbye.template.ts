export function generateAccountGoodbyeEmail(input: { fullName?: string }) {
  const greeting = input.fullName ? `Hi ${input.fullName},` : 'Hi,';
  const subject = 'Your EatWise account has been deleted';
  const text = [
    greeting,
    '',
    'Your EatWise account and associated data have been permanently deleted as requested.',
    'We are sorry to see you go. You are always welcome back.',
    '',
    'EatWise Team',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Account Deleted</h2>
      <p>${greeting}</p>
      <p>Your EatWise account and associated data have been permanently deleted as requested.</p>
      <p>We are sorry to see you go. You are always welcome back.</p>
      <p style="margin-top: 24px;">EatWise Team</p>
    </div>
  `;

  return { subject, text, html };
}
