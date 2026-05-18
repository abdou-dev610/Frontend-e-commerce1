import Favorite from '../models/Favorite.js';

export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId }).sort({ createdAt: -1 });
    return res.json(favorites.map(f => f.productData));
  } catch (error) {
    console.error('Get Favorites Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const { productId, productData } = req.body;
    if (!productId || !productData) {
      return res.status(400).json({ message: 'productId et productData requis' });
    }

    await Favorite.findOneAndUpdate(
      { userId: req.userId, productId },
      { userId: req.userId, productId, productData },
      { upsert: true, new: true }
    );

    return res.status(201).json({ success: true });
  } catch (error) {
    console.error('Add Favorite Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    await Favorite.findOneAndDelete({ userId: req.userId, productId });
    return res.json({ success: true });
  } catch (error) {
    console.error('Remove Favorite Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const checkFavorite = async (req, res) => {
  try {
    const { productId } = req.params;
    const fav = await Favorite.findOne({ userId: req.userId, productId });
    return res.json({ isFavorite: !!fav });
  } catch (error) {
    console.error('Check Favorite Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
