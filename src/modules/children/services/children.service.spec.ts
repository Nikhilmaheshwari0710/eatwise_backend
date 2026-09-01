import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { Child } from '../schemas/child.schema';
import { AvatarService } from '../../profile/services/avatar.service';
import {
  BloodGroup,
  ChildAvatarPresetId,
  DietPreference,
  Gender,
  HeightUnit,
  WeightUnit,
} from '../../../common/constants';

describe('ChildrenService', () => {
  let service: ChildrenService;

  const parentId = '507f1f77bcf86cd799439011';
  const childId = '507f1f77bcf86cd799439012';

  const childModel = {
    find: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const avatarService = {
    saveAvatar: jest.fn().mockReturnValue('https://cdn.eatwise.app/avatars/child_custom.jpg'),
  };

  const configService = {
    get: jest.fn(() => 'https://cdn.eatwise.app'),
  };

  const childDoc = {
    _id: { toString: () => 'child-id-1' },
    parentId: { toString: () => 'parent-id-1' },
    name: 'Aarav Sharma',
    dateOfBirth: '2022-07-14',
    gender: Gender.MALE,
    avatarPresetId: ChildAvatarPresetId.CHILD1,
    bloodGroup: BloodGroup.O_POSITIVE,
    allergies: ['Peanuts'],
    medicalConditions: [],
    dietPreference: DietPreference.VEGETARIAN,
    growthRecords: [
      {
        weight: 14.2,
        weightUnit: WeightUnit.KG,
        height: 96,
        heightUnit: HeightUnit.CM,
        bmi: 15.4,
        bmiCategory: 'Normal',
        recordedAt: new Date('2025-08-01T00:00:00Z'),
      },
    ],
    healthScore: 7.8,
    totalScans: 24,
    createdAt: new Date('2024-02-10T10:00:00Z'),
    updatedAt: new Date('2025-09-01T08:00:00Z'),
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChildrenService,
        { provide: getModelToken(Child.name), useValue: childModel },
        { provide: AvatarService, useValue: avatarService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get(ChildrenService);
    jest.clearAllMocks();
    childDoc.save.mockResolvedValue(childDoc);
  });

  it('should list children for parent', async () => {
    childModel.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([childDoc]),
    });

    const result = await service.listChildren(parentId);

    expect(result.data.children).toHaveLength(1);
    expect(result.data.children[0].name).toBe('Aarav Sharma');
    expect(result.data.children[0].latestGrowth?.bmi).toBe(15.4);
  });

  it('should create child with initial growth', async () => {
    childModel.create.mockResolvedValue({
      _id: { toString: () => 'child-id-2' },
      name: 'Rohan Sharma',
      createdAt: new Date('2025-09-01T10:00:00Z'),
    });

    const result = await service.createChild(parentId, {
      name: 'Rohan Sharma',
      dateOfBirth: '2023-03-10',
      gender: Gender.MALE,
      initialWeight: 12,
      initialWeightUnit: WeightUnit.KG,
      initialHeight: 88,
      initialHeightUnit: HeightUnit.CM,
    });

    expect(result.message).toBe('Child profile added successfully.');
    expect(childModel.create).toHaveBeenCalled();
  });

  it('should update child profile', async () => {
    childModel.findOne.mockResolvedValue(childDoc);

    const result = await service.updateChild(parentId, childId, {
      name: 'Aarav Sharma Updated',
      dateOfBirth: '2022-07-14',
      gender: Gender.MALE,
    });

    expect(result.data.name).toBe('Aarav Sharma Updated');
    expect(childDoc.save).toHaveBeenCalled();
  });

  it('should delete child profile', async () => {
    childModel.findOne.mockResolvedValue(childDoc);

    const result = await service.deleteChild(parentId, childId);

    expect(result.message).toBe('Child profile deleted successfully.');
    expect(childDoc.deleteOne).toHaveBeenCalled();
  });

  it('should throw when child not found', async () => {
    childModel.findOne.mockResolvedValue(null);

    await expect(
      service.deleteChild(parentId, '507f1f77bcf86cd799439099'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
