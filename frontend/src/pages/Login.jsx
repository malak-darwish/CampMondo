import { useState } from 'react'
import api from '../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .login-root {
    min-height: 100vh;
    display: flex;
    font-family: 'Inter', sans-serif;
    background: #2c4a2e;
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
    width: 400px; height: 400px;
    border-radius: 50%;
    background: rgba(232,168,56,0.08);
    top: -80px; left: -80px;
    pointer-events: none;
  }

  .login-left::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: rgba(255,255,255,0.04);
    bottom: -60px; right: -60px;
    pointer-events: none;
  }

  .login-brand {
    font-family: 'Playfair Display', serif;
    font-size: 52px;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 8px;
  }

  .login-brand span { color: #e8a838; }

  .login-tagline {
    color: rgba(255,255,255,0.4);
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 56px;
  }

  .login-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 260px;
  }

  .login-card {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 18px;
  }

  .login-card.accent {
    background: rgba(232,168,56,0.12);
    border-color: rgba(232,168,56,0.25);
  }

  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-12px); }
    100% { transform: translateY(0px); }
}

  .login-card-icon { font-size: 22px; margin-bottom: 8px; }
  .login-card-label { font-size: 10px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
  .login-card-value { font-family: 'Playfair Display', serif; font-size: 24px; color: #fff; }
  .login-card.accent .login-card-value { color: #e8a838; }

  .login-right {
    width: 460px;
    background: #f5f0e8;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 56px;
  }

  .login-welcome {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3d6b45;
    margin-bottom: 10px;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 6px;
    line-height: 1.2;
  }

  .login-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 40px;
  }

  .login-field { margin-bottom: 20px; }

  .login-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    padding: 13px 15px;
    border: 1.5px solid #e0d0b8;
    border-radius: 9px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    outline: none;
    transition: border-color 0.2s;
    background: #fff9f0;
  }

  .login-input:focus { border-color: #3d6b45; background: #fff; }

  .login-error {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .login-btn {
    width: 100%;
    padding: 14px;
    background: #3d6b45;
    color: #fff;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-top: 8px;
  }

  .login-btn:hover { background: #2c4a2e; }
  .login-btn:active { transform: scale(0.99); }
  .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default function Login() {
    const [form, setForm]       = useState({ email: '', password: '' })
    const [error, setError]     = useState('')
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
                    <div style={{marginTop: '48px', width: '420px', textAlign: 'center'}}>
                      <img
                          src="/camping.svg"
                          alt="Camp illustration"
                          style={{
                              width: '100%',
                              maxWidth: '420px',
                              animation: 'float 3s ease-in-out infinite'
                          }}
                      />
                  </div>
                </div>

                <div className="login-right">
                    <div className="login-welcome">Welcome back</div>
                    <div className="login-title">Sign in to CampMondo</div>
                    <div className="login-subtitle">Manage your camp from one place</div>

                    {error && <div className="login-error">⚠ {error}</div>}

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
                        {loading ? 'Signing in...' : 'Sign In →'}
                    </button>
                </div>
            </div>
        </>
    )
}