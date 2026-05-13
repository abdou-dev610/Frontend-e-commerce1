import { Link } from "react-router-dom";
import { ArrowRight, Zap, Star, Shield } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const Hero = () => (
  <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", paddingTop: "64px" }}>
    {/* Background Image with Overlay */}
    <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
      <img
        src={heroBanner}
        alt="Mode Africaine - Personnes"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center"
        }}
        loading="lazy"
      />
      {/* Overlay Gradient for Text Readability */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to right, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)"
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 60%, rgba(0,0,0,0.2) 100%)"
      }} />
    </div>

    {/* Content */}
    <div style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", padding: "0 12px 40px 12px", flex: 1, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "50px", width: "fit-content" }}>
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <span style={{ color: "rgba(255,255,255,0.95)", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Collection Printemps 2026 🌍
          </span>
        </div>

        {/* Main Heading */}
        <h1 style={{ 
          fontWeight: "900", 
          fontSize: "clamp(32px, 7vw, 64px)", 
          color: "white",
          lineHeight: "1.1",
          letterSpacing: "-0.02em",
          maxWidth: "900px",
          textShadow: "2px 2px 12px rgba(0,0,0,0.4)"
        }}>
          Mode Africaine 🇸🇳{" "}
          <span style={{ 
            background: "linear-gradient(135deg, #fbbf24 0%, #fb923c 50%, #fcd34d 100%)", 
            WebkitBackgroundClip: "text", 
            WebkitTextFillColor: "transparent" 
          }}>
            Élégance Sénégalaise
          </span>
        </h1>

        {/* Description */}
        <p style={{ 
          fontSize: "clamp(16px, 3vw, 20px)", 
          color: "rgba(255,255,255,0.95)",
          lineHeight: "1.8", 
          maxWidth: "700px",
          fontWeight: "500",
          textShadow: "1px 1px 6px rgba(0,0,0,0.3)"
        }}>
          Découvrez notre collection exclusive de vêtements tradionnels et modernes.{" "}
          <span style={{ color: "#ea580c", fontWeight: "700" }}>Lacostes premium</span>,{" "}
          <span style={{ color: "#ea580c", fontWeight: "700" }}>Abayas raffinées</span>,{" "}
          <span style={{ color: "#ea580c", fontWeight: "700" }}>Qamis brodés</span>,{" "}
          <span style={{ color: "#ea580c", fontWeight: "700" }}>Boubous sénégalais</span> et bien plus.
        </p>

        {/* Features Row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", paddingTop: "8px" }}>
          {[
            { icon: "🚚", text: "Livraison Gratuite" },
            { icon: "✅", text: "100% Authentique" },
            { icon: "💳", text: "Paiement Sécurisé" }
          ].map((feature, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.95)", textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}>
              <span style={{ fontSize: "20px" }}>{feature.icon}</span>
              {feature.text}
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "24px", maxWidth: "500px" }}>
          <Link
            to="/produits"
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "10px", 
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)", 
              color: "white", 
              padding: "14px 32px", 
              borderRadius: "10px", 
              fontWeight: "700", 
              fontSize: "16px", 
              textDecoration: "none", 
              boxShadow: "0 15px 35px rgba(234, 88, 12, 0.3)",
              transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              transform: "translateY(0)"
            }}
            onMouseEnter={(e) => { 
              e.currentTarget.style.boxShadow = "0 25px 50px rgba(234, 88, 12, 0.4)"; 
              e.currentTarget.style.transform = "translateY(-4px) scale(1.02)";
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(234, 88, 12, 0.3)"; 
              e.currentTarget.style.transform = "translateY(0) scale(1)";
            }}
          >
            <span style={{ fontSize: "18px" }}>👗</span>
            Découvrir la Boutique
            <ArrowRight size={20} />
          </Link>
          <Link
            to="/contact"
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "10px", 
              backgroundColor: "white", 
              border: "2px solid #ea580c", 
              color: "#ea580c", 
              padding: "14px 32px", 
              borderRadius: "10px", 
              fontWeight: "700", 
              fontSize: "16px", 
              textDecoration: "none", 
              transition: "all 0.3s",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef3c7";
              e.currentTarget.style.boxShadow = "0 12px 25px rgba(234, 88, 12, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
            }}
          >
            <span style={{ fontSize: "18px" }}>💬</span>
            Contact & Support
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px", paddingTop: "40px", maxWidth: "700px" }}>
          {[
            { icon: "📦", number: "500+", label: "Produits" },
            { icon: "😊", number: "1000+", label: "Clients Heureux" },
            { icon: "⭐", number: "4.9/5", label: "Note Moyenne" }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <p style={{ fontSize: "32px", marginBottom: "8px" }}>{stat.icon}</p>
              <p style={{ fontSize: "20px", fontWeight: "800", color: "#fbbf24", margin: "0", textShadow: "1px 1px 4px rgba(0,0,0,0.3)" }}>{stat.number}</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: "500", margin: "4px 0 0 0" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Scroll Indicator */}
    <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
      <div style={{ animation: "bounce 2s infinite", display: "inline-block" }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: "600", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em", textShadow: "1px 1px 3px rgba(0,0,0,0.4)" }}>Scroll</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "4px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ width: "2px", height: "16px", backgroundColor: "#fbbf24", borderRadius: "9999px", opacity: i === 2 ? 1 : 0.4 }}></div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  </section>
);

export default Hero;
