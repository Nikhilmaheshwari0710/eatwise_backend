import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnalyzeProductImageDto {
  @ApiProperty({ description: 'Base64 encoded image data (without data:image prefix)' })
  @IsString()
  imageBase64: string;

  @ApiPropertyOptional({ description: 'Optional child ID for age-specific analysis' })
  @IsOptional()
  @IsString()
  childId?: string;
}
