import { ProductDocument } from '../schemas/product.schema';
import { getHealthMeta } from '../config/product-masters.config';

export function toProductListItem(product: ProductDocument, categoryName?: string) {
  const { healthLabel, healthColor } = getHealthMeta(product.healthScore);

  return {
    productId: product._id.toString(),
    name: product.name,
    brand: product.brand,
    barcode: product.barcode,
    category: categoryName ?? '',
    imageUrl: product.imageUrl,
    healthScore: product.healthScore,
    healthLabel,
    healthColor,
    isVeg: product.isVeg,
    netWeight: product.netWeight,
  };
}

export function toProductDetail(
  product: ProductDocument,
  categoryName: string,
  alternatives: Array<{
    productId: string;
    name: string;
    brand: string;
    healthScore: number;
    imageUrl?: string;
    isAffiliate: boolean;
    affiliateUrl?: string;
  }>,
) {
  const { healthLabel, healthColor } = getHealthMeta(product.healthScore);

  return {
    productId: product._id.toString(),
    barcode: product.barcode,
    name: product.name,
    brand: product.brand,
    category: categoryName,
    imageUrl: product.imageUrl,
    netWeight: product.netWeight,
    healthScore: product.healthScore,
    healthLabel,
    healthColor,
    isVeg: product.isVeg,
    servingSize: product.servingSize,
    ingredients: product.ingredients,
    allergens: product.allergens,
    nutritionPer100g: product.nutritionPer100g,
    highlights: product.highlights,
    suitableFor: product.suitableFor,
    alternatives,
  };
}

export function isValidBarcode(barcode: string): boolean {
  return /^\d{8,14}$/.test(barcode);
}
