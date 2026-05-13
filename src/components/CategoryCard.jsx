import { ShoppingCart, ChevronLeft, ChevronRight, Star, Shield } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const CategoryCard = ({ category, products }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Récupérer les images des 15 premiers produits
  const categoryImages = products.slice(0, 15).map(p => p.image);
  
  // Premier produit pour afficher les infos
  const firstProduct = products[0];
  
  // Calculer le prix moyen
  const avgPrice = Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length);

  const handleAddToCart = () => {
    addToCart(firstProduct);
    toast({ 
      title: "✅ Ajouté au panier", 
      description: `${category} - ${formatPrice(avgPrice)}` 
    });
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? categoryImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === categoryImages.length - 1 ? 0 : prev + 1));
  };

  const handleCategoryClick = () => {
    navigate(`/produits?cat=${category}`);
  };

  return (
    <div 
      onClick={handleCategoryClick}
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        overflow: "hidden",
        border: "2px solid #f3e5d7",
        transition: "all 0.4s ease",
        boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
        transform: "translateY(0) scale(1)",
        cursor: "pointer",
        position: "relative",
        background: "linear-gradient(135deg, #ffffff 0%, #faf8f3 100%)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(234, 88, 12, 0.2)";
        e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
        e.currentTarget.style.borderColor = "#ea580c";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderColor = "#f3e5d7";
      }}>
      
      {/* Badge Category */}
      <div style={{
        position: "absolute",
        top: "12px",
        left: "12px",
        backgroundColor: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
        color: "white",
        padding: "8px 14px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        zIndex: 10,
        boxShadow: "0 4px 12px rgba(234, 88, 12, 0.3)"
      }}>
        {category}
      </div>

      {/* Image Container avec Carousel */}
      <div style={{ 
        aspectRatio: "4/5", 
        overflow: "hidden", 
        backgroundColor: "linear-gradient(135deg, #faf8f3 0%, #f3e5d7 100%)",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <img
          src={categoryImages[currentImageIndex]}
          alt={`${category} - Image ${currentImageIndex + 1}`}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
        />

        {/* Image Indicators - 15 images */}
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "4px",
          zIndex: 5,
          background: "rgba(0,0,0,0.4)",
          padding: "8px 12px",
          borderRadius: "20px",
          backdropFilter: "blur(4px)",
          maxWidth: "90%",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          {categoryImages.map((_, idx) => {
            // Montrer les dots tous les 2 images pour 15 images
            const shouldShow = idx % 2 === 0 || idx === currentImageIndex;
            return shouldShow ? (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(idx);
                }}
                style={{
                  width: idx === currentImageIndex ? "16px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  border: "none",
                  backgroundColor: idx === currentImageIndex ? "#ea580c" : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0
                }}
                title={`Image ${idx + 1}`}
                aria-label={`Image ${idx + 1}`}
              />
            ) : null;
          })}
          <span style={{
            fontSize: "9px",
            color: "rgba(255,255,255,0.8)",
            marginLeft: "6px",
            fontWeight: "600"
          }}>
            {currentImageIndex + 1}/{categoryImages.length}
          </span>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevImage}
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6,
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ea580c";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
            e.currentTarget.style.color = "inherit";
          }}
          aria-label="Image précédente"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={handleNextImage}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: "rgba(255,255,255,0.9)",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 6,
            transition: "all 0.3s",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ea580c";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.9)";
            e.currentTarget.style.color = "inherit";
          }}
          aria-label="Image suivante"
        >
          <ChevronRight size={20} />
        </button>

        {/* Version Tag - Small thumbnails preview */}
        <div style={{
          position: "absolute",
          bottom: "50px",
          left: "12px",
          right: "12px",
          display: "flex",
          gap: "6px",
          overflow: "x",
          zIndex: 5,
          background: "rgba(255,255,255,0.95)",
          padding: "6px",
          borderRadius: "8px",
          backdropFilter: "blur(4px)"
        }}>
          {categoryImages.slice(0, 4).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentImageIndex(idx);
              }}
              style={{
                width: "28px",
                height: "35px",
                borderRadius: "4px",
                cursor: "pointer",
                border: idx === currentImageIndex ? "2px solid #ea580c" : "1px solid #f3e5d7",
                objectFit: "cover",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        
        {/* Title and Rating */}
        <div>
          <h3 style={{
            margin: "0 0 8px 0",
            fontSize: "14px",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1.3"
          }}>
            {category}
          </h3>
          
          {/* Rating Stars */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                style={{
                  fill: i < 4 ? "#ea580c" : "#e5e5e5",
                  color: i < 4 ? "#ea580c" : "#e5e5e5",
                  transition: "all 0.3s"
                }}
              />
            ))}
            <span style={{
              fontSize: "12px",
              color: "#666",
              marginLeft: "4px"
            }}>
              4/5
            </span>
          </div>
        </div>

        {/* Description */}
        <p style={{
          margin: "0 0 8px 0",
          fontSize: "12px",
          color: "#666",
          lineHeight: "1.4",
          height: "28px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}>
          {firstProduct.description}
        </p>

        {/* Authenticity Badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "12px",
          color: "#00a699",
          fontWeight: "600"
        }}>
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "2px solid #00a699",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            color: "#00a699"
          }}>
            ✓
          </div>
          100% Authentique
        </div>

        {/* Price and Add to Cart */}
        <div style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          <div style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#ea580c"
          }}>
            {formatPrice(avgPrice)}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "12px 16px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(34, 197, 94, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.2)";
            }}
          >
            <ShoppingCart size={16} />
            Ajouter
          </button>
        </div>

        {/* Voir tous les produits */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/produits?cat=${category}`);
          }}
          style={{
            backgroundColor: "transparent",
            color: "#ea580c",
            border: "2px solid #ea580c",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.3s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ea580c";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#ea580c";
          }}
        >
          Voir tous ({products.length})
        </button>
      </div>
    </div>
  );
};

export default CategoryCard;
