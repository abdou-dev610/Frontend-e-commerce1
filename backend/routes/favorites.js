import express from 'express';
import { getFavorites, addFavorite, removeFavorite, checkFavorite } from '../controllers/favoriteController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:productId', removeFavorite);
router.get('/:productId/check', checkFavorite);

export default router;
