import Hero from "@/components/Hero";
import CategoryBanner from "@/components/CategoryBanner";
import FeaturedProducts from "@/components/FeaturedProducts";

const TRUST = [
  { icon: "🚚", title: "Livraison Rapide",    sub: "Partout au Sénégal" },
  { icon: "✅", title: "100% Authentique",    sub: "Qualité garantie" },
  { icon: "💳", title: "Paiement Sécurisé",   sub: "Wave, Orange Money & Cash" },
  { icon: "↩️", title: "Retours Faciles",     sub: "Sous 7 jours" },
  { icon: "💬", title: "Support WhatsApp",    sub: "Réponse en 5 min" },
];

const TrustBar = () => (
  <div style={{ background: "#1a0a00", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "0" }}>
      {TRUST.map(({ icon, title, sub }, i) => (
        <div key={title} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px clamp(16px, 3vw, 32px)", borderRight: i < TRUST.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
          <span style={{ fontSize: "20px" }}>{icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "#fff", whiteSpace: "nowrap" }}>{title}</p>
            <p style={{ margin: 0, fontSize: "11px", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Index = () => (
  <>
    <Hero />
    <TrustBar />
    <CategoryBanner />
    <FeaturedProducts />
  </>
);

export default Index;
