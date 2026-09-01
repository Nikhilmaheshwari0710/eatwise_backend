import { IsInt, IsOptional, IsEnum, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  AffiliatePlatformId,
  AffiliateTransactionStatus,
} from '../../../common/constants';

export class GetAffiliateTransactionsQueryDto {
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

  @ApiPropertyOptional({ enum: AffiliatePlatformId })
  @IsOptional()
  @IsEnum(AffiliatePlatformId)
  platformId?: AffiliatePlatformId;

  @ApiPropertyOptional({ enum: AffiliateTransactionStatus })
  @IsOptional()
  @IsEnum(AffiliateTransactionStatus)
  status?: AffiliateTransactionStatus;
}
