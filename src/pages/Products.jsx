import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import ProductGridCard from "@/components/ProductGridCard";
import CategoryCard from "@/components/CategoryCard";
import { getProducts, getCategories } from "@/services/productService";

const CATEGORY_ICONS = {
  Lacostes: "👕", Chaussures: "👟", Abayas: "👗",
  Qamis: "🕌", Pullovers: "🧥", Ensembles: "👔",
  Pantalons: "👖", Tous: "🛍️",
};

const SkeletonCard = () => (
  <div style={{ borderRadius: "16px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
    <div style={{ height: "220px", background: "linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
    <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ height: "14px", borderRadius: "6px", background: "#f3f4f6", width: "75%" }} />
      <div style={{ height: "12px", borderRadius: "6px", background: "#f3f4f6", width: "50%" }} />
      <div style={{ height: "32px", borderRadius: "8px", background: "#f3f4f6", marginTop: "6px" }} />
    </div>
  </div>
);

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "Tous";
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState(["Tous"]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    getCategories()
      .then(cats => setCategories(["Tous", ...cats.filter(c => c !== "Tous")]))
      .catch(() => setCategories(["Tous"]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getProducts(null),
      getProducts(activeCategory === "Tous" ? null : activeCategory),
    ])
      .then(([all, filtered]) => { setAllProducts(all); setProducts(filtered); })
      .catch(() => { setError("Erreur lors du chargement des produits"); setProducts([]); setAllProducts([]); })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const productsByCategory = allProducts.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const filtered = search.trim()
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4" }}>

      {/* ── Page Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #7c3a10 100%)",
        paddingTop: "100px", paddingBottom: "48px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: "url('/images/icones/Lacostes.png') center/cover no-repeat", opacity: 0.04 }} />
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.25) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)" }} />

        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234,88,12,0.2)", border: "1px solid rgba(234,88,12,0.4)", borderRadius: "50px", padding: "6px 14px", marginBottom: "16px" }}>
            <Package size={14} color="#fb923c" />
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.1em" }}>Notre Catalogue</span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: "900", color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {activeCategory === "Tous" ? "Tous nos Produits" : activeCategory}
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "rgba(255,255,255,0.65)", margin: 0, fontWeight: "500" }}>
            {activeCategory === "Tous"
              ? `${allProducts.length} articles disponibles dans ${categories.length - 1} catégories`
              : `${products.length} article${products.length > 1 ? "s" : ""} dans la catégorie ${activeCategory}`}
          </p>
        </div>
      </div>

      {/* ── Sticky Filter Bar ── */}
      <div style={{
        position: "sticky", top: "64px", zIndex: 20,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", overflowX: "auto", padding: "14px 0", scrollbarWidth: "none" }}>
            {categories.map((cat) => {
              const active = activeCategory === cat;
              const count = cat === "Tous" ? allProducts.length : (productsByCategory[cat]?.length || 0);
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 16px", borderRadius: "50px", border: "none", cursor: "pointer",
                  whiteSpace: "nowrap", fontFamily: "inherit", fontWeight: "700",
                  fontSize: "13px", transition: "all 0.25s ease",
                  background: active ? "linear-gradient(135deg, #ea580c, #f97316)" : "#f3f4f6",
                  color: active ? "#fff" : "#4b5563",
                  boxShadow: active ? "0 4px 16px rgba(234,88,12,0.35)" : "none",
                  transform: active ? "translateY(-1px)" : "none",
                }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#e9eaec"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "#f3f4f6"; }}
                >
                  <span>{CATEGORY_ICONS[cat] || "🏷️"}</span>
                  {cat}
                  <span style={{
                    fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "50px",
                    background: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
                    color: active ? "#fff" : "#6b7280",
                  }}>{count}</span>
                </button>
              );
            })}

            {/* Search */}
            {activeCategory !== "Tous" && (
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px", background: "#f3f4f6", borderRadius: "50px", padding: "8px 14px", minWidth: "200px", flexShrink: 0 }}>
                <Search size={14} color="#9ca3af" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher..."
                  style={{ border: "none", background: "transparent", fontSize: "13px", fontFamily: "inherit", outline: "none", color: "#374151", width: "100%" }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)" }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: "center", padding: "80px 32px" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</p>
            <p style={{ fontSize: "16px", color: "#ef4444", fontWeight: "600" }}>{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* All categories view */}
            {activeCategory === "Tous" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "28px" }}>
                {categories.filter(cat => cat !== "Tous").map((cat, i) => (
                  productsByCategory[cat] && (
                    <div key={cat} style={{ animation: "fadeUp 0.5s ease forwards", animationDelay: `${i * 0.06}s`, opacity: 0 }}>
                      <CategoryCard category={cat} products={productsByCategory[cat].slice(0, 15)} />
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Specific category */}
            {activeCategory !== "Tous" && filtered.length > 0 && (
              <>
                {search && (
                  <p style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px", fontWeight: "500" }}>
                    {filtered.length} résultat{filtered.length > 1 ? "s" : ""} pour «&nbsp;{search}&nbsp;»
                  </p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "20px" }}>
                  {filtered.map((product, i) => (
                    <div key={product._id || product.id} style={{ animation: "fadeUp 0.4s ease forwards", animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                      <ProductGridCard product={product} disableNavigation />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Empty */}
            {activeCategory !== "Tous" && filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "100px 32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🔍</div>
                <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#111827", margin: 0 }}>
                  {search ? "Aucun résultat" : "Aucun produit"}
                </h3>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  {search ? `Aucun produit ne correspond à « ${search} »` : "Cette catégorie est vide pour le moment."}
                </p>
                {search && (
                  <button onClick={() => setSearch("")} style={{ marginTop: "8px", padding: "10px 24px", background: "#ea580c", color: "#fff", border: "none", borderRadius: "50px", fontWeight: "700", fontSize: "13px", cursor: "pointer", fontFamily: "inherit" }}>
                    Effacer la recherche
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default Products;
