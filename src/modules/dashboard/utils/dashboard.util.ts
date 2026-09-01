import { Gender } from '../../../common/constants';
import { ChildDocument } from '../../children/schemas/child.schema';

export function formatTodayDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTodayDay(date = new Date()): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatGenderLabel(gender: Gender): string {
  if (gender === Gender.MALE) return 'Boy';
  if (gender === Gender.FEMALE) return 'Girl';
  return 'Other';
}

export function formatChildDetails(child: ChildDocument, ageDisplay: string): string {
  return `${ageDisplay} - ${formatGenderLabel(child.gender)}`;
}

export function formatGrowthValue(
  value?: number,
  unit?: string,
): string | undefined {
  if (value === undefined || value === null) return undefined;
  return `${value} ${unit ?? ''}`.trim();
}

export function deriveChildStatus(child: ChildDocument): string {
  if (child.healthScore >= 7) return 'Healthy';

  const latestGrowth = child.growthRecords?.length
    ? child.growthRecords[child.growthRecords.length - 1]
    : undefined;

  if (child.healthScore >= 4) return 'Active';
  if (latestGrowth?.bmiCategory === 'Normal') return 'Healthy';

  return 'Active';
}

export function formatActivityTimestamp(date: Date): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDate.getTime()) / (24 * 60 * 60 * 1000),
  );

  const timeLabel = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) return `Today, ${timeLabel}`;
  if (diffDays === 1) return `Yesterday, ${timeLabel}`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function truncatePreview(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3).trim()}...`;
}
