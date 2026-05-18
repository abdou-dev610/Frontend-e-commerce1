import express from 'express';
import {
  initiatePayment,
  checkPaymentStatus,
  handlePaymentWebhook,
  refundPayment
} from '../controllers/paymentController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/initiate', verifyToken, initiatePayment);
router.post('/check-status', verifyToken, checkPaymentStatus);

// Admin only
router.post('/refund', verifyToken, verifyAdmin, refundPayment);

// Webhook (public - PayTech va appeler ceci)
router.post('/webhook', handlePaymentWebhook);

export default router;
