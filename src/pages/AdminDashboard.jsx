import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, productsApi, adminApi, paymentApi, uploadImage } from "@/integrations/api/client";
import { toast } from "sonner";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const C = {
  primary: "#8B5E3C",
  primaryLight: "#fdf3e8",
  orange: "#f97316",
  green: "#16a34a",
  greenLight: "#dcfce7",
  red: "#dc2626",
  redLight: "#fee2e2",
  blue: "#2563eb",
  blueLight: "#dbeafe",
  yellow: "#d97706",
  yellowLight: "#fef3c7",
  purple: "#7c3aed",
  purpleLight: "#ede9fe",
  bg: "#f4f5f7",
  white: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
};

const PIE_PALETTE = [C.primary, C.orange, C.blue, C.green, C.purple];

const METHOD_LABELS = {
  wave: "Wave",
  orange_money: "Orange Money",
  free_money: "Free Money",
  whatsapp: "WhatsApp",
  card: "Carte",
};

const ORDER_STATUS = {
  pending:   { label: "En attente",  color: C.yellow,  bg: C.yellowLight, icon: "⏳" },
  confirmed: { label: "Confirmé",    color: C.green,   bg: C.greenLight,  icon: "✓"  },
  shipped:   { label: "Expédié",     color: C.blue,    bg: C.blueLight,   icon: "🚚" },
  delivered: { label: "Livré",       color: C.primary, bg: C.primaryLight,icon: "📦" },
  cancelled: { label: "Annulé",      color: C.red,     bg: C.redLight,    icon: "✕"  },
};

const PAY_STATUS = {
  pending:   { label: "En attente", color: C.yellow,  bg: C.yellowLight },
  completed: { label: "Confirmé",   color: C.green,   bg: C.greenLight  },
  failed:    { label: "Échoué",     color: C.red,     bg: C.redLight    },
  cancelled: { label: "Annulé",     color: C.purple,  bg: "#f3e8ff"     },
};

