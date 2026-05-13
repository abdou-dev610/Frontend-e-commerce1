import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Menu, X, ShoppingBag, ShoppingCart,
  User, LogOut, Shield, ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const NAV_LINKS = [
  { to: "/", label: "Accueil" },
  { to: "/produits", label: "Produits" },
  { to: "/contact", label: "Contact" },
];

const getInitials = (name) => {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

// ─── Style de base des boutons du dropdown ──────────────────────────────────
const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "11px 16px",
  borderBottom: "1px solid #f3f4f6",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid #f3f4f6",
  fontSize: "13px",
  fontWeight: "500",
  cursor: "pointer",
  textAlign: "left",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const btnRef  = useRef(null); // bouton avatar
  const portalRef = useRef(null); // div portal

  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

  // Fermer sur changement de route
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Calculer la position du portal sous le bouton avatar
  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
  }, []);

  // Repositionner si scroll / resize pendant ouverture
  useEffect(() => {
    if (!dropdownOpen) return;
    const update = () => calcPos();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [dropdownOpen, calcPos]);

  // Clic en dehors → fermer
  useEffect(() => {
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Navigation depuis le dropdown (avec log diagnostic) ─────────────────
  const goTo = (path) => {
    console.log("🔗 NAVIGATE TO:", path);
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    console.log("🔗 CLICK LOGOUT");
    setDropdownOpen(false);
    setMobileOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    try { await signOut(); } catch (_) {}
    navigate("/auth");
  };

  const toggleDropdown = () => {
    if (dropdownOpen) {
      setDropdownOpen(false);
    } else {
      calcPos();
      setDropdownOpen(true);
    }
  };

  // ── Portal dropdown ──────────────────────────────────────────────────────
  const dropdownPortal = dropdownOpen && user
    ? createPortal(
        <div
          ref={portalRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
            minWidth: "235px",
            zIndex: 99999,
            overflow: "hidden",
          }}
        >
          {/* En-tête utilisateur */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
            <div style={{ fontWeight: "700", color: "#111827", fontSize: "13px" }}>{user.fullName}</div>
            <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{user.email}</div>
            {user.phone && <div style={{ color: "#6b7280", fontSize: "12px" }}>{user.phone}</div>}
          </div>

          {/* Mon Compte */}
          <button
            type="button"
            style={{ ...itemStyle, color: "#374151" }}
            onClick={() => { console.log("CLICK MON COMPTE"); goTo("/mon-compte"); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            👤 Mon Compte
          </button>

          {/* Mes Commandes */}
          <button
            type="button"
            style={{ ...itemStyle, color: "#374151" }}
            onClick={() => { console.log("CLICK COMMANDES"); goTo("/commandes"); }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            📦 Mes Commandes
          </button>

          {/* Tableau de Bord Admin (si admin) */}
          {isAdmin && (
            <button
              type="button"
              style={{ ...itemStyle, color: "#ea580c", fontWeight: "600" }}
              onClick={() => { console.log("CLICK ADMIN"); goTo("/admin"); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff7ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Shield size={14} />
              Tableau de Bord Admin
            </button>
          )}

          {/* Déconnexion */}
          <button
            type="button"
            style={{ ...itemStyle, color: "#ef4444", borderBottom: "none" }}
            onClick={handleSignOut}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderBottom: "1px solid #f3f4f6",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
          }}
        >
          {/* ── Logo ──────────────────────────────────── */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)",
                padding: "8px",
                borderRadius: "6px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            >
              <ShoppingBag size={20} color="white" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: "1.1",
                  whiteSpace: "nowrap",
                }}
              >
                CHIC SENEGAL
              </span>
              <span style={{ fontSize: "10px", color: "#b45309", fontWeight: "600", lineHeight: "1" }}>
                STYLE
              </span>
            </div>
          </Link>

          {/* ── Liens desktop ─────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(16px, 3vw, 40px)" }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                style={({ isActive }) => ({
                  fontSize: "clamp(12px, 2vw, 14px)",
                  fontWeight: "600",
                  color: isActive ? "#ea580c" : "#374151",
                  textDecoration: isActive ? "underline" : "none",
                  transition: "color 0.2s",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Droite : panier + user + hamburger ─────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Panier */}
            <Link
              to="/panier"
              style={{
                position: "relative",
                textDecoration: "none",
                color: "#374151",
                padding: "6px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ShoppingCart size={22} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px", right: "-4px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px", height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Avatar / Connexion */}
            {user ? (
              <button
                ref={btnRef}
                type="button"
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  border: "1px solid #e5e7eb",
                  background: "white",
                  cursor: "pointer",
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#374151",
                }}
              >
                <div
                  style={{
                    width: "28px", height: "28px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: "bold", fontSize: "12px",
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user.fullName)}
                </div>
                <span style={{ maxWidth: "80px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.fullName?.split(" ")[0] || user.email}
                </span>
                <ChevronDown size={14} color="#9ca3af" />
              </button>
            ) : (
              <Link
                to="/auth"
                style={{
                  fontSize: "13px", fontWeight: "700",
                  color: "white",
                  background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "flex", alignItems: "center", gap: "6px",
                }}
              >
                <User size={14} />
                Connexion
              </Link>
            )}

            {/* Hamburger */}
            <button
              type="button"
              style={{
                border: "none", background: "none",
                cursor: "pointer", color: "#374151",
                padding: "6px", borderRadius: "6px",
                display: "flex", alignItems: "center",
              }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Menu mobile"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Menu mobile ───────────────────────────────── */}
        {mobileOpen && (
          <div
            style={{
              backgroundColor: "white",
              borderTop: "1px solid #e5e7eb",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  display: "block",
                  padding: "11px 8px",
                  color: isActive ? "#ea580c" : "#374151",
                  textDecoration: "none",
                  fontWeight: "500",
                  fontSize: "15px",
                  borderBottom: "1px solid #f9fafb",
                })}
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to="/panier"
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "11px 8px",
                color: "#374151",
                textDecoration: "none",
                fontWeight: "500", fontSize: "15px",
                borderBottom: "1px solid #f9fafb",
              }}
            >
              <ShoppingCart size={16} />
              Panier
              {itemCount > 0 && (
                <span
                  style={{
                    backgroundColor: "#ef4444", color: "white",
                    borderRadius: "50%", width: "18px", height: "18px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "10px", fontWeight: "bold",
                  }}
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "8px", paddingTop: "8px" }}>
              {user ? (
                <>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "10px 8px 14px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        width: "36px", height: "36px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: "bold", fontSize: "14px", flexShrink: 0,
                      }}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", color: "#111827", fontSize: "14px" }}>{user.fullName}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>{user.email}</div>
                    </div>
                  </div>

                  <button type="button" onClick={() => goTo("/mon-compte")}
                    style={{ ...itemStyle, color: "#374151", borderBottom: "1px solid #f9fafb", width: "100%" }}>
                    👤 Mon Compte
                  </button>
                  <button type="button" onClick={() => goTo("/commandes")}
                    style={{ ...itemStyle, color: "#374151", borderBottom: "1px solid #f9fafb", width: "100%" }}>
                    📦 Mes Commandes
                  </button>
                  {isAdmin && (
                    <button type="button" onClick={() => goTo("/admin")}
                      style={{ ...itemStyle, color: "#ea580c", fontWeight: "600", borderBottom: "1px solid #f9fafb", width: "100%" }}>
                      <Shield size={14} /> Tableau de Bord Admin
                    </button>
                  )}
                  <button type="button" onClick={handleSignOut}
                    style={{ ...itemStyle, color: "#ef4444", borderBottom: "none", width: "100%" }}>
                    <LogOut size={14} /> Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                    padding: "12px",
                    background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)",
                    color: "white", textDecoration: "none", fontWeight: "600",
                    borderRadius: "8px", fontSize: "14px",
                  }}
                >
                  <User size={14} />
                  Connexion
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Portal — rendu directement dans document.body, hors de tout contexte CSS parent */}
      {dropdownPortal}
    </>
  );
};

export default Navbar;
