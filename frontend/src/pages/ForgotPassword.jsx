import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .fp-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    background: #2c4a2e;
    padding: 32px;
  }

  .fp-card {
    width: 100%;
    max-width: 460px;
    background: #f5f0e8;
    border-radius: 14px;
    padding: 48px 44px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }

  .fp-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3d6b45;
    margin-bottom: 8px;
  }

  .fp-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #2c1810;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .fp-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .fp-field { margin-bottom: 18px; }

  .fp-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .fp-input {
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

  .fp-input:focus { border-color: #3d6b45; background: #fff; }

  .fp-error {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .fp-success {
    background: #e7f4e8;
    border: 1px solid #b8d4ba;
    color: #2c4a2e;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
    line-height: 1.5;
  }

  .fp-btn {
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

  .fp-btn:hover { background: #2c4a2e; }
  .fp-btn:active { transform: scale(0.99); }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .fp-back {
    margin-top: 22px;
    text-align: center;
    font-size: 13px;
  }

  .fp-back a { color: #3d6b45; text-decoration: none; font-weight: 500; }
  .fp-back a:hover { text-decoration: underline; }
`

export default function ForgotPassword() {
    const [email, setEmail]     = useState('')
    const [error, setError]     = useState('')
    const [sent, setSent]       = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        setError('')
        if (!email.trim()) { setError('Please enter your email'); return }

        setLoading(true)
        try {
            await api.post('/auth/forgot-password', { email: email.trim() })
            setSent(true)
        } catch (err) {
            // Backend returns 200 even when account doesn't exist (anti-enumeration),
            // so any error here is genuinely unexpected.
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

    return (
        <>
            <style>{styles}</style>
            <div className="fp-root">
                <div className="fp-card">
                    <div className="fp-eyebrow">Account Recovery</div>
                    <div className="fp-title">Forgot your password?</div>
                    <div className="fp-subtitle">
                        Enter your account email and we&apos;ll send you a link to reset it.
                    </div>

                    {error && <div className="fp-error">⚠ {error}</div>}

                    {sent ? (
                        <div className="fp-success">
                            ✓ If an account exists for that email, a reset link has been sent.
                            Please check your inbox (and spam folder). The link expires in 1 hour.
                        </div>
                    ) : (
                        <>
                            <div className="fp-field">
                                <label className="fp-label">Email</label>
                                <input
                                    className="fp-input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={handleKey}
                                    autoComplete="email"
                                />
                            </div>

                            <button className="fp-btn" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </>
                    )}

                    <div className="fp-back">
                        <Link to="/login">← Back to sign in</Link>
                    </div>
                </div>
            </div>
        </>
    )
}