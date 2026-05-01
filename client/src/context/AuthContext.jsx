import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/api";

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
  const [role, setRole] = useState(null);
  const [gymName, setGymName] = useState(null);
  const [isDeactivated, setIsDeactivated] = useState(false);
  const [gymLogo, setGymLogo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load persisted state
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedGym = localStorage.getItem("hasGym");
      const storedUser = localStorage.getItem("user");
      const storedRole = localStorage.getItem("role");
      const storedGymName = localStorage.getItem("gymName");
      const storedGymLogo = localStorage.getItem("gymLogo");

      if (storedToken) {
        setToken(storedToken);
        setHasGym(storedGym === "true");
        setRole(storedRole);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        if (storedGymName) {
          setGymName(storedGymName);
        }
        if (storedGymLogo) {
          setGymLogo(storedGymLogo);
        }
      }
    } catch (err) {
      console.error("Auth load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch gym name when authenticated (for header)
  useEffect(() => {
    let cancelled = false;
    async function loadGymName() {
      if (!token || !hasGym) return;
      try {
        const res = await API.get("/gym/me");
        const name = res.data?.name || res.data?.gym?.name;
        const logo = res.data?.logo || res.data?.gym?.logo;
        if (!cancelled && name) {
          setGymName(name);
          localStorage.setItem("gymName", name);
        }
        if (!cancelled && logo) {
          setGymLogo(logo);
          localStorage.setItem("gymLogo", logo);
        }
      } catch {
        // ignore - gym endpoint may be missing in some environments
      }
    }
    loadGymName();
    return () => {
      cancelled = true;
    };
  }, [token, hasGym]);

  // 🔐 LOGIN (supports normal + Google)
  const login = (tokenValue, hasGymValue = false, userData = null) => {
    try {
      localStorage.setItem("token", tokenValue);
      localStorage.setItem("hasGym", String(hasGymValue));
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        if (userData.role) {
          localStorage.setItem("role", userData.role);
          setRole(userData.role);
        }
      }

      setToken(tokenValue);
      setHasGym(Boolean(hasGymValue));
      if (userData?.gymName) {
        localStorage.setItem("gymName", userData.gymName);
        setGymName(userData.gymName);
      }
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
      localStorage.removeItem("gymName");
      localStorage.removeItem("gymLogo");
      localStorage.removeItem("role");

      setToken(null);
      setHasGym(false);
      setUser(null);
      setRole(null);
      setGymName(null);
      setGymLogo(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // ⏱️ Automatic Logout (Inactivity Timer - 30 minutes)
  useEffect(() => {
    if (!token) return;

    let timeoutId;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        console.log("Inactivity detected. Logging out...");
        logout();
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Events to track user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    const handleDeactivation = () => setIsDeactivated(true);
    window.addEventListener("gym:deactivated", handleDeactivation);

    resetTimer(); // Initialize timer

    return () => {
      window.removeEventListener("gym:deactivated", handleDeactivation);
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [token]);

  const updateUser = (newData) => {
    if (newData) {
      setUser(newData);
      localStorage.setItem("user", JSON.stringify(newData));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        gymName,
        gymLogo,
        hasGym,
        role,
        isDeactivated,
        setHasGym,
        setGymName,
        setGymLogo,
        login,
        logout,
        updateUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
