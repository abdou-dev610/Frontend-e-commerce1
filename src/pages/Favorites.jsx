import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

const Favorites = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      padding: "40px 16px",
      textAlign: "center",
    }}
  >
    <div
      style={{
        width: "72px",
        height: "72px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Heart size={32} color="white" />
    </div>
    <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>
      Mes Favoris
    </h1>
    <p style={{ color: "#6b7280", fontSize: "15px", maxWidth: "360px" }}>
      Vous n'avez pas encore de produits favoris. Explorez notre catalogue pour en ajouter.
    </p>
    <Link
      to="/produits"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)",
        color: "white",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "14px",
      }}
    >
      Voir les produits
    </Link>
  </div>
);

export default Favorites;
