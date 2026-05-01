import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  // 🔥 LOAD USER FROM TOKEN
  useEffect(() => {
    async function loadMe() {
      if (!token) return;

      try {
        const res = await api.get("/auth/me");

        const currentUser = res.data.data;

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser)); // ✅ FIXED

      } catch (err) {
        console.log("LOAD ME ERROR:", err.response?.data);
        logout();
      }
    }

    loadMe();
  }, [token]);

  // 🔥 LOGIN
  async function login(email, password) {
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", res.data); // 🔍 debug

      const newToken = res.data.data.token;
      const newUser = res.data.data.user;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      return { ok: true, user: newUser };

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data); // 🔍 debug

      return {
        ok: false,
        message: err.response?.data?.message || "Login failed"
      };
    } finally {
      setLoading(false);
    }
  }

  // 🔥 LOGOUT
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);

    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: user?.role,
        loading,
        login,
        logout,
        isAuthenticated: Boolean(token && user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);