import { IsOptional, IsString, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ScanHistoryFilter } from '../../../common/constants';

export class ScanHistoryQueryDto {
  @ApiPropertyOptional({ example: 'child_001' })
  @IsOptional()
  @IsString()
  childId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: ScanHistoryFilter, default: ScanHistoryFilter.ALL })
  @IsOptional()
  @IsEnum(ScanHistoryFilter)
  filter?: ScanHistoryFilter = ScanHistoryFilter.ALL;

  @ApiPropertyOptional({ example: '2025-08-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
