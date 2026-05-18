import { productsApi } from "@/integrations/api/client";
import { products as staticProducts, categories as staticCategories } from "@/data/products.js";

let productsCache = null;
let categoriesCache = null;
let cacheTime = null;
let cacheTimeCategories = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const normalizedImage = normalizeImagePath(product?.image);
  const normalizedImages = Array.isArray(product?.images)
    ? product.images.map(normalizeImagePath)
    : [];

  return {
    ...product,
    image: normalizedImage,
    images: normalizedImages.length > 0
      ? normalizedImages
      : normalizedImage
        ? [normalizedImage]
        : [],
  };
};

// Static products normalized once at module load (no async needed)
const normalizedStatic = staticProducts.map(p => normalizeProductImage({ ...p, available: true }));

export const getProducts = async (category = null) => {
  try {
    if (!productsCache || !cacheTime || Date.now() - cacheTime >= CACHE_DURATION) {
      const all = (await productsApi.getAll(null)).map(normalizeProductImage);
      productsCache = all;
      cacheTime = Date.now();
    }

    if (!category || category === 'Tous') {
      return productsCache;
    }
    return productsCache.filter(p => p.category === category);
  } catch (error) {
    // Render free tier may be sleeping — fall back to local static products so images always display
    console.warn('API indisponible, affichage des produits statiques:', error.message);
    if (!category || category === 'Tous') return normalizedStatic;
    return normalizedStatic.filter(p => p.category === category);
  }
};

export const getCategories = async () => {
  try {
    if (categoriesCache && cacheTimeCategories && Date.now() - cacheTimeCategories < CACHE_DURATION) {
      return categoriesCache;
    }

    const categories = await productsApi.getCategories();
    categoriesCache = categories;
    cacheTimeCategories = Date.now();
    return categories;
  } catch (error) {
    console.warn('Catégories indisponibles, utilisation des catégories statiques:', error.message);
    return staticCategories.filter(c => c !== 'Tous');
  }
};

export const getProductById = async (id) => {
  try {
    return normalizeProductImage(await productsApi.getById(id));
  } catch (error) {
    // If API fails, try to find product in static catalog
    const found = normalizedStatic.find(p => p.id === id || p._id === id);
    if (found) return found;
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
  return `https://wa.me/221706242361?text=${encodeURIComponent(message)}`;
};
