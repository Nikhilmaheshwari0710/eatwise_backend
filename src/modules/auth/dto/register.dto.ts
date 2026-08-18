import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  @Matches(/^\+[1-9]\d{6,14}$/, { message: 'Phone number must be in E.164 format' })
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'StrongP@ss1' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string;

  @ApiPropertyOptional({ example: 'StrongP@ss1' })
  @ValidateIf((object: RegisterDto) => object.password !== undefined)
  @IsString()
  confirmPassword?: string;
}
