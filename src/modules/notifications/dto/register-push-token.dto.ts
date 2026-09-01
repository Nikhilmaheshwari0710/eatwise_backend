import { IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PushPlatform } from '../../../common/constants';

export class RegisterPushTokenDto {
  @ApiProperty({ example: 'fcm_token_here_abc123xyz' })
  @IsString()
  @MinLength(1)
  token: string;

  @ApiProperty({ enum: PushPlatform, example: PushPlatform.ANDROID })
  @IsEnum(PushPlatform)
  platform: PushPlatform;

  @ApiProperty({ example: 'device_unique_id' })
  @IsString()
  @MinLength(1)
  deviceId: string;
}
