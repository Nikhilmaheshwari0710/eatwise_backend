import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Injectable()
export class PostImageService {
  constructor(private readonly configService: ConfigService) {}

  savePostImage(userId: string, file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Image must be a JPG or PNG file');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Image must be 10MB or smaller');
    }

    const uploadDir =
      this.configService.get<string>('community.postUploadDir') || 'uploads/posts';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const extension =
      extname(file.originalname).toLowerCase() ||
      (file.mimetype === 'image/png' ? '.png' : '.jpg');
    const filename = `${userId}_${randomUUID()}${extension}`;
    const destination = join(uploadDir, filename);

    writeFileSync(destination, file.buffer);

    const cdnBaseUrl =
      this.configService.get<string>('community.cdnBaseUrl') ||
      'http://192.168.1.9:3000/uploads';
    const base = cdnBaseUrl.replace(/\/$/, '');
    return `${base}/posts/${filename}`;
  }
}
