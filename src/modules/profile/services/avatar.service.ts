import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class AvatarService {
  constructor(private readonly configService: ConfigService) {}

  saveAvatar(userId: string, file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Avatar must be a JPG or PNG image');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('Avatar must be 5MB or smaller');
    }

    const uploadDir = this.configService.get<string>('avatar.uploadDir') || 'uploads/avatars';
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const extension = extname(file.originalname).toLowerCase() || (file.mimetype === 'image/png' ? '.png' : '.jpg');
    const filename = `${userId}_${randomUUID()}${extension}`;
    const destination = join(uploadDir, filename);

    writeFileSync(destination, file.buffer);

    const cdnBaseUrl = this.configService.get<string>('avatar.cdnBaseUrl') || 'http://localhost:3000/uploads';
    const base = cdnBaseUrl.replace(/\/$/, '');
    return `${base}/avatars/${filename}`;
  }
}
