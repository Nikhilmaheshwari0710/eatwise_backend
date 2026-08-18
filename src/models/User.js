const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const childProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  allergies: [String],
  dietaryPreferences: [String],
  healthConditions: [String],
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  children: [childProfileSchema],
  preferences: {
    dietType: { type: String, enum: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'other'], default: 'other' },
    allergies: [String],
    healthGoals: [String],
  },
  scanCount: { type: Number, default: 0 },
  plan: { type: String, enum: ['free', 'pro', 'family'], default: 'free' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
