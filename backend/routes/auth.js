import express from 'express';
import { signUp, signIn, adminSignIn, verifyToken, verifyEmail, resendVerification } from '../controllers/authController.js';
import { verifyToken as verifyTokenMiddleware } from '../middleware/auth.js';
import { authLimiter, adminAuthLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { signUpSchema, signInSchema } from '../schemas/auth.js';

const router = express.Router();

router.post('/signup', authLimiter, validate(signUpSchema), signUp);
router.post('/signin', authLimiter, validate(signInSchema), signIn);
router.post('/admin-signin', adminAuthLimiter, validate(signInSchema), adminSignIn);
router.get('/verify', verifyTokenMiddleware, verifyToken);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', authLimiter, verifyTokenMiddleware, resendVerification);

export default router;
