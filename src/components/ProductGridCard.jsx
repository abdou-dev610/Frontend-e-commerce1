import { ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/integrations/api/client";
import SafeImage from "@/components/SafeImage";

const API = import.meta.env.VITE_API_URL || "/api";

const ProductGridCard = ({ product, disableNavigation = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const primaryImage = product.images?.[0] || product.image || null;
  const productId = String(product._id || product.id);

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/favorites/${productId}/check`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.ok ? r.json() : { isFavorite: false })
      .then(d => setIsFavorite(d.isFavorite))
      .catch(() => {});
  }, [user, productId]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "✅ Ajouté au panier",
      description: `${product.name} - ${formatPrice(product.price)}`
    });
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: "Connexion requise", description: "Connectez-vous pour ajouter aux favoris" });
      return;
    }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await fetch(`${API}/favorites/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setIsFavorite(false);
        toast({ title: "Retiré des favoris", description: product.name });
      } else {
        await fetch(`${API}/favorites`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
          body: JSON.stringify({ productId, productData: product }),
        });
        setIsFavorite(true);
        toast({ title: "❤️ Ajouté aux favoris", description: product.name });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier les favoris" });
    } finally {
      setFavLoading(false);
    }
  };

  const isUnavailable = product.available === false;

  return (
    <div
      onClick={() => {
        if (!disableNavigation && !isUnavailable) {
          navigate(`/produit/${product._id || product.id}`);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        transition: "all 0.3s",
        boxShadow: isHovered && !isUnavailable
          ? "0 16px 32px rgba(0,0,0,0.15)"
          : "0 4px 12px rgba(0,0,0,0.08)",
        transform: isHovered && !isUnavailable ? "translateY(-6px)" : "translateY(0)",
        cursor: isUnavailable ? "not-allowed" : disableNavigation ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        opacity: isUnavailable ? 0.75 : 1,
      }}
    >
      {/* BADGE INDISPONIBLE */}
      {isUnavailable && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.45)",
          borderRadius: "16px",
        }}>
          <span style={{
            background: "#1f2937", color: "#fff",
            padding: "8px 20px", borderRadius: "999px",
            fontSize: "13px", fontWeight: "800", letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}>
            Indisponible
          </span>
        </div>
      )}

      {/* CATEGORY */}
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        backgroundColor: "#ea580c",
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        zIndex: 10
      }}>
        {product.category}
      </div>

      {/* FAVORITE */}
      <button
        onClick={handleFavorite}
        disabled={favLoading}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "none",
          cursor: favLoading ? "wait" : "pointer",
          fontSize: "18px",
          zIndex: 10,
          opacity: favLoading ? 0.6 : 1,
          transition: "transform 0.2s",
          transform: isFavorite ? "scale(1.15)" : "scale(1)"
        }}
      >
        {isFavorite ? "❤️" : "🤍"}
      </button>

      {/* ✅ IMAGE FIX */}
      <div
        style={{
          width: "100%",
          aspectRatio: "4/5",
          maxHeight: "260px",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px"
        }}
      >
        <SafeImage
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* CONTENT */}
      <div style={{
        padding: "14px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flex: 1
      }}>

        <h3 style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#1f2937",
          lineHeight: "1.3"
        }}>
          {product.name}
        </h3>

        <div style={{
          fontSize: "18px",
          fontWeight: "700",
          color: "#ea580c"
        }}>
          {formatPrice(product.price)}
        </div>

        <button
          onClick={isUnavailable ? undefined : handleAddToCart}
          disabled={isUnavailable}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            backgroundColor: isUnavailable ? "#9ca3af" : "#ea580c",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontWeight: "700",
            cursor: isUnavailable ? "not-allowed" : "pointer"
          }}
        >
          <ShoppingCart size={16} />
          {isUnavailable ? "Indisponible" : "Commander"}
        </button>

      </div>
    </div>
  );
};

export default ProductGridCard;