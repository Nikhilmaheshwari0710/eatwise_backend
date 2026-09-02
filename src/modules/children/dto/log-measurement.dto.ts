import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HeightUnit, WeightUnit } from '../../../common/constants';

export class LogMeasurementDto {
  @ApiPropertyOptional({ example: 14.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ enum: WeightUnit })
  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @ApiPropertyOptional({ example: 96.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  height?: number;

  @ApiPropertyOptional({ enum: HeightUnit })
  @IsOptional()
  @IsEnum(HeightUnit)
  heightUnit?: HeightUnit;

  @ApiProperty({ example: '2025-09-01' })
  @IsDateString()
  recordedAt: string;

  @ApiPropertyOptional({ example: 'Monthly checkup' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
