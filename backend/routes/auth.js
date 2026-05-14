import express from 'express';
import { signUp, signIn, adminSignIn, verifyToken } from '../controllers/authController.js';
import { verifyToken as verifyTokenMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/admin-signin', adminSignIn);
router.get('/verify', verifyTokenMiddleware, verifyToken);

export default router;
