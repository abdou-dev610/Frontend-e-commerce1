import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/services/productService";
import { createOrder, initiatePayment } from "@/services/orderService";

const paymentMethods = [
  { id: "wave", name: "Wave", icon: "🌊", description: "Mobile Money" },
  { id: "orange_money", name: "Orange Money", icon: "🟠", description: "Mobile Money" },
  { id: "free_money", name: "Free Money", icon: "🟢", description: "Mobile Money" },
];

const Payment = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (items.length === 0) {
      navigate("/panier", { replace: true });
    }
  }, [items, navigate]);

  const handlePayment = async () => {
    if (!selectedMethod) {
      setError("Veuillez choisir un mode de paiement");
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // ✅ Construire les produits correctement
      const orderItems = items.map((i) => ({
        product_id: i.product.id || i.product._id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.image,
      }));

      // 🔥 DEBUG
      console.log("ORDER DATA:", {
        products: orderItems,
        total,
      });

      // ✅ CORRECTION ICI (IMPORTANT)
      const orderResponse = await createOrder({
        items: orderItems,
        totalAmount: Number(total),
        paymentMethod: selectedMethod,
        customerName: user.fullName || user.email,
        customerEmail: user.email,
        customerPhone: user.phone || "",
      });

      if (!orderResponse || !orderResponse._id) {
        throw new Error("Erreur lors de la création de la commande");
      }

      // ✅ PAIEMENT MOBILE
      const paymentResponse = await initiatePayment({
        orderId: orderResponse._id,
        amount: total,
        paymentMethod: selectedMethod,
        description: `Commande Chic Senegal Style - ${items.length} article(s)`,
      });

      if (paymentResponse?.redirect_url) {
        // ✅ NE PAS appeler clearCart() ici - PaymentSuccess s'en chargera
        window.location.href = paymentResponse.redirect_url;
      } else {
        throw new Error("Erreur lors de l'initiation du paiement");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Une erreur est survenue lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "500px", margin: "auto", padding: "20px" }}>
        <h1>Paiement</h1>

        {/* METHODS */}
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => setSelectedMethod(method.id)}
            style={{
              display: "block",
              width: "100%",
              marginBottom: "10px",
              padding: "10px",
              border:
                selectedMethod === method.id
                  ? "2px solid #8B5E3C"
                  : "1px solid #ccc",
            }}
          >
            {method.icon} {method.name}
          </button>                   
        ))}

        {/* TOTAL */}
        <h3>Total: {formatPrice(total)}</h3>

        {/* ERROR */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* BUTTON */}
        <button
          onClick={handlePayment}
          disabled={processing}
          style={{
            width: "100%",
            padding: "12px",
            background: "#8B5E3C",
            color: "#fff",
          }}
        >
          {processing ? "Chargement..." : "Payer"}
        </button>
      </div>
    </div>
  );
};

export default Payment;