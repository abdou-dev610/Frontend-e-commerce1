import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Lacostes', 'Abayas', 'Qamis', 'Pullovers', 'Pantalons', 'Ensembles']
  },
  description: String,
  image: {
    type: String,
    required: true
  },
  images: [String], // Pour 15 images par produit
  stock: {
    type: Number,
    default: 100
  },
  available: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5
  },
  reviews: [{
    user: String,
    comment: String,
    rating: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

productSchema.index({ name: 'text', description: 'text', category: 'text' });

export default mongoose.model('Product', productSchema);
