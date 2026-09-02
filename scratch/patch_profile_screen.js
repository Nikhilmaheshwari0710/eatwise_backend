const fs = require('fs');
const filePath = 'd:\\backup project\\eatwise\\eatwise_app\\src\\features\\profile\\presentation\\screens\\ProfileScreen.tsx';

let content = fs.readFileSync(filePath, 'utf8');

// Replace useEffect block
const oldEffectRegex = /\/\/ When API profile loads, update local userData with real values[\s\S]*?\}, \[profile\]\);/;

const newEffect = `// When API profile loads, update local userData with real values
  useEffect(() => {
    if (!profile) return;
    let avatarSource = profile.avatar;
    if (profile.avatarPresetId) {
      const preset = AVATAR_PRESETS.find(p => p.id === profile.avatarPresetId);
      if (preset) {
        avatarSource = preset.source;
      }
    }
    setUserData(prev => ({
      ...prev,
      name: profile.name || prev.name,
      email: profile.email || prev.email,
      phone: profile.phone || prev.phone,
      avatar: avatarSource ?? prev.avatar,
      dateOfBirth: profile.dateOfBirth ?? prev.dateOfBirth,
      gender: profile.gender ?? prev.gender,
      language: profile.language ?? prev.language,
    }));
  }, [profile]);`;

if (oldEffectRegex.test(content)) {
  content = content.replace(oldEffectRegex, newEffect);
  console.log('Successfully patched useEffect regex');
} else {
  console.log('Failed to match useEffect regex');
}

// Replace handleSaveEdit payload block
const oldPayloadRegex = /\/\/ Build the API payload[\s\S]*?nutritionGoal: editForm\.bio,\r?\n\s*\};/;

const newPayload = `const selectedPreset = AVATAR_PRESETS.find(p => p.source === editForm.avatar);

    // Build the API payload
    const payload: any = {
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      dateOfBirth: formattedDob,
      gender: editForm.gender,
      preferredLanguage: editForm.language,
      dietPreference: editForm.dietPreference,
      nutritionGoal: editForm.bio,
    };

    if (selectedPreset) {
      payload.avatarPresetId = selectedPreset.id;
    }`;

if (oldPayloadRegex.test(content)) {
  content = content.replace(oldPayloadRegex, newPayload);
  console.log('Successfully patched payload regex');
} else {
  console.log('Failed to match payload regex');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done writing ProfileScreen.tsx');
