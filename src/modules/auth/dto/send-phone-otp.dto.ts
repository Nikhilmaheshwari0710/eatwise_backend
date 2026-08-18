import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPhoneOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  phoneNumber: string;
}
