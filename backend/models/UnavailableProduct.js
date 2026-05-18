import mongoose from 'mongoose';

const unavailableProductSchema = new mongoose.Schema({
  staticId: { type: String, required: true, unique: true },
  markedAt: { type: Date, default: Date.now },
});

export default mongoose.model('UnavailableProduct', unavailableProductSchema);
