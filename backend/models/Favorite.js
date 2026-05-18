import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: String, required: true },
  productData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

favoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('Favorite', favoriteSchema);
