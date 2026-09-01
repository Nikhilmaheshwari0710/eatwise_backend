import { IsEnum, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostCategory } from '../../../common/constants';

export class CreatePostDto {
  @ApiProperty({ enum: PostCategory })
  @IsEnum(PostCategory)
  category: PostCategory;

  @ApiProperty({ example: 'Best protein sources for toddlers?' })
  @IsString()
  @MinLength(1)
  @MaxLength(150)
  title: string;

  @ApiProperty({ example: 'My son is 2 years old. Looking for high-protein vegetarian foods.' })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  body: string;

  @ApiPropertyOptional({ example: 'https://cdn.eatwise.app/posts/usr_abc123_post_img.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
