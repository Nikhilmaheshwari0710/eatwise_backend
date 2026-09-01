import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  BloodGroup,
  ChildAvatarPresetId,
  DietPreference,
  Gender,
  HeightUnit,
  WeightUnit,
} from '../../../common/constants';

export class CreateChildDto {
  @ApiProperty({ example: 'Rohan Sharma' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '2023-03-10' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must be in YYYY-MM-DD format',
  })
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ enum: BloodGroup })
  @IsOptional()
  @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional({ enum: ChildAvatarPresetId })
  @IsOptional()
  @IsEnum(ChildAvatarPresetId)
  avatarPresetId?: ChildAvatarPresetId;

  @ApiPropertyOptional({ example: ['Peanuts'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @ApiPropertyOptional({ enum: DietPreference })
  @IsOptional()
  @IsEnum(DietPreference)
  dietPreference?: DietPreference;

  @ApiPropertyOptional({ example: 12.0 })
  @IsOptional()
  @IsNumber()
  initialWeight?: number;

  @ApiPropertyOptional({ enum: WeightUnit })
  @IsOptional()
  @IsEnum(WeightUnit)
  initialWeightUnit?: WeightUnit;

  @ApiPropertyOptional({ example: 88.0 })
  @IsOptional()
  @IsNumber()
  initialHeight?: number;

  @ApiPropertyOptional({ enum: HeightUnit })
  @IsOptional()
  @IsEnum(HeightUnit)
  initialHeightUnit?: HeightUnit;
}
