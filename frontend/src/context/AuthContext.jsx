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