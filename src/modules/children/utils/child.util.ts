import { BmiCategory, HeightUnit, WeightUnit } from '../../../common/constants';
import { ChildDocument, GrowthRecord } from '../schemas/child.schema';

export function toKg(weight: number, unit: WeightUnit): number {
  return unit === WeightUnit.LBS ? weight * 0.453592 : weight;
}

export function toCm(height: number, unit: HeightUnit): number {
  return unit === HeightUnit.INCHES ? height * 2.54 : height;
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 14) return BmiCategory.UNDERWEIGHT;
  if (bmi <= 18) return BmiCategory.NORMAL;
  return BmiCategory.OVERWEIGHT;
}

export function calculateAgeDisplay(dateOfBirth: string): string {
  const dob = new Date(dateOfBirth);
  const now = new Date();

  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();

  if (now.getDate() < dob.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearLabel = years === 1 ? '1 year' : `${years} years`;
  const monthLabel = months === 1 ? '1 month' : `${months} months`;
  return `${yearLabel} ${monthLabel}`;
}

export function buildGrowthRecord(
  weight: number,
  weightUnit: WeightUnit,
  height: number,
  heightUnit: HeightUnit,
  recordedAt = new Date(),
): GrowthRecord {
  const weightKg = toKg(weight, weightUnit);
  const heightCm = toCm(height, heightUnit);
  const bmi = calculateBmi(weightKg, heightCm);

  return {
    weight,
    weightUnit,
    height,
    heightUnit,
    bmi,
    bmiCategory: getBmiCategory(bmi),
    recordedAt,
  };
}

export function resolveChildAvatarUrl(
  child: ChildDocument,
  cdnBaseUrl: string,
): string | undefined {
  if (child.avatarUrl) {
    return child.avatarUrl;
  }

  if (child.avatarPresetId) {
    const base = cdnBaseUrl.replace(/\/$/, '');
    return `${base}/avatars/${child.avatarPresetId}.png`;
  }

  return undefined;
}

export function toLatestGrowthResponse(record?: GrowthRecord) {
  if (!record) return undefined;

  return {
    weight: record.weight,
    weightUnit: record.weightUnit,
    height: record.height,
    heightUnit: record.heightUnit,
    bmi: record.bmi,
    bmiCategory: record.bmiCategory,
    recordedAt: record.recordedAt,
  };
}

export function toChildResponse(child: ChildDocument, cdnBaseUrl: string) {
  const latestRecord = child.growthRecords?.length
    ? child.growthRecords[child.growthRecords.length - 1]
    : undefined;

  return {
    childId: child._id.toString(),
    parentId: child.parentId.toString(),
    name: child.name,
    dateOfBirth: child.dateOfBirth,
    ageDisplay: calculateAgeDisplay(child.dateOfBirth),
    gender: child.gender,
    relationship: child.relationship,
    avatarUrl: resolveChildAvatarUrl(child, cdnBaseUrl),
    avatarPresetId: child.avatarPresetId,
    bloodGroup: child.bloodGroup,
    allergies: child.allergies ?? [],
    medicalConditions: child.medicalConditions ?? [],
    dietPreference: child.dietPreference,
    latestGrowth: toLatestGrowthResponse(latestRecord),
    healthScore: child.healthScore,
    totalScans: child.totalScans,
    createdAt: child.createdAt,
    updatedAt: child.updatedAt,
  };
}
