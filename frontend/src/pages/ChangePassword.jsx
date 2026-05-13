import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .pw-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Inter', sans-serif;
    background: #2c4a2e;
    padding: 32px;
  }

  .pw-card {
    width: 100%;
    max-width: 480px;
    background: #f5f0e8;
    border-radius: 14px;
    padding: 48px 44px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  }

  .pw-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #3d6b45;
    margin-bottom: 8px;
  }

  .pw-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    color: #2c1810;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .pw-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 28px;
    line-height: 1.5;
  }

  .pw-field { margin-bottom: 18px; }

  .pw-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .pw-input {
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

  .pw-input:focus { border-color: #3d6b45; background: #fff; }

  .pw-hint {
    font-size: 12px;
    color: #8a7a65;
    margin-top: 6px;
  }

  .pw-error {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .pw-success {
    background: #e7f4e8;
    border: 1px solid #b8d4ba;
    color: #2c4a2e;
    padding: 11px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 18px;
  }

  .pw-info {
    background: #fff4d6;
    border: 1px solid #e8a838;
    color: #6b4f15;
    padding: 12px 15px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 22px;
    line-height: 1.5;
  }

  .pw-btn {
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

  .pw-btn:hover { background: #2c4a2e; }
  .pw-btn:active { transform: scale(0.99); }
  .pw-btn:disabled { opacity: 0.6; cursor: not-allowed; }
`

const dashboardFor = (role) => {
    if (role === 'admin')  return '/admin/dashboard'
    if (role === 'staff')  return '/staff/dashboard'
    if (role === 'parent') return '/parent/dashboard'
    return '/login'
}

export default function ChangePassword() {
    const navigate = useNavigate()
    const { user, mustChangePassword, clearMustChangePassword } = useAuth()
    const isForced = !!mustChangePassword

    const [form, setForm] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    })
    const [error, setError]   = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const validate = () => {
        if (!isForced && !form.current_password) {
            return 'Current password is required'
        }
        if (!form.new_password || !form.confirm_password) {
            return 'Please fill in both password fields'
        }
        if (form.new_password !== form.confirm_password) {
            return 'New passwords do not match'
        }
        // Frontend mirror of is_strong_password
        const pw = form.new_password
        if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw)) {
            return 'Password must be at least 8 characters and include uppercase, lowercase, and a digit'
        }
        return null
    }

    const handleSubmit = async () => {
        setError('')
        setSuccess('')
        const v = validate()
        if (v) { setError(v); return }

        setLoading(true)
        try {
            const body = isForced
                ? { new_password: form.new_password }
                : { current_password: form.current_password, new_password: form.new_password }

            await api.post('/auth/change-password', body)
            clearMustChangePassword()
            setSuccess('Password changed successfully. Redirecting…')
            setTimeout(() => {
                navigate(dashboardFor(user?.role), { replace: true })
            }, 900)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

    return (
        <>
            <style>{styles}</style>
            <div className="pw-root">
                <div className="pw-card">
                    <div className="pw-eyebrow">Account Security</div>
                    <div className="pw-title">
                        {isForced ? 'Set a new password' : 'Change your password'}
                    </div>
                    <div className="pw-subtitle">
                        {isForced
                            ? 'You\'re using a temporary password. Choose a permanent one to continue.'
                            : 'Update the password used to sign in to your CampMondo account.'}
                    </div>

                    {isForced && (
                        <div className="pw-info">
                            🔒 You must set a new password before accessing the rest of CampMondo.
                        </div>
                    )}

                    {error   && <div className="pw-error">⚠ {error}</div>}
                    {success && <div className="pw-success">✓ {success}</div>}

                    {!isForced && (
                        <div className="pw-field">
                            <label className="pw-label">Current Password</label>
                            <input
                                className="pw-input"
                                type="password"
                                value={form.current_password}
                                onChange={e => setForm({ ...form, current_password: e.target.value })}
                                onKeyDown={handleKey}
                                autoComplete="current-password"
                            />
                        </div>
                    )}

                    <div className="pw-field">
                        <label className="pw-label">New Password</label>
                        <input
                            className="pw-input"
                            type="password"
                            value={form.new_password}
                            onChange={e => setForm({ ...form, new_password: e.target.value })}
                            onKeyDown={handleKey}
                            autoComplete="new-password"
                        />
                        <div className="pw-hint">
                            At least 8 characters, with uppercase, lowercase, and a digit.
                        </div>
                    </div>

                    <div className="pw-field">
                        <label className="pw-label">Confirm New Password</label>
                        <input
                            className="pw-input"
                            type="password"
                            value={form.confirm_password}
                            onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                            onKeyDown={handleKey}
                            autoComplete="new-password"
                        />
                    </div>

                    <button className="pw-btn" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Saving...' : (isForced ? 'Set Password & Continue' : 'Change Password')}
                    </button>
                </div>
            </div>
        </>
    )
}