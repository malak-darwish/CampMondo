import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f5f0e8; font-family: 'Inter', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #2c1810; }
  .page-sub { font-size: 13px; color: #8a7a65; margin-top: 4px; }

  .btn { padding: 10px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-primary { background: #3d6b45; color: #fff; }
  .btn-primary:hover { background: #2c4a2e; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { background: transparent; border: 1.5px solid #c8b89a; color: #5a4a35; }
  .btn-secondary:hover { border-color: #8a7a65; }
  .btn-danger { background: #fdecea; color: #c62828; border: 1.5px solid #f5c6c6; }
  .btn-danger:hover { background: #fbd5d3; }
  .btn-sm { padding: 6px 13px; font-size: 12px; }

  .alert { padding: 11px 15px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .alert-error { background: #fdecea; border: 1px solid #f5c6c6; color: #c62828; }
  .alert-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }

  .form-panel {
    background: #fff9f0;
    border-radius: 14px;
    border: 1px solid #e8d5b5;
    padding: 26px 30px;
    margin-bottom: 28px;
  }

  .form-panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f0e8d8;
  }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-field { display: flex; flex-direction: column; gap: 7px; }
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .form-input {
    padding: 10px 13px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    outline: none;
    transition: border-color 0.2s;
    background: #fdf8f0;
  }
  .form-input:focus { border-color: #3d6b45; background: #fff; }
  .form-actions { display: flex; gap: 10px; margin-top: 22px; }

  .table-panel {
    background: #fff9f0;
    border-radius: 14px;
    border: 1px solid #e8d5b5;
    overflow: hidden;
  }

  .table-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0e8d8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .table-title { font-size: 14px; font-weight: 600; color: #2c1810; }
  .table-count {
    font-size: 11px;
    color: #8a7a65;
    background: #f0e8d8;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
  }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #fdf8f0; }
  th { padding: 11px 18px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #a08c72; border-bottom: 1px solid #f0e8d8; }
  td { padding: 14px 18px; font-size: 13px; color: #3a2e1e; border-bottom: 1px solid #f8f4ee; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fdf8f0; }

  .td-actions { display: flex; gap: 8px; }

  .badge-blue { background: #e8f0fe; color: #1a56db; padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }

  .empty-state { padding: 56px; text-align: center; color: #a08c72; }
  .empty-icon { font-size: 38px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; }
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
                        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm) }}>
                            {showForm ? '✕ Cancel' : '+ New Session'}
                        </button>
                    </div>

                    {error   && <div className="alert alert-error">⚠ {error}</div>}
                    {success && <div className="alert alert-success">✓ {success}</div>}

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
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Saving...' : editingId ? 'Update Session' : 'Create Session'}
                                </button>
                                <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="table-panel">
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
                                            <td><span className="badge-blue">{s.max_capacity} spots</span></td>
                                            <td><strong>${s.enrollment_fee}</strong></td>
                                            <td>
                                                <div className="td-actions">
                                                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
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