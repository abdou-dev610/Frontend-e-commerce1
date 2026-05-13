import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";

const INFO_ITEMS = [
  { icon: Phone,         color: "#22c55e", bg: "#f0fdf4", label: "Téléphone",    value: "+221 76 204 81 19",                   sub: "Disponible tous les jours" },
  { icon: MessageCircle, color: "#25d366", bg: "#f0fdf4", label: "WhatsApp",     value: "wa.me/221762048119",                  sub: "Réponse rapide garantie", wa: true },
  { icon: Mail,          color: "#3b82f6", bg: "#eff6ff", label: "Email",        value: "ndiayeabdoumamesaye1234@gmail.com",   sub: "Réponse sous 24h" },
  { icon: MapPin,        color: "#ea580c", bg: "#fff7ed", label: "Adresse",      value: "Dakar, Sénégal",                      sub: "Livraison partout au Sénégal" },
  { icon: Clock,         color: "#8b5cf6", bg: "#f5f3ff", label: "Horaires",     value: "Lun – Sam : 08h00 – 20h00",           sub: "Dimanche : 10h00 – 18h00" },
];

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    const text = `Bonjour, je suis ${form.name}.${form.subject ? ` Sujet : ${form.subject}.` : ""} ${form.message}${form.email ? ` (Email : ${form.email})` : ""}${form.phone ? ` (Tél : ${form.phone})` : ""}`;
    window.open(`https://wa.me/221762048119?text=${encodeURIComponent(text)}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #3d1a00 40%, #7c3a10 100%)",
        paddingTop: "100px", paddingBottom: "56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "350px", height: "350px", borderRadius: "50%", background: "radial-gradient(circle, rgba(234,88,12,0.25) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(234,88,12,0.2)", border: "1px solid rgba(234,88,12,0.4)", borderRadius: "50px", padding: "6px 16px", marginBottom: "20px" }}>
            <MessageCircle size={14} color="#fb923c" />
            <span style={{ fontSize: "11px", fontWeight: "700", color: "#fb923c", textTransform: "uppercase", letterSpacing: "0.1em" }}>Nous Contacter</span>
          </div>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 52px)", fontWeight: "900", color: "#fff", margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            On est là pour vous 💬
          </h1>
          <p style={{ fontSize: "clamp(14px, 2vw, 17px)", color: "rgba(255,255,255,0.65)", margin: 0, maxWidth: "600px", marginInline: "auto", fontWeight: "500", lineHeight: 1.7 }}>
            Une question, une commande sur-mesure ou simplement envie d'échanger ?<br />Contactez-nous via WhatsApp, email ou le formulaire ci-dessous.
          </p>
        </div>
      </div>

      {/* ── WhatsApp CTA Banner ── */}
      <div style={{ background: "#25d366", padding: "0" }}>
        <a href="https://wa.me/221762048119" target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "16px 24px", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#1ebe59"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          <span style={{ fontSize: "22px" }}>💬</span>
          <span style={{ fontSize: "15px", fontWeight: "800", color: "#fff" }}>Discuter sur WhatsApp — Réponse en moins de 5 minutes</span>
          <span style={{ fontSize: "13px", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "3px 10px", borderRadius: "50px", fontWeight: "700" }}>En ligne</span>
        </a>
      </div>

      {/* ── Main Grid ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "clamp(40px, 6vw, 64px) clamp(16px, 4vw, 32px)" }}>
        <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr)", gap: "clamp(24px, 4vw, 48px)", alignItems: "start" }}>

          {/* ── Left: Info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ marginBottom: "8px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>Nos coordonnées</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Plusieurs façons de nous joindre</p>
            </div>

            {INFO_ITEMS.map(({ icon: Icon, color, bg, label, value, sub, wa }) => (
              <div key={label}
                style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "18px", background: "#fff", borderRadius: "14px", border: "1px solid #f0ede8", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", transition: "all 0.25s ease", cursor: wa ? "pointer" : "default" }}
                onClick={() => wa && window.open("https://wa.me/221762048119", "_blank")}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)"; }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: bg, border: `1px solid ${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={color} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "12px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 2px" }}>{label}</p>
                  <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", margin: "0 0 2px", wordBreak: "break-all" }}>{value}</p>
                  <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>{sub}</p>
                </div>
                {wa && <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: "#25d366", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "50px", padding: "3px 10px", flexShrink: 0 }}>Écrire</span>}
              </div>
            ))}

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
              {[["🔒", "Paiement sécurisé"], ["🚚", "Livraison rapide"], ["↩️", "Retours faciles"], ["⭐", "4.9/5 clients"]].map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", background: "#fff", borderRadius: "10px", border: "1px solid #f0ede8" }}>
                  <span style={{ fontSize: "18px" }}>{icon}</span>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Form ── */}
          <div style={{ background: "#fff", borderRadius: "20px", padding: "clamp(24px, 4vw, 40px)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0ede8" }}>
            <div style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: "0 0 6px" }}>Envoyer un message</h2>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>Votre message sera transmis via WhatsApp</p>
            </div>

            {sent && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "10px", marginBottom: "20px" }}>
                <CheckCircle size={18} color="#22c55e" />
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#15803d" }}>Message envoyé ! WhatsApp s'est ouvert.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Name + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <Field label="Nom complet *" name="name" placeholder="Votre nom" value={form.name} onChange={handleChange} required />
                <Field label="Téléphone" name="phone" placeholder="+221 XX XXX XX XX" value={form.phone} onChange={handleChange} type="tel" />
              </div>

              <Field label="Email" name="email" placeholder="votre@email.com" value={form.email} onChange={handleChange} type="email" />

              {/* Subject select */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Sujet</label>
                <select name="subject" value={form.subject} onChange={handleChange}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", background: "#fff", color: form.subject ? "#111827" : "#9ca3af", outline: "none", cursor: "pointer" }}>
                  <option value="">Choisir un sujet...</option>
                  <option value="Commande">Question sur une commande</option>
                  <option value="Produit">Renseignement produit</option>
                  <option value="Livraison">Livraison & délais</option>
                  <option value="Retour">Retour / échange</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Message *</label>
                <textarea name="message" value={form.message} onChange={handleChange} required rows={5} maxLength={1000}
                  placeholder="Décrivez votre demande en détail..."
                  style={{ width: "100%", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
                  onFocus={e => e.target.style.borderColor = "#ea580c"}
                  onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
                <p style={{ fontSize: "11px", color: "#9ca3af", textAlign: "right", margin: "4px 0 0" }}>{form.message.length}/1000</p>
              </div>

              <button type="submit"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", padding: "14px 24px", background: "linear-gradient(135deg, #ea580c, #f97316)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", fontSize: "15px", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(234,88,12,0.3)", transition: "all 0.3s ease" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 14px 36px rgba(234,88,12,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(234,88,12,0.3)"; e.currentTarget.style.transform = "none"; }}>
                <Send size={18} />
                Envoyer via WhatsApp
              </button>

              <p style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", margin: 0 }}>
                🔒 Vos informations sont traitées de manière confidentielle
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, name, placeholder, value, onChange, type = "text", required }) => (
  <div>
    <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>
      {label}
    </label>
    <input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required}
      style={{ width: "100%", padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #e5e7eb", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
      onFocus={e => e.target.style.borderColor = "#ea580c"}
      onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
  </div>
);

export default Contact;
