import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationFilter } from '../../../common/constants';

export class GetNotificationsQueryDto {
  @ApiPropertyOptional({ enum: NotificationFilter, default: NotificationFilter.ALL })
  @IsOptional()
  @IsEnum(NotificationFilter)
  filter?: NotificationFilter = NotificationFilter.ALL;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
