import { ShoppingBag, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", color: "white", padding: "clamp(48px, 10vw, 80px) clamp(8px, 3vw, 16px) clamp(20px, 5vw, 32px)" }}>
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(clamp(220px, 25vw, 280px), 1fr))", gap: "clamp(32px, 8vw, 56px)", marginBottom: "clamp(32px, 8vw, 56px)" }}>
        {/* Brand Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)", padding: "12px", borderRadius: "8px", boxShadow: "0 8px 16px rgba(234, 88, 12, 0.2)" }}>
              <ShoppingBag size={24} color="white" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontWeight: "bold", fontSize: "15px", background: "linear-gradient(90deg, #fbbf24 0%, #fb923c 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: "1.2" }}>
                CHIC SENEGAL
              </span>
              <span style={{ fontWeight: "bold", fontSize: "13px", color: "#fb923c", lineHeight: "1" }}>STYLE</span>
            </div>
          </div>
          <p style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6" }}>
            Votre destination pour la mode africaine authentique. Découvrez notre sélection exclusive de vêtements tendance.
          </p>
          {/* Social Links */}
          <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
            {[
              { Icon: Facebook,  label: "Facebook",  href: "https://www.facebook.com/?locale=fr_FR" },
              { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/" },
              { Icon: Twitter,   label: "Twitter",   href: "https://x.com/home?lang=fr" }
            ].map(({ Icon, label, href }, i) => (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noreferrer"
                title={label}
                style={{
                  backgroundColor: "rgba(148, 163, 184, 0.2)",
                  color: "#fb923c",
                  padding: "10px",
                  borderRadius: "6px",
                  transition: "all 0.3s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(148, 163, 184, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ea580c";
                  e.currentTarget.style.color = "white";
                  e.currentTarget.style.border = "1px solid #ea580c";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(234, 88, 12, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(148, 163, 184, 0.2)";
                  e.currentTarget.style.color = "#fb923c";
                  e.currentTarget.style.border = "1px solid rgba(148, 163, 184, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "28px", color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>Liens Rapides</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { to: "/", label: "Accueil" },
              { to: "/produits", label: "Produits" },
              { to: "/contact", label: "Contact" },
              { to: "/panier", label: "Panier" }
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  color: "#cbd5e1",
                  transition: "all 0.3s",
                  fontSize: "14px",
                  fontWeight: "500",
                  paddingLeft: "0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "fit-content"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fb923c";
                  e.currentTarget.style.paddingLeft = "6px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                <span style={{ fontSize: "12px" }}>→</span> {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "28px", color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>Catégories</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {["Lacostes", "Abayas", "Qamis", "Pullovers"].map((cat) => (
              <Link
                key={cat}
                to={`/produits?cat=${encodeURIComponent(cat)}`}
                onClick={() => window.scrollTo(0, 0)}
                style={{
                  color: "#cbd5e1",
                  transition: "all 0.3s",
                  fontSize: "14px",
                  fontWeight: "500",
                  paddingLeft: "0",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  width: "fit-content",
                  textDecoration: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fb923c";
                  e.currentTarget.style.paddingLeft = "6px";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#cbd5e1";
                  e.currentTarget.style.paddingLeft = "0";
                }}
              >
                <span style={{ fontSize: "12px" }}>→</span> {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "28px", color: "#fbbf24", letterSpacing: "0.08em", textTransform: "uppercase" }}>Contact</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: Phone, title: "Téléphone", text: "+221 76 204 81 19" },
              { icon: Mail, title: "Email", text: "ndiayeabdoumamesaye1234@gmail.com" },
              { icon: MapPin, title: "Localisation", text: "Dakar, Sénégal" }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                  padding: "14px",
                  borderRadius: "8px",
                  backgroundColor: "rgba(148, 163, 184, 0.1)",
                  transition: "all 0.3s",
                  border: "1px solid rgba(148, 163, 184, 0.2)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(234, 88, 12, 0.15)";
                  e.currentTarget.style.border = "1px solid rgba(234, 88, 12, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(148, 163, 184, 0.1)";
                  e.currentTarget.style.border = "1px solid rgba(148, 163, 184, 0.2)";
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "rgba(251, 146, 60, 0.2)",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  <item.icon size={18} style={{ color: "#fb923c" }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{item.title}</p>
                  <p style={{ color: "#cbd5e1", fontSize: "12px", wordBreak: "break-all", overflowWrap: "anywhere" }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.2)", marginTop: "56px", marginBottom: "40px" }} />

      {/* Footer Bottom */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
        <p style={{ color: "#94a3b8", fontSize: "13px", fontWeight: "500", textAlign: "center" }}>
          © {new Date().getFullYear()} <span style={{ color: "#fb923c", fontWeight: "600" }}>Chic Senegal Style</span>. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
