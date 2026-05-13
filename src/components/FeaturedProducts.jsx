import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import CategoryCard from "./CategoryCard";
import { getProducts, getCategories } from "@/services/productService";

const FeaturedProducts = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedCategories = async () => {
      try {
        setLoading(true);
        
        // Charger les catégories
        const cats = await getCategories();
        const filteredCategories = cats.filter(cat => cat !== "Tous");
        setCategories(filteredCategories);
        
        // Charger tous les produits
        const products = await getProducts();
        
        // Grouper par catégorie
        const grouped = {};
        products.forEach(product => {
          if (!grouped[product.category]) {
            grouped[product.category] = [];
          }
          grouped[product.category].push(product);
        });
        
        setProductsByCategory(grouped);
      } catch (error) {
        console.error("Error loading featured categories:", error);
        setCategories([]);
        setProductsByCategory({});
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedCategories();
  }, []);

  return (
    <section style={{ 
      paddingTop: "clamp(56px, 12vw, 80px)", 
      paddingBottom: "clamp(56px, 12vw, 96px)", 
      background: "linear-gradient(135deg, #ffffff 0%, #faf8f3 100%)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Background Elements */}
      <div style={{
        position: "absolute",
        top: "-50px",
        right: "-50px",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute",
        bottom: "-100px",
        left: "-100px",
        width: "400px",
        height: "400px",
        background: "radial-gradient(circle, rgba(251, 146, 60, 0.05) 0%, transparent 70%)",
        borderRadius: "50%",
        pointerEvents: "none"
      }} />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)", position: "relative", zIndex: 1 }}>
        {/* Header - Amélioré */}
        <div style={{ textAlign: "center", marginBottom: "clamp(40px, 10vw, 56px)" }}>
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(234, 88, 12, 0.1)",
            border: "1px solid rgba(234, 88, 12, 0.2)",
            padding: "8px 16px",
            borderRadius: "50px",
            marginBottom: "16px"
          }}>
            <Sparkles size={16} color="#ea580c" />
            <span style={{
              color: "#ea580c",
              fontSize: "12px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.08em"
            }}>
              ✨ Tendances du Moment
            </span>
          </div>

          {/* Titre Principal */}
          <h2 style={{
            fontSize: "clamp(28px, 6vw, 44px)",
            fontWeight: "900",
            color: "#111827",
            marginTop: "12px",
            letterSpacing: "-0.01em"
          }}>
            Collections Vedettes 🌟
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "#6b7280",
            marginTop: "12px",
            maxWidth: "600px",
            margin: "12px auto 0 auto",
            fontWeight: "500"
          }}>
            Découvrez nos sélections premium des plus belles pièces sénégalaises et internationales
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ 
            textAlign: "center", 
            padding: "80px 32px",
            color: "#9ca3af"
          }}>
            <div style={{ 
              fontSize: "24px", 
              marginBottom: "16px",
              animation: "spin 1s linear infinite"
            }}>⏳</div>
            <p style={{ fontSize: "14px", fontWeight: "500" }}>
              Chargement de nos collections...
            </p>
          </div>
        )}

        {/* Category Cards Grid - Responsive */}
        {!loading && categories.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "clamp(20px, 4vw, 32px)",
            marginBottom: "clamp(40px, 10vw, 56px)"
          }}>
            {categories.map((category, i) => (
              <div
                key={category}
                style={{
                  animation: `slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                  animationDelay: `${i * 0.08}s`,
                  opacity: 0
                }}
              >
                {productsByCategory[category] && (
                  <CategoryCard 
                    category={category}
                    products={productsByCategory[category].slice(0, 15)}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && categories.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "80px 32px",
            color: "#6b7280"
          }}>
            <p style={{ fontSize: "16px", fontWeight: "500" }}>
              Les collections seront bientôt disponibles...
            </p>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </section>
  );
};

export default FeaturedProducts;
