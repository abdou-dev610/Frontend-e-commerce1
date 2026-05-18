import mongoose from 'mongoose';

const excludedProductSchema = new mongoose.Schema({
  staticId: { type: String, required: true, unique: true },
  excludedAt: { type: Date, default: Date.now },
});

export default mongoose.model('ExcludedProduct', excludedProductSchema);
