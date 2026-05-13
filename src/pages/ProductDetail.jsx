import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Star, Shield, ArrowLeft } from "lucide-react";
import { getProductById, formatPrice } from "@/services/productService";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Générer 15 variations d'images
  const generateImageVariations = (baseUrl) => {
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

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const foundProduct = await getProductById(id);
        
        if (foundProduct) {
          setProduct(foundProduct);
        } else {
          setError("Produit non trouvé");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError("Erreur lors du chargement du produit");
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product);
    toast({ 
      title: "✅ Ajouté au panier", 
      description: `${product.name} - ${formatPrice(product.price)}` 
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "80px"
      }}>
        <p style={{ fontSize: "16px", color: "#6b7280" }}>Chargement du produit...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: "80px",
        gap: "20px"
      }}>
        <p style={{ fontSize: "16px", color: "#dc3545" }}>{error || "Produit non trouvé"}</p>
        <button
          onClick={() => navigate("/produits")}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700"
          }}
        >
          Retour aux produits
        </button>
      </div>
    );
  }

  const images = generateImageVariations(product.image);

  return (
    <div style={{
      paddingTop: "clamp(60px, 10vw, 80px)",
      paddingBottom: "clamp(40px, 8vw, 64px)",
      backgroundColor: "#faf8f3"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)" }}>
        {/* Back Button & Header */}
        <div style={{ marginBottom: "32px" }}>
          <button
            onClick={() => navigate("/produits")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              marginBottom: "20px",
              transition: "all 0.3s",
              fontWeight: "600",
              color: "#111827"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#ea580c";
              e.currentTarget.style.color = "#ea580c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#111827";
            }}
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <div style={{ marginBottom: "24px" }}>
            <h1 style={{
              fontSize: "clamp(24px, 5vw, 36px)",
              fontWeight: "900",
              color: "#111827",
              marginBottom: "12px"
            }}>
              {product.name}
            </h1>
            
            {/* Rating & Info */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    style={{
                      fill: i < 4 ? "#f97316" : "#e5e7eb",
                      color: i < 4 ? "#f97316" : "#e5e7eb"
                    }}
                  />
                ))}
                <span style={{ fontSize: "13px", color: "#6b7280", marginLeft: "8px", fontWeight: "600" }}>
                  4.9/5 (127 avis)
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "16px",
                  textTransform: "uppercase"
                }}>
                  {product.category}
                </span>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "12px",
                  color: "#059669",
                  fontWeight: "600"
                }}>
                  <Shield size={14} />
                  100% Authentique
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          border: "1px solid #f3e5d7"
        }}>
          <h3 style={{
            fontSize: "14px",
            fontWeight: "700",
            color: "#111827",
            marginBottom: "8px"
          }}>
            Description
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#6b7280",
            lineHeight: "1.6",
            margin: 0,
            marginBottom: "12px"
          }}>
            {product.description}
          </p>
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontSize: "13px",
            color: "#6b7280"
          }}>
            <li style={{ marginBottom: "6px", display: "flex", gap: "8px" }}>
              <span style={{ color: "#ea580c", fontWeight: "700" }}>•</span>
              Mode Premium Sénégalaise
            </li>
            <li style={{ marginBottom: "6px", display: "flex", gap: "8px" }}>
              <span style={{ color: "#ea580c", fontWeight: "700" }}>•</span>
              Qualité Garantie 100% Authentique
            </li>
            <li style={{ marginBottom: "6px", display: "flex", gap: "8px" }}>
              <span style={{ color: "#ea580c", fontWeight: "700" }}>•</span>
              Livraison Gratuite
            </li>
            <li style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "#ea580c", fontWeight: "700" }}>•</span>
              Paiement Sécurisé
            </li>
          </ul>
        </div>

        {/* Gallery - 15 images comme des cartes produits */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px"
        }}>
          {images.map((img, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                overflow: "hidden",
                border: "2px solid #f3e5d7",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                cursor: "pointer",
                transform: "translateY(0) scale(1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(234, 88, 12, 0.2)";
                e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                e.currentTarget.style.borderColor = "#ea580c";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.borderColor = "#f3e5d7";
              }}
            >
              {/* Image */}
              <div style={{
                aspectRatio: "4/5",
                overflow: "hidden",
                backgroundColor: "#f9fafb",
                position: "relative"
              }}>
                <img
                  src={img}
                  alt={`${product.name} - Variation ${idx + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.4s ease"
                  }}
                  onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
                  onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  loading="lazy"
                />
                
                {/* Badge variation */}
                <div style={{
                  position: "absolute",
                  top: "8px",
                  left: "8px",
                  background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "16px",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase"
                }}>
                  V{idx + 1}
                </div>
              </div>

              {/* Info & Actions */}
              <div style={{
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                {/* Category Badge */}
                <span style={{
                  fontSize: "9px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  width: "fit-content"
                }}>
                  {product.category}
                </span>

                {/* Product Name */}
                <h3 style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#111827",
                  lineHeight: "1.3",
                  margin: "0",
                  display: "-webkit-box",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {product.name}
                </h3>

                {/* Price */}
                <div style={{
                  fontSize: "14px",
                  fontWeight: "900",
                  background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "4px 0"
                }}>
                  {formatPrice(product.price)}
                </div>

                {/* Add Button */}
                <button
                  onClick={() => handleAddToCart()}
                  style={{
                    padding: "8px 12px",
                    background: "#22c55e",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.2)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(34, 197, 94, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(34, 197, 94, 0.2)";
                  }}
                >
                  <ShoppingCart size={14} />
                  Ajouter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
