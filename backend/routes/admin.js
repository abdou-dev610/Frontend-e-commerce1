import express from 'express';
import {
  getStats,
  getUsers,
  getUserOrders,
  toggleAdminStatus,
  deleteUser,
  archiveUserOrders,
  getAdminProducts,
  deleteStaticProduct,
  updateStaticProduct,
  toggleProductAvailability,
  getAuditLogs,
} from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, verifyAdmin);

router.get('/stats', getStats);
router.get('/products', getAdminProducts);
router.post('/products/static/delete', deleteStaticProduct);
router.post('/products/static/update', updateStaticProduct);
router.post('/products/toggle-availability', toggleProductAvailability);
router.get('/users', getUsers);
router.get('/users/:id/orders', getUserOrders);
router.put('/users/:id/toggle-admin', toggleAdminStatus);
router.put('/users/:id/archive-orders', archiveUserOrders);
router.delete('/users/:id', deleteUser);

export default router;
