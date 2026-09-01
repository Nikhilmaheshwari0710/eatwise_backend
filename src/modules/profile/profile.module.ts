import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AuthModule } from '../auth/auth.module';
import { ProfileController } from './controllers/profile.controller';
import { ProfileService } from './services/profile.service';
import { AvatarService } from './services/avatar.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ProfileController],
  providers: [ProfileService, AvatarService],
  exports: [AvatarService],
})
export class ProfileModule {}
