import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ShoppingBag, Lock } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, adminSignIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "signup") {
      if (!fullName.trim()) {
        toast({ title: "Erreur", description: "Le nom complet est requis", variant: "destructive" });
        return;
      }
      if (!phone.trim()) {
        toast({ title: "Erreur", description: "Le téléphone est requis", variant: "destructive" });
        return;
      }
    }

    if (!email.trim()) {
      toast({ title: "Erreur", description: "L'email est requis", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signUp(email, password, fullName, phone);
        toast({ title: "Inscription réussie!", description: "Bienvenue sur Chic Sénégal Style." });
        setTimeout(() => navigate("/"), 1000);
        return;
      }

      // Connexion unifiée : essaie client d'abord, puis admin en fallback
      let response;
      let isAdminLogin = false;

      try {
        response = await signIn(email, password);
        if (response?.user?.isAdmin) {
          isAdminLogin = true;
        }
      } catch {
        // Client signin failed — try admin signin
        response = await adminSignIn(email, password);
        isAdminLogin = true;
      }

      if (isAdminLogin) {
        toast({ title: "Bienvenue Admin!", description: "Redirection vers le tableau de bord..." });
        navigate("/admin");
      } else {
        toast({ title: "Connexion réussie!", description: "Bienvenue!" });
        navigate("/");
      }
    } catch (err) {
      toast({ title: "Erreur", description: err.message || "Identifiants incorrects", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
      padding: "24px 16px"
    }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Logo & Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "64px",
            height: "64px",
            backgroundColor: "#ea580c",
            borderRadius: "16px",
            marginBottom: "16px",
            boxShadow: "0 8px 24px rgba(234, 88, 12, 0.3)"
          }}>
            <ShoppingBag size={32} color="white" />
          </div>
          <h1 style={{
            fontSize: "26px",
            fontWeight: "800",
            color: "#1c1917",
            marginBottom: "4px",
            letterSpacing: "-0.5px"
          }}>
            Chic Sénégal Style
          </h1>
          <p style={{ fontSize: "14px", color: "#78716c" }}>
            {mode === "login" ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </p>
        </div>

        {/* Card */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px 28px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          border: "1px solid #f5f5f4"
        }}>
          {/* Mode tabs */}
          <div style={{
            display: "flex",
            backgroundColor: "#f5f5f4",
            borderRadius: "8px",
            padding: "4px",
            marginBottom: "28px",
            gap: "4px"
          }}>
            {[
              { key: "login", label: "Connexion" },
              { key: "signup", label: "Inscription" }
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setEmail("");
                  setPassword("");
                  setFullName("");
                  setPhone("");
                }}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: mode === key ? "white" : "transparent",
                  color: mode === key ? "#1c1917" : "#78716c",
                  border: "none",
                  borderRadius: "6px",
                  fontWeight: mode === key ? "600" : "400",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: mode === key ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Full Name (signup only) */}
            {mode === "signup" && (
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Abdou Ndiaye"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                  onBlur={(e) => e.target.style.borderColor = "#e7e5e4"}
                />
              </div>
            )}

            {/* Phone (signup only) */}
            {mode === "signup" && (
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="77 123 45 67"
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                  onBlur={(e) => e.target.style.borderColor = "#e7e5e4"}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemple.com"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                onBlur={(e) => e.target.style.borderColor = "#e7e5e4"}
              />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Mot de passe</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: "44px" }}
                  onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                  onBlur={(e) => e.target.style.borderColor = "#e7e5e4"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#a8a29e",
                    display: "flex",
                    alignItems: "center",
                    padding: "4px"
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "13px 16px",
                backgroundColor: submitting ? "#d6cbc6" : "#ea580c",
                color: "white",
                fontWeight: "600",
                fontSize: "15px",
                border: "none",
                borderRadius: "8px",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                marginTop: "4px"
              }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = "#c2410c")}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = "#ea580c")}
            >
              {submitting
                ? "Chargement..."
                : mode === "signup"
                ? "Créer mon compte"
                : "Se connecter"}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "20px 0 0"
          }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e7e5e4" }} />
            <span style={{ fontSize: "12px", color: "#a8a29e" }}>
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#e7e5e4" }} />
          </div>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setEmail("");
              setPassword("");
              setFullName("");
              setPhone("");
            }}
            style={{
              width: "100%",
              padding: "11px 16px",
              backgroundColor: "transparent",
              color: "#ea580c",
              fontWeight: "600",
              fontSize: "14px",
              border: "1px solid #ea580c",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.2s",
              marginTop: "12px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fff7ed";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {mode === "login" ? "S'inscrire" : "Se connecter"}
          </button>
        </div>

        {/* Admin hint */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          justifyContent: "center",
          marginTop: "20px"
        }}>
          <Lock size={12} color="#a8a29e" />
          <span style={{ fontSize: "12px", color: "#a8a29e" }}>
            Les administrateurs se connectent avec les mêmes identifiants
          </span>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#44403c",
  marginBottom: "6px"
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: "8px",
  border: "1px solid #e7e5e4",
  fontSize: "14px",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  backgroundColor: "#fafaf9",
  boxSizing: "border-box",
  outline: "none"
};

export default Auth;
