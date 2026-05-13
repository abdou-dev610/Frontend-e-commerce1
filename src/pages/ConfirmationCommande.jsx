import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { ordersApi } from "@/integrations/api/client";

const ConfirmationCommande = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("ready"); // ready, loading, success, error
  const [message, setMessage] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    // Charger les détails de la commande au chargement
    const loadOrder = async () => {
      try {
        const orderId = searchParams.get("order");
        if (orderId) {
          const order = await ordersApi.getById(orderId);
          setOrderDetails(order);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };
    loadOrder();
  }, [searchParams]);

  const handleConfirmOrder = async () => {
    try {
      setLoading(true);
      setStatus("loading");

      const orderId = searchParams.get("order");
      if (!orderId) {
        setStatus("error");
        setMessage("❌ ID de commande manquant");
        setLoading(false);
        return;
      }

      // Appeler l'API pour confirmer la commande
      const response = await ordersApi.updateStatus(orderId, {
        paymentStatus: "Confirmé",
        orderStatus: "En cours de traitement"
      });

      if (response) {
        setOrderDetails(response);
        setStatus("success");
        setMessage("✅ Commande confirmée et envoyée!");

        // Redirection automatique après 3 secondes
        setTimeout(() => {
          navigate("/admin");
        }, 3000);
      } else {
        setStatus("error");
        setMessage("❌ Erreur lors de la confirmation");
      }
    } catch (error) {
      console.error("Erreur:", error);
      setStatus("error");
      setMessage("❌ Erreur serveur. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      paddingTop: "80px",
      paddingBottom: "40px",
      background: "linear-gradient(135deg, #faf8f3 0%, #f3e5d7 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        padding: "24px"
      }}>
        {status === "success" ? (
          // SUCCESS STATE
          <div style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "2px solid #f3e5d7",
            padding: "40px 24px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{ fontSize: "64px", animation: "bounce 0.6s ease-in-out 2" }}>
              ✅
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#059669",
              margin: 0
            }}>
              Commande Confirmée!
            </h1>
            <p style={{
              color: "#6b7280",
              fontSize: "14px",
              margin: 0,
              marginBottom: "16px"
            }}>
              {message}
            </p>

            {orderDetails && (
              <div style={{
                background: "#f0fdf4",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #bbf7d0",
                width: "100%",
                textAlign: "left"
              }}>
                <p style={{
                  fontSize: "13px",
                  margin: "0 0 8px 0",
                  color: "#111827",
                  fontWeight: "600"
                }}>
                  📦 Numéro de Commande:
                </p>
                <p style={{
                  fontSize: "16px",
                  margin: 0,
                  color: "#059669",
                  fontWeight: "700",
                  wordBreak: "break-all"
                }}>
                  {orderDetails.orderNumber || orderDetails._id}
                </p>
              </div>
            )}

            <p style={{
              fontSize: "13px",
              color: "#6b7280",
              margin: "8px 0 0 0"
            }}>
              Redirection vers le panel admin en 3 secondes...
            </p>

            <button
              onClick={() => navigate("/admin")}
              style={{
                marginTop: "16px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(234, 88, 12, 0.3)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              📊 Aller au Panel Admin
            </button>
          </div>
        ) : (
          // CONFIRMATION STATE
          <div style={{
            background: "white",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            border: "2px solid #f3e5d7",
            padding: "40px 24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📦</div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: "900",
                color: "#111827",
                margin: "0 0 8px 0"
              }}>
                Confirmer cette Commande
              </h1>
              <p style={{
                color: "#6b7280",
                fontSize: "14px",
                margin: 0
              }}>
                Cliquez sur le bouton ci-dessous pour confirmer et traiter la commande
              </p>
            </div>

            {/* Order Details */}
            {orderDetails && (
              <div style={{
                background: "#f9fafb",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb"
              }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  fontSize: "13px"
                }}>
                  <div>
                    <p style={{ color: "#6b7280", margin: "0 0 4px 0", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Numéro</p>
                    <p style={{ color: "#111827", margin: 0, fontWeight: "700", fontSize: "14px" }}>
                      {orderDetails.orderNumber || orderDetails._id}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: "#6b7280", margin: "0 0 4px 0", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Montant</p>
                    <p style={{ 
                      color: "#ea580c", 
                      margin: 0, 
                      fontWeight: "700", 
                      fontSize: "14px",
                      background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent"
                    }}>
                      {(orderDetails.totalAmount || 0).toLocaleString()} FCFA
                    </p>
                  </div>
                  {orderDetails.customerName && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <p style={{ color: "#6b7280", margin: "0 0 4px 0", fontSize: "11px", fontWeight: "600", textTransform: "uppercase" }}>Client</p>
                      <p style={{ color: "#111827", margin: 0, fontWeight: "600" }}>
                        {orderDetails.customerName}
                      </p>
                      {orderDetails.customerPhone && (
                        <p style={{ color: "#6b7280", margin: "2px 0 0 0", fontSize: "12px" }}>
                          📱 {orderDetails.customerPhone}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {status === "error" && (
              <div style={{
                background: "#fee2e2",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #fecaca",
                color: "#991b1b",
                fontSize: "13px",
                fontWeight: "600"
              }}>
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={handleConfirmOrder}
              disabled={loading}
              style={{
                padding: "16px 24px",
                background: loading ? "#ccc" : "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px"
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(234, 88, 12, 0.35)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <span>⏳</span>
                  Confirmation en cours...
                </>
              ) : (
                <>
                  <span>✅</span>
                  CONFIRMER CETTE COMMANDE
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/admin")}
              style={{
                padding: "12px 24px",
                background: "white",
                color: "#ea580c",
                border: "2px solid #ea580c",
                borderRadius: "8px",
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#faf8f3";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              📊 Aller au Panel Admin
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default ConfirmationCommande;
