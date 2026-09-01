import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateScanDto {
  @ApiProperty({ example: 'prod_001' })
  @IsString()
  productId: string;

  @ApiProperty({ example: '8901063112119' })
  @IsString()
  barcode: string;

  @ApiPropertyOptional({ example: 'child_001' })
  @IsOptional()
  @IsString()
  childId?: string;

  @ApiProperty({ example: '2025-09-01T09:42:00Z' })
  @IsDateString()
  scannedAt: string;
}
