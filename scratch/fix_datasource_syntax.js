const fs = require('fs');
const targetFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\data\\datasources\\ProfileRemoteDataSource.ts';

const cleanContent = `import { apiClient } from '../../../../shared/network/apiClient';
import { env } from '../../../../shared/config/env';
import { UpdateProfilePayload, UserProfile } from '../../domain/entities/UserProfile';

interface RawUserProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  avatar?: any;
  avatarUrl?: string;
  avatarPresetId?: string;
  role?: string;
  dateOfBirth?: string;
  gender?: string;
  language?: string;
  isEmailVerified?: boolean;
  isPremium?: boolean;
  children?: any[];
}

const normalizeProfile = (raw: RawUserProfile): UserProfile => {
  const fullName =
    raw.name ??
    [raw.firstName, raw.lastName].filter(Boolean).join(' ') ??
    '';

  return {
    id: raw.id,
    name: fullName,
    email: raw.email ?? '',
    phone: raw.phoneNumber ?? raw.phone ?? '',
    avatar: raw.avatarUrl ?? raw.avatar ?? null,
    avatarPresetId: raw.avatarPresetId,
    role: raw.role ?? 'Parent Account',
    dateOfBirth: raw.dateOfBirth,
    gender: raw.gender,
    language: raw.language,
    isEmailVerified: raw.isEmailVerified,
    isPremium: raw.isPremium,
    children: raw.children ?? [],
  };
};

export class ProfileRemoteDataSource {
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    const response = await apiClient.request<RawUserProfile>(
      '/user/profile',
      { method: 'GET' },
      accessToken,
    );
    return normalizeProfile(response.data);
  }

  async updateUserProfile(
    accessToken: string,
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> {
    const response = await apiClient.request<RawUserProfile>(
      '/user/profile',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      accessToken,
    );
    return normalizeProfile(response.data);
  }

  async uploadAvatar(
    accessToken: string,
    imageUri: string,
    fileName: string,
    mimeType: string,
  ): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    } as any);

    const fullUrl = \`\${env.baseUrl}/user/avatar/upload\`;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
      },
      body: formData,
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const message =
        typeof json.message === 'string' ? json.message : 'Avatar upload failed';
      throw new Error(message);
    }

    if (json.data?.id) {
      return normalizeProfile(json.data as RawUserProfile);
    }

    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      avatar: json.data?.avatarUrl ?? json.data?.avatar ?? imageUri,
      role: '',
      children: [],
    };
  }

  async requestEmailChange(accessToken: string, newEmail: string): Promise<void> {
    await apiClient.request(
      '/user/email/change-request',
      {
        method: 'POST',
        body: JSON.stringify({ newEmail }),
      },
      accessToken,
    );
  }

  async verifyEmailChange(
    accessToken: string,
    newEmail: string,
    otp: string,
  ): Promise<UserProfile> {
    const response = await apiClient.request<RawUserProfile>(
      '/user/email/change-verify',
      {
        method: 'POST',
        body: JSON.stringify({ newEmail, otp }),
      },
      accessToken,
    );
    if (response.data?.id) {
      return normalizeProfile(response.data);
    }
    return { id: '', name: '', email: newEmail, phone: '', avatar: null, role: '', children: [] };
  }
}
`;

fs.writeFileSync(targetFile, cleanContent, 'utf8');
console.log('Fixed ProfileRemoteDataSource.ts syntax successfully!');
