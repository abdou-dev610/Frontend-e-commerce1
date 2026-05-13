// Service Orders - Gestion des commandes
import { ordersApi, paymentApi } from "@/integrations/api/client";

// ✅ CREATE ORDER
export const createOrder = async (orderData) => {
  try {
    // 🔥 DEBUG (très important)
    console.log("Sending order data:", orderData);

    // ✅ Vérification des données (PRO)
    if (!orderData || !orderData.items || orderData.items.length === 0) {
      throw new Error("Les produits sont vides");
    }

    if (!orderData.totalAmount || isNaN(orderData.totalAmount) || orderData.totalAmount <= 0) {
      throw new Error("Le montant total est invalide");
    }

    if (!orderData.customerName || typeof orderData.customerName !== 'string') {
      throw new Error("Le nom du client est requis");
    }

    const order = await ordersApi.create(orderData);

    console.log("Order created successfully:", order);

    return order;
  } catch (error) {
    console.error("Error creating order:", error.message || error);

    // 🔥 Affiche l’erreur backend si dispo
    if (error.response) {
      console.error("Backend error:", error.response);
    }

    throw error;
  }
};

// ✅ GET MY ORDERS
export const getMyOrders = async () => {
  try {
    const orders = await ordersApi.getAll();
    return orders || [];
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    return [];
  }
};

// ✅ GET ORDER BY ID
export const getOrderById = async (id) => {
  try {
    if (!id) throw new Error("ID manquant");

    return await ordersApi.getById(id);
  } catch (error) {
    console.error("Error fetching order:", error.message);
    throw error;
  }
};

// ✅ CANCEL ORDER
export const cancelOrder = async (id) => {
  try {
    if (!id) throw new Error("ID manquant");

    return await ordersApi.cancel(id);
  } catch (error) {
    console.error("Error cancelling order:", error.message);
    throw error;
  }
};

// ✅ INITIATE PAYMENT
export const initiatePayment = async (paymentData) => {
  try {
    console.log("Payment data:", paymentData);

    if (!paymentData || !paymentData.amount) {
      throw new Error("Montant invalide");
    }

    const response = await paymentApi.initiate(paymentData);
    return response;
  } catch (error) {
    console.error("Error initiating payment:", error.message);
    throw error;
  }
};

// ✅ CHECK PAYMENT STATUS
export const checkPaymentStatus = async (orderId) => {
  try {
    if (!orderId) throw new Error("Order ID manquant");

    return await paymentApi.checkStatus(orderId);
  } catch (error) {
    console.error("Error checking payment status:", error.message);
    throw error;
  }
};

// ✅ WHATSAPP MESSAGE
export const getWhatsAppOrderText = (items, total, orderId, formatPrice) => {
  if (!items || items.length === 0) {
    return "Bonjour, je souhaite commander un produit.";
  }

  const itemsList = items
    .map((item) => {
      const name = item?.product?.name || "Produit";
      const price = item?.product?.price || 0;
      const quantity = item?.quantity || 1;

      return `${name} x${quantity} - ${formatPrice(price * quantity)}`;
    })
    .join("\n");

  return `Bonjour, je souhaite confirmer ma commande:\n\n${itemsList}\n\nMontant total: ${formatPrice(total)}\n\nNuméro de commande: ${orderId}`;
};

// ✅ FORMAT PRICE
export const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-SN", {
    style: "currency",
    currency: "XOF",
  }).format(price || 0);
};