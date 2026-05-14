import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['order_status_update', 'payment_status_update', 'user_delete', 'user_admin_toggle', 'product_create', 'product_update', 'product_delete'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['order', 'user', 'product'],
    required: true
  },
  entityId: {
    type: String,
    required: true
  },
  changes: {
    type: Object,
    default: {}
  },
  previousValues: {
    type: Object,
    default: {}
  },
  newValues: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  errorMessage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index pour les requêtes courantes
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
