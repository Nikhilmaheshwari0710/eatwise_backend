const Product = require('../models/Product');
const ScanHistory = require('../models/ScanHistory');
const User = require('../models/User');

exports.scanBarcode = async (req, res, next) => {
  try {
    const { barcode } = req.params;
    let product = await Product.findOne({ barcode }).populate('alternatives', 'name brand healthScore imageUrl');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found. Try label scan instead.' });
    }

    const user = await User.findById(req.user._id);
    const childId = req.query.childId;
    const child = childId ? user.children.id(childId) : null;

    const personalizedWarnings = [];
    const userAllergies = [...(user.preferences?.allergies || []), ...(child?.allergies || [])];

    product.ingredients.forEach(ingredient => {
      const lower = ingredient.toLowerCase();
      userAllergies.forEach(allergy => {
        if (lower.includes(allergy.toLowerCase())) {
          personalizedWarnings.push(`Contains ${ingredient} — flagged for ${allergy} allergy`);
        }
      });
    });

    let verdict = 'safe';
    if (product.healthScore < 40 || personalizedWarnings.length > 0) verdict = 'avoid';
    else if (product.healthScore < 70) verdict = 'caution';

    await ScanHistory.create({
      user: req.user._id,
      product: product._id,
      childProfile: childId,
      verdict,
      personalizedWarnings,
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { scanCount: 1 } });

    res.json({ success: true, product, verdict, personalizedWarnings });
  } catch (error) {
    next(error);
  }
};

exports.analyzeLabelImage = async (req, res, next) => {
  try {
    // Placeholder for AI/OCR integration
    // In production, this would accept an image, run OCR, parse ingredients, and return analysis
    res.json({
      success: true,
      message: 'Label analysis endpoint ready. Integrate AI/OCR service here.',
      mockResult: {
        detectedIngredients: ['Sugar', 'Palm Oil', 'Artificial Color (Red 40)', 'Sodium Benzoate'],
        healthScore: 35,
        verdict: 'avoid',
        flaggedIngredients: [
          { name: 'Red 40', reason: 'Linked to hyperactivity in children', severity: 'high' },
          { name: 'Palm Oil', reason: 'High in saturated fat', severity: 'medium' },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('alternatives', 'name brand healthScore imageUrl');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const query = {};
    if (q) query.$text = { $search: q };
    if (category) query.category = category;

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('name brand category healthScore imageUrl barcode');

    const total = await Product.countDocuments(query);

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

exports.getScanHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const history = await ScanHistory.find({ user: req.user._id })
      .populate('product', 'name brand imageUrl healthScore')
      .sort('-scannedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await ScanHistory.countDocuments({ user: req.user._id });

    res.json({ success: true, history, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
