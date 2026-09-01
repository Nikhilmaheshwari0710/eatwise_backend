import { Injectable } from '@nestjs/common';
import { ProductsService } from '../../products/services/products.service';
import {
  HEALTH_LABEL_TIERS,
  PRODUCT_CATEGORIES,
  SCAN_HISTORY_FILTERS,
} from '../../products/config/product-masters.config';

@Injectable()
export class MastersService {
  constructor(private readonly productsService: ProductsService) {}

  async getScanMasters() {
    const categoriesResult = await this.productsService.getCategories();

    return {
      message: 'Scan masters fetched successfully',
      data: {
        productCategories: categoriesResult.data.categories.length
          ? categoriesResult.data.categories
          : PRODUCT_CATEGORIES.map((category, index) => ({
              id: `cat_${String(index + 1).padStart(2, '0')}`,
              name: category.name,
              productCount: 0,
            })),
        healthLabels: HEALTH_LABEL_TIERS.map((tier) => ({
          label: tier.label,
          color: tier.color,
          minScore: tier.minScore,
        })),
        scanHistoryFilters: SCAN_HISTORY_FILTERS,
        highlightTypes: ['danger', 'warning', 'success', 'info'],
      },
    };
  }
}
