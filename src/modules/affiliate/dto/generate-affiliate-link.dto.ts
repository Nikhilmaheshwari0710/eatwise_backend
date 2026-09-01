import { IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliatePlatformId } from '../../../common/constants';

export class GenerateAffiliateLinkDto {
  @ApiProperty({ enum: AffiliatePlatformId, example: AffiliatePlatformId.AMAZON })
  @IsEnum(AffiliatePlatformId)
  platformId: AffiliatePlatformId;

  @ApiProperty({ example: 'ritika123-21' })
  @IsString()
  @MinLength(2)
  affiliateTag: string;

  @ApiPropertyOptional({ example: 'https://amazon.in/dp/B012345' })
  @IsOptional()
  @IsUrl()
  productUrl?: string;
}
