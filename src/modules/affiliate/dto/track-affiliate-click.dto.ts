import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateClickSource, AffiliateDeviceType } from '../../../common/constants';

export class TrackAffiliateClickDto {
  @ApiProperty({ example: 'https://eatwise.link/a/ritika123' })
  @IsUrl()
  shortLink: string;

  @ApiPropertyOptional({ enum: AffiliateClickSource, example: AffiliateClickSource.WHATSAPP })
  @IsOptional()
  @IsEnum(AffiliateClickSource)
  source?: AffiliateClickSource;

  @ApiPropertyOptional({ enum: AffiliateDeviceType, example: AffiliateDeviceType.ANDROID })
  @IsOptional()
  @IsEnum(AffiliateDeviceType)
  deviceType?: AffiliateDeviceType;
}
