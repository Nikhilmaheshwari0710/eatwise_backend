import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiProductResult {
  name: string;
  brand: string;
  category: string;
  netWeight: string;
  healthScore: number;
  healthLabel: string;
  healthColor: string;
  ingredients: string;
  allergens: string[];
  nutritionPer100g: { calories: number; protein: number; carbohydrates: number; fat: number; saturatedFat: number; fiber: number; sugar: number; sodium: number; };
  highlights: Array<{ label: string; type: string; detail: string }>;
  suitableFor: { toddler: boolean; child: boolean; adult: boolean };
  isVeg: boolean;
}

@Injectable()
export class GeminiAnalysisService {
  private readonly logger = new Logger(GeminiAnalysisService.name);
  private genAI: GoogleGenerativeAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (apiKey && apiKey.length > 5) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Gemini AI initialized successfully');
    } else {
      this.logger.warn('GEMINI_API_KEY not set');
    }
  }

  async analyzeProductImage(imageBase64: string): Promise<GeminiProductResult | null> {
    if (!this.genAI) { this.logger.warn('Gemini AI not initialized'); return null; }
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = 'You are a food product nutritional analysis expert. Analyze this packaged food product image carefully. Extract: product name, brand, category, net weight, full ingredients, allergens, nutrition per 100g (calories, protein, carbohydrates, fat, saturatedFat, fiber, sugar, sodium), whether vegetarian. Then compute: healthScore (0-10), healthLabel (Excellent Choice=8-10, Good Choice=6-7.9, Moderate Choice=4-5.9, High Risk=0-3.9), up to 3 highlights (type: good/moderate/danger), age suitability (toddler/child/adult booleans). healthColor: Excellent=#10B981, Good=#22C55E, Moderate=#F59E0B, HighRisk=#EF4444. Respond ONLY with valid JSON, no markdown. Required keys: name, brand, category, netWeight, isVeg, ingredients, allergens, nutritionPer100g, healthScore, healthLabel, healthColor, highlights, suitableFor.';
      const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };
      const result = await model.generateContent([prompt, imagePart]);
      const text = (await result.response).text().trim();
      const cleaned = text.replace(/ + '`' + json/gi, '').replace(/ + '`' + /gi, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed.name || !parsed.brand) { this.logger.warn('Incomplete data from Gemini'); return null; }
      const score = parsed.healthScore || 5;
      if (!parsed.healthColor) {
        parsed.healthColor = score >= 8 ? '#10B981' : score >= 6 ? '#22C55E' : score >= 4 ? '#F59E0B' : '#EF4444';
      }
      this.logger.log('Gemini analyzed: ' + parsed.name + ' score=' + score);
      return parsed;
    } catch (err) {
      this.logger.error('Gemini analysis failed: ' + (err && err.message ? err.message : String(err)));
      return null;
    }
  }
}