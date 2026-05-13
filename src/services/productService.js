// Service Products - Stocke les produits du backend
import { productsApi } from "@/integrations/api/client";

// Stockage en cache pour éviter trop d'appels API
let productsCache = null;
let categoriesCache = null;
let cacheTime = null;
let cacheTimeCategories = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const LOCAL_IMAGE_OVERRIDES = {
  l1: "/images/Lacostes/lacoste1.jpeg",
  l2: "/images/Lacostes/lacoste2.jpeg",
  a1: "/images/Abaya/abaya1.jpeg",
};

const normalizeImagePath = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  // Keep remote/data/blob urls unchanged.
  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  // Normalize Windows separators and common typo "/image/".
  const withForwardSlashes = trimmed.replace(/\\/g, "/");
  const fixedImageFolder = withForwardSlashes.replace(/^\/?image\//i, "images/");
  return fixedImageFolder.startsWith("/") ? fixedImageFolder : `/${fixedImageFolder}`;
};

const normalizeProductImage = (product) => {
  const localImage = LOCAL_IMAGE_OVERRIDES[product?.id];
  const normalizedImage = normalizeImagePath(localImage || product?.image);
  const normalizedImages = Array.isArray(product?.images)
    ? product.images.map(normalizeImagePath)
    : [];

  if (!localImage && !normalizedImage && normalizedImages.length === 0) return product;

  return {
    ...product,
    image: normalizedImage,
    images: normalizedImages.length > 0
      ? [normalizedImage || normalizedImages[0], ...normalizedImages.slice(1)]
      : normalizedImage
        ? [normalizedImage]
        : [],
  };
};

export const getProducts = async (category = null) => {
  try {
    // Retourner du cache si disponible et pas expiré
    if (productsCache && cacheTime && Date.now() - cacheTime < CACHE_DURATION) {
      if (!category || category === 'Tous') {
        return productsCache;
      }
      return productsCache.filter(p => p.category === category);
    }

    // Sinon fetcher du backend
    const products = (await productsApi.getAll(category)).map(normalizeProductImage);
    
    // Mettre en cache
    if (!category || category === 'Tous') {
      productsCache = products;
      cacheTime = Date.now();
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    // Retourner du cache si disponible et pas expiré
    if (categoriesCache && cacheTimeCategories && Date.now() - cacheTimeCategories < CACHE_DURATION) {
      return categoriesCache;
    }

    // Sinon fetcher du backend
    const categories = await productsApi.getCategories();
    
    // Mettre en cache
    categoriesCache = categories;
    cacheTimeCategories = Date.now();

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories if API fails
    return ['Tous', 'Vêtements', 'Accessoires', 'Chaussures'];
  }
};

export const getProductById = async (id) => {
  try {
    return normalizeProductImage(await productsApi.getById(id));
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const clearProductsCache = () => {
  productsCache = null;
  cacheTime = null;
};

export const clearCategoriesCache = () => {
  categoriesCache = null;
  cacheTimeCategories = null;
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
  }).format(price);
};

export const getWhatsAppLink = (product) => {
  const message = `Bonjour, je suis intéressé par ce produit:\n\n${product.name}\nPrix: ${formatPrice(product.price)}\n\nVoulez-vous plus d'informations?`;
  return `https://wa.me/221762048119?text=${encodeURIComponent(message)}`;
};
