import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AccountService } from '../services/account.service';
import { DeleteAccountRequestDto } from '../dto/delete-account-request.dto';
import { DeleteVerifyOtpDto } from '../dto/delete-verify-otp.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import { ResendDeleteOtpDto } from '../dto/resend-delete-otp.dto';

@ApiTags('Account')
@Controller('account')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('delete-request')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Initiate account deletion with reason and password' })
  @ApiResponse({ status: 200, description: 'OTP sent to registered email' })
  @ApiResponse({ status: 401, description: 'Incorrect password' })
  async requestDeletion(
    @CurrentUser('id') userId: string,
    @Body() dto: DeleteAccountRequestDto,
  ) {
    return this.accountService.requestDeletion(userId, dto);
  }

  @Post('delete-verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify OTP to confirm deletion intent' })
  @ApiResponse({ status: 200, description: 'OTP verified, delete token returned' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifyDeletionOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: DeleteVerifyOtpDto,
  ) {
    return this.accountService.verifyDeletionOtp(userId, dto.deleteRequestId, dto.otp);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete account after OTP verification' })
  @ApiResponse({ status: 200, description: 'Account permanently deleted' })
  @ApiResponse({ status: 400, description: 'Invalid or expired delete token' })
  async deleteAccount(
    @CurrentUser('id') userId: string,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.accountService.deleteAccount(userId, dto.deleteToken);
  }

  @Post('delete-request/resend-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Resend account deletion OTP' })
  @ApiResponse({ status: 200, description: 'New OTP sent' })
  async resendDeletionOtp(
    @CurrentUser('id') userId: string,
    @Body() dto: ResendDeleteOtpDto,
  ) {
    return this.accountService.resendDeletionOtp(userId, dto.deleteRequestId);
  }
}
