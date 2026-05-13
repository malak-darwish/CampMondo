import { useEffect, useState } from 'react'
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
    width: min(1120px, calc(100% - 48px));
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

  .payments-grid {
    display: grid;
    grid-template-columns: 380px minmax(0, 1fr);
    gap: 22px;
  }

  .panel {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    overflow: hidden;
  }

  .panel-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0e8d8;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
  }

  .panel-body { padding: 22px; }

  .form-field { margin-bottom: 16px; }

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
  .form-select {
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
  .form-select:focus { border-color: #3d6b45; }

  .primary-btn {
    width: 100%;
    min-height: 40px;
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
  .primary-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .message {
    margin-bottom: 16px;
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

  .table {
    width: 100%;
    border-collapse: collapse;
  }

  .table th {
    text-align: left;
    padding: 12px 18px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8a7a65;
    border-bottom: 1px solid #f0e8d8;
  }

  .table td {
    padding: 14px 18px;
    font-size: 13px;
    color: #2c1810;
    border-bottom: 1px solid #f8f4ee;
  }

  .status {
    display: inline-flex;
    padding: 3px 10px;
    border-radius: 999px;
    background: #fff4d6;
    color: #6b4f15;
    font-size: 11px;
    font-weight: 600;
  }

  .empty-state,
  .loading {
    padding: 28px 22px;
    color: #8a7a65;
    font-size: 13px;
  }

  @media (max-width: 980px) {
    .page-body {
      width: min(100% - 32px, 1120px);
      padding: 28px 0;
    }
    .payments-grid { grid-template-columns: 1fr; }
  }
`

const initialForm = {
    enrollment_id: '',
    amount: '',
    card_number: '',
    expiry_date: '',
    cvv: '',
}

export default function Payments() {
    const [enrollments, setEnrollments] = useState([])
    const [payments, setPayments] = useState([])
    const [form, setForm] = useState(initialForm)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    async function load() {
        const [enrollmentsRes, paymentsRes] = await Promise.all([
            api.get('/parent/enrollments'),
            api.get('/parent/payments'),
        ])
        setEnrollments((enrollmentsRes.data.data || []).filter((item) => item.status === 'active'))
        setPayments(paymentsRes.data.data || [])
    }

    useEffect(() => {
        load()
            .catch((err) => setError(err.response?.data?.message || 'Could not load payments'))
            .finally(() => setLoading(false))
    }, [])

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    function selectEnrollment(enrollmentId) {
        const enrollment = enrollments.find((item) => String(item.id) === String(enrollmentId))
        setForm((prev) => ({
            ...prev,
            enrollment_id: enrollmentId,
            amount: enrollment?.session?.enrollment_fee ?? prev.amount,
        }))
    }

    async function submit(e) {
        e.preventDefault()
        setError('')
        setMessage('')
        setSaving(true)
        try {
            const res = await api.post('/parent/payments', form)
            setMessage(res.data.message)
            setForm(initialForm)
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Payment failed')
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
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">Submit camper payments and review payment history.</p>

                    <div className="payments-grid">
                        <form className="panel" onSubmit={submit} autoComplete="off">
                            <div className="panel-header">
                                <div className="panel-title">Submit Payment</div>
                            </div>
                            <div className="panel-body">
                                {message && <div className="message success">{message}</div>}
                                {error && <div className="message error">{error}</div>}

                                <div className="form-field">
                                    <label className="form-label">Enrolled camper/session</label>
                                    <select className="form-select" value={form.enrollment_id} onChange={(e) => selectEnrollment(e.target.value)}>
                                        <option value="">
                                            {enrollments.length === 0 ? 'Enroll a camper in a session first' : 'Select enrollment'}
                                        </option>
                                        {enrollments.map((enrollment) => (
                                            <option key={enrollment.id} value={enrollment.id}>
                                                {enrollment.camper_name} - {enrollment.session?.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Amount</label>
                                    <input className="form-input" value={form.amount} onChange={(e) => update('amount', e.target.value)} placeholder="150.00" />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Payment number</label>
                                    <input
                                        className="form-input"
                                        value={form.card_number}
                                        onChange={(e) => update('card_number', e.target.value)}
                                        placeholder="Use 12 or more digits"
                                        inputMode="numeric"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Expiry</label>
                                    <input
                                        className="form-input"
                                        value={form.expiry_date}
                                        onChange={(e) => update('expiry_date', e.target.value)}
                                        placeholder="MM/YY"
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Security code</label>
                                    <input
                                        className="form-input"
                                        value={form.cvv}
                                        onChange={(e) => update('cvv', e.target.value)}
                                        placeholder="3 or 4 digits"
                                        inputMode="numeric"
                                        autoComplete="off"
                                    />
                                </div>
                                <button className="primary-btn" disabled={saving || loading}>
                                    {saving ? 'Submitting...' : 'Submit Payment'}
                                </button>
                            </div>
                        </form>

                        <section className="panel">
                            <div className="panel-header">
                                <div className="panel-title">Payment History</div>
                            </div>
                            {loading ? (
                                <div className="loading">Loading payments...</div>
                            ) : payments.length === 0 ? (
                                <div className="empty-state">No payments submitted yet.</div>
                            ) : (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Camper</th>
                                            <th>Session</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.camper_name}</td>
                                                <td>{p.session_name || 'Session'}</td>
                                                <td>${p.amount}</td>
                                                <td><span className="status">{p.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </>
    )
}
