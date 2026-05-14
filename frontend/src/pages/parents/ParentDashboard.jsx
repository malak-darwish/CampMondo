import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .parent-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .parent-body {
    width: min(1120px, calc(100% - 48px));
    margin: 0 auto;
    padding: 40px 0;
  }

  .parent-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 24px;
    margin-bottom: 32px;
  }

  .parent-greeting {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 4px;
    line-height: 1.15;
  }

  .parent-date {
    font-size: 13px;
    color: #8a7a65;
  }

  .primary-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0 16px;
    background: #3d6b45;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .primary-action:hover { background: #2c4a2e; }

  .parent-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: #fff9f0;
    border-radius: 14px;
    padding: 24px;
    border: 1px solid #e8d5b5;
  }

  .stat-card.featured {
    background: #2c4a2e;
    border-color: #2c4a2e;
  }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #a08c72;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .stat-card.featured .stat-label { color: rgba(255,255,255,0.42); }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 700;
    color: #2c1810;
  }

  .stat-card.featured .stat-value { color: #e8a838; }

  .quicklinks {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 28px;
  }

  .quick-btn {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 16px 20px;
    text-decoration: none;
    display: block;
    transition: border-color 0.15s, background 0.15s;
  }

  .quick-btn:hover {
    border-color: #3d6b45;
    background: #f0f7f1;
  }

  .quick-label {
    font-size: 13px;
    font-weight: 600;
    color: #2c1810;
  }

  .quick-sub {
    font-size: 11px;
    color: #a08c72;
    margin-top: 4px;
  }

  .panel {
    background: #fff9f0;
    border-radius: 14px;
    border: 1px solid #e8d5b5;
    overflow: hidden;
  }

  .panel-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0e8d8;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
  }

  .panel-link {
    font-size: 12px;
    color: #3d6b45;
    text-decoration: none;
    font-weight: 600;
    white-space: nowrap;
  }

  .camper-row {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1.2fr auto;
    gap: 14px;
    padding: 16px 22px;
    border-bottom: 1px solid #f8f4ee;
    align-items: center;
  }

  .camper-row:last-child { border-bottom: none; }

  .camper-name {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
  }

  .camper-meta {
    font-size: 12px;
    color: #8a7a65;
    line-height: 1.5;
  }

  .camper-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .small-btn,
  .danger-btn,
  .ghost-btn {
    min-height: 34px;
    padding: 0 12px;
    border-radius: 7px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .small-btn {
    background: #3d6b45;
    color: #fff;
    border: 1px solid #3d6b45;
  }

  .small-btn:hover { background: #2c4a2e; }

  .danger-btn {
    background: #fff;
    color: #b3261e;
    border: 1px solid #efc4bf;
  }

  .danger-btn:hover { background: #fdecea; }

  .ghost-btn {
    background: #fff;
    color: #5a4a35;
    border: 1px solid #e0d0b8;
  }

  .ghost-btn:hover { background: #f7efe3; }

  .small-btn:disabled,
  .danger-btn:disabled,
  .ghost-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .edit-panel {
    grid-column: 1 / -1;
    background: #fff;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 18px;
    margin-top: 4px;
  }

  .edit-title {
    font-size: 13px;
    font-weight: 700;
    color: #2c1810;
    margin-bottom: 14px;
  }

  .edit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .edit-field.full { grid-column: 1 / -1; }

  .edit-label {
    display: block;
    font-size: 10px;
    font-weight: 700;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 7px;
  }

  .edit-input,
  .edit-select,
  .edit-textarea {
    width: 100%;
    padding: 11px 12px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    background: #fff;
    color: #2c1810;
    font: inherit;
    font-size: 13px;
    outline: none;
  }

  .edit-input:focus,
  .edit-select:focus,
  .edit-textarea:focus {
    border-color: #3d6b45;
  }

  .edit-textarea {
    min-height: 84px;
    resize: vertical;
  }

  .edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }

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

  .empty-state {
    padding: 34px 22px;
    color: #8a7a65;
    font-size: 13px;
  }

  .empty-state strong {
    display: block;
    color: #2c1810;
    font-size: 15px;
    margin-bottom: 6px;
  }

  .loading,
  .error-state {
    padding: 60px;
    text-align: center;
    color: #8a7a65;
    font-size: 14px;
  }

  .error-state { color: #c62828; }

  @media (max-width: 900px) {
    .parent-body {
      width: min(100% - 32px, 1120px);
      padding: 28px 0;
    }
    .parent-header { flex-direction: column; }
    .parent-stats,
    .quicklinks,
    .camper-row,
    .edit-grid { grid-template-columns: 1fr; }
    .camper-actions { justify-content: flex-start; }
  }
`

function camperToForm(camper) {
    return {
        full_name: camper.full_name || '',
        date_of_birth: camper.date_of_birth || '',
        gender: camper.gender || '',
        emergency_contact_name: camper.emergency_contact_name || '',
        emergency_contact_phone: camper.emergency_contact_phone || '',
        medical_alerts: camper.medical_alerts || '',
    }
}

export default function ParentDashboard() {
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    const [editingId, setEditingId] = useState(null)
    const [editForm, setEditForm] = useState(null)
    const [savingId, setSavingId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)

    const firstName = user?.full_name?.split(' ')[0] || 'Parent'
    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })
    const today = new Date().toISOString().slice(0, 10)

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        setLoading(true)
        setError('')
        try {
            const res = await api.get('/parent/dashboard')
            setDashboard(res.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load parent dashboard')
        } finally {
            setLoading(false)
        }
    }

    function startEdit(camper) {
        setMessage('')
        setError('')
        setEditingId(camper.id)
        setEditForm(camperToForm(camper))
    }

    function cancelEdit() {
        setEditingId(null)
        setEditForm(null)
    }

    function updateEdit(field, value) {
        setEditForm((prev) => ({ ...prev, [field]: value }))
    }

    function replaceCamper(updatedCamper) {
        setDashboard((prev) => ({
            ...prev,
            campers: (prev?.campers || []).map((camper) => (
                camper.id === updatedCamper.id ? updatedCamper : camper
            )),
        }))
    }

    function removeCamper(camperId) {
        setDashboard((prev) => {
            const campers = (prev?.campers || []).filter((camper) => camper.id !== camperId)
            return {
                ...prev,
                campers,
                campers_count: campers.length,
            }
        })
    }

    async function saveCamper(camperId) {
        if (!editForm) return
        setMessage('')
        setError('')
        setSavingId(camperId)
        try {
            const payload = {
                ...editForm,
                full_name: editForm.full_name.trim(),
                emergency_contact_name: editForm.emergency_contact_name.trim(),
                emergency_contact_phone: editForm.emergency_contact_phone.trim(),
                medical_alerts: editForm.medical_alerts.trim(),
            }
            const res = await api.put(`/parent/campers/${camperId}`, payload)
            replaceCamper(res.data.data)
            setMessage(res.data.message || 'Camper profile updated')
            cancelEdit()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not update camper profile')
        } finally {
            setSavingId(null)
        }
    }

    async function deleteCamper(camper) {
        const confirmed = window.confirm(
            `Remove ${camper.full_name}? This will delete the camper profile from your account.`
        )
        if (!confirmed) return

        setMessage('')
        setError('')
        setDeletingId(camper.id)
        try {
            const res = await api.delete(`/parent/campers/${camper.id}`)
            removeCamper(camper.id)
            if (editingId === camper.id) cancelEdit()
            setMessage(res.data.message || 'Camper profile removed')
        } catch (err) {
            setError(err.response?.data?.message || 'Could not remove camper profile')
        } finally {
            setDeletingId(null)
        }
    }

    const campers = dashboard?.campers || []
    const campersCount = dashboard?.campers_count ?? campers.length
    const paymentsCount = dashboard?.payments_count ?? 0

    if (loading) {
        return (
            <>
                <style>{styles}</style>
                <div className="parent-root">
                    <Navbar />
                    <div className="loading">Loading dashboard...</div>
                </div>
            </>
        )
    }

    return (
        <>
            <style>{styles}</style>
            <div className="parent-root">
                <Navbar />
                <div className="parent-body">
                    <div className="parent-header">
                        <div>
                            <h1 className="parent-greeting">Welcome, {firstName}</h1>
                            <div className="parent-date">{dateStr}</div>
                        </div>
                        <Link className="primary-action" to="/parent/register-camper">
                            Register Camper
                        </Link>
                    </div>

                    {message && <div className="message success">{message}</div>}
                    {error && <div className="message error">{error}</div>}

                    {!error && !dashboard ? (
                        <div className="empty-state">
                            <strong>Dashboard unavailable.</strong>
                            Refresh the page and try again.
                        </div>
                    ) : (
                        <>
                            <div className="parent-stats">
                                <div className="stat-card featured">
                                    <div className="stat-label">Campers</div>
                                    <div className="stat-value">{campersCount}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Payments</div>
                                    <div className="stat-value">{paymentsCount}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Announcements</div>
                                    <div className="stat-value">1</div>
                                </div>
                            </div>

                            <div className="quicklinks">
                                <Link className="quick-btn" to="/parent/register-camper">
                                    <div className="quick-label">Register Camper</div>
                                    <div className="quick-sub">Add a child profile</div>
                                </Link>
                                <Link className="quick-btn" to="/parent/sessions">
                                    <div className="quick-label">Sessions</div>
                                    <div className="quick-sub">View and enroll campers</div>
                                </Link>
                                <Link className="quick-btn" to="/parent/payments">
                                    <div className="quick-label">Payments</div>
                                    <div className="quick-sub">Submit or review payments</div>
                                </Link>
                                <Link className="quick-btn" to="/parent/announcements">
                                    <div className="quick-label">Announcements</div>
                                    <div className="quick-sub">Read camp updates</div>
                                </Link>
                            </div>

                            <section className="panel">
                                <div className="panel-header">
                                    <div className="panel-title">Your Campers</div>
                                    <Link className="panel-link" to="/parent/register-camper">Add camper</Link>
                                </div>

                                {campers.length === 0 ? (
                                    <div className="empty-state">
                                        <strong>No campers registered yet.</strong>
                                        Register a camper to start enrollment and payment workflows.
                                    </div>
                                ) : (
                                    campers.map((camper) => (
                                        <div key={camper.id} className="camper-row">
                                            <div>
                                                <div className="camper-name">{camper.full_name}</div>
                                                <div className="camper-meta">Date of birth: {camper.date_of_birth}</div>
                                                {camper.medical_alerts && (
                                                    <div className="camper-meta">Medical alerts: {camper.medical_alerts}</div>
                                                )}
                                            </div>
                                            <div className="camper-meta">Gender: {camper.gender || 'Not set'}</div>
                                            <div className="camper-meta">
                                                Emergency: {camper.emergency_contact_name || 'Not set'} - {camper.emergency_contact_phone || 'Not set'}
                                            </div>
                                            <div className="camper-actions">
                                                <button
                                                    type="button"
                                                    className="small-btn"
                                                    onClick={() => startEdit(camper)}
                                                    disabled={savingId === camper.id || deletingId === camper.id}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="danger-btn"
                                                    onClick={() => deleteCamper(camper)}
                                                    disabled={savingId === camper.id || deletingId === camper.id}
                                                >
                                                    {deletingId === camper.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>

                                            {editingId === camper.id && editForm && (
                                                <div className="edit-panel">
                                                    <div className="edit-title">Edit camper profile</div>
                                                    <div className="edit-grid">
                                                        <div className="edit-field">
                                                            <label className="edit-label">Full name</label>
                                                            <input
                                                                className="edit-input"
                                                                value={editForm.full_name}
                                                                onChange={(e) => updateEdit('full_name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="edit-field">
                                                            <label className="edit-label">Date of birth</label>
                                                            <input
                                                                className="edit-input"
                                                                type="date"
                                                                max={today}
                                                                value={editForm.date_of_birth}
                                                                onChange={(e) => updateEdit('date_of_birth', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="edit-field">
                                                            <label className="edit-label">Gender</label>
                                                            <select
                                                                className="edit-select"
                                                                value={editForm.gender}
                                                                onChange={(e) => updateEdit('gender', e.target.value)}
                                                            >
                                                                <option value="">Select gender</option>
                                                                <option value="female">Female</option>
                                                                <option value="male">Male</option>
                                                                <option value="other">Other</option>
                                                            </select>
                                                        </div>
                                                        <div className="edit-field">
                                                            <label className="edit-label">Emergency phone</label>
                                                            <input
                                                                className="edit-input"
                                                                value={editForm.emergency_contact_phone}
                                                                onChange={(e) => updateEdit('emergency_contact_phone', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="edit-field full">
                                                            <label className="edit-label">Emergency contact name</label>
                                                            <input
                                                                className="edit-input"
                                                                value={editForm.emergency_contact_name}
                                                                onChange={(e) => updateEdit('emergency_contact_name', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="edit-field full">
                                                            <label className="edit-label">Medical alerts</label>
                                                            <textarea
                                                                className="edit-textarea"
                                                                value={editForm.medical_alerts}
                                                                onChange={(e) => updateEdit('medical_alerts', e.target.value)}
                                                                placeholder="Optional allergies, medication, or notes"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="edit-actions">
                                                        <button
                                                            type="button"
                                                            className="ghost-btn"
                                                            onClick={cancelEdit}
                                                            disabled={savingId === camper.id}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="small-btn"
                                                            onClick={() => saveCamper(camper.id)}
                                                            disabled={savingId === camper.id}
                                                        >
                                                            {savingId === camper.id ? 'Saving...' : 'Save changes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
