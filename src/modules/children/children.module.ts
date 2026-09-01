import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ProfileModule } from '../profile/profile.module';
import { Child, ChildSchema } from './schemas/child.schema';
import { ChildrenController } from './controllers/children.controller';
import { ChildrenService } from './services/children.service';

@Module({
  imports: [
    AuthModule,
    ProfileModule,
    MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }]),
  ],
  controllers: [ChildrenController],
  providers: [ChildrenService],
})
export class ChildrenModule {}
