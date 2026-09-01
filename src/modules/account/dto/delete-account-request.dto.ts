import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeleteAccountReason } from '../../../common/constants';

export class DeleteAccountRequestDto {
  @ApiProperty({ enum: DeleteAccountReason, example: DeleteAccountReason.PRIVACY_CONCERNS })
  @IsEnum(DeleteAccountReason)
  reason: DeleteAccountReason;

  @ApiPropertyOptional({ example: 'I am concerned about my data privacy.' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reasonText?: string;

  @ApiProperty({ example: 'userPassword123' })
  @IsString()
  @MinLength(1)
  password: string;
}
