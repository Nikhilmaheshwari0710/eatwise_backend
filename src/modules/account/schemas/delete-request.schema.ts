import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DeleteAccountReason, DeleteRequestStatus } from '../../../common/constants';

export type DeleteRequestDocument = DeleteRequest & Document;

@Schema({ timestamps: true })
export class DeleteRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: DeleteAccountReason, required: true })
  reason: DeleteAccountReason;

  @Prop({ maxlength: 300 })
  reasonText?: string;

  @Prop({ type: String, enum: DeleteRequestStatus, default: DeleteRequestStatus.PENDING_OTP })
  status: DeleteRequestStatus;

  @Prop({ required: true })
  otpExpiresAt: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const DeleteRequestSchema = SchemaFactory.createForClass(DeleteRequest);

DeleteRequestSchema.index({ userId: 1, status: 1 });
