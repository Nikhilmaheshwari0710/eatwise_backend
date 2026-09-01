export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  const dotIndex = local.indexOf('.');
  if (dotIndex > -1 && dotIndex + 4 <= local.length) {
    return `${local.slice(0, dotIndex + 4)}***@${domain}`;
  }

  const visibleLength = local.length <= 4 ? 1 : 3;
  return `${local.slice(0, visibleLength)}***@${domain}`;
}
