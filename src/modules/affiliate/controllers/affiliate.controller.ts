import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AffiliateService } from '../services/affiliate.service';
import { EnrollAffiliateDto } from '../dto/enroll-affiliate.dto';
import { GenerateAffiliateLinkDto } from '../dto/generate-affiliate-link.dto';
import { TrackAffiliateClickDto } from '../dto/track-affiliate-click.dto';
import { GetAffiliateTransactionsQueryDto } from '../dto/get-affiliate-transactions-query.dto';
import { UpdateBankDetailsDto } from '../dto/update-bank-details.dto';

@ApiTags('Affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('track-click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Track a click on an affiliate link' })
  @ApiResponse({ status: 200, description: 'Click tracked' })
  trackClick(@Body() dto: TrackAffiliateClickDto) {
    return this.affiliateService.trackClick(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate profile and earnings summary' })
  @ApiResponse({ status: 200, description: 'Profile returned' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.affiliateService.getProfile(userId);
  }

  @Get('platforms')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get supported affiliate platforms' })
  @ApiResponse({ status: 200, description: 'Platforms returned' })
  getPlatforms() {
    return this.affiliateService.getPlatforms();
  }

  @Post('generate-link')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate a custom affiliate link' })
  @ApiResponse({ status: 200, description: 'Link generated' })
  generateLink(@CurrentUser('id') userId: string, @Body() dto: GenerateAffiliateLinkDto) {
    return this.affiliateService.generateLink(userId, dto);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get affiliate transaction history' })
  @ApiResponse({ status: 200, description: 'Transactions returned' })
  getTransactions(
    @CurrentUser('id') userId: string,
    @Query() query: GetAffiliateTransactionsQueryDto,
  ) {
    return this.affiliateService.getTransactions(
      userId,
      query.page,
      query.limit,
      query.platformId,
      query.status,
    );
  }

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll in the affiliate program' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  enroll(@CurrentUser('id') userId: string, @Body() dto: EnrollAffiliateDto) {
    return this.affiliateService.enroll(userId, dto);
  }

  @Put('bank-details')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save or update bank details for payout' })
  @ApiResponse({ status: 200, description: 'Bank details saved' })
  updateBankDetails(@CurrentUser('id') userId: string, @Body() dto: UpdateBankDetailsDto) {
    return this.affiliateService.updateBankDetails(userId, dto);
  }
}
