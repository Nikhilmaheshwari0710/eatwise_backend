import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { HighlightType } from '../../../common/constants';

@Schema({ _id: false })
export class NutritionFacts {
  @Prop({ required: true })
  calories: number;

  @Prop({ required: true })
  protein: number;

  @Prop({ required: true })
  carbohydrates: number;

  @Prop({ required: true })
  fat: number;

  @Prop({ required: true })
  saturatedFat: number;

  @Prop({ required: true })
  fiber: number;

  @Prop({ required: true })
  sugar: number;

  @Prop({ required: true })
  sodium: number;

  @Prop()
  calcium?: number;
}

export const NutritionFactsSchema = SchemaFactory.createForClass(NutritionFacts);

@Schema({ _id: false })
export class ProductHighlight {
  @Prop({ required: true })
  label: string;

  @Prop({ type: String, enum: HighlightType, required: true })
  type: HighlightType;

  @Prop({ required: true })
  detail: string;
}

export const ProductHighlightSchema = SchemaFactory.createForClass(ProductHighlight);

@Schema({ _id: false })
export class SuitableFor {
  @Prop({ default: false })
  toddler: boolean;

  @Prop({ default: false })
  child: boolean;

  @Prop({ default: true })
  adult: boolean;
}

export const SuitableForSchema = SchemaFactory.createForClass(SuitableFor);

@Schema({ _id: false })
export class ProductAlternative {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ default: false })
  isAffiliate: boolean;

  @Prop()
  affiliateUrl?: string;
}

export const ProductAlternativeSchema = SchemaFactory.createForClass(ProductAlternative);

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true, index: true })
  barcode: string;

  @Prop({ required: true, trim: true, index: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  brand: string;

  @Prop({ type: Types.ObjectId, ref: 'ProductCategory', required: true, index: true })
  categoryId: Types.ObjectId;

  @Prop()
  imageUrl?: string;

  @Prop({ index: true })
  imageHash?: string;

  @Prop({ required: true })
  netWeight: string;

  @Prop({ required: true, min: 0, max: 10 })
  healthScore: number;

  @Prop({ default: true })
  isVeg: boolean;

  @Prop()
  servingSize?: string;

  @Prop()
  ingredients?: string;

  @Prop({ type: [String], default: [] })
  allergens: string[];

  @Prop({ type: NutritionFactsSchema, required: true })
  nutritionPer100g: NutritionFacts;

  @Prop({ type: [ProductHighlightSchema], default: [] })
  highlights: ProductHighlight[];

  @Prop({ type: SuitableForSchema, default: () => ({}) })
  suitableFor: SuitableFor;

  @Prop({ type: [ProductAlternativeSchema], default: [] })
  alternatives: ProductAlternative[];

  createdAt?: Date;
  updatedAt?: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', brand: 'text' });
