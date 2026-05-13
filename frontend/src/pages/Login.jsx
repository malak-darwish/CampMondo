import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

  @keyframes float {
    0%   { transform: translateY(0px); }
    50%  { transform: translateY(-12px); }
    100% { transform: translateY(0px); }
  }

  .login-right {
    width: 460px;
    background: #f5f0e8;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 72px 56px;
    overflow-y: auto;
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
    margin-bottom: 32px;
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

  .login-info {
    background: #fff4d6;
    border: 1px solid #e8a838;
    color: #6b4f15;
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

  .login-forgot {
    margin-top: 18px;
    text-align: center;
    font-size: 13px;
  }

  .login-forgot a {
    color: #3d6b45;
    text-decoration: none;
    font-weight: 500;
  }

  .login-forgot a:hover { text-decoration: underline; }

  .login-switch {
    margin-top: 20px;
    text-align: center;
    font-size: 13px;
    color: #6f604d;
  }

  .login-switch button {
    background: none;
    border: none;
    color: #3d6b45;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
  }

  .login-switch button:hover { text-decoration: underline; }

  @media (max-width: 860px) {
    .login-root { flex-direction: column; }
    .login-left { min-height: 260px; padding: 36px 24px; }
    .login-right { width: 100%; padding: 40px 28px; }
  }
`

const dashboardFor = (role) => {
    if (role === 'admin') return '/admin/dashboard'
    if (role === 'staff') return '/staff/dashboard'
    if (role === 'parent') return '/parent/dashboard'
    return '/login'
}

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const { login, isAuthenticated, user, mustChangePassword } = useAuth()

    const [mode, setMode] = useState('login')
    const [form, setForm] = useState({ email: '', password: '' })
    const [registerForm, setRegisterForm] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
    })
    const [error, setError] = useState('')
    const [info, setInfo] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (searchParams.get('expired') === '1') {
            setInfo('Your session has expired. Please sign in again.')
        }
    }, [searchParams])

    useEffect(() => {
        if (isAuthenticated && user) {
            if (mustChangePassword) navigate('/change-password', { replace: true })
            else navigate(dashboardFor(user.role), { replace: true })
        }
    }, [isAuthenticated, user, mustChangePassword, navigate])

    const handleLogin = async () => {
        setError('')
        setInfo('')
        if (!form.email || !form.password) {
            setError('Email and password are required')
            return
        }

        setLoading(true)
        const result = await login(form.email.trim(), form.password)
        setLoading(false)

        if (!result.ok) {
            setError(result.message)
            return
        }

        const from = location.state?.from?.pathname

        if (result.mustChangePassword) {
            navigate('/change-password', { replace: true })
        } else if (from && from !== '/login') {
            navigate(from, { replace: true })
        } else {
            navigate(dashboardFor(result.user.role), { replace: true })
        }
    }

    const handleRegister = async () => {
        setError('')
        setInfo('')

        if (!registerForm.full_name || !registerForm.email || !registerForm.password) {
            setError('Full name, email, and password are required')
            return
        }

        if (registerForm.password !== registerForm.confirm_password) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await api.post('/auth/register-parent', {
                full_name: registerForm.full_name.trim(),
                email: registerForm.email.trim(),
                phone_number: registerForm.phone_number.trim(),
                password: registerForm.password,
            })

            const result = await login(registerForm.email.trim(), registerForm.password)
            if (!result.ok) {
                setMode('login')
                setForm({ email: registerForm.email.trim(), password: '' })
                setInfo('Account created. Please sign in.')
                return
            }

            navigate(dashboardFor(result.user.role), { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create parent account')
        } finally {
            setLoading(false)
        }
    }

    const switchMode = (nextMode) => {
        setMode(nextMode)
        setError('')
        setInfo('')
    }

    const handleKey = (e) => {
        if (e.key === 'Enter') {
            if (mode === 'register') handleRegister()
            else handleLogin()
        }
    }

    return (
        <>
            <style>{styles}</style>
            <div className="login-root">
                <div className="login-left">
                    <div className="login-brand">Camp<span>Mondo</span></div>
                    <div className="login-tagline">Summer Camp Management</div>
                    <div style={{ marginTop: '48px', width: '420px', textAlign: 'center' }}>
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
                    <div className="login-welcome">{mode === 'register' ? 'Parent registration' : 'Welcome back'}</div>
                    <div className="login-title">{mode === 'register' ? 'Create parent account' : 'Sign in to CampMondo'}</div>
                    <div className="login-subtitle">
                        {mode === 'register' ? 'Create your parent access before registering campers' : 'Manage your camp from one place'}
                    </div>

                    {info && <div className="login-info">{info}</div>}
                    {error && <div className="login-error">{error}</div>}

                    {mode === 'register' && (
                        <div className="login-field">
                            <label className="login-label">Full name</label>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Parent name"
                                value={registerForm.full_name}
                                onChange={e => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                                onKeyDown={handleKey}
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="you@example.com"
                            value={mode === 'register' ? registerForm.email : form.email}
                            onChange={e => {
                                if (mode === 'register') setRegisterForm({ ...registerForm, email: e.target.value })
                                else setForm({ ...form, email: e.target.value })
                            }}
                            onKeyDown={handleKey}
                            autoComplete="email"
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="login-field">
                            <label className="login-label">Phone number</label>
                            <input
                                className="login-input"
                                type="tel"
                                placeholder="Optional"
                                value={registerForm.phone_number}
                                onChange={e => setRegisterForm({ ...registerForm, phone_number: e.target.value })}
                                onKeyDown={handleKey}
                                autoComplete="tel"
                            />
                        </div>
                    )}

                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Password"
                            value={mode === 'register' ? registerForm.password : form.password}
                            onChange={e => {
                                if (mode === 'register') setRegisterForm({ ...registerForm, password: e.target.value })
                                else setForm({ ...form, password: e.target.value })
                            }}
                            onKeyDown={handleKey}
                            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="login-field">
                            <label className="login-label">Confirm password</label>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Confirm password"
                                value={registerForm.confirm_password}
                                onChange={e => setRegisterForm({ ...registerForm, confirm_password: e.target.value })}
                                onKeyDown={handleKey}
                                autoComplete="new-password"
                            />
                        </div>
                    )}

                    {mode === 'register' ? (
                        <button className="login-btn" onClick={handleRegister} disabled={loading}>
                            {loading ? 'Creating account...' : 'Create Parent Account'}
                        </button>
                    ) : (
                        <button className="login-btn" onClick={handleLogin} disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    )}

                    {mode === 'login' && (
                        <div className="login-forgot">
                            <Link to="/forgot-password">Forgot your password?</Link>
                        </div>
                    )}

                    <div className="login-switch">
                        {mode === 'register' ? (
                            <>Already have an account? <button onClick={() => switchMode('login')}>Sign in</button></>
                        ) : (
                            <>Parent without an account? <button onClick={() => switchMode('register')}>Create one</button></>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
