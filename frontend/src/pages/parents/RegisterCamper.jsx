import { useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .page-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .page-body {
    width: min(900px, calc(100% - 48px));
    margin: 0 auto;
    padding: 40px 0;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 6px;
  }

  .page-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 28px;
  }

  .form-panel {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    padding: 24px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .form-field.full { grid-column: 1 / -1; }

  .form-label {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    background: #fff;
    color: #2c1810;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .form-input:focus,
  .form-select:focus,
  .form-textarea:focus {
    border-color: #3d6b45;
  }

  .form-textarea {
    min-height: 96px;
    resize: vertical;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 22px;
  }

  .primary-btn {
    min-height: 40px;
    padding: 0 18px;
    background: #3d6b45;
    border: none;
    border-radius: 8px;
    color: #fff;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .primary-btn:hover { background: #2c4a2e; }

  .message {
    margin-bottom: 18px;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
  }

  .message.success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c7e8c9;
  }

  .message.error {
    background: #fdecea;
    color: #c62828;
    border: 1px solid #f5c6c6;
  }

  @media (max-width: 760px) {
    .page-body {
      width: min(100% - 32px, 900px);
      padding: 28px 0;
    }
    .form-grid { grid-template-columns: 1fr; }
  }
`

const initialForm = {
    full_name: '',
    date_of_birth: '',
    gender: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_alerts: '',
}

export default function RegisterCamper() {
    const [form, setForm] = useState(initialForm)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const today = new Date().toISOString().slice(0, 10)

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    async function submit(e) {
        e.preventDefault()
        setMessage('')
        setError('')
        setSaving(true)
        try {
            const res = await api.post('/parent/campers', form)
            setMessage(res.data.message)
            setForm(initialForm)
        } catch (err) {
            setError(err.response?.data?.message || 'Could not create camper')
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <main className="page-body">
                    <h1 className="page-title">Register Camper</h1>
                    <p className="page-subtitle">Create a camper profile linked to your parent account.</p>

                    <form className="form-panel" onSubmit={submit}>
                        {message && <div className="message success">{message}</div>}
                        {error && <div className="message error">{error}</div>}

                        <div className="form-grid">
                            <div className="form-field">
                                <label className="form-label">Full name</label>
                                <input className="form-input" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Date of birth</label>
                                <input className="form-input" type="date" max={today} value={form.date_of_birth} onChange={(e) => update('date_of_birth', e.target.value)} />
                            </div>
                            <div className="form-field">
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                                    <option value="">Select gender</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-field">
                                <label className="form-label">Emergency phone</label>
                                <input className="form-input" value={form.emergency_contact_phone} onChange={(e) => update('emergency_contact_phone', e.target.value)} />
                            </div>
                            <div className="form-field full">
                                <label className="form-label">Emergency contact name</label>
                                <input className="form-input" value={form.emergency_contact_name} onChange={(e) => update('emergency_contact_name', e.target.value)} />
                            </div>
                            <div className="form-field full">
                                <label className="form-label">Medical alerts</label>
                                <textarea className="form-textarea" value={form.medical_alerts} onChange={(e) => update('medical_alerts', e.target.value)} placeholder="Optional allergies, medication, or notes" />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button className="primary-btn" disabled={saving}>
                                {saving ? 'Creating...' : 'Create Camper'}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </>
    )
}
