import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import SafeImage from "@/components/SafeImage";

const ProductGridCard = ({ product, disableNavigation = false }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const primaryImage = product.images?.[0] || product.image || "/images/no-image.png";

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "✅ Ajouté au panier",
      description: `${product.name} - ${formatPrice(product.price)}`
    });
  };

  const handleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <div
      onClick={() => {
        if (!disableNavigation) {
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
        boxShadow: isHovered
          ? "0 16px 32px rgba(0,0,0,0.15)"
          : "0 4px 12px rgba(0,0,0,0.08)",
        transform: isHovered
          ? "translateY(-6px)"
          : "translateY(0)",
        cursor: disableNavigation ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative"
      }}
    >

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
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "18px",
          zIndex: 10
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
          fallbackSrc="/images/no-image.png"
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
          onClick={handleAddToCart}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            backgroundColor: "#ea580c",
            color: "white",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontWeight: "700",
            cursor: "pointer"
          }}
        >
          <ShoppingCart size={16} />
          Commander
        </button>

      </div>
    </div>
  );
};

export default ProductGridCard;