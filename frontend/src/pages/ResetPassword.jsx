import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .rp-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    background: #2c4a2e;
    padding: 32px;
  }

  .rp-card {
    width: 100%;
    max-width: 460px;
    background: #f5f0e8;
    border-radius: 14px;
    padding: 48px 44px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }

  .rp-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3d6b45;
    margin-bottom: 8px;
  }

  .rp-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #2c1810;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .rp-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .rp-field { margin-bottom: 18px; }

  .rp-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .rp-input {
    width: 100%;
    padding: 13px 15px;
    border: 1.5px solid #e0d0b8;
    border-radius: 9px;
    font-size: 14px;
    color: #2c1810;
    outline: none;
    transition: border-color 0.2s;
    background: #fff9f0;
  }

  .rp-input:focus { border-color: #3d6b45; background: #fff; }

  .rp-hint { font-size: 12px; color: #8a7a65; margin-top: 6px; }

  .rp-error {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .rp-success {
    background: #e7f4e8;
    border: 1px solid #b8d4ba;
    color: #2c4a2e;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .rp-btn {
    width: 100%;
    padding: 14px;
    background: #3d6b45;
    color: #fff;
    border: none;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    margin-top: 6px;
  }

  .rp-btn:hover { background: #2c4a2e; }
  .rp-btn:active { transform: scale(0.99); }
  .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .rp-back {
    margin-top: 22px;
    text-align: center;
    font-size: 13px;
  }

  .rp-back a { color: #3d6b45; text-decoration: none; font-weight: 500; }
  .rp-back a:hover { text-decoration: underline; }
`

export default function ResetPassword() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const token = params.get('token') || ''

    const [form, setForm] = useState({ password: '', confirm: '' })
    const [error, setError] = useState('')
    const [done, setDone]   = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!token) setError('Reset link is invalid. Please request a new one.')
    }, [token])

    const validate = () => {
        if (!form.password || !form.confirm) return 'Please fill in both password fields'
        if (form.password !== form.confirm)  return 'Passwords do not match'
        const pw = form.password
        if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw)) {
            return 'Password must be at least 8 characters and include uppercase, lowercase, and a digit'
        }
        return null
    }

    const handleSubmit = async () => {
        setError('')
        if (!token) { setError('Reset link is invalid. Please request a new one.'); return }
        const v = validate()
        if (v) { setError(v); return }

        setLoading(true)
        try {
            await api.post('/auth/reset-password', { token, password: form.password })
            setDone(true)
            setTimeout(() => navigate('/login', { replace: true }), 1500)
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed')
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

    return (
        <>
            <style>{styles}</style>
            <div className="rp-root">
                <div className="rp-card">
                    <div className="rp-eyebrow">Account Recovery</div>
                    <div className="rp-title">Reset your password</div>
                    <div className="rp-subtitle">Choose a new password for your CampMondo account.</div>

                    {error && <div className="rp-error">⚠ {error}</div>}
                    {done  && <div className="rp-success">✓ Password updated. Redirecting to sign in…</div>}

                    {!done && token && (
                        <>
                            <div className="rp-field">
                                <label className="rp-label">New Password</label>
                                <input
                                    className="rp-input"
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    onKeyDown={handleKey}
                                    autoComplete="new-password"
                                />
                                <div className="rp-hint">
                                    At least 8 characters, with uppercase, lowercase, and a digit.
                                </div>
                            </div>

                            <div className="rp-field">
                                <label className="rp-label">Confirm New Password</label>
                                <input
                                    className="rp-input"
                                    type="password"
                                    value={form.confirm}
                                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                                    onKeyDown={handleKey}
                                    autoComplete="new-password"
                                />
                            </div>

                            <button className="rp-btn" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Saving...' : 'Reset Password'}
                            </button>
                        </>
                    )}

                    <div className="rp-back">
                        <Link to="/login">← Back to sign in</Link>
                    </div>
                </div>
            </div>
        </>
    )
}