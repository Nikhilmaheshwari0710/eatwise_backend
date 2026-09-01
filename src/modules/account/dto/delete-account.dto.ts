import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty({ example: 'del_token_xyz789' })
  @IsString()
  deleteToken: string;
}
