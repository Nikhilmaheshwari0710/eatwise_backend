import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  phoneNumber?: string;

  @ApiProperty({ example: 'StrongP@ss1' })
  @IsString()
  password: string;
}
