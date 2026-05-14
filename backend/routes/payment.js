import express from 'express';
import {
  initiatePayment,
  checkPaymentStatus,
  handlePaymentWebhook
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/initiate', verifyToken, initiatePayment);
router.post('/check-status', verifyToken, checkPaymentStatus);

// Webhook (public - PayTech va appeler ceci)
router.post('/webhook', handlePaymentWebhook);

export default router;
