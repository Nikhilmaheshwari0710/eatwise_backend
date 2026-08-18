import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({ description: 'Google ID token from mobile app' })
  @IsString()
  idToken: string;
}
