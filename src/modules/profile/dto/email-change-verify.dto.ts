import { IsEmail, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailChangeVerifyDto {
  @ApiProperty({ example: 'new.email@gmail.com' })
  @IsEmail()
  newEmail: string;

  @ApiProperty({ example: '724190' })
  @IsString()
  @Length(6, 6)
  otp: string;
}
