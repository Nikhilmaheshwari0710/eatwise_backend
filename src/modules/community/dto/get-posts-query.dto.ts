import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CommunityTab, PostCategory } from '../../../common/constants';

export class GetPostsQueryDto {
  @ApiPropertyOptional({ enum: CommunityTab, default: CommunityTab.FOR_YOU })
  @IsOptional()
  @IsEnum(CommunityTab)
  tab?: CommunityTab = CommunityTab.FOR_YOU;

  @ApiPropertyOptional({ enum: PostCategory })
  @IsOptional()
  @IsEnum(PostCategory)
  category?: PostCategory;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
