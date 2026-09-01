import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ScanDocument = Scan & Document;

@Schema({ timestamps: true })
export class Scan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  barcode: string;

  @Prop({ type: Types.ObjectId, ref: 'Child' })
  childId?: Types.ObjectId;

  @Prop()
  childName?: string;

  @Prop({ required: true, index: true })
  scannedAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ScanSchema = SchemaFactory.createForClass(Scan);

ScanSchema.index({ userId: 1, scannedAt: -1 });
ScanSchema.index({ userId: 1, childId: 1, scannedAt: -1 });
