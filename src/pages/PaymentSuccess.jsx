import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { ordersApi, getToken } from "@/integrations/api/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const [orderDetails, setOrderDetails] = useState(null);
  const [status, setStatus] = useState("confirming"); // confirming, success, error
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer et confirmer automatiquement la commande
    const orderId = searchParams.get("order");
    const transactionId = searchParams.get("transaction_id");
    let redirectTimer;

    const confirmOrder = async () => {
      try {
        if (!orderId) {
          throw new Error("ID de commande manquant");
        }

        console.log("🔥 Début de confirmation du paiement pour orderId:", orderId);

        // Vérifier l'authentification
        const token = getToken();
        if (!token) {
          throw new Error("Authentification requise - veuillez vous reconnecter");
        }

        // Récupérer les détails de la commande
        console.log("📦 Récupération des détails de la commande...");
        const orderData = await ordersApi.getById(orderId);
        console.log("✅ Détails de la commande reçus:", orderData);

        setOrderDetails({
          orderId,
          orderNumber: orderData.orderNumber,
          transactionId,
          items: orderData.items || items,
          total: orderData.totalAmount || total,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerPhone
        });

        // Confirmer le paiement via ordersApi
        console.log("💳 Confirmation du paiement via l'API...");
        const confirmResponse = await ordersApi.confirmPayment(orderId, transactionId);
        console.log("✅ Réponse de confirmation reçue:", confirmResponse);

        if (!confirmResponse.success && !confirmResponse.order) {
          throw new Error("Erreur lors de la confirmation du paiement");
        }

        // Envoyer notification à l'admin
        console.log("📧 Envoi de notification à l'administrateur...");
        try {
          const notifyResponse = await fetch(`${import.meta.env.VITE_API_URL || "/api"}/orders/notify-admin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderId,
              orderNumber: orderData.orderNumber,
              customerName: orderData.customerName,
              customerEmail: orderData.customerEmail,
              customerPhone: orderData.customerPhone,
              totalAmount: orderData.totalAmount,
              transactionId: transactionId
            })
          });
          console.log("📧 Notification envoyée:", notifyResponse.ok);
        } catch (err) {
          console.warn("⚠️ Notification non envoyée:", err.message);
        }

        console.log("✅✅✅ Commande reçue — en attente de validation admin");
        setStatus("success");
        setMessage("✅ Commande reçue ! L'administrateur va valider votre paiement.");
        clearCart();

        // Redirection automatique après 3 secondes
        redirectTimer = setTimeout(() => {
          navigate("/");
        }, 3000);
      } catch (error) {
        console.error("❌ Erreur lors de la confirmation:", error);
        setStatus("error");
        setMessage("⚠️ Erreur lors de la confirmation. Veuillez réessayer ou contacter le support.");
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
    return () => clearTimeout(redirectTimer);
  }, [searchParams]);

  return (
    <div style={{
      paddingTop: "100px",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #8B5E3C 0%, #D4A574 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        maxWidth: "500px",
        margin: "auto",
        padding: "40px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        textAlign: "center"
      }}>
        {/* Icône de succès */}
        <div style={{
          fontSize: "80px",
          marginBottom: "20px",
          animation: "bounce 1s infinite"
        }}>
          {status === "success" ? "✅" : status === "error" ? "❌" : "⏳"}
        </div>

        {/* Titre */}
        <h1 style={{
          color: status === "success" ? "#27ae60" : status === "error" ? "#d32f2f" : "#f97316",
          marginBottom: "10px",
          fontSize: "32px"
        }}>
          {status === "success" ? "Paiement Réussi!" : status === "error" ? "Erreur" : "Traitement..."}
        </h1>

        {/* Message */}
        <p style={{
          color: "#555",
          fontSize: "16px",
          marginBottom: "20px",
          lineHeight: "1.6"
        }}>
          {status === "success" 
            ? "Votre commande a été confirmée et l'administrateur a été notifié."
            : status === "error"
            ? message
            : "Veuillez patienter, votre commande est en cours de traitement..."}
          <br />
          {orderDetails && (
            <>
              <strong>Numéro de commande:</strong> {orderDetails.orderNumber || orderDetails.orderId}
              <br />
              <strong>Montant:</strong> {(orderDetails.total || 0).toLocaleString()} FCFA
            </>
          )}
        </p>

        {/* Détails des articles */}
        {orderDetails && (orderDetails.items?.length > 0) && (
          <div style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "left"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#333" }}>
              📦 Résumé de commande:
            </h3>
            {orderDetails.items.map((item, idx) => {
              const itemName = item.product?.name || item.name || "Produit";
              const itemPrice = item.product?.price || item.price || 0;
              const itemQty = item.quantity || 1;
              return (
                <div key={idx} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: idx < orderDetails.items.length - 1 ? "1px solid #ddd" : "none"
                }}>
                  <span>{itemName} x{itemQty}</span>
                  <span style={{ fontWeight: "bold" }}>
                    {(itemPrice * itemQty).toLocaleString()} FCFA
                  </span>
                </div>
              );
            })}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0",
              marginTop: "10px",
              borderTop: "2px solid #8B5E3C",
              fontWeight: "bold",
              color: "#8B5E3C"
            }}>
              <span>TOTAL:</span>
              <span>{(orderDetails.total || 0).toLocaleString()} FCFA</span>
            </div>
          </div>
        )}

        {/* Message de succès */}
        {status === "success" && (
          <div style={{
            background: "#fff8e1",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #f9a825"
          }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#e65100" }}>
              ⏳ <strong>Commande reçue — paiement en attente de validation.</strong>
              <br />
              L'administrateur vérifiera votre paiement et confirmera la commande sous 24h.
            </p>
          </div>
        )}

        {/* Message d'erreur */}
        {status === "error" && (
          <div style={{
            background: "#ffebee",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            borderLeft: "4px solid #d32f2f"
          }}>
            <p style={{ margin: 0, fontSize: "14px", color: "#b71c1c" }}>
              {message}
            </p>
          </div>
        )}

        {/* Boutons */}
        <div style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          flexDirection: "column"
        }}>
          {status === "success" && (
            <button
              onClick={() => {
                navigate("/");
              }}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "#8B5E3C",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(139, 94, 60, 0.3)"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#6a4a2c";
                e.target.style.boxShadow = "0 6px 16px rgba(139, 94, 60, 0.5)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#8B5E3C";
                e.target.style.boxShadow = "0 4px 12px rgba(139, 94, 60, 0.3)";
              }}
            >
              🏠 Retour à l'Accueil
            </button>
          )}

          {status === "error" && (
            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "14px 20px",
                background: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "all 0.3s"
              }}
            >
              🏠 Retour à l'Accueil
            </button>
          )}

          {status === "confirming" && (
            <p style={{
              color: "#999",
              fontSize: "14px"
            }}>
              ⏳ Confirmation en cours...
            </p>
          )}
        </div>

        {/* Info supplémentaire */}
        <p style={{
          color: "#999",
          fontSize: "12px",
          marginTop: "20px",
          lineHeight: "1.5"
        }}>
          📧 Un e-mail de confirmation a été envoyé à votre adresse.
          <br />
          📞 L'administrateur vous contactera rapidement.
          <br />
          <strong>⏱️ Temps de traitement: 24-48 heures</strong>
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
