import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice, getWhatsAppLink } from "@/services/productService";

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
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "80px 16px", textAlign: "center" }}>
          <div style={{
            width: "80px", height: "80px",
            backgroundColor: "#f3f4f6", borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px"
          }}>
            <ShoppingBag size={40} color="#9ca3af" />
          </div>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "bold", color: "#1f2937", marginBottom: "8px" }}>
            Votre panier est vide
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "24px" }}>
            Ajoutez des produits pour commencer vos achats
          </p>
          <Link to="/produits" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "12px 32px", backgroundColor: "#ea580c", color: "white",
              fontWeight: "600", border: "none", borderRadius: "6px",
              cursor: "pointer", fontSize: "14px"
            }}>
              Voir les produits
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "72px", paddingBottom: "64px", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(12px, 3vw, 24px)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "clamp(16px, 4vw, 32px)", paddingTop: "clamp(12px, 3vw, 24px)", flexWrap: "wrap", gap: "12px" }}>
          <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "bold", color: "#1f2937", margin: 0 }}>
            Mon Panier ({items.length} article{items.length > 1 ? "s" : ""})
          </h1>
          <button
            onClick={clearCart}
            style={{ fontSize: "13px", color: "#ef4444", background: "none", border: "1px solid #fecaca", borderRadius: "6px", padding: "6px 12px", cursor: "pointer" }}
          >
            Vider le panier
          </button>
        </div>

        {/* Main layout : responsive via CSS class */}
        <div className="cart-layout">

          {/* ── Items List ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {items.map((item, index) => (
              <div key={item.product.id || item.product._id || index}
                className="cart-item"
                style={{
                  display: "flex", gap: "14px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                {/* Product Image */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  style={{
                    width: "clamp(72px, 20vw, 100px)",
                    height: "clamp(90px, 25vw, 120px)",
                    objectFit: "cover",
                    borderRadius: "8px",
                    flexShrink: 0,
                    backgroundColor: "#f3f4f6"
                  }}
                  onError={e => { e.target.style.background = "#f3f4f6"; e.target.src = ""; }}
                />

                {/* Product Info */}
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h3 style={{ fontWeight: "700", fontSize: "clamp(13px, 2.5vw, 15px)", color: "#1f2937", margin: 0, lineHeight: 1.3 }}>
                    {item.product.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                    {item.product.category}
                  </p>
                  <p style={{ fontWeight: "700", fontSize: "clamp(13px, 2.5vw, 15px)", color: "#ea580c", margin: 0 }}>
                    {formatPrice(item.product.price)}
                  </p>

                  {/* Controls row */}
                  <div className="cart-item-controls">
                    {/* Quantité */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        onClick={() => updateQuantity(pid(item.product), Math.max(1, item.quantity - 1))}
                        style={{ padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: "13px", fontWeight: "700", width: "28px", textAlign: "center", color: "#1f2937" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(pid(item.product), item.quantity + 1)}
                        style={{ padding: "5px 8px", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Subtotal + delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "auto" }}>
                      <span style={{ fontWeight: "700", fontSize: "clamp(13px, 2.5vw, 15px)", color: "#ea580c" }}>
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeFromCart(pid(item.product))}
                        style={{ padding: "6px", border: "none", backgroundColor: "#fee2e2", color: "#dc2626", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Summary Card ── */}
          <div style={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "20px", height: "fit-content" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#1f2937", marginBottom: "20px", marginTop: 0 }}>
              Résumé de commande
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px", maxHeight: "220px", overflowY: "auto" }}>
              {items.map((item, index) => (
                <div key={item.product.id || item.product._id || index} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", gap: "8px" }}>
                  <span style={{ color: "#6b7280", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.product.name.substring(0, 22)} ×{item.quantity}
                  </span>
                  <span style={{ fontWeight: "600", color: "#1f2937", flexShrink: 0 }}>
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "bold" }}>
                <span style={{ color: "#1f2937" }}>Total</span>
                <span style={{ color: "#ea580c" }}>{formatPrice(total)}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {user ? (
                <Link to="/paiement" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "13px 16px",
                    backgroundColor: "#ea580c", color: "white",
                    fontWeight: "700", fontSize: "14px",
                    border: "none", borderRadius: "8px", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                  }}>
                    Payer en ligne
                    <ArrowRight size={16} />
                  </button>
                </Link>
              ) : (
                <Link to="/auth" style={{ textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "13px 16px",
                    backgroundColor: "#ea580c", color: "white",
                    fontWeight: "700", fontSize: "14px",
                    border: "none", borderRadius: "8px", cursor: "pointer"
                  }}>
                    Se connecter pour payer
                  </button>
                </Link>
              )}
              <a href={whatsAppOrderMessage()} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <button style={{
                  width: "100%", padding: "13px 16px",
                  backgroundColor: "#25D366", color: "white",
                  fontWeight: "700", fontSize: "14px",
                  border: "none", borderRadius: "8px", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}>
                  <span>💬</span>
                  Commander via WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Layout panier ─────────────────────────── */
        .cart-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }
        @media (min-width: 1024px) {
          .cart-layout {
            grid-template-columns: 1fr 380px;
            align-items: start;
          }
        }

        /* ── Contrôles quantité ─────────────────────── */
        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default Cart;
