const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  childProfile: { type: mongoose.Schema.Types.ObjectId },
  verdict: { type: String, enum: ['safe', 'caution', 'avoid'], default: 'caution' },
  personalizedWarnings: [String],
  scannedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
