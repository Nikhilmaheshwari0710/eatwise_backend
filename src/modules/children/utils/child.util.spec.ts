import {
  calculateAgeDisplay,
  calculateBmi,
  getBmiCategory,
  buildGrowthRecord,
} from './child.util';
import { BmiCategory, HeightUnit, WeightUnit } from '../../../common/constants';

describe('child.util', () => {
  it('should calculate BMI', () => {
    expect(calculateBmi(14.2, 96)).toBe(15.4);
  });

  it('should classify BMI as Normal for pediatric range', () => {
    expect(getBmiCategory(15.4)).toBe(BmiCategory.NORMAL);
    expect(getBmiCategory(13)).toBe(BmiCategory.UNDERWEIGHT);
    expect(getBmiCategory(19)).toBe(BmiCategory.OVERWEIGHT);
  });

  it('should build growth record with unit conversion', () => {
    const record = buildGrowthRecord(26.5, WeightUnit.LBS, 34.6, HeightUnit.INCHES);

    expect(record.weightUnit).toBe(WeightUnit.LBS);
    expect(record.heightUnit).toBe(HeightUnit.INCHES);
    expect(record.bmi).toBeGreaterThan(0);
    expect(record.bmiCategory).toBeDefined();
  });

  it('should format age display', () => {
    const ageDisplay = calculateAgeDisplay('2022-07-14');
    expect(ageDisplay).toMatch(/years/);
    expect(ageDisplay).toMatch(/month/);
  });
});
