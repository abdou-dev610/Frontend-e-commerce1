import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  notifyAdminNewOrder,
  confirmPayment
} from '../controllers/orderController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Notification route (pas d'auth requise - appelée après paiement) ⚠️ DOIT ÊTRE AVANT les routes avec :id
router.post('/notify-admin', notifyAdminNewOrder);

// User & Admin routes
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id', verifyToken, verifyAdmin, updateOrderStatus);
router.post('/:id/cancel', verifyToken, cancelOrder);

// Client payment confirmation route (sans admin check)
router.post('/:id/confirm-payment', verifyToken, confirmPayment);

export default router;
