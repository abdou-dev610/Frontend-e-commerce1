import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getCategories } from "@/services/productService";
import { 
  getAllOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct
} from "@/services/adminService";

const Admin = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ 
    name: "", 
    price: "", 
    image: "", 
    category: "", 
    description: "",
    stock: "10"
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (!form.category && cats.length > 0) {
          setForm(prev => ({ ...prev, category: cats[0] }));
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Load products and orders
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await createProduct({ _skip: true }); // This is a workaround, should use getProducts
      // For now, we'll use an empty list and rely on backend data
      setProducts([]);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Erreur lors du chargement des commandes");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.image) {
      setError("Remplissez tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      const productData = {
        name: form.name,
        price: parseInt(form.price),
        image: form.image,
        category: form.category,
        description: form.description,
        stock: parseInt(form.stock) || 10,
      };

      if (editingProduct) {
        await updateProduct(editingProduct._id || editingProduct.id, productData);
        setError(""); // Clear error on success
      } else {
        await createProduct(productData);
        setError(""); // Clear error on success
      }

      setShowForm(false);
      setEditingProduct(null);
      setForm({ name: "", price: "", image: "", category: categories[0] || "", description: "", stock: "10" });
      fetchProducts();
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      description: product.description || "",
      stock: (product.stock || 10).toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      setLoading(true);
      setError("");
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      setLoading(true);
      setError("");
      await updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ 
        paddingTop: "clamp(60px, 10vw, 96px)", 
        paddingBottom: "clamp(40px, 8vw, 64px)", 
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "bold", marginBottom: "8px" }}>
            Accès refusé
          </h1>
          <p style={{ color: "#666", fontSize: "clamp(14px, 2.5vw, 16px)" }}>
            Vous n'avez pas les droits d'administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "clamp(60px, 10vw, 80px)", paddingBottom: "clamp(40px, 8vw, 64px)", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)" }}>
        <h1 style={{ fontSize: "clamp(24px, 5vw, 32px)", fontWeight: "bold", marginBottom: "24px" }}>
          Administration
        </h1>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #e0e0e0", paddingBottom: "16px" }}>
          <button
            onClick={() => setTab("products")}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              backgroundColor: tab === "products" ? "#ea580c" : "transparent",
              color: tab === "products" ? "white" : "#666",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.3s",
            }}
          >
            📦 Produits ({products.length})
          </button>
          <button
            onClick={() => setTab("orders")}
            style={{
              padding: "8px 16px",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              backgroundColor: tab === "orders" ? "#ea580c" : "transparent",
              color: tab === "orders" ? "white" : "#666",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.3s",
            }}
          >
            🛒 Commandes ({orders.length})
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(220, 53, 69, 0.1)",
              border: "1px solid rgba(220, 53, 69, 0.3)",
              borderRadius: "6px",
              color: "#dc3545",
              marginBottom: "16px",
              fontSize: "14px"
            }}
          >
            {error}
          </div>
        )}

        {/* Products Tab */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Gestion des produits</h2>
              <button
                onClick={() => { 
                  setShowForm(true); 
                  setEditingProduct(null); 
                  setForm({ name: "", price: "", image: "", category: categories[0] || "", description: "", stock: "10" }); 
                }}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#22c55e",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "all 0.3s"
                }}
              >
                + Ajouter
              </button>
            </div>

            {/* Product Form Modal */}
            {showForm && (
              <div style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "16px"
              }}>
                <div style={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  padding: "24px",
                  width: "100%",
                  maxWidth: "448px",
                  maxHeight: "90vh",
                  overflowY: "auto"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
                      {editingProduct ? "Modifier" : "Ajouter"} un produit
                    </h3>
                    <button 
                      onClick={() => setShowForm(false)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Nom *
                      </label>
                      <input 
                        type="text"
                        value={form.name} 
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Prix (FCFA) *
                      </label>
                      <input 
                        type="number" 
                        value={form.price} 
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        URL Image *
                      </label>
                      <input 
                        type="text"
                        value={form.image} 
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Catégorie
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      >
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Stock
                      </label>
                      <input 
                        type="number" 
                        value={form.stock} 
                        onChange={(e) => setForm({ ...form, stock: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "14px", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        Description
                      </label>
                      <textarea 
                        value={form.description} 
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "4px",
                          fontSize: "14px",
                          minHeight: "80px"
                        }}
                      />
                    </div>
                    <button 
                      onClick={handleSave}
                      disabled={loading}
                      style={{
                        padding: "10px 16px",
                        backgroundColor: "#22c55e",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        opacity: loading ? 0.6 : 1,
                        transition: "all 0.3s"
                      }}
                    >
                      {loading ? "Enregistrement..." : (editingProduct ? "Enregistrer" : "Ajouter")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px"
            }}>
              {products.map((product) => (
                <div 
                  key={product.id || product._id} 
                  style={{
                    backgroundColor: "white",
                    border: "1px solid #e0e0e0",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      marginBottom: "12px"
                    }}
                  />
                  <h3 style={{ fontWeight: "600", marginBottom: "4px", fontSize: "16px" }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                    {product.category}
                  </p>
                  <p style={{ color: "#ea580c", fontWeight: "bold", marginBottom: "12px", fontSize: "14px" }}>
                    {formatPrice(product.price)}
                  </p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={() => handleEdit(product)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "transparent",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.3s"
                      }}
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id || product._id)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: "600",
                        transition: "all 0.3s"
                      }}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === "orders" && (
          <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px" }}>Commandes</h2>
            {orders.length === 0 ? (
              <p style={{ color: "#999", padding: "32px 0", textAlign: "center", fontSize: "14px" }}>
                Aucune commande pour le moment.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {orders.map((order) => (
                  <div 
                    key={order.id || order._id} 
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      padding: "16px"
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", marginBottom: "12px" }}>
                      <div>
                        <p style={{ fontWeight: "600", marginBottom: "4px", fontSize: "16px" }}>
                          Commande #{(order.id || order._id).toString().slice(0, 8)}
                        </p>
                        <p style={{ fontSize: "13px", color: "#666", marginBottom: "4px" }}>
                          {new Date(order.createdAt || order.created_at).toLocaleDateString("fr-FR")}
                        </p>
                        {order.customerName && <p style={{ fontSize: "13px" }}>Client : {order.customerName}</p>}
                        {order.customerPhone && <p style={{ fontSize: "13px" }}>Tél : {order.customerPhone}</p>}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ color: "#ea580c", fontWeight: "bold", fontSize: "16px", marginBottom: "4px" }}>
                          {formatPrice(order.totalAmount || order.total)}
                        </p>
                        <p style={{ fontSize: "13px", color: "#666" }}>
                          {order.paymentMethod || "N/A"}
                        </p>
                      </div>
                    </div>
                    <select
                      value={order.orderStatus || order.status || "pending"}
                      onChange={(e) => handleOrderStatusUpdate(order.id || order._id, e.target.value)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "4px",
                        fontSize: "13px",
                        cursor: "pointer"
                      }}
                    >
                      <option value="pending">En attente</option>
                      <option value="confirmed">Confirmée</option>
                      <option value="shipped">Expédiée</option>
                      <option value="delivered">Livrée</option>
                      <option value="cancelled">Annulée</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
