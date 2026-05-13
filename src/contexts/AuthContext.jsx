import { createContext, useContext, useEffect, useState } from "react";
import { authApi, setToken, getToken, setRefreshToken } from "@/integrations/api/client";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle logout event from API (e.g., 401 response)
  useEffect(() => {
    const handleLogout = () => {
      console.log("🚨 Logout triggered by API");
      setToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAdmin(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  // Vérifier le token au chargement
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await authApi.verifyToken();
          const u = response.user;
          setUser(u);
          setIsAdmin(u?.isAdmin || false);
          // Mettre à jour le cache local
          localStorage.setItem("cachedUser", JSON.stringify(u));
        } catch (error) {
          console.error('Token verification failed:', error);
          // Erreur réseau = backend indisponible → restaurer le cache local
          // Erreur 401/auth = token invalide → déconnecter
          const isNetworkError =
            error.message?.includes("Failed to fetch") ||
            error.message?.includes("NetworkError") ||
            error.message?.includes("Load failed") ||
            error.message?.includes("fetch") ||
            error.message?.includes("network");
          const cachedStr = localStorage.getItem("cachedUser");
          if (isNetworkError && cachedStr) {
            try {
              const cachedUser = JSON.parse(cachedStr);
              console.warn("⚠️ Backend indisponible — session restaurée depuis le cache local");
              setUser(cachedUser);
              setIsAdmin(cachedUser?.isAdmin || false);
            } catch {
              setToken(null);
              setRefreshToken(null);
              setUser(null);
              setIsAdmin(false);
              localStorage.removeItem("cachedUser");
            }
          } else {
            // Token invalide ou expiré : déconnecter proprement
            setToken(null);
            setRefreshToken(null);
            setUser(null);
            setIsAdmin(false);
            localStorage.removeItem("cachedUser");
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email, password, fullName, phone) => {
    try {
      const response = await authApi.signup(email, password, fullName, phone);
      if (response && response.token) {
        setToken(response.token);
        if (response.refreshToken) setRefreshToken(response.refreshToken);
        setUser(response.user);
        setIsAdmin(response.user?.isAdmin || false);
        localStorage.setItem("cachedUser", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await authApi.signin(email, password);
      if (response && response.token) {
        setToken(response.token);
        if (response.refreshToken) setRefreshToken(response.refreshToken);
        setUser(response.user);
        setIsAdmin(response.user?.isAdmin || false);
        localStorage.setItem("cachedUser", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const adminSignIn = async (email, password) => {
    try {
      const response = await authApi.adminSignin(email, password);
      if (response && response.token) {
        setToken(response.token);
        if (response.refreshToken) setRefreshToken(response.refreshToken);
        setUser(response.user);
        setIsAdmin(response.user?.isAdmin || false);
        localStorage.setItem("cachedUser", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error('Admin sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem("cachedUser");
  };

  const value = {
    user,
    isAdmin,
    loading,
    signUp,
    signIn,
    adminSignIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
