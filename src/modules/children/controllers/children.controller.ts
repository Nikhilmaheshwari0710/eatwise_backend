import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ChildrenService } from '../services/children.service';
import { CreateChildDto } from '../dto/create-child.dto';
import { UpdateChildDto } from '../dto/update-child.dto';

@ApiTags('Children')
@Controller('children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Get()
  @ApiOperation({ summary: 'Get all children for logged-in parent' })
  @ApiResponse({ status: 200, description: 'Children list returned' })
  async listChildren(@CurrentUser('id') parentId: string) {
    return this.childrenService.listChildren(parentId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new child profile' })
  @ApiResponse({ status: 201, description: 'Child profile created' })
  async createChild(
    @CurrentUser('id') parentId: string,
    @Body() dto: CreateChildDto,
  ) {
    return this.childrenService.createChild(parentId, dto);
  }

  @Put(':childId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing child profile' })
  @ApiResponse({ status: 200, description: 'Child profile updated' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async updateChild(
    @CurrentUser('id') parentId: string,
    @Param('childId') childId: string,
    @Body() dto: UpdateChildDto,
  ) {
    return this.childrenService.updateChild(parentId, childId, dto);
  }

  @Delete(':childId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a child profile' })
  @ApiResponse({ status: 200, description: 'Child profile deleted' })
  @ApiResponse({ status: 404, description: 'Child not found' })
  async deleteChild(
    @CurrentUser('id') parentId: string,
    @Param('childId') childId: string,
  ) {
    return this.childrenService.deleteChild(parentId, childId);
  }

  @Post(':childId/avatar/upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: { type: 'string', format: 'binary' },
      },
      required: ['avatar'],
    },
  })
  @ApiOperation({ summary: 'Upload custom avatar for child' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser('id') parentId: string,
    @Param('childId') childId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.childrenService.uploadAvatar(parentId, childId, file);
  }
}
