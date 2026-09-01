import {
  IsArray,
  IsEnum,
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
} from '../../../common/constants';

export class UpdateChildDto {
  @ApiProperty({ example: 'Aarav Sharma' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '2022-07-14' })
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

  @ApiPropertyOptional({ example: ['Peanuts', 'Dairy'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ example: ['Lactose Intolerant'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medicalConditions?: string[];

  @ApiPropertyOptional({ enum: DietPreference })
  @IsOptional()
  @IsEnum(DietPreference)
  dietPreference?: DietPreference;
}
