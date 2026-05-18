import { useState, useEffect } from "react";
import { X, Send, MessageCircle } from "lucide-react";

const WA_NUMBER = "221706242361";
const WA_URL    = `https://wa.me/${WA_NUMBER}`;

const QUICK_MESSAGES = [
  { icon: "👗", text: "Je veux voir vos produits" },
  { icon: "📦", text: "Où en est ma commande ?" },
  { icon: "💰", text: "Quels sont vos tarifs ?" },
  { icon: "🚚", text: "Infos sur la livraison" },
];

const WhatsAppWidget = () => {
  const [open, setOpen]       = useState(false);
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse]     = useState(true);
  const [input, setInput]     = useState("");

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { if (open) setPulse(false); }, [open]);

  const send = (msg) => {
    window.open(`${WA_URL}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    send(input.trim());
    setInput("");
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop (mobile uniquement) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="wa-backdrop"
          style={{
            position: "fixed", inset: 0, zIndex: 9998,
            background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Conteneur principal — responsive via CSS */}
      <div className="wa-widget-container" style={{
        position: "fixed",
        bottom: "24px",
        right: "20px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
        pointerEvents: "none",
      }}>

        {/* ── Chat Panel ── */}
        <div className="wa-chat-panel" style={{
          width: "340px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)",
          transform: open ? "translateY(0) scale(1)" : "translateY(20px) scale(0.92)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformOrigin: "bottom right",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #128c7e 0%, #25d366 100%)",
            padding: "20px 18px 16px",
            position: "relative",
          }}>
            <button onClick={() => setOpen(false)} style={{
              position: "absolute", top: "14px", right: "14px",
              background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%",
              width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", transition: "background 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.28)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
              <X size={14} color="#fff" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "2px solid rgba(255,255,255,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px",
                }}>👗</div>
                <div style={{
                  position: "absolute", bottom: "1px", right: "1px",
                  width: "12px", height: "12px", borderRadius: "50%",
                  background: "#4ade80", border: "2px solid #25d366",
                }} />
              </div>

              <div>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#fff" }}>Chic Sénégal</p>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#4ade80" }} />
                  <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: "500" }}>
                    En ligne · Répond en &lt; 5 min
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message bubble */}
          <div style={{ background: "#e5ddd5", padding: "16px 14px 8px" }}>
            <div style={{
              background: "#fff",
              borderRadius: "0 12px 12px 12px",
              padding: "12px 14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              maxWidth: "90%",
              position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: "-8px",
                width: 0, height: 0,
                borderTop: "8px solid #fff",
                borderLeft: "8px solid transparent",
              }} />
              <p style={{ margin: 0, fontSize: "14px", color: "#111", lineHeight: 1.5 }}>
                👋 Bonjour ! Je suis là pour vous aider.<br />
                Comment puis-je vous servir aujourd&apos;hui ?
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#9ca3af", textAlign: "right" }}>
                {new Date().toLocaleTimeString("fr-SN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>

          {/* Quick replies */}
          <div style={{ background: "#e5ddd5", padding: "8px 14px 12px", display: "flex", flexDirection: "column", gap: "7px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Démarrer rapidement</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
              {QUICK_MESSAGES.map(({ icon, text }) => (
                <button key={text} onClick={() => send(text)} style={{
                  display: "flex", alignItems: "center", gap: "5px",
                  padding: "7px 12px", borderRadius: "50px",
                  background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
                  fontSize: "12px", fontWeight: "600", color: "#111",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#25d366"; e.currentTarget.style.color = "#128c7e"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"; e.currentTarget.style.color = "#111"; }}>
                  {icon} {text}
                </button>
              ))}
            </div>
          </div>

          {/* Input bar */}
          <div style={{
            background: "#f0f2f5",
            padding: "10px 12px",
            display: "flex", alignItems: "center", gap: "8px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="Écrire un message..."
              style={{
                flex: 1, padding: "10px 14px",
                borderRadius: "24px", border: "none",
                background: "#fff", fontSize: "13px",
                fontFamily: "inherit", outline: "none",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                minWidth: 0,
              }}
            />
            <button onClick={handleSend} style={{
              width: "38px", height: "38px", borderRadius: "50%", border: "none",
              background: input.trim() ? "linear-gradient(135deg, #128c7e, #25d366)" : "#d1d5db",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: input.trim() ? "pointer" : "default",
              transition: "all 0.25s ease",
              flexShrink: 0,
            }}>
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>

        {/* ── FAB Button ── */}
        <button
          className="wa-fab"
          onClick={() => setOpen(o => !o)}
          style={{
            width: "60px", height: "60px",
            borderRadius: "50%", border: "none", cursor: "pointer",
            pointerEvents: "auto",
            background: "linear-gradient(135deg, #1a1200 0%, #3d2800 100%)",
            boxShadow: "0 8px 30px rgba(212,160,23,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: open ? "rotate(0deg) scale(0.9)" : "rotate(0deg) scale(1)",
            position: "relative",
          }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.transform = "scale(1.12)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(212,160,23,0.65)"; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(212,160,23,0.5)"; } }}
          aria-label="Ouvrir WhatsApp"
        >
          {pulse && !open && (
            <span style={{
              position: "absolute", inset: "-4px", borderRadius: "50%",
              border: "3px solid #d4a017", opacity: 0.6,
              animation: "waPulse 2s ease-out infinite",
            }} />
          )}

          {open
            ? <X size={24} color="#fff" />
            : <img src="/images/icones/watshapp.png" alt="WhatsApp"
                style={{ width: "42px", height: "42px", objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))" }} />
          }

          {!open && pulse && (
            <span style={{
              position: "absolute", top: "0px", right: "0px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "#ef4444", border: "2px solid #fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "10px", fontWeight: "800", color: "#fff",
            }}>1</span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: 0.7; }
          70%  { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Mobile : réduire taille + repositionner */
        @media (max-width: 480px) {
          .wa-widget-container {
            bottom: 16px !important;
            right: 14px !important;
          }
          .wa-fab {
            width: 52px !important;
            height: 52px !important;
          }
          /* Panel : largeur dynamique pour ne jamais dépasser l'écran */
          .wa-chat-panel {
            width: min(320px, calc(100vw - 32px)) !important;
          }
          /* Backdrop actif sur mobile */
          .wa-backdrop {
            display: block;
          }
        }

        @media (min-width: 481px) {
          .wa-backdrop {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppWidget;
