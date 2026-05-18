import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getWhatsAppLink } from "@/services/productService";

// Retourne l'identifiant stable d'un produit (MongoDB _id ou id local)
const pid = (p) => p?._id || p?.id;

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user } = useAuth();

  const whatsAppOrderMessage = () => {
    const origin = window.location.origin;
    const productList = items
      .map((i) => {
        const img = i.product.image;
        const imageUrl = img
          ? (img.startsWith("http") ? img : `${origin}${img}`)
          : null;
        const line = `• ${i.product.name} x${i.quantity} — ${formatPrice(i.product.price * i.quantity)}`;
        return imageUrl ? `${line}\n  🖼️ ${imageUrl}` : line;
      })
      .join("\n\n");
    const msg = `Bonjour, je souhaite commander :\n\n${productList}\n\n💰 Total : ${formatPrice(total)}\n\nMerci !`;
    return `https://wa.me/221706242361?text=${encodeURIComponent(msg)}`;
  };

  if (items.length === 0) {
    return (
      <div style={{ paddingTop: "80px", paddingBottom: "64px", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{
            width: "80px",
            height: "80px",
            backgroundColor: "#f3f4f6",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <ShoppingBag size={40} color="#9ca3af" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Votre panier est vide
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
            Ajoutez des produits pour commencer vos achats
          </p>
          <Link to="/produits" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "12px 32px",
              backgroundColor: "#ea580c",
              color: "white",
              fontWeight: "600",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "all 0.3s",
              fontSize: "14px",
              display: "inline-block"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c2410c"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ea580c"}
            >
              Voir les produits
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "80px", paddingBottom: "64px", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)" }}>
        {/* Header */}
        <h1 style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: "bold", color: "#1f2937", marginBottom: "clamp(20px, 5vw, 32px)" }}>
          Mon Panier
        </h1>

        {/* Main Grid - Responsive */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "clamp(16px, 4vw, 32px)"
        }}>
          {/* Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 3vw, 16px)" }}>
            {items.map((item, index) => (
              <div key={item.product.id || item.product._id || index} style={{
                display: "flex",
                gap: "16px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                transition: "all 0.3s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                {/* Product Image */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={{
                    width: "100px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "6px",
                    flexShrink: 0,
                    backgroundColor: "#f3f4f6"
                  }}
                />

                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                  <h3 style={{ fontWeight: "600", fontSize: "15px", color: "#1f2937", marginBottom: "4px" }}>
                    {item.product.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
                    {item.product.category}
                  </p>
                  <p style={{ fontWeight: "bold", fontSize: "14px", color: "#ea580c", marginBottom: "12px" }}>
                    {formatPrice(item.product.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => updateQuantity(pid(item.product), Math.max(1, item.quantity - 1))}
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#ea580c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      <Minus size={16} />
                    </button>
                    <span style={{ fontSize: "13px", fontWeight: "600", width: "32px", textAlign: "center", color: "#1f2937" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(pid(item.product), item.quantity + 1)}
                      style={{
                        padding: "6px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "4px",
                        cursor: "pointer",
                        backgroundColor: "#fff",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#ea580c";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }}
                    >
                      <Plus size={16} />
                    </button>

                    {/* Subtotal */}
                    <span style={{ marginLeft: "auto", fontWeight: "700", fontSize: "15px", color: "#ea580c" }}>
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(pid(item.product))}
                      style={{
                        padding: "6px 8px",
                        border: "none",
                        backgroundColor: "#fee2e2",
                        color: "#dc2626",
                        borderRadius: "4px",
                        cursor: "pointer",
                        transition: "all 0.3s",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fca5a5";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#fee2e2";
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card - Responsive position */}
          <div style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "16px",
            height: "fit-content",
            position: "static",
            top: "auto"
          }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px" }}>
              Résumé
            </h2>

            {/* Items Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px", maxHeight: "300px", overflow: "auto" }}>
              {items.map((item, index) => (
                <div key={item.product.id || item.product._id || index} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6b7280", minWidth: 0 }}>
                    {item.product.name.substring(0, 20)} x{item.quantity}
                  </span>
                  <span style={{ fontWeight: "600", color: "#1f2937", flexShrink: 0, marginLeft: "8px" }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold" }}>
                <span style={{ color: "#1f2937" }}>Total</span>
                <span style={{ color: "#ea580c" }}>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {user ? (
                <Link to="/paiement" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "#ea580c",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c2410c"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ea580c"}
                  >
                    Payer en ligne
                    <ArrowRight size={16} />
                  </button>
                </Link>
              ) : (
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%",
                    padding: "12px 16px",
                    backgroundColor: "#ea580c",
                    color: "white",
                    fontWeight: "600",
                    fontSize: "14px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c2410c"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#ea580c"}
                  >
                    Se connecter pour payer
                  </button>
                </Link>
              )}
              <a href={whatsAppOrderMessage()} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "#25D366",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "14px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#1ebe5b"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#25D366"}
                >
                  Commander via WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
