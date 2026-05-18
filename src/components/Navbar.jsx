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

const itemStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  padding: "11px 16px",
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

  const btnRef   = useRef(null);
  const portalRef = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Fermer mobile menu quand on resize vers desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const calcPos = useCallback(() => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setDropdownPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
  }, []);

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

  useEffect(() => {
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (portalRef.current?.contains(e.target)) return;
      setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const goTo = (path) => {
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
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
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
            <div style={{ fontWeight: "700", color: "#111827", fontSize: "13px" }}>{user.fullName}</div>
            <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "2px" }}>{user.email}</div>
            {user.phone && <div style={{ color: "#6b7280", fontSize: "12px" }}>{user.phone}</div>}
          </div>

          <button type="button" style={{ ...itemStyle, color: "#374151" }}
            onClick={() => goTo("/mon-compte")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            👤 Mon Compte
          </button>

          <button type="button" style={{ ...itemStyle, color: "#374151" }}
            onClick={() => goTo("/commandes")}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            📦 Mes Commandes
          </button>

          {isAdmin && (
            <button type="button" style={{ ...itemStyle, color: "#ea580c", fontWeight: "600" }}
              onClick={() => goTo("/admin")}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff7ed")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              <Shield size={14} />
              Tableau de Bord Admin
            </button>
          )}

          <button type="button" style={{ ...itemStyle, color: "#ef4444", borderBottom: "none" }}
            onClick={handleSignOut}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* ── Responsive CSS ─────────────────────────────────────────── */}
      <style>{`
        /* Desktop : afficher liens + user, masquer hamburger */
        @media (min-width: 768px) {
          .nav-desktop-links { display: flex !important; }
          .nav-user-desktop  { display: flex !important; }
          .nav-hamburger     { display: none  !important; }
        }
        /* Mobile : masquer liens + user desktop, afficher hamburger */
        @media (max-width: 767px) {
          .nav-desktop-links { display: none  !important; }
          .nav-user-desktop  { display: none  !important; }
          .nav-hamburger     { display: flex  !important; }
        }
      `}</style>

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
            style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none", flexShrink: 0 }}
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

          {/* ── Liens desktop (masqués sur mobile) ─── */}
          <div
            className="nav-desktop-links"
            style={{ alignItems: "center", gap: "clamp(16px, 3vw, 40px)" }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                style={({ isActive }) => ({
                  fontSize: "14px",
                  fontWeight: "600",
                  color: isActive ? "#ea580c" : "#374151",
                  textDecoration: isActive ? "underline" : "none",
                  transition: "color 0.2s",
                  whiteSpace: "nowrap",
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* ── Droite ───────────────────────────────── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

            {/* Panier — toujours visible */}
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

            {/* Avatar / Connexion — masqués sur mobile (dans le menu hamburger) */}
            <div className="nav-user-desktop">
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
                    whiteSpace: "nowrap",
                  }}
                >
                  <User size={14} />
                  Connexion
                </Link>
              )}
            </div>

            {/* Hamburger — visible uniquement sur mobile */}
            <button
              type="button"
              className="nav-hamburger"
              style={{
                border: "none", background: "none",
                cursor: "pointer", color: "#374151",
                padding: "6px", borderRadius: "6px",
                alignItems: "center",
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
              padding: "8px 0 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              maxHeight: "calc(100vh - 56px)",
              overflowY: "auto",
            }}
          >
            {/* Navigation links */}
            <div style={{ padding: "0 16px" }}>
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  onClick={() => setMobileOpen(false)}
                  style={({ isActive }) => ({
                    display: "block",
                    padding: "13px 8px",
                    color: isActive ? "#ea580c" : "#374151",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "15px",
                    borderBottom: "1px solid #f3f4f6",
                  })}
                >
                  {link.label}
                </NavLink>
              ))}

              <Link
                to="/panier"
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "13px 8px",
                  color: "#374151",
                  textDecoration: "none",
                  fontWeight: "600", fontSize: "15px",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <ShoppingCart size={18} />
                Panier
                {itemCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#ef4444", color: "white",
                      borderRadius: "50%", width: "20px", height: "20px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "bold",
                    }}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* User section */}
            <div style={{ padding: "8px 16px 0" }}>
              {user ? (
                <>
                  <div
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "12px 8px 16px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <div
                      style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #b45309 0%, #f97316 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "white", fontWeight: "bold", fontSize: "16px", flexShrink: 0,
                      }}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: "700", color: "#111827", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                    </div>
                  </div>

                  <button type="button" onClick={() => goTo("/mon-compte")}
                    style={{ ...itemStyle, color: "#374151", borderBottom: "1px solid #f3f4f6", width: "100%" }}>
                    👤 Mon Compte
                  </button>
                  <button type="button" onClick={() => goTo("/commandes")}
                    style={{ ...itemStyle, color: "#374151", borderBottom: "1px solid #f3f4f6", width: "100%" }}>
                    📦 Mes Commandes
                  </button>
                  {isAdmin && (
                    <button type="button" onClick={() => goTo("/admin")}
                      style={{ ...itemStyle, color: "#ea580c", fontWeight: "600", borderBottom: "1px solid #f3f4f6", width: "100%" }}>
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
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    padding: "14px",
                    background: "linear-gradient(90deg, #b45309 0%, #f97316 100%)",
                    color: "white", textDecoration: "none", fontWeight: "700",
                    borderRadius: "10px", fontSize: "15px",
                    marginTop: "8px",
                  }}
                >
                  <User size={16} />
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {dropdownPortal}
    </>
  );
};

export default Navbar;
