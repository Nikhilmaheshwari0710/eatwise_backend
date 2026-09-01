import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResendDeleteOtpDto {
  @ApiProperty({ example: 'del_req_abc123' })
  @IsString()
  deleteRequestId: string;
}
