import { useState } from 'react'
import api from '../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    background: #0f1117;
  }

  .login-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 60px;
    position: relative;
    overflow: hidden;
  }

  .login-left::before {
    content: '';
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,210,166,0.15) 0%, transparent 70%);
    top: -100px; left: -100px;
    pointer-events: none;
  }

  .login-left::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,166,210,0.1) 0%, transparent 70%);
    bottom: -50px; right: -50px;
    pointer-events: none;
  }

  .login-brand {
    font-family: 'DM Serif Display', serif;
    font-size: 48px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .login-brand span { color: #63d2a6; }

  .login-tagline {
    color: rgba(255,255,255,0.4);
    font-size: 15px;
    font-weight: 300;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .login-illustration {
    margin-top: 60px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 280px;
  }

  .login-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .login-card-icon { font-size: 24px; }
  .login-card-label { font-size: 11px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px; }
  .login-card-value { font-size: 22px; font-weight: 600; color: #fff; }
  .login-card.accent { background: rgba(99,210,166,0.1); border-color: rgba(99,210,166,0.2); }
  .login-card.accent .login-card-value { color: #63d2a6; }

  .login-right {
    width: 480px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 80px 60px;
  }

  .login-title {
    font-family: 'DM Serif Display', serif;
    font-size: 32px;
    color: #0f1117;
    margin-bottom: 8px;
  }

  .login-subtitle {
    color: #888;
    font-size: 14px;
    margin-bottom: 40px;
  }

  .login-field { margin-bottom: 20px; }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: #0f1117;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #0f1117;
    outline: none;
    transition: border-color 0.2s;
    background: #fafafa;
  }

  .login-input:focus { border-color: #63d2a6; background: #fff; }

  .login-error {
    background: #fff0f0;
    border: 1px solid #fca5a5;
    color: #dc2626;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .login-btn {
    width: 100%;
    padding: 15px;
    background: #0f1117;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-top: 8px;
  }

  .login-btn:hover { background: #1e2330; }
  .login-btn:active { transform: scale(0.99); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default function Login() {
    const [form, setForm]     = useState({ email: '', password: '' })
    const [error, setError]   = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/auth/login', form)
            const { token, user } = res.data.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))

            if (user.role === 'admin')  window.location.href = '/admin/dashboard'
            if (user.role === 'staff')  window.location.href = '/staff/dashboard'
            if (user.role === 'parent') window.location.href = '/parent/dashboard'
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => { if (e.key === 'Enter') handleLogin() }

    return (
        <>
            <style>{styles}</style>
            <div className="login-root">
                <div className="login-left">
                    <div className="login-brand">Camp<span>Mondo</span></div>
                    <div className="login-tagline">Summer Camp Management</div>
                    <div className="login-illustration">
                        <div className="login-card accent">
                            <div className="login-card-icon">⛺</div>
                            <div className="login-card-label">Sessions</div>
                            <div className="login-card-value">12</div>
                        </div>
                        <div className="login-card">
                            <div className="login-card-icon">👦</div>
                            <div className="login-card-label">Campers</div>
                            <div className="login-card-value">248</div>
                        </div>
                        <div className="login-card">
                            <div className="login-card-icon">👥</div>
                            <div className="login-card-label">Groups</div>
                            <div className="login-card-value">18</div>
                        </div>
                        <div className="login-card accent">
                            <div className="login-card-icon">✅</div>
                            <div className="login-card-label">Attendance</div>
                            <div className="login-card-value">96%</div>
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <div className="login-title">Welcome back</div>
                    <div className="login-subtitle">Sign in to your CampMondo account</div>

                    {error && <div className="login-error">{error}</div>}

                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            onKeyDown={handleKey}
                        />
                    </div>

                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={e => setForm({...form, password: e.target.value})}
                            onKeyDown={handleKey}
                        />
                    </div>

                    <button className="login-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </div>
        </>
    )
}
