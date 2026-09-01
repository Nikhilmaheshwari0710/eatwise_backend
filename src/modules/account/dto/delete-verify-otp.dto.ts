import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteVerifyOtpDto {
  @ApiProperty({ example: 'del_req_abc123' })
  @IsString()
  deleteRequestId: string;

  @ApiProperty({ example: '847291' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
