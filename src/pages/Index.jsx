import Hero from "@/components/Hero";
import CategoryBanner from "@/components/CategoryBanner";
import FeaturedProducts from "@/components/FeaturedProducts";

const TRUST = [
  { icon: "🚚", title: "Livraison Rapide",  sub: "Partout au Sénégal" },
  { icon: "✅", title: "100% Authentique",  sub: "Qualité garantie" },
  { icon: "💳", title: "Paiement Sécurisé", sub: "Wave, Orange Money" },
  { icon: "↩️", title: "Retours Faciles",   sub: "Sous 7 jours" },
  { icon: "💬", title: "Support WhatsApp",  sub: "Réponse en 5 min" },
];

const TrustBar = () => (
  <div style={{ background: "#1a0a00", borderBottom: "1px solid rgba(255,255,255,0.06)", overflowX: "hidden" }}>
    {/* Desktop : flex row centré / Mobile : grille 2 colonnes */}
    <div className="trust-bar-inner" style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>
      {TRUST.map(({ icon, title, sub }) => (
        <div key={title} className="trust-item" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>{icon}</span>
          <div>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "700", color: "#fff" }}>{title}</p>
            <p style={{ margin: 0, fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>{sub}</p>
          </div>
        </div>
      ))}
    </div>

    <style>{`
      /* ── Desktop ─────────────────────────────────── */
      .trust-bar-inner {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        gap: 0;
      }
      .trust-bar-inner::-webkit-scrollbar { display: none; }

      .trust-item {
        padding: 14px clamp(12px, 2.5vw, 28px);
        border-right: 1px solid rgba(255,255,255,0.08);
        flex-shrink: 0;
      }
      .trust-item:last-child { border-right: none; }

      /* ── Mobile : grille 2 × 3 ───────────────────── */
      @media (max-width: 640px) {
        .trust-bar-inner {
          display: grid !important;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          overflow-x: visible;
          padding: 0 !important;
        }
        .trust-item {
          padding: 12px 14px;
          border-right: 1px solid rgba(255,255,255,0.06) !important;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        /* Enlever la bordure droite du 2ème élément de chaque rangée */
        .trust-item:nth-child(2n) { border-right: none !important; }
        .trust-item:nth-last-child(-n+2) { border-bottom: none; }
      }
    `}</style>
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
