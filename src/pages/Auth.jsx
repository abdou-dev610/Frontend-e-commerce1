import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
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
    
    // Validation
    if (!isAdminMode && !isLogin) {
      if (!fullName || !fullName.trim()) {
        toast({ title: "Erreur", description: "Le nom complet est requis", variant: "destructive" });
        return;
      }
      if (!phone || !phone.trim()) {
        toast({ title: "Erreur", description: "Le téléphone est requis", variant: "destructive" });
        return;
      }
    }
    
    if (!email || !email.trim()) {
      toast({ title: "Erreur", description: "L'email est requis", variant: "destructive" });
      return;
    }
    
    if (!password || password.length < 6) {
      toast({ title: "Erreur", description: "Le mot de passe doit contenir au moins 6 caractères", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    try {
      if (isAdminMode) {
        // Admin Login
        console.log("🔐 Tentative connexion administrateur...");
        await adminSignIn(email, password);
        console.log("✅ Connexion admin réussie");
        toast({ title: "✅ Bienvenue Admin!", description: "Redirection vers le tableau de bord..." });
        navigate("/admin");
      } else if (isLogin) {
        console.log("🔑 Tentative connexion client...");
        await signIn(email, password);
        console.log("✅ Connexion réussie");
        toast({ title: "✅ Connexion réussie!", description: "Bienvenue !" });
        navigate("/");
      } else {
        console.log("📝 Tentative inscription...", { email, fullName, phone });
        const response = await signUp(email, password, fullName, phone);
        console.log("✅ Inscription réussie:", response);
        toast({ title: "✅ Inscription réussie!", description: "Votre compte a été créé avec succès. Redirection en cours..." });
        
        // Attendre 1 seconde puis rediriger
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      const errorMsg = err.message || "Une erreur est survenue";
      toast({ title: "❌ Erreur", description: errorMsg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      paddingTop: "clamp(40px, 8vw, 60px)",
      paddingBottom: "clamp(40px, 8vw, 60px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb"
    }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Mode Toggle Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          marginBottom: "24px",
          backgroundColor: "#f3f4f6",
          padding: "6px",
          borderRadius: "8px"
        }}>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(false);
              setIsLogin(true);
              setEmail("");
              setPassword("");
              setFullName("");
              setPhone("");
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: !isAdminMode ? "#ea580c" : "transparent",
              color: !isAdminMode ? "white" : "#6b7280",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            👤 Client
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminMode(true);
              setIsLogin(true);
              setEmail("ndiayeabdoumamesaye1234@gmail.com");
              setPassword("");
              setFullName("");
              setPhone("");
            }}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: isAdminMode ? "#ea580c" : "transparent",
              color: isAdminMode ? "white" : "#6b7280",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.3s"
            }}
          >
            🔐 Admin
          </button>
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "56px",
            height: "56px",
            backgroundColor: isAdminMode ? "#059669" : "#ea580c",
            borderRadius: "8px",
            marginBottom: "16px",
            transition: "background-color 0.3s"
          }}>
            {isAdminMode ? "🔐" : "🛍️"}
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#1f2937",
            marginBottom: "8px"
          }}>
            {isAdminMode ? "Admin Dashboard" : isLogin ? "Connexion Client" : "Inscription Client"}
          </h1>
          <p style={{
            fontSize: "14px",
            color: "#6b7280"
          }}>
            {isAdminMode 
              ? "Connectez-vous à votre compte administrateur" 
              : isLogin 
              ? "Connectez-vous à votre compte" 
              : "Créez votre compte Boutique Fashion"}
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} style={{
          backgroundColor: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "32px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          {/* Full Name Field (Signup only) */}
          {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151"
              }}>
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Abdou Ndiaye"
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.3s",
                  backgroundColor: "#fff"
                }}
                onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>
          )}

          {/* Phone Field (Signup only) */}
          {!isLogin && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151"
              }}>
                Téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="77 123 45 67"
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.3s",
                  backgroundColor: "#fff"
                }}
                onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
            </div>
          )}

          {/* Email Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151"
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              required
              style={{
                padding: "12px 14px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "14px",
                fontFamily: "inherit",
                transition: "all 0.3s",
                backgroundColor: "#fff"
              }}
              onFocus={(e) => e.target.style.borderColor = "#ea580c"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
            />
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <label style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#374151"
            }}>
              Mot de passe
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  paddingRight: "40px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  transition: "all 0.3s",
                  backgroundColor: "#fff",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#ea580c"}
                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px"
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ea580c"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "12px 16px",
              backgroundColor: isAdminMode ? "#059669" : "#ea580c",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
              border: "none",
              borderRadius: "6px",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              opacity: submitting ? 0.7 : 1
            }}
            onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = isAdminMode ? "#047857" : "#c2410c")}
            onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = isAdminMode ? "#059669" : "#ea580c")}
          >
            {submitting ? "Chargement..." : isAdminMode ? "🔐 Accès Admin" : isLogin ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        {/* Toggle Link - Only show for client mode */}
        {!isAdminMode && (
          <p style={{
            textAlign: "center",
            fontSize: "13px",
            color: "#6b7280",
            marginTop: "16px"
          }}>
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                marginLeft: "4px",
                color: "#ea580c",
                fontWeight: "600",
                border: "none",
                background: "none",
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.3s"
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        )}

        {/* Admin Info */}
        {isAdminMode && (
          <div style={{
            marginTop: "20px",
            backgroundColor: "#dbeafe",
            border: "1px solid #93c5fd",
            borderRadius: "8px",
            padding: "16px",
            fontSize: "12px",
            color: "#1e40af"
          }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600" }}>
              💡 Accès Administrateur
            </p>
            <p style={{ margin: 0 }}>
              Email: <code style={{backgroundColor: "white", padding: "2px 6px", borderRadius: "4px"}}>ndiayeabdoumamesaye1234@gmail.com</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