const CATEGORIES = ["Lacostes","Abayas","Qamis","Pullovers","Pantalons","Ensembles"];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("fr-SN", {
    style: "currency", currency: "XOF", maximumFractionDigits: 0,
  }).format(n || 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("fr-SN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

const exportPDF = (rows) => {
  const date = new Date().toLocaleDateString("fr-SN");
  const rows_html = rows.map((o, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#fdf7f0"}">
      <td>${o.orderNumber || ""}</td>
      <td>${o.customerName || ""}</td>
      <td>${o.customerEmail || ""}</td>
      <td>${o.customerPhone || ""}</td>
      <td style="text-align:right">${(o.totalAmount || 0).toLocaleString("fr-SN")} F CFA</td>
      <td>${METHOD_LABELS[o.paymentMethod] || o.paymentMethod || ""}</td>
      <td>${PAY_STATUS[o.paymentStatus]?.label || o.paymentStatus || ""}</td>
      <td>${ORDER_STATUS[o.orderStatus]?.label || o.orderStatus || ""}</td>
      <td>${fmtDate(o.createdAt)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
    <title>Commandes — Chic Sénégal</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; font-size: 11px; color: #222; }
      .header { background: #8B5E3C; color: white; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
      .header h1 { font-size: 15px; }
      .header span { font-size: 11px; opacity: .85; }
      table { width: 100%; border-collapse: collapse; margin-top: 0; }
      th { background: #8B5E3C; color: white; padding: 7px 8px; text-align: left; font-size: 10px; }
      td { padding: 6px 8px; border-bottom: 1px solid #e5e0d8; }
      @media print { @page { size: A4 landscape; margin: 10mm; } }
    </style>
  </head><body>
    <div class="header">
      <h1>Chic Sénégal — Liste des commandes</h1>
      <span>Exporté le ${date} &nbsp;|&nbsp; ${rows.length} commande(s)</span>
    </div>
    <table>
      <thead><tr>
        <th>N° Commande</th><th>Client</th><th>Email</th><th>Téléphone</th>
        <th>Montant</th><th>Méthode</th><th>Paiement</th><th>Commande</th><th>Date</th>
      </tr></thead>
      <tbody>${rows_html}</tbody>
    </table>
    <script>window.onload = () => { window.print(); }<\/script>
  </body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

// ─────────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────────

const Badge = ({ type, value, sm }) => {
  const cfg = (type === "payment" ? PAY_STATUS : ORDER_STATUS)[value]
    || { label: value, color: C.muted, bg: "#f3f4f6" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "3px",
      padding: sm ? "2px 8px" : "3px 10px",
      borderRadius: "999px",
      background: cfg.bg, color: cfg.color,
      fontSize: sm ? "11px" : "12px", fontWeight: "600",
      whiteSpace: "nowrap",
    }}>
      {cfg.icon && <span>{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
};

const KpiCard = ({ label, value, sub, color, icon }) => (
  <div style={{
    flex: "1 1 180px", background: C.white, borderRadius: "14px",
    padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
    borderLeft: `4px solid ${color}`,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <p style={{ margin: 0, fontSize: "13px", color: C.muted, fontWeight: "500" }}>{label}</p>
        <p style={{ margin: "6px 0 0", fontSize: "24px", fontWeight: "800", color: C.text }}>{value}</p>
      </div>
      <div style={{
        width: "42px", height: "42px", borderRadius: "10px",
        background: color + "18", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px",
      }}>
        {icon}
      </div>
    </div>
    {sub && <p style={{ margin: "8px 0 0", fontSize: "12px", color: C.muted }}>{sub}</p>}
  </div>
);

const Modal = ({ title, onClose, children, wide }) => createPortal(
  <div
    style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100000, padding: "16px", overflowY: "auto",
      pointerEvents: "auto",
    }}
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div style={{
      background: C.white, borderRadius: "16px", padding: "28px",
      width: "100%", maxWidth: wide ? "820px" : "520px",
      boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
      maxHeight: "90vh", overflowY: "auto",
      pointerEvents: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: C.text }}>{title}</h3>
        <button onClick={onClose} style={{
          background: "#f3f4f6", border: "none", width: "30px", height: "30px",
          borderRadius: "8px", cursor: "pointer", fontSize: "16px", display: "flex",
          alignItems: "center", justifyContent: "center", color: C.muted,
        }}>✕</button>
      </div>
      {children}
    </div>
  </div>,
  document.body
);

const Btn = ({ children, onClick, color = C.primary, outline, disabled, sm, style: extra = {} }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: sm ? "5px 12px" : "9px 18px",
      background: outline ? C.white : color,
      color: outline ? color : C.white,
      border: `1.5px solid ${color}`,
      borderRadius: "8px", fontWeight: "600",
      fontSize: sm ? "12px" : "13px",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      transition: "all 0.15s",
      ...extra,
    }}
  >
    {children}
  </button>
);

const Input = ({ value, onChange, placeholder, type = "text", style: extra = {} }) => (
  <input
    value={value} onChange={onChange} placeholder={placeholder} type={type}
    style={{
      width: "100%", padding: "9px 12px",
      border: `1px solid ${C.border}`, borderRadius: "8px",
      fontSize: "13px", outline: "none", boxSizing: "border-box",
      ...extra,
    }}
  />
);

const Select = ({ value, onChange, children, style: extra = {} }) => (
  <select
    value={value} onChange={onChange}
    style={{
      padding: "9px 12px", border: `1px solid ${C.border}`,
      borderRadius: "8px", fontSize: "13px",
      background: C.white, cursor: "pointer",
      outline: "none", ...extra,
    }}
  >
    {children}
  </select>
);

// ─────────────────────────────────────────────
// PAGINATION & HELPERS
// ─────────────────────────────────────────────

const ITEMS_PER_PAGE = 20;

const normalize = (s) =>
  s?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") || "";

const Pagination = ({ page, total, perPage = ITEMS_PER_PAGE, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const btn = (active, disabled) => ({
    padding: "5px 10px", borderRadius: "6px", fontSize: "13px",
    border: `1.5px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary : C.white,
    color: active ? C.white : C.text,
    fontWeight: active ? "700" : "400",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1, minWidth: "34px",
  });
  const pages = [];
  const add = (p) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
  add(1); add(totalPages);
  for (let i = page - 1; i <= page + 1; i++) add(i);
  pages.sort((a, b) => a - b);
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={btn(false, page === 1)}>←</button>
      {pages.reduce((acc, p, i) => {
        if (i > 0 && p - pages[i - 1] > 1)
          acc.push(<span key={`e${i}`} style={{ color: C.muted, padding: "0 3px", fontSize: "13px" }}>…</span>);
        acc.push(<button key={p} onClick={() => onChange(p)} style={btn(p === page, false)}>{p}</button>);
        return acc;
      }, [])}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={btn(false, page === totalPages)}>→</button>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: STATISTIQUES
// ─────────────────────────────────────────────

const computeFromOrders = (orders) => {
  const now = new Date();
  const som = new Date(now.getFullYear(), now.getMonth(), 1);
  const totalRevenue = orders.filter((o) => o.paymentStatus === "completed")
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const monthRevenue = orders
    .filter((o) => o.paymentStatus === "completed" && new Date(o.createdAt) >= som)
    .reduce((s, o) => s + (o.totalAmount || 0), 0);
  const byStatus = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const byMethod = {};
  orders.forEach((o) => {
    if (byStatus[o.orderStatus] !== undefined) byStatus[o.orderStatus]++;
    if (!byMethod[o.paymentMethod]) byMethod[o.paymentMethod] = { count: 0, revenue: 0 };
    byMethod[o.paymentMethod].count++;
    byMethod[o.paymentMethod].revenue += o.totalAmount || 0;
  });
  return {
    totalOrders: orders.length,
    totalRevenue,
    monthRevenue,
    lastMonthRevenue: 0,
    ordersByStatus: byStatus,
    totalUsers: 0,
    ordersByPaymentMethod: Object.entries(byMethod).map(([k, v]) => ({ _id: k, ...v })),
    monthlyRevenue: [],
    topProducts: [],
    recentOrders: [...orders].slice(0, 5),
  };
};

const StatsTab = ({ orders }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getStats();
        setStats(data);
      } catch {
        setStats(computeFromOrders(orders));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orders]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px", color: C.muted }}>
        <p style={{ fontSize: "32px", margin: "0 0 8px" }}>⏳</p>
        Chargement des statistiques...
      </div>
    );
  }
  if (!stats) return null;

  const statusPie = Object.entries(stats.ordersByStatus || {})
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: ORDER_STATUS[k]?.label || k, value: v }));

  const methodPie = (stats.ordersByPaymentMethod || []).map((m) => ({
    name: METHOD_LABELS[m._id] || m._id,
    value: m.count,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* KPIs */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <KpiCard label="Commandes totales" value={stats.totalOrders} icon="🛍️"
          color={C.primary} sub={`${stats.ordersByStatus?.pending || 0} en attente`} />
        <KpiCard label="Revenus confirmés" value={fmt(stats.totalRevenue)} icon="💰"
          color={C.green} sub={`${fmt(stats.monthRevenue)} ce mois-ci`} />
        <KpiCard label="Clients inscrits" value={stats.totalUsers || "—"} icon="👥"
          color={C.blue} sub="Comptes enregistrés" />
        <KpiCard
          label="Commandes livrées"
          value={stats.ordersByStatus?.delivered || 0}
          icon="📦"
          color={C.orange}
          sub={`${stats.ordersByStatus?.cancelled || 0} annulée${stats.ordersByStatus?.cancelled > 1 ? "s" : ""}`}
        />
      </div>

      {/* Charts */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

        {/* Monthly revenue bar */}
        {stats.monthlyRevenue?.length > 0 && (
          <div style={{
            flex: "2 1 320px", background: C.white, borderRadius: "14px",
            padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <p style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: C.text }}>
              📈 Revenus des 6 derniers mois
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 1000 ? `${Math.round(v / 1000)}k` : v} />
                <Tooltip formatter={(v) => fmt(v)} labelStyle={{ fontWeight: "600" }} />
                <Bar dataKey="revenue" name="Revenus" fill={C.primary} radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Payment methods pie */}
        {methodPie.length > 0 && (
          <div style={{
            flex: "1 1 220px", background: C.white, borderRadius: "14px",
            padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <p style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: C.text }}>
              💳 Méthodes de paiement
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={methodPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {methodPie.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order status pie */}
        {statusPie.length > 0 && (
          <div style={{
            flex: "1 1 220px", background: C.white, borderRadius: "14px",
            padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <p style={{ margin: "0 0 16px", fontWeight: "700", fontSize: "15px", color: C.text }}>
              📊 Statuts des commandes
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {statusPie.map((_, i) => <Cell key={i} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent orders + Top products */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{
          flex: "2 1 280px", background: C.white, borderRadius: "14px",
          padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        }}>
          <p style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "15px", color: C.text }}>
            🕐 Dernières commandes
          </p>
          {(stats.recentOrders || []).length === 0 && (
            <p style={{ color: C.muted, fontSize: "13px" }}>Aucune commande récente</p>
          )}
          {(stats.recentOrders || []).map((o) => (
            <div key={o._id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: `1px solid ${C.border}`,
            }}>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "13px", color: C.primary }}>{o.orderNumber}</p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: C.muted }}>{o.customerName}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "13px" }}>{fmt(o.totalAmount)}</p>
                <Badge type="order" value={o.orderStatus} sm />
              </div>
            </div>
          ))}
        </div>

        {(stats.topProducts || []).length > 0 && (
          <div style={{
            flex: "1 1 200px", background: C.white, borderRadius: "14px",
            padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
          }}>
            <p style={{ margin: "0 0 14px", fontWeight: "700", fontSize: "15px", color: C.text }}>
              🏆 Top produits vendus
            </p>
            {stats.topProducts.map((p, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 0", borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{
                  width: "24px", height: "24px", borderRadius: "50%",
                  background: C.primaryLight, color: C.primary,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: "800", flexShrink: 0,
                }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: "12px", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p._id}</p>
                  <p style={{ margin: "1px 0 0", fontSize: "11px", color: C.muted }}>{p.totalQty} unité{p.totalQty > 1 ? "s" : ""}</p>
                </div>
                <span style={{ fontWeight: "700", fontSize: "12px", color: C.green, flexShrink: 0 }}>{fmt(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: COMMANDES
// ─────────────────────────────────────────────

const OrdersTab = ({ orders, onStatusUpdate, loading }) => {
  const [search, setSearch]       = useState("");
  const [filters, setFilters]     = useState({ payment: "all", status: "all", method: "all", period: "all" });
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus]   = useState("");
  const [bulking, setBulking]         = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage]               = useState(1);
  const [updatingBtn, setUpdatingBtn] = useState(null);

  const filterFn = (o) => {
    const q = search.toLowerCase();
    if (q && !o.orderNumber?.toLowerCase().includes(q)
          && !o.customerName?.toLowerCase().includes(q)
          && !o.customerEmail?.toLowerCase().includes(q)) return false;
    if (filters.payment !== "all" && o.paymentStatus !== filters.payment) return false;
    if (filters.status  !== "all" && o.orderStatus   !== filters.status)  return false;
    if (filters.method  !== "all" && o.paymentMethod  !== filters.method)  return false;
    if (filters.period !== "all") {
      const now = new Date(); const d = new Date(o.createdAt);
      if (filters.period === "today" && d.toDateString() !== now.toDateString()) return false;
      if (filters.period === "week") { const w = new Date(now); w.setDate(w.getDate()-7); if (d < w) return false; }
      if (filters.period === "month") { const m = new Date(now.getFullYear(), now.getMonth(), 1); if (d < m) return false; }
    }
    return true;
  };

  const visible = orders.filter(filterFn);
  const paginatedOrders = visible.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const toggleOne = (id) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(selectedIds.length === visible.length && visible.length > 0 ? [] : visible.map((o) => o._id));

  const applyBulk = async () => {
    if (!bulkStatus || !selectedIds.length) return;
    setBulking(true);
    try {
      for (const id of selectedIds) await onStatusUpdate(id, "order", bulkStatus);
      const statusLabel = ORDER_STATUS[bulkStatus]?.label || bulkStatus;
      toast.success(`${selectedIds.length} commande${selectedIds.length > 1 ? "s" : ""} mise${selectedIds.length > 1 ? "s" : ""} à jour`, {
        description: `Statut changé vers "${statusLabel}"`,
        duration: 3000,
      });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour", {
        description: err.message || "Veuillez réessayer.",
      });
    } finally {
      setSelectedIds([]);
      setBulkStatus("");
      setBulking(false);
    }
  };

  const handleModalUpdate = async (orderId, type, value) => {
    const btnKey = `${type}-${value}`;
    setUpdatingBtn(btnKey);
    try {
      await onStatusUpdate(orderId, type, value);
      setSelectedOrder((prev) => prev && prev._id === orderId
        ? { ...prev, [type === "payment" ? "paymentStatus" : "orderStatus"]: value }
        : prev
      );
      const labels = type === "payment" ? PAY_STATUS : ORDER_STATUS;
      toast.success(`Statut mis à jour : ${labels[value]?.label || value}`, {
        description: "Le client a été notifié par email si une adresse est enregistrée.",
        duration: 4000,
      });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour", {
        description: err.message || "Veuillez réessayer.",
      });
    } finally {
      setUpdatingBtn(null);
    }
  };

  const thr = { padding: "11px 14px", textAlign: "left", fontWeight: "600", color: C.muted, fontSize: "12px", whiteSpace: "nowrap" };
  const tdc = { padding: "11px 14px" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Status quick-filters */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {Object.entries(ORDER_STATUS).map(([key, cfg]) => {
          const cnt = orders.filter((o) => o.orderStatus === key).length;
          const active = filters.status === key;
          return (
            <button key={key}
              onClick={() => setFilters((f) => ({ ...f, status: f.status === key ? "all" : key }))}
              style={{
                padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px",
                fontWeight: "600", transition: "all 0.15s",
                border: `2px solid ${active ? cfg.color : C.border}`,
                background: active ? cfg.bg : C.white, color: active ? cfg.color : C.muted,
              }}>
              {cfg.icon} {cfg.label}: <strong>{cnt}</strong>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{
        background: C.white, borderRadius: "12px", padding: "14px 16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center",
      }}>
        <div style={{ flex: "1 1 200px", position: "relative" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="N° commande, client, email..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <Select value={filters.payment} onChange={(e) => setFilters((f) => ({ ...f, payment: e.target.value }))}>
          <option value="all">Tout paiement</option>
          <option value="pending">En attente</option>
          <option value="completed">Confirmé</option>
          <option value="failed">Échoué</option>
          <option value="cancelled">Annulé</option>
        </Select>
        <Select value={filters.method} onChange={(e) => setFilters((f) => ({ ...f, method: e.target.value }))}>
          <option value="all">Toute méthode</option>
          {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </Select>
        <Select value={filters.period} onChange={(e) => setFilters((f) => ({ ...f, period: e.target.value }))}>
          <option value="all">Toute période</option>
          <option value="today">Aujourd&apos;hui</option>
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois</option>
        </Select>
        <Btn onClick={() => exportPDF(visible)} color={C.primary}>
          ⬇ Exporter PDF ({visible.length})
        </Btn>
      </div>

      {/* Bulk bar */}
      {selectedIds.length > 0 && (
        <div style={{
          background: C.blueLight, border: `1px solid ${C.blue}30`,
          borderRadius: "10px", padding: "11px 16px",
          display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
        }}>
          <span style={{ fontWeight: "700", color: C.blue, fontSize: "13px" }}>
            ✓ {selectedIds.length} sélectionnée{selectedIds.length > 1 ? "s" : ""}
          </span>
          <Select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            <option value="">Changer statut vers...</option>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          <Btn onClick={applyBulk} disabled={!bulkStatus || bulking} color={C.blue}>
            {bulking ? "Mise à jour..." : "Appliquer"}
          </Btn>
          <Btn onClick={() => setSelectedIds([])} outline color={C.muted}>Annuler</Btn>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>⏳ Chargement...</div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: C.white, borderRadius: "12px", color: C.muted }}>
          <p style={{ fontSize: "40px", margin: "0 0 8px" }}>📭</p>
          <p style={{ margin: 0 }}>Aucune commande ne correspond aux filtres</p>
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: `2px solid ${C.border}` }}>
                  <th style={thr}>
                    <input type="checkbox"
                      checked={selectedIds.length === visible.length && visible.length > 0}
                      onChange={toggleAll} />
                  </th>
                  <th style={thr}>N° Commande</th>
                  <th style={thr}>Client</th>
                  <th style={thr}>Montant</th>
                  <th style={thr}>Méthode</th>
                  <th style={thr}>Paiement</th>
                  <th style={thr}>Commande</th>
                  <th style={thr}>Date</th>
                  <th style={{ ...thr, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((o, i) => (
                  <tr key={o._id} style={{
                    borderBottom: `1px solid ${C.border}`,
                    background: selectedIds.includes(o._id) ? C.blueLight : i % 2 === 0 ? C.white : "#fafafa",
                  }}>
                    <td style={tdc}>
                      <input type="checkbox" checked={selectedIds.includes(o._id)} onChange={() => toggleOne(o._id)} />
                    </td>
                    <td style={{ ...tdc, fontWeight: "700", color: C.primary }}>{o.orderNumber}</td>
                    <td style={tdc}>
                      <p style={{ margin: 0, fontWeight: "600" }}>{o.customerName}</p>
                      <p style={{ margin: "2px 0 0", color: C.muted, fontSize: "12px" }}>{o.customerEmail}</p>
                    </td>
                    <td style={{ ...tdc, fontWeight: "700", color: C.green }}>{fmt(o.totalAmount)}</td>
                    <td style={{ ...tdc, color: C.muted }}>{METHOD_LABELS[o.paymentMethod] || o.paymentMethod}</td>
                    <td style={tdc}><Badge type="payment" value={o.paymentStatus} /></td>
                    <td style={tdc}><Badge type="order" value={o.orderStatus} /></td>
                    <td style={{ ...tdc, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(o.createdAt)}</td>
                    <td style={{ ...tdc, textAlign: "center" }}>
                      <Btn sm onClick={() => setSelectedOrder(o)}>Gérer</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{visible.length} sur {orders.length} commande{orders.length > 1 ? "s" : ""}</span>
            <Pagination page={page} total={visible.length} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Order detail / status modal */}
      {selectedOrder && (
        <Modal title={`Commande ${selectedOrder.orderNumber}`} onClose={() => setSelectedOrder(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {/* Left */}
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Informations client</p>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "14px", fontSize: "13px", lineHeight: "2" }}>
                <p style={{ margin: 0 }}><strong>Nom:</strong> {selectedOrder.customerName}</p>
                <p style={{ margin: 0 }}><strong>Email:</strong> {selectedOrder.customerEmail || "—"}</p>
                <p style={{ margin: 0 }}><strong>Téléphone:</strong> {selectedOrder.customerPhone || "—"}</p>
                <p style={{ margin: 0 }}><strong>Méthode:</strong> {METHOD_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod}</p>
                <p style={{ margin: 0 }}><strong>Montant:</strong> <span style={{ color: C.green, fontWeight: "800" }}>{fmt(selectedOrder.totalAmount)}</span></p>
                <p style={{ margin: 0 }}><strong>Date:</strong> {fmtDate(selectedOrder.createdAt)}</p>
              </div>

              <p style={{ margin: "16px 0 10px", fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Articles commandés</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "8px 12px", background: "#f9fafb", borderRadius: "8px", fontSize: "13px",
                  }}>
                    <span>{item.name} × <strong>{item.quantity}</strong></span>
                    <span style={{ fontWeight: "700" }}>{fmt(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Statut du paiement</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
                {Object.entries(PAY_STATUS).map(([key, cfg]) => {
                  const isActive  = selectedOrder.paymentStatus === key;
                  const isLoading = updatingBtn === `payment-${key}`;
                  return (
                    <button key={key}
                      onClick={() => !isLoading && !updatingBtn && handleModalUpdate(selectedOrder._id, "payment", key)}
                      disabled={!!updatingBtn}
                      style={{
                        padding: "10px 14px", borderRadius: "8px",
                        cursor: updatingBtn ? "not-allowed" : "pointer",
                        fontSize: "13px", fontWeight: "600", textAlign: "left",
                        transition: "all 0.15s", opacity: updatingBtn && !isLoading ? 0.5 : 1,
                        border: isActive ? `2px solid ${cfg.color}` : `1px solid ${C.border}`,
                        background: isActive ? cfg.bg : C.white,
                        color: cfg.color,
                        display: "flex", alignItems: "center", gap: "8px",
                      }}>
                      {isLoading
                        ? <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${cfg.color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        : isActive ? "✓" : null
                      }
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Statut de la commande</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {Object.entries(ORDER_STATUS).map(([key, cfg]) => {
                  const isActive  = selectedOrder.orderStatus === key;
                  const isLoading = updatingBtn === `order-${key}`;
                  return (
                    <button key={key}
                      onClick={() => !isLoading && !updatingBtn && handleModalUpdate(selectedOrder._id, "order", key)}
                      disabled={!!updatingBtn}
                      style={{
                        padding: "10px 14px", borderRadius: "8px",
                        cursor: updatingBtn ? "not-allowed" : "pointer",
                        fontSize: "13px", fontWeight: "600", textAlign: "left",
                        transition: "all 0.15s", opacity: updatingBtn && !isLoading ? 0.5 : 1,
                        border: isActive ? `2px solid ${cfg.color}` : `1px solid ${C.border}`,
                        background: isActive ? cfg.bg : C.white,
                        color: cfg.color,
                        display: "flex", alignItems: "center", gap: "8px",
                      }}>
                      {isLoading
                        ? <span style={{ display: "inline-block", width: "14px", height: "14px", border: `2px solid ${cfg.color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                        : isActive ? "✓" : cfg.icon
                      }
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: PRODUITS — CRUD avec fallback localStorage
// ─────────────────────────────────────────────

const LOCAL_PRODUCTS_KEY = "chic_local_products";

const localDB = {
  getAll: () => {
    try { return JSON.parse(localStorage.getItem(LOCAL_PRODUCTS_KEY) || "[]"); }
    catch { return []; }
  },
  save: (list) => localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list)),
  create: (data) => {
    const list = localDB.getAll();
    const newP = { ...data, _id: `local_${Date.now()}`, createdAt: new Date().toISOString() };
    localDB.save([...list, newP]);
    return newP;
  },
  update: (id, data) => {
    const list = localDB.getAll().map((p) => p._id === id ? { ...p, ...data } : p);
    localDB.save(list);
  },
  delete: (id) => localDB.save(localDB.getAll().filter((p) => p._id !== id)),
};

const emptyForm = { name: "", price: "", category: "", description: "", image: "", stock: "100" };

const ProductsTab = ({ refreshKey = 0 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [formModal, setFormModal] = useState(null); // null | "new" | product
  const [form, setForm]           = useState(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [formError, setFormError]   = useState("");
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [isCustomCat, setIsCustomCat] = useState(false);
  const fileInputRef = useRef(null);
  const [search, setSearch]       = useState("");
  const [page, setPage]           = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getProducts();
      const list = Array.isArray(data) ? data : (data?.products || []);
      setProducts(list);
      setIsLocalMode(false);
      console.log("✅ Produits chargés depuis l'API:", list.length);
    } catch {
      // Fallback localStorage
      const localList = localDB.getAll();
      setProducts(localList);
      setIsLocalMode(true);
      console.warn("⚠️ API indisponible — produits chargés depuis localStorage:", localList.length);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [refreshKey]);

  const openNew = () => {
    console.log("CLICK AJOUT PRODUIT");
    setForm(emptyForm);
    setFormError("");
    setIsCustomCat(false);
    setFormModal("new");
  };

  const openEdit = (p) => {
    console.log("CLICK MODIFIER PRODUIT", p);
    setForm({
      name: p.name || "", price: p.price || "", category: p.category || "",
      description: p.description || "", image: p.image || "", stock: p.stock ?? 100,
    });
    setFormError("");
    setIsCustomCat(!!(p.category) && !CATEGORIES.includes(p.category));
    setFormModal(p);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !form.image) {
      setFormError("Veuillez remplir tous les champs obligatoires (*)");
      return;
    }
    setSaving(true);
    setFormError("");
    const payload = { ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) || 0 };

    try {
      if (isLocalMode) throw new Error("local"); // forcer le mode local
      if (formModal === "new") {
        await productsApi.create(payload);
        toast.success("Produit créé avec succès");
      } else if (formModal.source === "static") {
        await adminApi.updateStaticProduct(formModal._id, payload);
        toast.success("Produit modifié avec succès");
      } else {
        await productsApi.update(formModal._id, payload);
        toast.success("Produit mis à jour avec succès");
      }
      setFormModal(null);
      load();
    } catch {
      // Fallback localStorage
      try {
        if (formModal === "new") {
          localDB.create(payload);
          toast.success("Produit créé (sauvegarde locale)");
        } else {
          localDB.update(formModal._id, payload);
          toast.success("Produit modifié (sauvegarde locale)");
        }
        setIsLocalMode(true);
        setFormModal(null);
        load();
      } catch (le) {
        setFormError(le.message || "Erreur lors de la sauvegarde");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const product = products.find(p => p._id === id || p.id === id);
    try {
      if (product?.source === "static") {
        await adminApi.deleteStaticProduct(id);
      } else if (!isLocalMode) {
        await productsApi.delete(id);
      } else {
        throw new Error("local");
      }
      toast.success("Produit supprimé avec succès", { duration: 2000 });
    } catch {
      localDB.delete(id);
      setIsLocalMode(true);
      toast.success("Produit supprimé (stockage local)", { duration: 2000 });
    }
    setDelConfirm(null);
    load();
  };

  const field = (key, label, opts = {}) => (
    <div key={key}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>
        {label}{opts.required && <span style={{ color: C.red }}> *</span>}
      </label>
      {opts.textarea ? (
        <textarea value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          placeholder={opts.placeholder}
          style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", minHeight: "70px", boxSizing: "border-box" }} />
      ) : (
        <Input value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={opts.placeholder} type={opts.type} />
      )}
    </div>
  );

  const filtered = products.filter((p) => {
    const q = normalize(search);
    return !q || normalize(p.name).includes(q) || normalize(p.description).includes(q) || normalize(p.category).includes(q);
  });
  const paginatedProducts = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {loading && <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>⏳ Chargement...</div>}
      {!loading && <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <p style={{ margin: 0, color: C.muted, fontSize: "13px" }}>
          {products.length} produit{products.length > 1 ? "s" : ""}{" "}
          {isLocalMode
            ? <span style={{ color: C.yellow, fontWeight: "600" }}>⚠️ Mode local (backend indisponible)</span>
            : <span style={{ fontStyle: "italic" }}>dans la base de données</span>
          }
        </p>
        <Btn onClick={openNew}>+ Ajouter un produit</Btn>
      </div>

      {products.length > 0 && (
        <div style={{ background: C.white, borderRadius: "12px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un produit..."
              style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: C.white, borderRadius: "12px", color: C.muted }}>
          <p style={{ fontSize: "40px", margin: "0 0 8px" }}>📦</p>
          <p style={{ margin: "0 0 4px" }}>Aucun produit dans la base de données</p>
          <p style={{ margin: "0 0 20px", fontSize: "12px" }}>Les produits du catalogue local sont gérés dans le code source.</p>
          <Btn onClick={openNew}>Créer le premier produit</Btn>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: C.white, borderRadius: "12px", color: C.muted }}>
          <p style={{ fontSize: "40px", margin: "0 0 8px" }}>🔍</p>
          <p style={{ margin: 0 }}>Aucun produit ne correspond à votre recherche</p>
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: `2px solid ${C.border}` }}>
                  {["Produit","Catégorie","Prix","Stock","Actions"].map((h, i) => (
                    <th key={h} style={{ padding: "11px 14px", textAlign: i === 4 ? "center" : "left", fontWeight: "600", color: C.muted, fontSize: "12px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((p, idx) => (
                  <tr key={p._id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? C.white : "#fafafa" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {p.image && (
                          <img src={p.image} alt={p.name}
                            style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", background: "#f3f4f6", flexShrink: 0 }}
                            onError={(e) => { e.target.style.display = "none"; }} />
                        )}
                        <div>
                          <p style={{ margin: 0, fontWeight: "700" }}>{p.name}</p>
                          {p.description && (
                            <p style={{ margin: "2px 0 0", color: C.muted, fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {p.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ padding: "3px 10px", background: C.primaryLight, color: C.primary, borderRadius: "999px", fontSize: "12px", fontWeight: "600" }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: "700", color: C.green }}>{fmt(p.price)}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontWeight: "700", color: p.stock > 10 ? C.green : p.stock > 0 ? C.yellow : C.red }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
                        <Btn sm outline color={C.blue} onClick={() => openEdit(p)}>Modifier</Btn>
                        <Btn sm outline color={C.red} onClick={() => setDelConfirm(p)}>Supprimer</Btn>
                        <button
                          onClick={async () => {
                            const newAvail = p.available === false ? true : false;
                            try {
                              await adminApi.toggleAvailability(p._id || p.id, p.source || 'db', newAvail);
                              toast.success(newAvail ? "Produit remis en stock" : "Produit marqué indisponible");
                              load();
                            } catch { toast.error("Erreur lors de la mise à jour"); }
                          }}
                          style={{
                            padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600",
                            border: `1px solid ${p.available === false ? C.green : C.yellow}`,
                            background: "transparent",
                            color: p.available === false ? C.green : C.yellow,
                            cursor: "pointer", whiteSpace: "nowrap",
                          }}
                        >
                          {p.available === false ? "Disponible" : "Indisponible"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{filtered.length} produit{filtered.length > 1 ? "s" : ""}</span>
            {filtered.length > ITEMS_PER_PAGE && <Pagination page={page} total={filtered.length} onChange={setPage} />}
          </div>
        </div>
      )}
      </>}

      {/* Form modal */}
      {formModal !== null && (
        <Modal title={formModal === "new" ? "Ajouter un produit" : "Modifier le produit"} onClose={() => setFormModal(null)}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {field("name", "Nom du produit", { required: true })}

            {/* Image upload */}
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>
                Image du produit<span style={{ color: C.red }}> *</span>
              </label>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/avif"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true); setFormError("");
                  try {
                    const { url } = await uploadImage(file);
                    setForm((p) => ({ ...p, image: url }));
                  } catch (err) {
                    setFormError(err.message || "Erreur lors du téléversement");
                  } finally {
                    setUploading(false);
                  }
                }}
              />
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                {/* Preview */}
                <div onClick={() => fileInputRef.current?.click()}
                  style={{ width: "90px", height: "90px", borderRadius: "8px", border: `2px dashed ${form.image ? C.primary : C.border}`,
                    cursor: "pointer", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    background: form.image ? "transparent" : "#fafafa", position: "relative" }}>
                  {form.image ? (
                    <img src={form.image.startsWith("/api") ? `http://localhost:5000${form.image}` : form.image}
                      alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "24px" }}>📷</span>
                  )}
                  {uploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.8)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: C.primary }}>
                      Envoi...
                    </div>
                  )}
                </div>
                {/* Right side */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <Btn outline color={C.primary} onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    style={{ width: "100%", justifyContent: "center" }}>
                    {uploading ? "Téléversement..." : "📂 Choisir une image"}
                  </Btn>
                  <Input value={form.image} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    placeholder="/images/... ou coller une URL" style={{ fontSize: "12px" }} />
                  <span style={{ fontSize: "11px", color: C.muted }}>JPEG, PNG, WEBP — max 10 Mo</span>
                </div>
              </div>
            </div>
            {field("description", "Description", { textarea: true })}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>
                  Prix (FCFA)<span style={{ color: C.red }}> *</span>
                </label>
                <Input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>Stock</label>
                <Input type="number" value={form.stock} onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "5px" }}>
                  Catégorie<span style={{ color: C.red }}> *</span>
                </label>
                {!isCustomCat ? (
                  <Select
                    value={form.category}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setIsCustomCat(true);
                        setForm((p) => ({ ...p, category: "" }));
                      } else {
                        setForm((p) => ({ ...p, category: e.target.value }));
                      }
                    }}
                    style={{ width: "100%" }}
                  >
                    <option value="">Choisir...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">+ Nouvelle catégorie...</option>
                  </Select>
                ) : (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Input
                      value={form.category}
                      onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Nom de la catégorie"
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={() => { setIsCustomCat(false); setForm((p) => ({ ...p, category: "" })); }}
                      style={{
                        padding: "0 10px", border: `1px solid ${C.border}`,
                        borderRadius: "8px", cursor: "pointer", fontSize: "12px",
                        color: C.muted, background: "#f9fafb", whiteSpace: "nowrap",
                      }}
                    >
                      ← Liste
                    </button>
                  </div>
                )}
              </div>
            </div>
            {formError && (
              <p style={{ margin: 0, color: C.red, fontSize: "12px", background: C.redLight, padding: "8px 12px", borderRadius: "6px" }}>
                {formError}
              </p>
            )}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", paddingTop: "4px" }}>
              <Btn outline color={C.muted} onClick={() => setFormModal(null)}>Annuler</Btn>
              <Btn onClick={handleSave} disabled={saving}>
                {saving ? "Enregistrement..." : formModal === "new" ? "Créer le produit" : "Sauvegarder"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {delConfirm && (
        <Modal title="Confirmer la suppression" onClose={() => setDelConfirm(null)}>
          <p style={{ margin: "0 0 20px", color: C.muted, lineHeight: "1.6" }}>
            Êtes-vous sûr de vouloir supprimer <strong>"{delConfirm.name}"</strong> ?
            Cette action est <strong>irréversible</strong>.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Btn outline color={C.muted} onClick={() => setDelConfirm(null)}>Annuler</Btn>
            <Btn color={C.red} onClick={() => handleDelete(delConfirm._id)}>Supprimer</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// TAB: CLIENTS
// ─────────────────────────────────────────────

const ClientsTab = ({ refreshKey = 0 }) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders]     = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [delConfirm, setDelConfirm]     = useState(null);
  const [adminConfirm, setAdminConfirm] = useState(null);
  const [toggling, setToggling]         = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [archiving, setArchiving]       = useState(null);
  const [page, setPage]                 = useState(1);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getUsers();
      setUsers(Array.isArray(data) ? data : (data?.users || []));
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [refreshKey]);

  const viewOrders = async (user) => {
    console.log("👁️ CLICK COMMANDES:", user._id, user.fullName);
    setSelectedUser(user);
    setLoadingOrders(true);
    try { setUserOrders(await adminApi.getUserOrders(user._id) || []); }
    catch { setUserOrders([]); }
    finally { setLoadingOrders(false); }
  };

  const handleToggle = async (userId) => {
    console.log("🔑 CLICK TOGGLE ADMIN:", userId);
    setAdminConfirm(null);
    setToggling(userId);
    try {
      const upd = await adminApi.toggleAdminStatus(userId);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isAdmin: upd.isAdmin } : u));
      toast.success(upd.isAdmin ? "Administrateur assigné" : "Rôle administrateur retiré", { duration: 2000 });
    } catch (e) {
      toast.error("Erreur lors de la mise à jour", { description: e.message || "Veuillez réessayer." });
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (userId) => {
    console.log("🗑️ CLICK SUPPRIMER CLIENT:", userId);
    if (userId === currentUser?._id) {
      toast.error("Vous ne pouvez pas supprimer votre propre compte");
      setDelConfirm(null);
      return;
    }
    const target = users.find((u) => u._id === userId);
    if (target?.isAdmin && users.filter((u) => u.isAdmin).length <= 1) {
      toast.error("Impossible de supprimer le dernier administrateur");
      setDelConfirm(null);
      return;
    }
    setDeletingId(userId);
    try {
      await adminApi.deleteUser(userId);
      setUsers((p) => p.filter((u) => u._id !== userId));
      setDelConfirm(null);
      toast.success("Compte supprimé avec succès", { duration: 2000 });
    } catch (e) {
      // Si le blocage vient des commandes, afficher le nombre dans la modale
      const match = e.message?.match(/(\d+) commande/);
      if (match) {
        setDelConfirm((prev) => ({ ...prev, orderCount: parseInt(match[1]) }));
      } else {
        toast.error("Erreur lors de la suppression", { description: e.message || "Veuillez réessayer." });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleArchiveAndDelete = async (userId) => {
    setArchiving(userId);
    try {
      await adminApi.archiveUserOrders(userId);
      await adminApi.deleteUser(userId);
      setUsers((p) => p.filter((u) => u._id !== userId));
      setDelConfirm(null);
      toast.success("Commandes archivées et compte supprimé", { duration: 2000 });
    } catch (e) {
      toast.error("Erreur", { description: e.message || "Veuillez réessayer." });
    } finally {
      setArchiving(null);
    }
  };

  const visible = users.filter((u) => {
    const q = normalize(search);
    return !q || normalize(u.fullName).includes(q) || normalize(u.email).includes(q) || u.phone?.includes(q);
  });
  const paginatedUsers = visible.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const thr = { padding: "11px 14px", textAlign: "left", fontWeight: "600", color: C.muted, fontSize: "12px" };
  const tdc = { padding: "11px 14px" };

  if (loading) return <div style={{ textAlign: "center", padding: "60px", color: C.muted }}>⏳ Chargement des clients...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
      <div style={{ background: C.white, borderRadius: "12px", padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>🔍</span>
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un client..."
            style={{ width: "100%", padding: "8px 12px 8px 32px", border: `1px solid ${C.border}`, borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", background: C.white, borderRadius: "12px", color: C.muted }}>
          Aucun client trouvé
        </div>
      ) : (
        <div style={{ background: C.white, borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: `2px solid ${C.border}` }}>
                  {["Client","Téléphone","Commandes","Total dépensé","Rôle","Inscrit le","Actions"].map((h, i) => (
                    <th key={h} style={{ ...thr, textAlign: i === 6 ? "center" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((u, i) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? C.white : "#fafafa" }}>
                      <td style={tdc}>
                        <p style={{ margin: 0, fontWeight: "700" }}>{u.fullName || "—"}</p>
                        <p style={{ margin: "2px 0 0", color: C.muted, fontSize: "12px" }}>{u.email}</p>
                        {isSelf && <span style={{ fontSize: "10px", background: C.primaryLight, color: C.primary, padding: "1px 6px", borderRadius: "4px", fontWeight: "700" }}>Vous</span>}
                      </td>
                      <td style={{ ...tdc, color: C.muted }}>{u.phone || "—"}</td>
                      <td style={{ ...tdc, fontWeight: "700" }}>{u.orderCount || 0}</td>
                      <td style={{ ...tdc, fontWeight: "700", color: C.green }}>{fmt(u.totalSpent)}</td>
                      <td style={tdc}>
                        <span style={{
                          padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700",
                          background: u.isAdmin ? C.purpleLight : "#f3f4f6",
                          color: u.isAdmin ? C.purple : C.muted,
                        }}>
                          {u.isAdmin ? "👑 Admin" : "👤 Client"}
                        </span>
                      </td>
                      <td style={{ ...tdc, color: C.muted, whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ ...tdc, textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "5px", justifyContent: "center", flexWrap: "wrap" }}>
                          <Btn sm outline color={C.blue}
                            onClick={(e) => { e.stopPropagation(); viewOrders(u); }}>
                            Commandes
                          </Btn>
                          <Btn sm outline color={u.isAdmin ? C.yellow : C.purple}
                            onClick={(e) => { e.stopPropagation(); setAdminConfirm(u); }}
                            disabled={toggling === u._id || isSelf}>
                            {toggling === u._id ? "..." : u.isAdmin ? "Retirer admin" : "Rendre admin"}
                          </Btn>
                          <Btn sm outline color={C.red}
                            onClick={(e) => { e.stopPropagation(); setDelConfirm(u); }}
                            disabled={deletingId === u._id || isSelf}>
                            {deletingId === u._id ? "..." : "✕"}
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{visible.length} client{visible.length > 1 ? "s" : ""} affiché{visible.length > 1 ? "s" : ""}</span>
            {visible.length > ITEMS_PER_PAGE && <Pagination page={page} total={visible.length} onChange={setPage} />}
          </div>
        </div>
      )}

      {/* Confirmation : changer le rôle admin */}
      {adminConfirm && (
        <Modal
          title={adminConfirm.isAdmin ? "Retirer les droits admin" : "Promouvoir en administrateur"}
          onClose={() => setAdminConfirm(null)}
        >
          <p style={{ margin: "0 0 20px", color: C.muted, lineHeight: "1.6" }}>
            {adminConfirm.isAdmin
              ? <><strong>{adminConfirm.fullName || adminConfirm.email}</strong> perdra l'accès au tableau de bord. Confirmer ?</>
              : <><strong>{adminConfirm.fullName || adminConfirm.email}</strong> aura accès à toutes les données administrateur. Confirmer ?</>
            }
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <Btn outline color={C.muted} onClick={() => setAdminConfirm(null)}>Annuler</Btn>
            <Btn
              color={adminConfirm.isAdmin ? C.yellow : C.purple}
              onClick={() => handleToggle(adminConfirm._id)}
              disabled={toggling === adminConfirm._id}
            >
              {toggling === adminConfirm._id ? "Traitement..." : adminConfirm.isAdmin ? "Retirer admin" : "Promouvoir"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Commandes du client */}
      {selectedUser && (
        <Modal title={`Commandes — ${selectedUser.fullName || selectedUser.email}`} onClose={() => setSelectedUser(null)} wide>
          {loadingOrders ? (
            <p style={{ textAlign: "center", color: C.muted }}>Chargement...</p>
          ) : userOrders.length === 0 ? (
            <p style={{ textAlign: "center", color: C.muted }}>Aucune commande pour ce client</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userOrders.map((o) => (
                <div key={o._id} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px", background: "#f9fafb", borderRadius: "10px",
                }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: "700", color: C.primary, fontSize: "14px" }}>{o.orderNumber}</p>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: C.muted }}>{fmtDate(o.createdAt)}</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Badge type="payment" value={o.paymentStatus} sm />
                    <Badge type="order" value={o.orderStatus} sm />
                    <span style={{ fontWeight: "800", color: C.green }}>{fmt(o.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Confirmation suppression */}
      {delConfirm && (
        <Modal title="Supprimer le compte" onClose={() => setDelConfirm(null)}>
          {delConfirm.orderCount > 0 ? (
            <>
              <div style={{
                background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "8px",
                padding: "14px 16px", marginBottom: "16px"
              }}>
                <p style={{ margin: "0 0 6px", fontWeight: "700", color: "#c2410c", fontSize: "14px" }}>
                  ⚠️ Commandes existantes
                </p>
                <p style={{ margin: 0, color: "#92400e", fontSize: "13px", lineHeight: "1.5" }}>
                  <strong>{delConfirm.fullName || delConfirm.email}</strong> possède{" "}
                  <strong>{delConfirm.orderCount} commande(s)</strong>. Pour supprimer ce compte,
                  vous devez d'abord archiver ses commandes.
                </p>
              </div>
              <p style={{ margin: "0 0 20px", fontSize: "13px", color: C.muted }}>
                Les commandes archivées ne seront plus visibles dans la liste principale mais resteront conservées dans la base de données.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Btn outline color={C.muted} onClick={() => setDelConfirm(null)}>Annuler</Btn>
                <Btn color={C.yellow} onClick={() => handleArchiveAndDelete(delConfirm._id)} disabled={!!archiving}>
                  {archiving ? "Archivage en cours..." : `📦 Archiver et supprimer`}
                </Btn>
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: "0 0 20px", color: C.muted, lineHeight: "1.6" }}>
                Supprimer définitivement le compte de{" "}
                <strong>{delConfirm.fullName || delConfirm.email}</strong> ?
                Cette action est <strong>irréversible</strong>.
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Btn outline color={C.muted} onClick={() => setDelConfirm(null)}>Annuler</Btn>
                <Btn color={C.red} onClick={() => handleDelete(delConfirm._id)} disabled={!!deletingId}>
                  {deletingId ? "Vérification..." : "Supprimer définitivement"}
                </Btn>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

const TABS = [
  { key: "stats",    label: "Statistiques", icon: "📊" },
  { key: "orders",   label: "Commandes",    icon: "📦" },
  { key: "products", label: "Produits",     icon: "🛍️" },
  { key: "clients",  label: "Clients",      icon: "👥" },
];

const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("stats");
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Inject CSS for spinner animation once
    if (typeof document !== "undefined" && !document.getElementById("admin-spin-style")) {
      const style = document.createElement("style");
      style.id = "admin-spin-style";
      style.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ordersApi.getAll();
      setOrders(Array.isArray(data) ? data : (data?.orders || []));
    } catch {
      setError("Impossible de charger les commandes. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, type, value) => {
    // Remboursement automatique si on annule un paiement
    if (type === "payment" && value === "cancelled") {
      const refundResult = await paymentApi.refund(orderId);
      setOrders((prev) => prev.map((o) => {
        if (o._id !== orderId) return o;
        return { ...o, paymentStatus: "cancelled", orderStatus: "cancelled", refund: refundResult };
      }));
      const methodLabel = { wave: "Wave", orange_money: "Orange Money", free_money: "Free Money", card: "Carte", whatsapp: "WhatsApp" };
      const order = orders.find(o => o._id === orderId);
      const method = methodLabel[order?.paymentMethod] || order?.paymentMethod || "";
      if (refundResult.manualRequired) {
        toast.warning("Remboursement manuel requis", {
          description: `Veuillez rembourser ${refundResult.amount?.toLocaleString("fr-SN")} F CFA manuellement sur ${method}.`,
          duration: 8000,
        });
      } else {
        toast.success(`Remboursement initié sur ${method}`, {
          description: `${refundResult.amount?.toLocaleString("fr-SN")} F CFA seront crédités sur le compte ${method} du client.`,
          duration: 6000,
        });
      }
      return refundResult;
    }

    const payload = type === "payment" ? { paymentStatus: value } : { orderStatus: value };
    const updated = await ordersApi.updateStatus(orderId, payload);
    setOrders((prev) => prev.map((o) => o._id === orderId ? updated : o));
    return updated;
  };

  // ── Access denied ──
  if (!isAdmin) {
    return (
      <div style={{
        paddingTop: "100px", paddingBottom: "100px", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #faf8f3 0%, #fef3c7 100%)",
      }}>
        <div style={{
          maxWidth: "480px", textAlign: "center", background: C.white,
          padding: "40px 32px", borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)", border: "2px solid #f3e5d7",
        }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>🔐</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: C.text, marginBottom: "12px" }}>Accès Administrateur</h2>
          <p style={{ fontSize: "14px", color: C.muted, marginBottom: "24px", lineHeight: "1.6" }}>
            Vous n&apos;avez pas les droits nécessaires pour accéder à ce tableau de bord.
          </p>
          <div style={{ background: C.yellowLight, border: `1px solid #fcd34d`, borderRadius: "10px", padding: "14px", marginBottom: "24px", textAlign: "left" }}>
            <p style={{ fontSize: "12px", fontWeight: "700", color: C.text, margin: "0 0 6px" }}>📝 Pour devenir administrateur :</p>
            <ol style={{ fontSize: "12px", color: "#374151", paddingLeft: "18px", margin: 0 }}>
              <li>Connectez-vous avec votre compte</li>
              <li>Contactez l&apos;administrateur principal</li>
              <li>Il modifiera votre rôle dans la base de données</li>
            </ol>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", background: `linear-gradient(135deg, #ea580c, #f97316)`, color: "white", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
              ← Retourner à l&apos;accueil
            </Link>
            <Link to="/contact" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px", border: `2px solid #ea580c`, color: "#ea580c", padding: "12px 24px", borderRadius: "8px", textDecoration: "none", fontWeight: "600" }}>
              💬 Nous contacter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = orders.filter((o) => o.orderStatus === "pending").length;

  return (
    <div style={{ paddingTop: "80px", minHeight: "100vh", background: C.bg }}>

      {/* Top navigation tabs */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        position: "fixed", top: "56px", left: 0, right: 0, zIndex: 999,
      }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            const badge = tab.key === "orders" && pendingCount > 0 ? pendingCount : null;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "16px 18px", background: "none", border: "none", cursor: "pointer",
                fontSize: "14px", fontWeight: active ? "700" : "500",
                color: active ? C.primary : C.muted,
                borderBottom: active ? `3px solid ${C.primary}` : "3px solid transparent",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
                {tab.icon} {tab.label}
                {badge && (
                  <span style={{
                    background: C.orange, color: "white", borderRadius: "999px",
                    fontSize: "10px", fontWeight: "800", padding: "1px 7px",
                    minWidth: "18px", textAlign: "center",
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => { fetchOrders(); setRefreshKey(k => k + 1); }} style={{
              padding: "7px 14px", border: `1px solid ${C.border}`, background: C.white,
              borderRadius: "8px", cursor: "pointer", fontSize: "12px", color: C.muted,
            }}>
              🔄 Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px", paddingTop: "90px" }}>
        {error && (
          <div style={{
            padding: "12px 16px", background: C.redLight, border: `1px solid ${C.red}30`,
            borderRadius: "8px", color: C.red, marginBottom: "20px", fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {activeTab === "stats"    && <StatsTab orders={orders} />}
        {activeTab === "orders"   && <OrdersTab orders={orders} onStatusUpdate={handleStatusUpdate} loading={loading} />}
        {activeTab === "products" && <ProductsTab refreshKey={refreshKey} />}
        {activeTab === "clients"  && <ClientsTab refreshKey={refreshKey} />}
      </div>
    </div>
  );
};

export default AdminDashboard;
