import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Scan, ScanDocument } from '../schemas/scan.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Child, ChildDocument } from '../../children/schemas/child.schema';
import { CreateScanDto } from '../dto/create-scan.dto';
import { ScanHistoryQueryDto } from '../dto/scan-history-query.dto';
import { ScanHistoryFilter } from '../../../common/constants';
import { getHealthMeta, getHealthFilterRange } from '../../products/config/product-masters.config';

@Injectable()
export class ScansService {
  constructor(
    @InjectModel(Scan.name) private scanModel: Model<ScanDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Child.name) private childModel: Model<ChildDocument>,
  ) {}

  async createScan(userId: string, dto: CreateScanDto) {
    const product = await this.productModel.findById(dto.productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.barcode !== dto.barcode) {
      throw new BadRequestException('Barcode does not match product');
    }

    let childName: string | undefined;
    if (dto.childId) {
      const child = await this.childModel.findOne({
        _id: new Types.ObjectId(dto.childId),
        parentId: new Types.ObjectId(userId),
      });
      if (!child) {
        throw new ForbiddenException('Child not found or access denied');
      }
      childName = child.name;
      await this.childModel.findByIdAndUpdate(child._id, { $inc: { totalScans: 1 } });
    }

    const scan = await this.scanModel.create({
      userId: new Types.ObjectId(userId),
      productId: product._id,
      barcode: dto.barcode,
      childId: dto.childId ? new Types.ObjectId(dto.childId) : undefined,
      childName,
      scannedAt: new Date(dto.scannedAt),
    });

    return {
      message: 'Scan saved successfully.',
      data: {
        scanId: scan._id.toString(),
        productId: product._id.toString(),
        scannedAt: scan.scannedAt,
      },
    };
  }

  async getHistory(userId: string, query: ScanHistoryQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter = query.filter ?? ScanHistoryFilter.ALL;

    const baseFilter: Record<string, unknown> = {
      userId: new Types.ObjectId(userId),
    };

    if (query.childId) {
      if (!Types.ObjectId.isValid(query.childId)) {
        throw new BadRequestException('Invalid childId');
      }
      baseFilter.childId = new Types.ObjectId(query.childId);
    }

    if (query.startDate || query.endDate) {
      baseFilter.scannedAt = {};
      if (query.startDate) {
        (baseFilter.scannedAt as Record<string, Date>).$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        (baseFilter.scannedAt as Record<string, Date>).$lte = end;
      }
    }

    const allScans = await this.scanModel.find(baseFilter).sort({ scannedAt: -1 });
    const productIds = [...new Set(allScans.map((scan) => scan.productId.toString()))];
    const products = await this.productModel.find({
      _id: { $in: productIds.map((id) => new Types.ObjectId(id)) },
    });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    const enriched = allScans
      .map((scan) => {
        const product = productMap.get(scan.productId.toString());
        if (!product) return null;

        const { healthLabel, healthColor } = getHealthMeta(product.healthScore);
        return {
          scan,
          product,
          healthLabel,
          healthColor,
        };
      })
      .filter(Boolean) as Array<{
      scan: ScanDocument;
      product: ProductDocument;
      healthLabel: string;
      healthColor: string;
    }>;

    const healthRange = getHealthFilterRange(filter);
    const filtered = healthRange
      ? enriched.filter((item) => {
          const score = item.product.healthScore;
          if (healthRange.min !== undefined && score < healthRange.min) return false;
          if (healthRange.max !== undefined && score > healthRange.max) return false;
          return true;
        })
      : enriched;

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    const summary = {
      totalScans: enriched.length,
      healthyCount: enriched.filter((item) => item.product.healthScore >= 6).length,
      moderateCount: enriched.filter(
        (item) => item.product.healthScore >= 4 && item.product.healthScore < 6,
      ).length,
      highRiskCount: enriched.filter((item) => item.product.healthScore < 4).length,
    };

    return {
      message: 'Scan history fetched successfully',
      data: {
        scans: paginated.map(({ scan, product, healthLabel, healthColor }) => ({
          scanId: scan._id.toString(),
          productId: product._id.toString(),
          productName: product.name,
          productBrand: product.brand,
          productImageUrl: product.imageUrl,
          healthScore: product.healthScore,
          healthLabel,
          healthColor,
          childId: scan.childId?.toString() ?? null,
          childName: scan.childName ?? null,
          scannedAt: scan.scannedAt,
        })),
        summary,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 0,
        },
      },
    };
  }
}
