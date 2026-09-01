import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ScansService } from '../services/scans.service';
import { CreateScanDto } from '../dto/create-scan.dto';
import { ScanHistoryQueryDto } from '../dto/scan-history-query.dto';

@ApiTags('Scans')
@Controller('scans')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get scan history with filters' })
  @ApiResponse({ status: 200, description: 'Scan history returned' })
  async getHistory(
    @CurrentUser('id') userId: string,
    @Query() query: ScanHistoryQueryDto,
  ) {
    return this.scansService.getHistory(userId, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Save a product scan record' })
  @ApiResponse({ status: 201, description: 'Scan saved successfully' })
  async createScan(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateScanDto,
  ) {
    return this.scansService.createScan(userId, dto);
  }
}
