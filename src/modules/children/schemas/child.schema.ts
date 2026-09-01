import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  BmiCategory,
  BloodGroup,
  ChildAvatarPresetId,
  DietPreference,
  Gender,
  HeightUnit,
  WeightUnit,
} from '../../../common/constants';

export type GrowthRecordDocument = GrowthRecord & Document;

@Schema({ _id: false })
export class GrowthRecord {
  @Prop({ required: true })
  weight: number;

  @Prop({ type: String, enum: WeightUnit, default: WeightUnit.KG })
  weightUnit: WeightUnit;

  @Prop({ required: true })
  height: number;

  @Prop({ type: String, enum: HeightUnit, default: HeightUnit.CM })
  heightUnit: HeightUnit;

  @Prop({ required: true })
  bmi: number;

  @Prop({ type: String, enum: BmiCategory, required: true })
  bmiCategory: BmiCategory;

  @Prop({ required: true })
  recordedAt: Date;
}

export const GrowthRecordSchema = SchemaFactory.createForClass(GrowthRecord);

export type ChildDocument = Child & Document;

@Schema({ timestamps: true })
export class Child {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  parentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  dateOfBirth: string;

  @Prop({ type: String, enum: Gender, required: true })
  gender: Gender;

  @Prop()
  avatarUrl?: string;

  @Prop({ type: String, enum: ChildAvatarPresetId })
  avatarPresetId?: ChildAvatarPresetId;

  @Prop({ type: String, enum: BloodGroup })
  bloodGroup?: BloodGroup;

  @Prop({ type: [String], default: [] })
  allergies: string[];

  @Prop({ type: [String], default: [] })
  medicalConditions: string[];

  @Prop({ type: String, enum: DietPreference })
  dietPreference?: DietPreference;

  @Prop({ type: [GrowthRecordSchema], default: [] })
  growthRecords: GrowthRecord[];

  @Prop({ default: 0 })
  healthScore: number;

  @Prop({ default: 0 })
  totalScans: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ChildSchema = SchemaFactory.createForClass(Child);

ChildSchema.index({ parentId: 1, createdAt: -1 });
