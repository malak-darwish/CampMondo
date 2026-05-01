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
  .btn-sm { padding: 7px 14px; font-size: 12px; }
  .btn-green { background: #f0fdf4; color: #16a34a; border: 1.5px solid #86efac; }
  .btn-green:hover { background: #dcfce7; }
  .btn-red { background: #fef2f2; color: #dc2626; border: 1.5px solid #fca5a5; }
  .btn-red:hover { background: #fee2e2; }
  .error-box { background: #fff0f0; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .success-box { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }

  .form-panel { background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; padding: 28px 32px; margin-bottom: 32px; }
  .form-panel-title { font-size: 16px; font-weight: 600; color: #0f1117; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f0f2ee; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .form-field { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .form-input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; transition: border-color 0.2s; background: #fafafa; }
  .form-input:focus { border-color: #63d2a6; background: #fff; }
  .form-actions { display: flex; gap: 12px; margin-top: 24px; }
  .form-hint { font-size: 12px; color: #aaa; margin-top: 16px; padding: 12px 16px; background: #fafbf9; border-radius: 8px; border: 1px solid #f0f2ee; }

  .staff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

  .staff-card {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 14px;
    padding: 24px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .staff-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.05); }
  .staff-card.deactivated { opacity: 0.6; }

  .staff-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }

  .staff-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: #0f1117;
    color: #63d2a6;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .staff-card.deactivated .staff-avatar { background: #e5e7eb; color: #aaa; }

  .staff-name { font-size: 15px; font-weight: 600; color: #0f1117; }
  .staff-email { font-size: 12px; color: #aaa; margin-top: 2px; }

  .staff-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .staff-meta-row { display: flex; justify-content: space-between; align-items: center; }
  .staff-meta-label { font-size: 11px; color: #bbb; text-transform: uppercase; letter-spacing: 1px; }

  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-red { background: #fef2f2; color: #dc2626; }
  .badge-gray { background: #f3f4f6; color: #6b7280; }

  .staff-actions { display: flex; gap: 8px; }

  .empty-state { padding: 60px; text-align: center; color: #bbb; background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
  .section-title { font-size: 15px; font-weight: 600; color: #0f1117; }
  .section-count { font-size: 12px; color: #aaa; background: #f4f6f3; padding: 3px 10px; border-radius: 20px; }
`

export default function ManageStaff() {
    const [staffList, setStaffList] = useState([])
    const [form, setForm]           = useState({ full_name: '', email: '', phone: '' })
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')
    const [loading, setLoading]     = useState(false)
    const [showForm, setShowForm]   = useState(false)

    const loadStaff = () => {
        api.get('/admin/staff').then(r => setStaffList(r.data.data || []))
    }

    useEffect(() => { loadStaff() }, [])

    const handleCreate = async () => {
        setError(''); setSuccess('')
        setLoading(true)
        try {
            await api.post('/admin/staff', form)
            setSuccess(`Staff account created for ${form.full_name}. A temporary password has been sent to ${form.email}.`)
            setForm({ full_name: '', email: '', phone: '' })
            setShowForm(false)
            loadStaff()
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleDeactivate = async (id) => {
        try {
            await api.put(`/admin/staff/${id}/deactivate`)
            setSuccess('Staff account deactivated')
            loadStaff()
        } catch (err) {
            setError(err.response?.data?.message || 'Error')
        }
    }

    const handleReactivate = async (id) => {
        try {
            await api.put(`/admin/staff/${id}/reactivate`)
            setSuccess('Staff account reactivated')
            loadStaff()
        } catch (err) {
            setError(err.response?.data?.message || 'Error')
        }
    }

    const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    const f = (key, val) => setForm(prev => ({...prev, [key]: val}))

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div>
                            <div className="page-title">Staff Management</div>
                            <div className="page-sub">Create and manage staff accounts</div>
                        </div>
                        <button className="btn btn-dark" onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '+ Add Staff'}
                        </button>
                    </div>

                    {error   && <div className="error-box">⚠ {error}</div>}
                    {success && <div className="success-box">✓ {success}</div>}

                    {showForm && (
                        <div className="form-panel">
                            <div className="form-panel-title">Create Staff Account</div>
                            <div className="form-grid">
                                <div className="form-field">
                                    <label className="form-label">Full Name</label>
                                    <input className="form-input" placeholder="e.g. Ali Hassan" value={form.full_name} onChange={e => f('full_name', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" type="email" placeholder="staff@example.com" value={form.email} onChange={e => f('email', e.target.value)} />
                                </div>
                                <div className="form-field">
                                    <label className="form-label">Phone (optional)</label>
                                    <input className="form-input" placeholder="e.g. 70000000" value={form.phone} onChange={e => f('phone', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-hint">
                                📧 A temporary password will be automatically generated and emailed to the staff member. They will be required to change it on first login.
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-dark" onClick={handleCreate} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account & Send Email'}
                                </button>
                                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    <div className="section-header">
                        <div className="section-title">All Staff</div>
                        <div className="section-count">{staffList.length} members</div>
                    </div>

                    {staffList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👥</div>
                            <div className="empty-text">No staff accounts yet. Add your first staff member above.</div>
                        </div>
                    ) : (
                        <div className="staff-grid">
                            {staffList.map(s => (
                                <div key={s.id} className={`staff-card ${s.account_status === 'deactivated' ? 'deactivated' : ''}`}>
                                    <div className="staff-card-top">
                                        <div className="staff-avatar">{initials(s.full_name)}</div>
                                        <div>
                                            <div className="staff-name">{s.full_name}</div>
                                            <div className="staff-email">{s.email}</div>
                                        </div>
                                    </div>
                                    <div className="staff-meta">
                                        <div className="staff-meta-row">
                                            <span className="staff-meta-label">Status</span>
                                            <span className={`badge ${s.account_status === 'active' ? 'badge-green' : s.account_status === 'locked' ? 'badge-gray' : 'badge-red'}`}>
                                                {s.account_status}
                                            </span>
                                        </div>
                                        {s.phone && (
                                            <div className="staff-meta-row">
                                                <span className="staff-meta-label">Phone</span>
                                                <span style={{fontSize:'13px', color:'#555'}}>{s.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="staff-actions">
                                        {s.account_status !== 'deactivated'
                                            ? <button className="btn btn-red btn-sm" onClick={() => handleDeactivate(s.id)}>Deactivate</button>
                                            : <button className="btn btn-green btn-sm" onClick={() => handleReactivate(s.id)}>Reactivate</button>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
