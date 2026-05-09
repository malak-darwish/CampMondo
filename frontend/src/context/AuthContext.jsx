<<<<<<< HEAD
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
=======
import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    // Hydrate from localStorage on first render so a refresh keeps the user signed in.
    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem('user')
            return raw ? JSON.parse(raw) : null
        } catch {
            return null
        }
    })
    const [token, setToken] = useState(() => localStorage.getItem('token'))
    const [mustChangePassword, setMustChangePassword] = useState(
        () => localStorage.getItem('must_change_password') === 'true'
    )
    const [loading, setLoading] = useState(false)

    // Persist whenever these change
    useEffect(() => {
        if (user)  localStorage.setItem('user', JSON.stringify(user))
        else       localStorage.removeItem('user')
    }, [user])

    useEffect(() => {
        if (token) localStorage.setItem('token', token)
        else       localStorage.removeItem('token')
    }, [token])

    useEffect(() => {
        localStorage.setItem('must_change_password', mustChangePassword ? 'true' : 'false')
    }, [mustChangePassword])

    /**
     * Logs in. Returns { ok, user, mustChangePassword, message }.
     * The component decides where to navigate.
     */
    const login = async (email, password) => {
        setLoading(true)
        try {
            const res = await api.post('/auth/login', { email, password })
            const payload   = res.data?.data || {}
            const nextUser  = payload.user
            const nextToken = payload.token
            const mcp       = !!payload.must_change_password

            setUser(nextUser)
            setToken(nextToken)
            setMustChangePassword(mcp)

            return { ok: true, user: nextUser, mustChangePassword: mcp }
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed'
            return { ok: false, message, status: err.response?.status }
        } finally {
            setLoading(false)
        }
    }

    const logout = async () => {
        try { await api.post('/auth/logout') } catch { /* ignore */ }
        setUser(null)
        setToken(null)
        setMustChangePassword(false)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        localStorage.removeItem('must_change_password')
    }

    /**
     * Called after a successful password change so we can clear the
     * must_change_password flag without forcing a re-login.
     */
    const clearMustChangePassword = () => {
        setMustChangePassword(false)
        if (user) {
            const updated = { ...user, must_change_password: false }
            setUser(updated)
        }
    }

    const value = {
        user,
        token,
        loading,
        mustChangePassword,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        clearMustChangePassword,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
>>>>>>> origin/malak
