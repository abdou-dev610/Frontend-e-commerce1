import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getToken } from "@/integrations/api/client";
import { formatPrice } from "@/services/productService";
import SafeImage from "@/components/SafeImage";

const API = import.meta.env.VITE_API_URL || "/api";

const Favorites = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFavorites();
    else setLoading(false);
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API}/favorites`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error();
      setFavorites(await res.json());
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      await fetch(`${API}/favorites/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setFavorites((prev) => prev.filter((p) => (p._id || p.id) !== productId));
    } catch {
      /* silent */
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (!user) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "40px 16px", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={32} color="white" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Mes Favoris</h1>
        <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "360px" }}>
          Connectez-vous pour voir et gérer vos favoris.
        </p>
        <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
          Se connecter
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTopColor: "#ea580c", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "40px 16px", textAlign: "center" }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Heart size={32} color="white" />
        </div>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Mes Favoris</h1>
        <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "360px" }}>
          Vous n'avez pas encore de produits favoris. Explorez notre catalogue pour en ajouter.
        </p>
        <Link to="/produits" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 24px", background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>
          Voir les produits
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", paddingTop: "90px", paddingBottom: "48px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1f2937", margin: "0 0 4px" }}>
            ❤️ Mes Favoris
          </h1>
          <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
            {favorites.length} produit{favorites.length > 1 ? "s" : ""} enregistré{favorites.length > 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
          {favorites.map((product) => {
            const pid = product._id || product.id;
            const image = product.images?.[0] || product.image || "/images/no-image.png";
            return (
              <div key={pid} style={{ background: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column" }}>

                <div style={{ position: "relative" }}>
                  <div style={{ width: "100%", aspectRatio: "4/5", maxHeight: "240px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", padding: "8px" }}>
                    <SafeImage src={image} alt={product.name} fallbackSrc="/images/no-image.png" loading="lazy" className="max-w-full max-h-full object-contain" />
                  </div>
                  <button
                    onClick={() => removeFavorite(pid)}
                    title="Retirer des favoris"
                    style={{ position: "absolute", top: "10px", right: "10px", width: "36px", height: "36px", borderRadius: "50%", background: "white", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                  <span style={{ position: "absolute", top: "10px", left: "10px", background: "#ea580c", color: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                    {product.category}
                  </span>
                </div>

                <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1f2937", lineHeight: "1.3", margin: 0 }}>
                    {product.name}
                  </h3>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#ea580c" }}>
                    {formatPrice(product.price)}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "#ea580c", color: "white", border: "none", borderRadius: "10px", padding: "10px", fontWeight: "700", cursor: "pointer", fontSize: "13px" }}
                  >
                    <ShoppingCart size={15} />
                    Ajouter au panier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
