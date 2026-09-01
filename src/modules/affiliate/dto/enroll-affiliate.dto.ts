import { IsBoolean, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AffiliatePlatformId } from '../../../common/constants';

export class EnrollAffiliateDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  agreedToTerms: boolean;

  @ApiProperty({ enum: AffiliatePlatformId, example: AffiliatePlatformId.AMAZON })
  @IsEnum(AffiliatePlatformId)
  preferredPlatform: AffiliatePlatformId;

  @ApiProperty({ example: 'ritika123-21' })
  @IsString()
  @MinLength(2)
  affiliateTag: string;
}
