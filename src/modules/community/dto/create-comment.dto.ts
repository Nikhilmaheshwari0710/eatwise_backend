import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post! We switched to brown rice too.' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text: string;
}
