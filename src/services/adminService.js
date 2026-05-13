// Service Admin - Gestion des produits et commandes par admin
import { productsApi, ordersApi } from "@/integrations/api/client";

// Products Management
export const createProduct = async (productData) => {
  try {
    const product = await productsApi.create(productData);
    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const product = await productsApi.update(id, productData);
    return product;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const result = await productsApi.delete(id);
    return result;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Orders Management
export const getAllOrders = async () => {
  try {
    return await ordersApi.getAll();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (id, orderStatus) => {
  try {
    return await ordersApi.updateStatus(id, { orderStatus });
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
  }).format(price);
};
