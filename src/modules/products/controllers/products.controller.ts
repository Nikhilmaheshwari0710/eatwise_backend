import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ProductsService } from '../services/products.service';
import { SearchProductsQueryDto } from '../dto/search-products-query.dto';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  @ApiResponse({ status: 200, description: 'Categories list returned' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by name or brand' })
  @ApiResponse({ status: 200, description: 'Search results returned' })
  async search(@Query() query: SearchProductsQueryDto) {
    return this.productsService.search(query);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Look up product by barcode' })
  @ApiResponse({ status: 200, description: 'Product details returned' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.getByBarcode(barcode);
  }
}
