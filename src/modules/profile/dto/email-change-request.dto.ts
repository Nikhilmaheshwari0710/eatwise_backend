import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailChangeRequestDto {
  @ApiProperty({ example: 'new.email@gmail.com' })
  @IsEmail()
  newEmail: string;
}
