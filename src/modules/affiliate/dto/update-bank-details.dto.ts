import { IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBankDetailsDto {
  @ApiProperty({ example: 'Ritika Sharma' })
  @IsString()
  @MinLength(2)
  accountHolderName: string;

  @ApiProperty({ example: 'HDFC Bank' })
  @IsString()
  @MinLength(2)
  bankName: string;

  @ApiProperty({ example: '50100123456789' })
  @IsString()
  @MinLength(4)
  accountNumber: string;

  @ApiProperty({ example: 'HDFC0001234' })
  @IsString()
  @Matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: 'ifscCode must be a valid IFSC code' })
  ifscCode: string;

  @ApiPropertyOptional({ example: 'ritika@upi' })
  @IsOptional()
  @IsString()
  upiId?: string;
}
