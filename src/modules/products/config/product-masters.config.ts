import { HealthLabel, ScanHistoryFilter } from '../../../common/constants';

export interface HealthLabelMeta {
  label: HealthLabel;
  color: string;
  minScore: number;
}

export const HEALTH_LABEL_TIERS: HealthLabelMeta[] = [
  { label: HealthLabel.EXCELLENT, color: '#10B981', minScore: 8 },
  { label: HealthLabel.GOOD, color: '#22C55E', minScore: 6 },
  { label: HealthLabel.MODERATE, color: '#F59E0B', minScore: 4 },
  { label: HealthLabel.HIGH_RISK, color: '#EF4444', minScore: 0 },
];

export const PRODUCT_CATEGORIES = [
  { slug: 'dairy-eggs', name: 'Dairy & Eggs' },
  { slug: 'snacks', name: 'Snacks' },
  { slug: 'beverages', name: 'Beverages' },
  { slug: 'breakfast-cereals', name: 'Breakfast Cereals' },
  { slug: 'instant-foods', name: 'Instant Foods' },
  { slug: 'biscuits-cookies', name: 'Biscuits & Cookies' },
  { slug: 'baby-toddler', name: 'Baby & Toddler' },
  { slug: 'sauces-spreads', name: 'Sauces & Spreads' },
  { slug: 'fruits-veggies', name: 'Fruits & Veggies' },
  { slug: 'healthy-picks', name: 'Healthy Picks' },
];

export const SCAN_HISTORY_FILTERS = [
  { key: ScanHistoryFilter.ALL, label: 'All Scans' },
  { key: ScanHistoryFilter.HEALTHY, label: 'Healthy' },
  { key: ScanHistoryFilter.MODERATE, label: 'Moderate' },
  { key: ScanHistoryFilter.RISK, label: 'High Risk' },
];

export function getHealthMeta(score: number): { healthLabel: HealthLabel; healthColor: string } {
  if (score >= 8) {
    return { healthLabel: HealthLabel.EXCELLENT, healthColor: '#10B981' };
  }
  if (score >= 6) {
    return { healthLabel: HealthLabel.GOOD, healthColor: '#22C55E' };
  }
  if (score >= 5) {
    return { healthLabel: HealthLabel.MODERATE, healthColor: '#F59E0B' };
  }
  return { healthLabel: HealthLabel.HIGH_RISK, healthColor: '#EF4444' };
}

export function getHealthFilterRange(filter: ScanHistoryFilter): { min?: number; max?: number } | null {
  switch (filter) {
    case ScanHistoryFilter.HEALTHY:
      return { min: 6 };
    case ScanHistoryFilter.MODERATE:
      return { min: 4, max: 5.99 };
    case ScanHistoryFilter.RISK:
      return { max: 3.99 };
    default:
      return null;
  }
}
