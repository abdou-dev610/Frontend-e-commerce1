// API Client - Wrapper pour les appels au backend

// Utilise localhost en développement local, Render en production
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// 🔐 TOKEN MANAGEMENT
export const getToken = () => {
  return localStorage.getItem("authToken");
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};

export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
};

// 🔄 TOKEN REFRESH
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

export const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise(resolve => {
      subscribeTokenRefresh(token => resolve(token));
    });
  }

  isRefreshing = true;
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    isRefreshing = false;
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    setToken(data.token);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }

    isRefreshing = false;
    onRefreshed(data.token);
    return data.token;
  } catch (error) {
    console.error("❌ Token refresh error:", error.message);
    isRefreshing = false;
    // Clear tokens on refresh failure
    setToken(null);
    setRefreshToken(null);
    return null;
  }
};

// 🔥 CORE API CALL with 401 Interceptor
const apiCall = async (endpoint, options = {}, retryCount = 0) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 🔥 Gestion réponse vide (IMPORTANT)
    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    // 🔥 Handle 401 - Token expired or invalid
    if (response.status === 401 && retryCount === 0) {
      console.log("⚠️ Token expired, attempting refresh...");

      const newToken = await refreshAccessToken();

      if (newToken) {
        // Retry request with new token
        console.log("✅ Token refreshed, retrying request...");
        return apiCall(endpoint, options, retryCount + 1);
      } else {
        // Refresh failed, trigger logout via custom event
        window.dispatchEvent(new Event("auth:logout"));
        throw new Error("Session expired. Please login again.");
      }
    }

    // 🔥 Gestion erreurs améliorée
    if (!response.ok) {
      console.error("❌ API ERROR:", {
        status: response.status,
        data,
      });

      throw new Error(
        data.message || `Erreur serveur (${response.status})`
      );
    }

    console.log("✅ API SUCCESS:", endpoint, data);

    return data;
  } catch (error) {
    console.error("🚨 FETCH ERROR:", error.message);
    throw error;
  }
};

// ================= AUTH =================
export const authApi = {
  signup: (email, password, fullName, phone) =>
    apiCall("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, phone }),
    }),

  signin: async (email, password) => {
    const data = await apiCall("/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    // ✅ Sauvegarde automatique token
    if (data.token) {
      setToken(data.token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }
    }

    return data;
  },

  adminSignin: async (email, password) => {
    const data = await apiCall("/auth/admin-signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      setToken(data.token);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }
    }

    return data;
  },

  verifyToken: () => apiCall("/auth/verify"),

  refresh: async (refreshToken) =>
    apiCall("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

// ================= PRODUCTS =================
export const productsApi = {
  getAll: (category) => {
    const params =
      category && category !== "Tous" ? `?category=${category}` : "";
    return apiCall(`/products${params}`);
  },

  getById: (id) => apiCall(`/products/${id}`),

  create: (productData) =>
    apiCall("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    }),

  update: (id, productData) =>
    apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    }),

  delete: (id) =>
    apiCall(`/products/${id}`, {
      method: "DELETE",
    }),

  getCategories: () => apiCall("/products/categories"),
};

// ================= ORDERS =================
export const ordersApi = {
  create: (orderData) => {
    console.log("📦 Creating order:", orderData); // 🔥 debug
    return apiCall("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  getAll: () => apiCall("/orders"),

  getById: (id) => apiCall(`/orders/${id}`),

  updateStatus: (id, orderData) =>
    apiCall(`/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    }),

  confirmPayment: (id, transactionId) => {
    console.log("💳 Confirming payment for order:", id); // 🔥 debug
    return apiCall(`/orders/${id}/confirm-payment`, {
      method: "POST",
      body: JSON.stringify({ transactionId }),
    });
  },

  cancel: (id) =>
    apiCall(`/orders/${id}/cancel`, {
      method: "POST",
    }),
};

// ================= PAYMENT =================
export const paymentApi = {
  initiate: (paymentData) => {
    console.log("💳 Payment init:", paymentData); // 🔥 debug
    return apiCall("/payment/initiate", {
      method: "POST",
      body: JSON.stringify(paymentData),
    });
  },

  checkStatus: (orderId) =>
    apiCall("/payment/check-status", {
      method: "POST",
      body: JSON.stringify({ orderId }),
    }),
};

// ================= ADMIN =================
// ================= UPLOAD =================
export const uploadImage = async (file) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Erreur upload');
  }
  return res.json();
};

// ================= ADMIN =================
export const adminApi = {
  getStats: () => apiCall('/admin/stats'),

  getProducts: () => apiCall('/admin/products'),

  getUsers: () => apiCall('/admin/users'),

  getUserOrders: (userId) => apiCall(`/admin/users/${userId}/orders`),

  toggleAdminStatus: (userId) =>
    apiCall(`/admin/users/${userId}/toggle-admin`, { method: 'PUT' }),

  deleteUser: (userId) =>
    apiCall(`/admin/users/${userId}`, { method: 'DELETE' }),
};

export default apiCall;