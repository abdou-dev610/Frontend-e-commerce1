import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const cats = [
  { name: "Lacostes",   image: "/images/icones/Lacostes.png",   color: "#ea580c", bgColor: "#fef3c7" },
  { name: "Abayas",     image: "/images/icones/abayas.png",     color: "#ea580c", bgColor: "#fed7aa" },
  { name: "Qamis",      image: "/images/icones/qamis.png",      color: "#f97316", bgColor: "#fef3c7" },
  { name: "Pullovers",  image: "/images/icones/pullovers.png",  color: "#ea580c", bgColor: "#fed7aa" },
  { name: "Ensembles",  image: "/images/icones/ensembles.png",  color: "#f97316", bgColor: "#fef3c7" },
];

const CategoryBanner = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    navigate(`/produits?cat=${encodeURIComponent(categoryName)}`);
  };

  return (
  <section style={{ 
    paddingTop: "clamp(56px, 12vw, 80px)", 
    paddingBottom: "clamp(56px, 12vw, 96px)", 
    background: "linear-gradient(135deg, #faf8f3 0%, #ffffff 100%)",
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

    <div style={{ maxWidth: "1300px", margin: "0 auto", padding: "0 clamp(8px, 3vw, 16px)", position: "relative", zIndex: 1 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(48px, 12vw, 64px)" }}>
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
            Nos Collections
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: "clamp(32px, 6vw, 48px)",
          fontWeight: "900",
          color: "#111827",
          marginTop: "12px",
          letterSpacing: "-0.01em"
        }}>
          Nos Catégories
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
          Explorez nos 7 catégories principales de mode sénégalaise et internationale
        </p>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(clamp(150px, 20vw, 210px), 1fr))",
        gap: "clamp(12px, 2vw, 20px)",
        marginBottom: "clamp(48px, 12vw, 64px)"
      }}>
        {cats.map((c) => (
          <button
            key={c.name}
            onClick={() => handleCategoryClick(c.name)}
            style={{
              position: "relative",
              height: "clamp(180px, 25vw, 260px)",
              borderRadius: "18px",
              overflow: "hidden",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "inherit",
              boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
              e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.22)";
              e.currentTarget.querySelector("img").style.transform = "scale(1.1)";
              e.currentTarget.querySelector(".cat-overlay").style.background =
                "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)";
              e.currentTarget.querySelector(".cat-arrow").style.transform = "translateX(5px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.12)";
              e.currentTarget.querySelector("img").style.transform = "scale(1)";
              e.currentTarget.querySelector(".cat-overlay").style.background =
                "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)";
              e.currentTarget.querySelector(".cat-arrow").style.transform = "translateX(0)";
            }}
          >
            {/* Full-cover image */}
            <img
              src={c.image}
              alt={c.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
            />

            {/* Gradient overlay */}
            <div
              className="cat-overlay"
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)",
                transition: "background 0.35s ease",
              }}
            />

            {/* Top color accent */}
            <div style={{
              position: "absolute",
              top: 0, left: 0, right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${c.color}, #f97316)`,
            }} />

            {/* Text at bottom */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0,
              padding: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontSize: "clamp(15px, 2vw, 18px)",
                fontWeight: "800",
                color: "#ffffff",
                letterSpacing: "-0.01em",
                textShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}>
                {c.name}
              </span>
              <span
                className="cat-arrow"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${c.color}, #f97316)`,
                  transition: "transform 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <ArrowRight size={14} color="white" />
              </span>
            </div>
          </button>
        ))}
      </div>

    </div>
  </section>
  );
};

export default CategoryBanner;
