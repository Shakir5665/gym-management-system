import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// ✅ Safe hook usage
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [hasGym, setHasGym] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load persisted state
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedGym = localStorage.getItem("hasGym");
      const storedUser = localStorage.getItem("user");

      if (storedToken) {
        setToken(storedToken);
        setHasGym(storedGym === "true");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (err) {
      console.error("Auth load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔐 LOGIN (supports normal + Google)
  const login = (tokenValue, hasGymValue = false, userData = null) => {
    try {
      localStorage.setItem("token", tokenValue);
      localStorage.setItem("hasGym", String(hasGymValue));
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }

      setToken(tokenValue);
      setHasGym(Boolean(hasGymValue));
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  // 🔓 LOGOUT
  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("hasGym");
      localStorage.removeItem("user");

      setToken(null);
      setHasGym(false);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        hasGym,
        setHasGym,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
