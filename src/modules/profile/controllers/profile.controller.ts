import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ProfileService } from '../services/profile.service';
import { AvatarService } from '../services/avatar.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EmailChangeRequestDto } from '../dto/email-change-request.dto';
import { EmailChangeVerifyDto } from '../dto/email-change-verify.dto';

@ApiTags('Profile')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly avatarService: AvatarService,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.profileService.getProfile(userId);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post('avatar/upload')
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
  @ApiOperation({ summary: 'Upload custom profile photo' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const avatarUrl = this.avatarService.saveAvatar(userId, file);
    return this.profileService.uploadAvatar(userId, avatarUrl);
  }

  @Post('email/change-request')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Request OTP for email change' })
  @ApiResponse({ status: 200, description: 'OTP sent to new email' })
  async requestEmailChange(
    @CurrentUser('id') userId: string,
    @Body() dto: EmailChangeRequestDto,
  ) {
    return this.profileService.requestEmailChange(userId, dto.newEmail);
  }

  @Post('email/change-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP to confirm email change' })
  @ApiResponse({ status: 200, description: 'Email updated successfully' })
  async verifyEmailChange(
    @CurrentUser('id') userId: string,
    @Body() dto: EmailChangeVerifyDto,
  ) {
    return this.profileService.verifyEmailChange(userId, dto.newEmail, dto.otp);
  }
}
