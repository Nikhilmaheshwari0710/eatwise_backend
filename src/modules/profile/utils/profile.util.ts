import { UserDocument } from '../../auth/schemas/user.schema';

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

export function formatPhoneForDisplay(phone?: string): string | undefined {
  if (!phone) return undefined;

  const normalized = normalizePhone(phone);
  if (normalized.startsWith('+91') && normalized.length === 13) {
    return `+91 ${normalized.slice(3, 8)} ${normalized.slice(8)}`;
  }

  return phone;
}

export function resolveAvatarUrl(
  user: UserDocument,
  cdnBaseUrl: string,
): string | undefined {
  if (user.avatarUrl) {
    return user.avatarUrl;
  }

  if (user.avatarPresetId) {
    const base = cdnBaseUrl.replace(/\/$/, '');
    return `${base}/avatars/${user.avatarPresetId}.png`;
  }

  return undefined;
}

export function toProfileResponse(user: UserDocument, cdnBaseUrl: string) {
  return {
    userId: user._id.toString(),
    name: user.fullName,
    email: user.email,
    emailVerified: user.isEmailVerified,
    phone: formatPhoneForDisplay(user.phoneNumber),
    phoneVerified: user.isPhoneVerified,
    avatarUrl: resolveAvatarUrl(user, cdnBaseUrl),
    avatarPresetId: user.avatarPresetId,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    preferredLanguage: user.preferredLanguage,
    dietPreference: user.dietPreference,
    nutritionGoal: user.nutritionGoal,
    isPremium: user.isPremium,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}