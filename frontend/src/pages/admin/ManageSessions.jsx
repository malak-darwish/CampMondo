import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f4f6f3; font-family: 'DM Sans', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: #0f1117; }
  .page-sub { font-size: 14px; color: #888; margin-top: 4px; }
  .btn { padding: 11px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-dark { background: #0f1117; color: #fff; }
  .btn-dark:hover { background: #1e2330; }
  .btn-outline { background: transparent; border: 1.5px solid #e0e3de; color: #555; }
  .btn-outline:hover { border-color: #aaa; }
  .btn-danger { background: #fef2f2; color: #dc2626; border: 1.5px solid #fca5a5; }
  .btn-danger:hover { background: #fee2e2; }
  .btn-sm { padding: 7px 14px; font-size: 12px; }
  .error-box { background: #fff0f0; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .success-box { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }

  .form-panel {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8ebe6;
    padding: 28px 32px;
    margin-bottom: 32px;
  }

  .form-panel-title { font-size: 16px; font-weight: 600; color: #0f1117; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f0f2ee; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

  .form-field { display: flex; flex-direction: column; gap: 8px; }
  .form-field.full { grid-column: 1 / -1; }

  .form-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #555; }

  .form-input {
    padding: 11px 14px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #0f1117;
    outline: none;
    transition: border-color 0.2s;
    background: #fafafa;
  }

  .form-input:focus { border-color: #63d2a6; background: #fff; }

  .form-actions { display: flex; gap: 12px; margin-top: 24px; }

  .sessions-table {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8ebe6;
    overflow: hidden;
  }

  .table-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2ee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table-title { font-size: 15px; font-weight: 600; color: #0f1117; }
  .table-count { font-size: 12px; color: #aaa; background: #f4f6f3; padding: 3px 10px; border-radius: 20px; }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #fafbf9; }
  th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; border-bottom: 1px solid #f0f2ee; }
  td { padding: 16px 20px; font-size: 14px; color: #333; border-bottom: 1px solid #f9faf8; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbf9; }

  .td-actions { display: flex; gap: 8px; }

  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-blue { background: #eff6ff; color: #2563eb; }

  .empty-state { padding: 60px; text-align: center; color: #bbb; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }
`

const emptyForm = { name: '', start_date: '', end_date: '', max_capacity: '', enrollment_fee: '' }

export default function ManageSessions() {
    const [sessions, setSessions]   = useState([])
    const [form, setForm]           = useState(emptyForm)
    const [editingId, setEditingId] = useState(null)
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')
    const [loading, setLoading]     = useState(false)
    const [showForm, setShowForm]   = useState(false)

    const loadSessions = () => {
        api.get('/admin/sessions').then(r => setSessions(r.data.data || []))
    }

    useEffect(() => { loadSessions() }, [])

    const handleSubmit = async () => {
        setError(''); setSuccess('')
        setLoading(true)
        try {
            if (editingId) {
                await api.put(`/admin/sessions/${editingId}`, form)
                setSuccess('Session updated successfully')
            } else {
                await api.post('/admin/sessions', form)
                setSuccess('Session created successfully')
            }
            loadSessions()
            resetForm()
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (s) => {
        setEditingId(s.id)
        setForm({ name: s.name, start_date: s.start_date, end_date: s.end_date, max_capacity: s.max_capacity, enrollment_fee: s.enrollment_fee })
        setShowForm(true)
        setError(''); setSuccess('')
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this session? This cannot be undone.')) return
        try {
            await api.delete(`/admin/sessions/${id}`)
            setSuccess('Session deleted')
            loadSessions()
        } catch (err) {
            setError(err.response?.data?.message || 'Cannot delete session')
        }
    }

    const resetForm = () => {
        setForm(emptyForm)
        setEditingId(null)
        setShowForm(false)
    }

    const f = (key, val) => setForm(prev => ({...prev, [key]: val}))

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div>
                            <div className="page-title">Sessions</div>
                            <div className="page-sub">Create and manage camp sessions</div>
                        </div>
                        <button className="btn btn-dark" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}>
                            {showForm ? '✕ Cancel' : '+ New Session'}
                        </button>
                    </div>

                    {error   && <div className="error-box">⚠ {error}</div>}
                    {success && <div className="success-box">✓ {success}</div>}

                    {showForm && (
                        <div className="form-panel">
                            <div className="form-panel-title">{editingId ? 'Edit Session' : 'Create New Session'}</div>
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label className="form-label">Session Name</label>
                                    <input className="form-input" placeholder="e.g. Summer Session A" value={form.name} onChange={e => f('name', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Start Date</label>
                                    <input className="form-input" type="date" value={form.start_date} onChange={e => f('start_date', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">End Date</label>
                                    <input className="form-input" type="date" value={form.end_date} onChange={e => f('end_date', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Max Capacity</label>
                                    <input className="form-input" type="number" placeholder="e.g. 30" value={form.max_capacity} onChange={e => f('max_capacity', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Enrollment Fee ($)</label>
                                    <input className="form-input" type="number" placeholder="e.g. 150" value={form.enrollment_fee} onChange={e => f('enrollment_fee', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-dark" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Saving...' : editingId ? 'Update Session' : 'Create Session'}
                                </button>
                                <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="sessions-table">
                        <div className="table-header">
                            <div className="table-title">All Sessions</div>
                            <div className="table-count">{sessions.length} sessions</div>
                        </div>
                        {sessions.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">⛺</div>
                                <div className="empty-text">No sessions yet. Create your first one above.</div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Capacity</th>
                                        <th>Fee</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map(s => (
                                        <tr key={s.id}>
                                            <td><strong>{s.name}</strong></td>
                                            <td>{s.start_date}</td>
                                            <td>{s.end_date}</td>
                                            <td><span className="badge badge-blue">{s.max_capacity} spots</span></td>
                                            <td><strong>${s.enrollment_fee}</strong></td>
                                            <td>
                                                <div className="td-actions">
                                                    <button className="btn btn-outline btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
