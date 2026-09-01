import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import { User } from '../../auth/schemas/user.schema';
import { Child } from '../../children/schemas/child.schema';
import { DeleteRequest } from '../schemas/delete-request.schema';
import { OtpService } from '../../auth/services/otp.service';
import { EmailService } from '../../email/email.service';
import { DeleteAccountReason, DeleteRequestStatus } from '../../../common/constants';

describe('AccountService', () => {
  let service: AccountService;

  const userId = '507f1f77bcf86cd799439011';
  const deleteRequestId = '507f1f77bcf86cd799439012';

  const userModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const childModel = {
    deleteMany: jest.fn(),
  };

  const deleteRequestModel = {
    updateMany: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  const otpService = {
    generateAndStore: jest.fn().mockResolvedValue('847291'),
    verify: jest.fn(),
    storeCode: jest.fn(),
    consumeMatchingToken: jest.fn(),
  };

  const emailService = {
    sendAccountDeleteOtpEmail: jest.fn(),
    sendAccountGoodbyeEmail: jest.fn(),
  };

  const userDoc = {
    _id: { toString: () => userId },
    email: 'ritika.sharma@gmail.com',
    fullName: 'Ritika Sharma',
    isActive: true,
    isDeleted: false,
    save: jest.fn().mockResolvedValue(undefined),
  };

  const deleteRequestDoc = {
    _id: { toString: () => deleteRequestId },
    status: DeleteRequestStatus.PENDING_OTP,
    reason: DeleteAccountReason.PRIVACY_CONCERNS,
    save: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    userDoc.isActive = true;
    userDoc.isDeleted = false;
    userDoc.email = 'ritika.sharma@gmail.com';
    userDoc.fullName = 'Ritika Sharma';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Child.name), useValue: childModel },
        { provide: getModelToken(DeleteRequest.name), useValue: deleteRequestModel },
        { provide: OtpService, useValue: otpService },
        { provide: EmailService, useValue: emailService },
      ],
    }).compile();

    service = module.get(AccountService);
    jest.clearAllMocks();

    userModel.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        passwordHash: '$2b$12$hashedpassword',
      }),
      then: (resolve: (value: unknown) => void) => resolve(userDoc),
    }));
  });

  it('should initiate deletion and send OTP', async () => {
    deleteRequestModel.create.mockResolvedValue(deleteRequestDoc);
    deleteRequestModel.updateMany.mockResolvedValue(undefined);

    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(true);

    const result = await service.requestDeletion(userId, {
      reason: DeleteAccountReason.PRIVACY_CONCERNS,
      reasonText: 'Privacy concerns',
      password: 'StrongP@ss1',
    });

    expect(result.message).toContain('OTP sent to');
    expect(result.data.deleteRequestId).toBe(deleteRequestId);
    expect(emailService.sendAccountDeleteOtpEmail).toHaveBeenCalled();
  });

  it('should reject wrong password', async () => {
    jest.spyOn(require('bcrypt'), 'compare').mockResolvedValue(false);

    await expect(
      service.requestDeletion(userId, {
        reason: DeleteAccountReason.OTHER,
        password: 'WrongPass1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should verify deletion OTP and return delete token', async () => {
    deleteRequestModel.findOne.mockResolvedValue(deleteRequestDoc);
    otpService.verify.mockResolvedValue(true);

    const result = await service.verifyDeletionOtp(userId, deleteRequestId, '847291');

    expect(result.message).toContain('OTP verified');
    expect(result.data.deleteToken).toBeDefined();
  });

  it('should delete account with valid delete token', async () => {
    deleteRequestModel.findOne.mockResolvedValue({
      ...deleteRequestDoc,
      status: DeleteRequestStatus.OTP_VERIFIED,
    });
    otpService.consumeMatchingToken.mockResolvedValue({
      userId: { toString: () => userId },
    });
    childModel.deleteMany.mockResolvedValue(undefined);
    deleteRequestModel.updateMany.mockResolvedValue(undefined);

    const result = await service.deleteAccount(userId, 'del_token_xyz789');

    expect(result.message).toContain('permanently deleted');
    expect(childModel.deleteMany).toHaveBeenCalled();
    expect(userDoc.save).toHaveBeenCalled();
  });

  it('should reject invalid delete token', async () => {
    otpService.consumeMatchingToken.mockResolvedValue(null);

    await expect(
      service.deleteAccount(userId, 'invalid-token'),
    ).rejects.toThrow('Invalid or expired delete token.');
  });

  it('should resend deletion OTP', async () => {
    deleteRequestModel.findOne.mockResolvedValue(deleteRequestDoc);

    const result = await service.resendDeletionOtp(userId, deleteRequestId);

    expect(result.message).toContain('New OTP sent to');
    expect(emailService.sendAccountDeleteOtpEmail).toHaveBeenCalled();
  });

  it('should throw when delete request not found', async () => {
    deleteRequestModel.findOne.mockResolvedValue(null);

    await expect(
      service.resendDeletionOtp(userId, deleteRequestId),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
