const fs = require('fs');

const viewModelFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\hooks\\useProfileViewModel.ts';
const screenFile = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\ProfileScreen.tsx';

// --- Patch 1: useProfileViewModel.ts ---
let vmContent = fs.readFileSync(viewModelFile, 'utf8');

const newVmContent = `import { useCallback, useEffect, useMemo, useState } from 'react';
import { UpdateProfilePayload, UserProfile } from '../../domain/entities/UserProfile';
import { GetUserProfileUseCase } from '../../domain/usecases/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../domain/usecases/UpdateUserProfileUseCase';
import { UploadAvatarUseCase } from '../../domain/usecases/UploadAvatarUseCase';
import { RequestEmailChangeUseCase } from '../../domain/usecases/RequestEmailChangeUseCase';
import { VerifyEmailChangeUseCase } from '../../domain/usecases/VerifyEmailChangeUseCase';
import { ProfileRepositoryImpl } from '../../data/repositories/ProfileRepositoryImpl';
import { ProfileRemoteDataSource } from '../../data/datasources/ProfileRemoteDataSource';

let cachedProfile: UserProfile | null = null;

export const useProfileViewModel = () => {
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [isLoading, setIsLoading] = useState(!cachedProfile);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const {
    getUserProfileUseCase,
    updateUserProfileUseCase,
    uploadAvatarUseCase,
    requestEmailChangeUseCase,
    verifyEmailChangeUseCase,
  } = useMemo(() => {
    const remoteDataSource = new ProfileRemoteDataSource();
    const repository = new ProfileRepositoryImpl(remoteDataSource);
    return {
      getUserProfileUseCase: new GetUserProfileUseCase(repository),
      updateUserProfileUseCase: new UpdateUserProfileUseCase(repository),
      uploadAvatarUseCase: new UploadAvatarUseCase(repository),
      requestEmailChangeUseCase: new RequestEmailChangeUseCase(repository),
      verifyEmailChangeUseCase: new VerifyEmailChangeUseCase(repository),
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!cachedProfile) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const result = await getUserProfileUseCase.execute();
        cachedProfile = result;
        if (isMounted) {
          setProfile(result);
        }
      } catch (err: any) {
        console.error('Error loading user profile:', err);
        if (isMounted) {
          setError(err?.message ?? 'Failed to load profile');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [getUserProfileUseCase]);

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload): Promise<UserProfile> => {
      setIsSaving(true);
      setSaveError(null);
      try {
        const updated = await updateUserProfileUseCase.execute(payload);
        cachedProfile = updated;
        setProfile(updated);
        return updated;
      } catch (err: any) {
        const msg = err?.message ?? 'Failed to update profile';
        setSaveError(msg);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [updateUserProfileUseCase],
  );

  const uploadAvatar = useCallback(
    async (imageUri: string, fileName: string, mimeType: string): Promise<string> => {
      setIsUploadingAvatar(true);
      try {
        const updated = await uploadAvatarUseCase.execute(imageUri, fileName, mimeType);
        const newAvatar = updated.avatar ?? imageUri;
        setProfile(prev => {
          const next = prev ? { ...prev, avatar: newAvatar } : prev;
          cachedProfile = next;
          return next;
        });
        return newAvatar;
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [uploadAvatarUseCase],
  );

  const requestEmailChange = useCallback(
    async (newEmail: string): Promise<void> => {
      setIsSendingEmailOtp(true);
      try {
        await requestEmailChangeUseCase.execute(newEmail);
      } finally {
        setIsSendingEmailOtp(false);
      }
    },
    [requestEmailChangeUseCase],
  );

  const verifyEmailChange = useCallback(
    async (newEmail: string, otp: string): Promise<void> => {
      setIsVerifyingEmail(true);
      try {
        const updated = await verifyEmailChangeUseCase.execute(newEmail, otp);
        setProfile(prev => {
          const next = prev ? { ...prev, email: updated.email || newEmail } : prev;
          cachedProfile = next;
          return next;
        });
      } finally {
        setIsVerifyingEmail(false);
      }
    },
    [verifyEmailChangeUseCase],
  );

  return {
    profile,
    isLoading,
    error,
    isSaving,
    saveError,
    updateProfile,
    isUploadingAvatar,
    uploadAvatar,
    isSendingEmailOtp,
    requestEmailChange,
    isVerifyingEmail,
    verifyEmailChange,
  };
};
`;

fs.writeFileSync(viewModelFile, newVmContent, 'utf8');
console.log('Successfully updated useProfileViewModel.ts with in-memory caching!');

// --- Patch 2: ProfileScreen.tsx ---
let screenContent = fs.readFileSync(screenFile, 'utf8');

const oldStateBlock = `  // User Profile Editable State – seeded from API when available
  const [userData, setUserData] = useState({
    name: 'Ritika Sharma',
    email: 'ritika.sharma@gmail.com',
    phone: '+91 98765 43210',
    avatar: require('../../../../shared/assets/parent_ritika.png'),
    dateOfBirth: '15 Apr 1994',
    gender: 'Female',
    language: 'English (India)',
    dietPreference: 'Vegetarian',
    bio: 'Focusing on wholesome sugar-free meals & healthy growth for my children.',
  });`;

const newStateBlock = `  // Helper function to resolve avatar source from profile
  const resolveInitialAvatar = (p: typeof profile) => {
    if (p?.avatarPresetId) {
      const preset = AVATAR_PRESETS.find(pr => pr.id === p.avatarPresetId);
      if (preset) return preset.source;
    }
    return p?.avatar ?? require('../../../../shared/assets/parent_ritika.png');
  };

  // User Profile Editable State – initialized from cached API profile if available
  const [userData, setUserData] = useState(() => ({
    name: profile?.name || 'Ritika Sharma',
    email: profile?.email || 'ritika.sharma@gmail.com',
    phone: profile?.phone || '+91 98765 43210',
    avatar: resolveInitialAvatar(profile),
    dateOfBirth: profile?.dateOfBirth || '15 Apr 1994',
    gender: profile?.gender || 'Female',
    language: profile?.language || 'English (India)',
    dietPreference: 'Vegetarian',
    bio: 'Focusing on wholesome sugar-free meals & healthy growth for my children.',
  }));`;

const stateRegex = /\/\/\s*User Profile Editable State[\s\S]*?bio: '[\s\S]*?',\r?\n\s*\}\);/;

if (stateRegex.test(screenContent)) {
  screenContent = screenContent.replace(stateRegex, newStateBlock);
  console.log('Successfully matched and patched ProfileScreen.tsx state initialization');
} else {
  console.log('Failed to match stateRegex in ProfileScreen.tsx');
}

fs.writeFileSync(screenFile, screenContent, 'utf8');
console.log('Done writing ProfileScreen.tsx');
