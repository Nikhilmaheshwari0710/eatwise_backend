import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../auth/schemas/user.schema';
import { Child, ChildDocument } from '../../children/schemas/child.schema';
import { DeleteRequest, DeleteRequestDocument } from '../schemas/delete-request.schema';
import { OtpService } from '../../auth/services/otp.service';
import { EmailService } from '../../email/email.service';
import { DeleteAccountRequestDto } from '../dto/delete-account-request.dto';
import {
  DeleteRequestStatus,
  OtpType,
} from '../../../common/constants';
import { maskEmail } from '../utils/account.util';

const DELETE_OTP_EXPIRY_SECONDS = 600;
const DELETE_TOKEN_EXPIRY_SECONDS = 900;

@Injectable()
export class AccountService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
    @InjectModel(DeleteRequest.name) private deleteRequestModel: Model<DeleteRequestDocument>,
    private otpService: OtpService,
    private emailService: EmailService,
  ) {}

  async requestDeletion(userId: string, dto: DeleteAccountRequestDto) {
    const user = await this.findActiveUser(userId);

    if (!user.email) {
      throw new BadRequestException('An email address is required to delete your account');
    }

    await this.verifyPassword(user, dto.password);

    await this.deleteRequestModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: { $in: [DeleteRequestStatus.PENDING_OTP, DeleteRequestStatus.OTP_VERIFIED] },
      },
      { status: DeleteRequestStatus.CANCELLED },
    );

    const otpExpiresAt = new Date(Date.now() + DELETE_OTP_EXPIRY_SECONDS * 1000);
    const deleteRequest = await this.deleteRequestModel.create({
      userId: new Types.ObjectId(userId),
      reason: dto.reason,
      reasonText: dto.reasonText,
      status: DeleteRequestStatus.PENDING_OTP,
      otpExpiresAt,
    });

    const deleteRequestId = deleteRequest._id.toString();
    const otp = await this.otpService.generateAndStore(
      deleteRequestId,
      OtpType.ACCOUNT_DELETE,
      userId,
      DELETE_OTP_EXPIRY_SECONDS,
    );

    try {
      await this.emailService.sendAccountDeleteOtpEmail({
        email: user.email,
        fullName: user.fullName,
        otp,
      });
    } catch {
      await this.deleteRequestModel.findByIdAndDelete(deleteRequest._id);
      throw new ServiceUnavailableException('Unable to send account deletion OTP');
    }

    const maskedEmail = maskEmail(user.email);

    return {
      message: `OTP sent to ${maskedEmail} for account deletion verification.`,
      data: {
        deleteRequestId,
        maskedEmail,
        otpExpiresAt,
      },
    };
  }

  async verifyDeletionOtp(userId: string, deleteRequestId: string, otp: string) {
    const deleteRequest = await this.findPendingDeleteRequest(userId, deleteRequestId);

    try {
      await this.otpService.verify(deleteRequestId, OtpType.ACCOUNT_DELETE, otp);
    } catch {
      throw new BadRequestException('Invalid or expired OTP. Please try again.');
    }

    const deleteToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + DELETE_TOKEN_EXPIRY_SECONDS * 1000);

    await this.otpService.storeCode(
      userId,
      OtpType.ACCOUNT_DELETE_TOKEN,
      deleteToken,
      userId,
      DELETE_TOKEN_EXPIRY_SECONDS,
      false,
    );

    deleteRequest.status = DeleteRequestStatus.OTP_VERIFIED;
    await deleteRequest.save();

    return {
      message: 'OTP verified. Proceed to confirm account deletion.',
      data: {
        deleteToken,
        expiresAt,
      },
    };
  }

  async deleteAccount(userId: string, deleteToken: string) {
    const user = await this.findActiveUser(userId);
    const tokenRecord = await this.otpService.consumeMatchingToken(
      OtpType.ACCOUNT_DELETE_TOKEN,
      deleteToken,
    );

    if (!tokenRecord || tokenRecord.userId?.toString() !== userId) {
      throw new BadRequestException('Invalid or expired delete token.');
    }

    const originalEmail = user.email;
    const originalName = user.fullName;
    const deletedAt = new Date();

    await this.childModel.deleteMany({ parentId: new Types.ObjectId(userId) });

    const pendingRequest = await this.deleteRequestModel.findOne({
      userId: new Types.ObjectId(userId),
      status: DeleteRequestStatus.OTP_VERIFIED,
    });

    user.fullName = 'Deleted User';
    user.email = `deleted_${userId}@deleted.eatwise.app`;
    user.phoneNumber = undefined;
    user.googleId = undefined;
    user.passwordHash = '';
    user.refreshTokenHash = '';
    user.avatarUrl = undefined;
    user.avatarPresetId = undefined;
    user.dateOfBirth = undefined;
    user.gender = undefined;
    user.preferredLanguage = undefined;
    user.dietPreference = undefined;
    user.nutritionGoal = undefined;
    user.isEmailVerified = false;
    user.isPhoneVerified = false;
    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = deletedAt;
    user.deletionReason = pendingRequest?.reason;
    user.isPremium = false;

    await user.save();

    if (pendingRequest) {
      pendingRequest.status = DeleteRequestStatus.COMPLETED;
      await pendingRequest.save();
    }

    await this.deleteRequestModel.updateMany(
      {
        userId: new Types.ObjectId(userId),
        status: { $in: [DeleteRequestStatus.PENDING_OTP, DeleteRequestStatus.OTP_VERIFIED] },
      },
      { status: DeleteRequestStatus.CANCELLED },
    );

    if (originalEmail) {
      try {
        await this.emailService.sendAccountGoodbyeEmail({
          email: originalEmail,
          fullName: originalName,
        });
      } catch {
        // Account is already deleted; don't fail the request if email fails.
      }
    }

    return {
      message: 'Your account has been permanently deleted. We are sorry to see you go.',
      data: { deletedAt },
    };
  }

  async resendDeletionOtp(userId: string, deleteRequestId: string) {
    const deleteRequest = await this.findPendingDeleteRequest(userId, deleteRequestId);
    const user = await this.findActiveUser(userId);

    if (!user.email) {
      throw new BadRequestException('An email address is required to delete your account');
    }

    const otpExpiresAt = new Date(Date.now() + DELETE_OTP_EXPIRY_SECONDS * 1000);
    const otp = await this.otpService.generateAndStore(
      deleteRequestId,
      OtpType.ACCOUNT_DELETE,
      userId,
      DELETE_OTP_EXPIRY_SECONDS,
    );

    try {
      await this.emailService.sendAccountDeleteOtpEmail({
        email: user.email,
        fullName: user.fullName,
        otp,
      });
    } catch {
      throw new ServiceUnavailableException('Unable to send account deletion OTP');
    }

    deleteRequest.otpExpiresAt = otpExpiresAt;
    await deleteRequest.save();

    const maskedEmail = maskEmail(user.email);

    return {
      message: `New OTP sent to ${maskedEmail}.`,
      data: { otpExpiresAt },
    };
  }

  private async verifyPassword(user: UserDocument, password: string) {
    const userWithPassword = await this.userModel.findById(user._id).select('+passwordHash');
    if (!userWithPassword?.passwordHash) {
      return;
    }

    const isValid = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password. Please try again.');
    }
  }

  private async findActiveUser(userId: string): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new UnauthorizedException();
    }
    return user as UserDocument;
  }

  private async findPendingDeleteRequest(
    userId: string,
    deleteRequestId: string,
  ): Promise<DeleteRequestDocument> {
    if (!Types.ObjectId.isValid(deleteRequestId)) {
      throw new NotFoundException('Delete request not found.');
    }

    const deleteRequest = await this.deleteRequestModel.findOne({
      _id: new Types.ObjectId(deleteRequestId),
      userId: new Types.ObjectId(userId),
      status: DeleteRequestStatus.PENDING_OTP,
    });

    if (!deleteRequest) {
      throw new NotFoundException('Delete request not found.');
    }

    return deleteRequest;
  }
}
