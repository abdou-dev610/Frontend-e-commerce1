import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    sparse: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'userId is required']
  },
  customerName: {
    type: String,
    required: [true, 'customerName is required']
  },
  customerEmail: {
    type: String,
    default: null
  },
  customerPhone: {
    type: String,
    default: null
  },
  items: [{
    product_id: {
      type: String,
      sparse: true
    },
    productId: {
      type: String,
      sparse: true
    },
    name: {
      type: String,
      required: [true, 'Item name is required']
    },
    price: {
      type: Number,
      required: [true, 'Item price is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: 1
    },
    image: {
      type: String,
      default: null
    }
  }],
  totalAmount: {
    type: Number,
    required: [true, 'totalAmount is required'],
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'whatsapp',
    enum: ['wave', 'orange_money', 'free_money', 'whatsapp', 'card']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    default: null
  },
  refund: {
    status:      { type: String, enum: ['none', 'processing', 'completed', 'failed', 'manual_required'], default: 'none' },
    refundId:    { type: String, default: null },
    amount:      { type: Number, default: 0 },
    processedAt: { type: Date, default: null },
  },
  notes: {
    type: String,
    default: null
  },
  archived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ GÉNÉRER ORDERNUMBER AVANT VALIDATION (IMPORTANT!)
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderNumber = `CMD-${date}-${random}`;
    console.log('✅ orderNumber generated in pre-validate:', this.orderNumber);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
