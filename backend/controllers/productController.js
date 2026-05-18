import Product from '../models/Product.js';
import UnavailableProduct from '../models/UnavailableProduct.js';
import ExcludedProduct from '../models/ExcludedProduct.js';
import { products as productsData } from '../data/products.js';
import mongoose from 'mongoose';

export const getProducts = async (req, res) => {
  try {
    const { category } = req.query;

    const [dbProducts, excluded, unavailable] = await Promise.all([
      Product.find().sort({ createdAt: -1 }).lean(),
      ExcludedProduct.find().lean(),
      UnavailableProduct.find().lean(),
    ]);
    const excludedIds    = new Set(excluded.map(e => e.staticId));
    const unavailableIds = new Set(unavailable.map(u => u.staticId));

    const normalizedDbProducts = dbProducts.map(p => ({ ...p, id: p._id.toString() }));

    const normalizedStatic = productsData
      .filter(p => !EXCLUDED_CATEGORIES.includes(p.category) && !excludedIds.has(p.id))
      .map(p => ({ ...p, available: !unavailableIds.has(p.id) }));

    const merged = [...normalizedDbProducts, ...normalizedStatic];

    const filtered = category && category !== 'Tous'
      ? merged.filter(p => p.category === category)
      : merged;

    return res.json(filtered);
  } catch (error) {
    console.error('Get Products Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1) First check the local catalog (ids like "c8", "l1", etc.)
    const localProduct = productsData.find((product) => product.id === id);
    if (localProduct) {
      return res.json(localProduct);
    }

    // 2) Then check MongoDB only if id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Get Product Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description, image, images } = req.body;

    if (!name || !price || !category || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newProduct = new Product({
      name,
      price: parseFloat(price),
      category,
      description: description || '',
      image,
      images: images || [image]
    });

    await newProduct.save();
    return res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create Product Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category, description, image, images } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price: parseFloat(price),
        category,
        description,
        image,
        images: images || [image],
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Update Product Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const EXCLUDED_CATEGORIES = ['Chaussures'];

export const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Requête de recherche trop courte (min 2 caractères)' });
    }

    const [excluded, unavailable] = await Promise.all([
      ExcludedProduct.find().lean(),
      UnavailableProduct.find().lean(),
    ]);
    const excludedIds = new Set(excluded.map(e => e.staticId));
    const unavailableIds = new Set(unavailable.map(u => u.staticId));

    const dbResults = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).lean();

    const normalizedDb = dbResults.map(p => ({ ...p, id: p._id.toString() }));

    const lowerQ = q.toLowerCase();
    const staticResults = productsData
      .filter(p =>
        !EXCLUDED_CATEGORIES.includes(p.category) &&
        !excludedIds.has(p.id) &&
        (p.name.toLowerCase().includes(lowerQ) || p.description?.toLowerCase().includes(lowerQ) || p.category.toLowerCase().includes(lowerQ))
      )
      .map(p => ({ ...p, available: !unavailableIds.has(p.id) }));

    const merged = [...normalizedDb, ...staticResults];
    return res.json(merged);
  } catch (error) {
    console.error('Search Products Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const dbCategories = await Product.distinct('category');
    const localCategories = productsData.map(p => p.category);
    const all = [...new Set([...dbCategories, ...localCategories])]
      .filter(c => !EXCLUDED_CATEGORIES.includes(c))
      .sort();
    return res.json(all);
  } catch (error) {
    console.error('Get Categories Error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
