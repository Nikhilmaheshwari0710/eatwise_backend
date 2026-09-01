import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
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
import { CommunityService } from '../services/community.service';
import { PostImageService } from '../services/post-image.service';
import { GetPostsQueryDto } from '../dto/get-posts-query.dto';
import { SearchPostsQueryDto } from '../dto/search-posts-query.dto';
import { GetCommentsQueryDto } from '../dto/get-comments-query.dto';
import { CreatePostDto } from '../dto/create-post.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';

@ApiTags('Community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunityController {
  constructor(
    private readonly communityService: CommunityService,
    private readonly postImageService: PostImageService,
  ) {}

  @Get('topics')
  @ApiOperation({ summary: 'Get community topic tags' })
  @ApiResponse({ status: 200, description: 'Topics returned' })
  async getTopics() {
    return this.communityService.getTopics();
  }

  @Post('posts/upload-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  @ApiOperation({ summary: 'Upload image for a community post' })
  @ApiResponse({ status: 200, description: 'Image uploaded successfully' })
  uploadPostImage(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = this.postImageService.savePostImage(userId, file);
    return {
      message: 'Image uploaded successfully.',
      data: { imageUrl },
    };
  }

  @Get('posts/search')
  @ApiOperation({ summary: 'Search community posts by keyword' })
  @ApiResponse({ status: 200, description: 'Matching posts returned' })
  searchPosts(
    @CurrentUser('id') userId: string,
    @Query() query: SearchPostsQueryDto,
  ) {
    return this.communityService.searchPosts(
      userId,
      query.q,
      query.page,
      query.limit,
    );
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get paginated community posts' })
  @ApiResponse({ status: 200, description: 'Posts returned' })
  getPosts(@CurrentUser('id') userId: string, @Query() query: GetPostsQueryDto) {
    return this.communityService.getPosts(
      userId,
      query.tab,
      query.category,
      query.page,
      query.limit,
    );
  }

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new community post' })
  @ApiResponse({ status: 201, description: 'Post created' })
  createPost(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.communityService.createPost(userId, dto);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiResponse({ status: 200, description: 'Comments returned' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  getComments(@Param('postId') postId: string, @Query() query: GetCommentsQueryDto) {
    return this.communityService.getComments(postId, query.page, query.limit);
  }

  @Post('posts/:postId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a comment to a post' })
  @ApiResponse({ status: 201, description: 'Comment added' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  addComment(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.communityService.addComment(userId, postId, dto);
  }

  @Post('posts/:postId/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like or unlike a post' })
  @ApiResponse({ status: 200, description: 'Like toggled' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  toggleLike(@CurrentUser('id') userId: string, @Param('postId') postId: string) {
    return this.communityService.toggleLike(userId, postId);
  }
}
