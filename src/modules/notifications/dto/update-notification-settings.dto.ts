import { IsArray, IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class NotificationSettingItemDto {
  @ApiProperty({ example: 'high_sugar_alert' })
  @IsString()
  key: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  enabled: boolean;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty({ type: [NotificationSettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationSettingItemDto)
  settings: NotificationSettingItemDto[];
}
