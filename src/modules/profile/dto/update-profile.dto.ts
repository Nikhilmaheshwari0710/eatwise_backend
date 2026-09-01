import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AvatarPresetId,
  DietPreference,
  Gender,
  PreferredLanguage,
} from '../../../common/constants';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Ritika Sharma' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: '+91 98765 43210' })
  @IsString()
  @Matches(/^\+[\d\s]{8,20}$/, {
    message: 'Phone must include country code',
  })
  phone: string;

  @ApiPropertyOptional({ example: '1994-04-15' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateOfBirth must be in YYYY-MM-DD format',
  })
  dateOfBirth?: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ enum: PreferredLanguage })
  @IsOptional()
  @IsEnum(PreferredLanguage)
  preferredLanguage?: PreferredLanguage;

  @ApiPropertyOptional({ enum: DietPreference })
  @IsOptional()
  @IsEnum(DietPreference)
  dietPreference?: DietPreference;

  @ApiPropertyOptional({ example: 'Focusing on wholesome sugar-free meals for my children.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  nutritionGoal?: string;

  @ApiPropertyOptional({ enum: AvatarPresetId })
  @IsOptional()
  @IsEnum(AvatarPresetId)
  avatarPresetId?: AvatarPresetId;
}
