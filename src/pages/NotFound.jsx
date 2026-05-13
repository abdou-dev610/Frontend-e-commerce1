import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: route inexistante :", location.pathname);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #faf8f3 0%, #fff 100%)",
      padding: "20px"
    }}>
      <div style={{ textAlign: "center", maxWidth: "480px" }}>
        {/* Big 404 */}
        <div style={{
          fontSize: "clamp(80px, 20vw, 140px)",
          fontWeight: "900",
          background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: "1",
          marginBottom: "16px"
        }}>
          404
        </div>

        {/* Icon */}
        <div style={{
          fontSize: "48px",
          marginBottom: "16px"
        }}>
          🛍️
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(20px, 5vw, 28px)",
          fontWeight: "800",
          color: "#111827",
          marginBottom: "12px"
        }}>
          Page introuvable
        </h1>

        {/* Description */}
        <p style={{
          fontSize: "15px",
          color: "#6b7280",
          lineHeight: "1.6",
          marginBottom: "32px"
        }}>
          Oops ! La page <strong style={{ color: "#ea580c" }}>{location.pathname}</strong> n'existe pas.<br />
          Elle a peut-être été déplacée ou supprimée.
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
              color: "white",
              padding: "13px 28px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(234,88,12,0.25)",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-3px)";
              e.currentTarget.style.boxShadow = "0 14px 28px rgba(234,88,12,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(234,88,12,0.25)";
            }}
          >
            <Home size={18} />
            Retourner à l'accueil
          </Link>

          <Link
            to="/produits"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "2px solid #ea580c",
              color: "#ea580c",
              padding: "11px 28px",
              borderRadius: "10px",
              fontWeight: "700",
              fontSize: "15px",
              textDecoration: "none",
              transition: "all 0.3s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff7ed";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <ArrowLeft size={18} />
            Voir les produits
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
