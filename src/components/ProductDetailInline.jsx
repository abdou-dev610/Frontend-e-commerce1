import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import SafeImage from "@/components/SafeImage";

const ProductDetailInline = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Gérer les images locales vs Unsplash
  const generateImageVariations = (baseUrl) => {
    // Si c'est une image locale (commence par /images/), ne pas générer de variations
    if (baseUrl.startsWith("/images/")) {
      return [baseUrl]; // Retourner juste l'image sans variations
    }

    // Pour les URLs Unsplash, générer des variations
    const variations = [];
    const widths = [400, 420, 450, 380, 430, 390, 410, 440, 360, 470, 440, 400, 450, 420, 380];
    const heights = [500, 520, 550, 480, 530, 490, 510, 540, 460, 570, 540, 500, 550, 520, 480];
    
    for (let i = 0; i < 15; i++) {
      let url = baseUrl
        .replace("w=400", `w=${widths[i]}`)
        .replace("h=500", `h=${heights[i]}`);
      
      const separator = url.includes("?") ? "&" : "?";
      url += `${separator}variation=${i}`;
      variations.push(url);
    }
    return variations;
  };

  const images = generateImageVariations(product.image);

  const handleAddToCart = () => {
    addToCart(product);
    toast({ 
      title: "✅ Ajouté au panier", 
      description: `${product.name} - ${formatPrice(product.price)}` 
    });
  };

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{
      paddingTop: "clamp(40px, 8vw, 60px)",
      paddingBottom: "clamp(40px, 8vw, 64px)",
      backgroundColor: "#faf8f3"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{
            fontSize: "clamp(28px, 6vw, 44px)",
            fontWeight: "900",
            color: "#111827",
            marginBottom: "16px"
          }}>
            {product.name}
          </h1>

          {/* Rating & Badge */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", gap: "4px" }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    style={{
                      fill: "#ea580c",
                      color: "#ea580c"
                    }}
                  />
                ))}
              </div>
              <span style={{
                fontSize: "14px",
                color: "#6b7280",
                fontWeight: "600"
              }}>
                4.9/5 (127 avis)
              </span>
            </div>

            <div style={{
              backgroundColor: "#ea580c",
              color: "white",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase"
            }}>
              {product.category}
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#00a699",
              fontWeight: "600",
              fontSize: "13px"
            }}>
              ✓ 100% Authentique
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 mb-10" style={{
          marginBottom: "40px"
        }}>
          {/* Images Gallery */}
          <div>
            {/* Main Image */}
            <div style={{
              position: "relative",
              aspectRatio: "4/5",
              marginBottom: "20px",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb"
            }}>
              <SafeImage
                src={images[currentImageIndex]}
                alt={`${product.name} - Vue ${currentImageIndex + 1}`}
                fallbackSrc={product.image}
                loading="eager"
                className="w-full h-full object-cover"
                width={400}
                height={500}
              />

              {/* Navigation Arrows */}
              <button
                onClick={handlePrevImage}
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "none",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ea580c";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.95)";
                  e.currentTarget.style.color = "inherit";
                }}
              >
                <ChevronLeft size={24} />
              </button>

              <button
                onClick={handleNextImage}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "rgba(255,255,255,0.95)",
                  border: "none",
                  borderRadius: "50%",
                  width: "44px",
                  height: "44px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 5,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  transition: "all 0.3s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ea580c";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.95)";
                  e.currentTarget.style.color = "inherit";
                }}
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter */}
              <div style={{
                position: "absolute",
                bottom: "16px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0,0,0,0.6)",
                color: "white",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "600",
                backdropFilter: "blur(4px)"
              }}>
                {currentImageIndex + 1}/{images.length}
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(60px, 1fr))",
              gap: "10px"
            }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  style={{
                    position: "relative",
                    flex: "1",
                    height: "70px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: idx === currentImageIndex ? "3px solid #ea580c" : "1px solid #e5e7eb",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    padding: 0,
                    background: "none"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#ea580c";
                  }}
                  onMouseLeave={(e) => {
                    if (idx !== currentImageIndex) {
                      e.currentTarget.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  <img
                    src={img}
                    alt={`Vue ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <span style={{
                    position: "absolute",
                    fontSize: "9px",
                    fontWeight: "700",
                    color: "white",
                    backgroundColor: "rgba(234, 88, 12, 0.85)",
                    padding: "3px 6px",
                    borderRadius: "3px",
                    top: "4px",
                    left: "4px"
                  }}>
                    V{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px"
          }}>
            {/* Description */}
            <div style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            }}>
              <h2 style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#111827",
                marginBottom: "12px"
              }}>
                Description
              </h2>
              <p style={{
                color: "#6b7280",
                lineHeight: "1.6",
                fontSize: "14px",
                marginBottom: "16px"
              }}>
                {product.description}
              </p>

              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px"
              }}>
                <li style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  color: "#ea580c",
                  fontWeight: "600",
                  fontSize: "13px"
                }}>
                  <span>•</span> Mode Premium Sénégalaise
                </li>
                <li style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  color: "#ea580c",
                  fontWeight: "600",
                  fontSize: "13px"
                }}>
                  <span>•</span> Qualité Garantie 100% Authentique
                </li>
                <li style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  color: "#ea580c",
                  fontWeight: "600",
                  fontSize: "13px"
                }}>
                  <span>•</span> Livraison Gratuite
                </li>
                <li style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  color: "#ea580c",
                  fontWeight: "600",
                  fontSize: "13px"
                }}>
                  <span>•</span> Paiement Sécurisé
                </li>
              </ul>
            </div>

            {/* Price & Purchase */}
            <div style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb"
            }}>
              <div style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#ea580c",
                marginBottom: "24px"
              }}>
                {formatPrice(product.price)}
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  width: "100%",
                  backgroundColor: "#ea580c",
                  color: "white",
                  border: "none",
                  borderRadius: "10px",
                  padding: "16px 24px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  boxShadow: "0 6px 20px rgba(234, 88, 12, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f97316";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(234, 88, 12, 0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ea580c";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(234, 88, 12, 0.3)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <ShoppingCart size={20} />
                Ajouter au Panier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailInline;
