import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Child, ChildDocument, GrowthRecord } from '../schemas/child.schema';
import { CreateChildDto } from '../dto/create-child.dto';
import { UpdateChildDto } from '../dto/update-child.dto';
import { AvatarService } from '../../profile/services/avatar.service';
import {
  HeightUnit,
  WeightUnit,
} from '../../../common/constants';
import {
  buildGrowthRecord,
  toChildResponse,
} from '../utils/child.util';

@Injectable()
export class ChildrenService {
  constructor(
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    private configService: ConfigService,
    private avatarService: AvatarService,
  ) {}

  async listChildren(parentId: string) {
    const children = await this.childModel
      .find({ parentId: new Types.ObjectId(parentId) })
      .sort({ createdAt: -1 });

    const cdnBaseUrl = this.getCdnBaseUrl();

    return {
      message: 'Children fetched successfully',
      data: {
        children: children.map((child) => toChildResponse(child, cdnBaseUrl)),
      },
    };
  }

  async createChild(parentId: string, dto: CreateChildDto) {
    this.validateInitialGrowth(dto);

    const growthRecords: GrowthRecord[] = [];
    if (dto.initialWeight !== undefined && dto.initialHeight !== undefined) {
      growthRecords.push(
        buildGrowthRecord(
          dto.initialWeight,
          dto.initialWeightUnit ?? WeightUnit.KG,
          dto.initialHeight,
          dto.initialHeightUnit ?? HeightUnit.CM,
        ),
      );
    }

    const child = await this.childModel.create({
      parentId: new Types.ObjectId(parentId),
      name: dto.name,
      dateOfBirth: dto.dateOfBirth,
      gender: dto.gender,
      bloodGroup: dto.bloodGroup,
      avatarPresetId: dto.avatarPresetId,
      allergies: dto.allergies ?? [],
      medicalConditions: dto.medicalConditions ?? [],
      dietPreference: dto.dietPreference,
      growthRecords,
    });

    return {
      message: 'Child profile added successfully.',
      data: {
        childId: child._id.toString(),
        name: child.name,
        createdAt: child.createdAt,
      },
    };
  }

  async updateChild(parentId: string, childId: string, dto: UpdateChildDto) {
    const child = await this.findOwnedChild(parentId, childId);

    child.name = dto.name;
    child.dateOfBirth = dto.dateOfBirth;
    child.gender = dto.gender;
    child.bloodGroup = dto.bloodGroup;
    child.allergies = dto.allergies ?? [];
    child.medicalConditions = dto.medicalConditions ?? [];
    child.dietPreference = dto.dietPreference;

    if (dto.avatarPresetId !== undefined) {
      child.avatarPresetId = dto.avatarPresetId;
      child.avatarUrl = undefined;
    }

    await child.save();

    return {
      message: 'Child profile updated successfully.',
      data: {
        childId: child._id.toString(),
        name: child.name,
        updatedAt: child.updatedAt,
      },
    };
  }

  async deleteChild(parentId: string, childId: string) {
    const child = await this.findOwnedChild(parentId, childId);
    await child.deleteOne();

    return {
      message: 'Child profile deleted successfully.',
      data: {},
    };
  }

  async uploadAvatar(
    parentId: string,
    childId: string,
    file: Express.Multer.File,
  ) {
    const child = await this.findOwnedChild(parentId, childId);
    const avatarUrl = this.avatarService.saveAvatar(child._id.toString(), file);
    child.avatarUrl = avatarUrl;
    child.avatarPresetId = undefined;
    await child.save();

    return {
      message: 'Avatar uploaded successfully',
      data: { avatarUrl },
    };
  }

  private async findOwnedChild(
    parentId: string,
    childId: string,
  ): Promise<ChildDocument> {
    if (!Types.ObjectId.isValid(childId)) {
      throw new NotFoundException('Child not found.');
    }

    const child = await this.childModel.findOne({
      _id: new Types.ObjectId(childId),
      parentId: new Types.ObjectId(parentId),
    });

    if (!child) {
      throw new NotFoundException('Child not found.');
    }

    return child;
  }

  private validateInitialGrowth(dto: CreateChildDto) {
    const hasWeight = dto.initialWeight !== undefined;
    const hasHeight = dto.initialHeight !== undefined;

    if (hasWeight !== hasHeight) {
      throw new BadRequestException(
        'Both initialWeight and initialHeight are required to record initial growth',
      );
    }
  }

  private getCdnBaseUrl(): string {
    return this.configService.get<string>('avatar.cdnBaseUrl') || 'https://cdn.eatwise.app';
  }
}
