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
  .btn-amber { background: #e8a838; color: #fff; border: none; }
  .btn-amber:hover { background: #c8882a; }

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
    font-size: 15px; font-weight: 600; color: #2c1810;
    margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid #f0e8d8;
  }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .form-field { display: flex; flex-direction: column; gap: 7px; }
  .form-field.full { grid-column: 1 / -1; }
  .form-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .form-input {
    padding: 10px 13px; border: 1.5px solid #e0d0b8; border-radius: 8px;
    font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810;
    outline: none; transition: border-color 0.2s; background: #fdf8f0;
  }
  .form-input:focus { border-color: #3d6b45; background: #fff; }
  .form-actions { display: flex; gap: 10px; margin-top: 22px; }

  .table-panel { background: #fff9f0; border-radius: 14px; border: 1px solid #e8d5b5; overflow: hidden; }
  .table-header {
    padding: 18px 22px; border-bottom: 1px solid #f0e8d8;
    display: flex; justify-content: space-between; align-items: center;
  }
  .table-title { font-size: 14px; font-weight: 600; color: #2c1810; }
  .table-count {
    font-size: 11px; color: #8a7a65; background: #f0e8d8;
    padding: 3px 10px; border-radius: 20px; font-weight: 600;
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

  /* Activities panel */
  .activities-row td {
    background: #fdf5e6 !important;
    padding: 0 !important;
    border-bottom: 2px solid #e8d5b5 !important;
  }
  .activities-panel {
    padding: 20px 24px;
    border-top: 1px dashed #e0c898;
  }
  .activities-panel-title {
    font-size: 11px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 1px; color: #8a7a65; margin-bottom: 14px;
  }
  .activities-list { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .activity-chip {
    display: flex; align-items: center; gap: 8px;
    background: #fff9f0; border: 1px solid #e0c898;
    border-radius: 20px; padding: 5px 12px; font-size: 12px; color: #3a2e1e;
  }
  .activity-chip-fee { color: #3d6b45; font-weight: 600; }
  .activity-chip-age { color: #8a7a65; font-size: 11px; }
  .activity-chip-del {
    background: none; border: none; cursor: pointer;
    color: #c62828; font-size: 14px; line-height: 1; padding: 0;
    opacity: 0.6; transition: opacity 0.15s;
  }
  .activity-chip-del:hover { opacity: 1; }
  .activity-add-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .activity-add-row .form-input { padding: 7px 11px; font-size: 12px; width: auto; }
  .activity-empty { font-size: 12px; color: #a08c72; font-style: italic; margin-bottom: 12px; }
  .age-help { font-size: 11px; color: #8a7a65; margin: 0 0 10px; }

  .expand-btn {
    background: none; border: none; cursor: pointer;
    color: #3d6b45; font-size: 18px; line-height: 1;
    transition: transform 0.2s;
  }
  .expand-btn.open { transform: rotate(180deg); }
`

const emptyForm = { name: '', start_date: '', end_date: '', max_capacity: '', enrollment_fee: '' }
const emptyActivityForm = { name: '', fee: '', min_age: '', max_age: '' }

function activityAgeLabel(activity) {
  if (activity.min_age != null && activity.max_age != null) return `Ages ${activity.min_age}-${activity.max_age}`
  if (activity.min_age != null) return `Ages ${activity.min_age}+`
  if (activity.max_age != null) return `Up to age ${activity.max_age}`
  return 'All ages'
}

export default function ManageSessions() {
  const [sessions, setSessions]       = useState([])
  const [form, setForm]               = useState(emptyForm)
  const [editingId, setEditingId]     = useState(null)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [showForm, setShowForm]       = useState(false)

  // activities state: { [sessionId]: [...] }
  const [activities, setActivities]   = useState({})
  const [expandedId, setExpandedId]   = useState(null)
  const [actForm, setActForm]         = useState(emptyActivityForm)
  const [actLoading, setActLoading]   = useState(false)
  const [actError, setActError]       = useState('')

  const loadSessions = () =>
    api.get('/admin/sessions').then(r => setSessions(r.data.data || []))

  useEffect(() => { loadSessions() }, [])

  const loadActivities = (sessionId) => {
    api.get(`/admin/sessions/${sessionId}/activities`)
      .then(r => setActivities(prev => ({ ...prev, [sessionId]: r.data.data || [] })))
      .catch(() => {})
  }

  const toggleExpand = (sessionId) => {
    if (expandedId === sessionId) {
      setExpandedId(null)
    } else {
      setExpandedId(sessionId)
      setActForm(emptyActivityForm)
      setActError('')
      if (!activities[sessionId]) loadActivities(sessionId)
    }
  }

  const handleAddActivity = async (sessionId) => {
    if (!actForm.name.trim()) { setActError('Activity name is required'); return }
    setActLoading(true); setActError('')
    try {
      await api.post(`/admin/sessions/${sessionId}/activities`, {
        name: actForm.name.trim(),
        fee:  parseFloat(actForm.fee) || 0,
        min_age: actForm.min_age === '' ? null : Number(actForm.min_age),
        max_age: actForm.max_age === '' ? null : Number(actForm.max_age)
      })
      setActForm(emptyActivityForm)
      loadActivities(sessionId)
    } catch (err) {
      setActError(err.response?.data?.message || 'Failed to add activity')
    } finally {
      setActLoading(false)
    }
  }

  const handleDeleteActivity = async (sessionId, activityId) => {
    if (!confirm('Remove this activity?')) return
    try {
      await api.delete(`/admin/sessions/${sessionId}/activities/${activityId}`)
      loadActivities(sessionId)
    } catch (err) {
      setActError(err.response?.data?.message || 'Failed to delete activity')
    }
  }

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
    setForm(emptyForm); setEditingId(null); setShowForm(false)
  }

  const f = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

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
                    <th></th>
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
                    <>
                      <tr key={s.id}>
                        <td style={{ width: 40 }}>
                          <button
                            className={`expand-btn${expandedId === s.id ? ' open' : ''}`}
                            onClick={() => toggleExpand(s.id)}
                            title="Manage activities"
                          >⌄</button>
                        </td>
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

                      {expandedId === s.id && (
                        <tr className="activities-row" key={`act-${s.id}`}>
                          <td colSpan={7}>
                            <div className="activities-panel">
                              <div className="activities-panel-title">🎨 Activities for {s.name}</div>

                              {/* existing activities */}
                              {(activities[s.id] || []).length === 0
                                ? <div className="activity-empty">No activities yet — add one below.</div>
                                : (
                                  <div className="activities-list">
                                    {(activities[s.id] || []).map(a => (
                                      <div className="activity-chip" key={a.id}>
                                        <span>{a.name}</span>
                                        <span className="activity-chip-fee">${parseFloat(a.fee).toFixed(2)}</span>
                                        <span className="activity-chip-age">{activityAgeLabel(a)}</span>
                                        <button className="activity-chip-del" onClick={() => handleDeleteActivity(s.id, a.id)} title="Remove">✕</button>
                                      </div>
                                    ))}
                                  </div>
                                )
                              }

                              {/* add new activity */}
                              {actError && <div style={{ fontSize: 12, color: '#c62828', marginBottom: 8 }}>⚠ {actError}</div>}
                              <div className="age-help">Leave min/max age empty if the activity is open to all ages.</div>
                              <div className="activity-add-row">
                                <input
                                  className="form-input"
                                  placeholder="Activity name (e.g. Swimming)"
                                  value={actForm.name}
                                  onChange={e => setActForm(p => ({ ...p, name: e.target.value }))}
                                  style={{ flex: 1, minWidth: 180 }}
                                />
                                <input
                                  className="form-input"
                                  type="number"
                                  placeholder="Fee ($)"
                                  value={actForm.fee}
                                  onChange={e => setActForm(p => ({ ...p, fee: e.target.value }))}
                                  style={{ width: 110 }}
                                />
                                <input
                                  className="form-input"
                                  type="number"
                                  min="0"
                                  placeholder="Min age"
                                  value={actForm.min_age}
                                  onChange={e => setActForm(p => ({ ...p, min_age: e.target.value }))}
                                  style={{ width: 100 }}
                                />
                                <input
                                  className="form-input"
                                  type="number"
                                  min="0"
                                  placeholder="Max age"
                                  value={actForm.max_age}
                                  onChange={e => setActForm(p => ({ ...p, max_age: e.target.value }))}
                                  style={{ width: 100 }}
                                />
                                <button
                                  className="btn btn-amber btn-sm"
                                  onClick={() => handleAddActivity(s.id)}
                                  disabled={actLoading}
                                >
                                  {actLoading ? '...' : '+ Add Activity'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
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