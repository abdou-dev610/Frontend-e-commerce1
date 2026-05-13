import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyAccount from "./pages/MyAccount";
import MyOrders from "./pages/MyOrders";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import ConfirmationCommande from "./pages/ConfirmationCommande";
import AdminDashboard from "./pages/AdminDashboard";
import Favorites from "./pages/Favorites";
import CategoryPage from "./pages/CategoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Layout partagé : Navbar + Outlet + Footer + WhatsApp
const Layout = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <main className="min-h-screen pt-14">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppWidget />
      </CartProvider>
    </AuthProvider>
  </TooltipProvider>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Routes>
      <Route element={<Layout />}>

        {/* ── Routes publiques ───────────────────────── */}
        <Route path="/"                   element={<Index />} />
        <Route path="/produits"           element={<Products />} />
        <Route path="/produit/:id"        element={<ProductDetail />} />
        <Route path="/product/:id"        element={<ProductDetail />} />
        <Route path="/contact"            element={<Contact />} />
        <Route path="/auth"               element={<Auth />} />
        <Route path="/login"              element={<Login />} />
        <Route path="/signup"             element={<Signup />} />
        <Route path="/register"           element={<Signup />} />
        <Route path="/panier"             element={<Cart />} />
        <Route path="/cart"               element={<Cart />} />
        <Route path="/favoris"            element={<Favorites />} />
        <Route path="/favorites"          element={<Favorites />} />
        <Route path="/category/:slug"     element={<CategoryPage />} />

        {/* ── Routes protégées (utilisateur connecté) ── */}
        <Route path="/mon-compte"         element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
        <Route path="/account"            element={<ProtectedRoute><MyAccount /></ProtectedRoute>} />
        <Route path="/commandes"          element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/mes-commandes"      element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/orders"             element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/paiement"           element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/checkout"           element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/payment-success"    element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
        <Route path="/confirmation-commande" element={<ProtectedRoute><ConfirmationCommande /></ProtectedRoute>} />

        {/* ── Routes admin ──────────────────────────── */}
        <Route path="/admin"              element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/dashboard"    element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />

        {/* ── 404 ───────────────────────────────────── */}
        <Route path="*"                   element={<NotFound />} />

      </Route>
    </Routes>
  </QueryClientProvider>
);

export default App;
