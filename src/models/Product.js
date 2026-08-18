const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  barcode: { type: String, index: true },
  name: { type: String, required: true },
  brand: { type: String, default: '' },
  category: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  ingredients: [String],
  nutritionFacts: {
    servingSize: String,
    calories: Number,
    totalFat: Number,
    saturatedFat: Number,
    transFat: Number,
    cholesterol: Number,
    sodium: Number,
    totalCarbs: Number,
    dietaryFiber: Number,
    sugars: Number,
    addedSugars: Number,
    protein: Number,
  },
  healthScore: { type: Number, min: 0, max: 100, default: 50 },
  safetyScore: { type: Number, min: 0, max: 100, default: 50 },
  processingLevel: { type: String, enum: ['minimal', 'moderate', 'high', 'ultra'], default: 'moderate' },
  flaggedIngredients: [{
    name: String,
    reason: String,
    severity: { type: String, enum: ['low', 'medium', 'high'] },
  }],
  alternatives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Product', productSchema);
