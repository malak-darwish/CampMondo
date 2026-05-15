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
  .btn-success { background: #e8f5e9; color: #2e7d32; border: 1.5px solid #a5d6a7; }
  .btn-success:hover { background: #d0ecd1; }
  .btn-danger { background: #fdecea; color: #c62828; border: 1.5px solid #f5c6c6; }
  .btn-danger:hover { background: #fbd5d3; }
  .btn-sm { padding: 6px 13px; font-size: 12px; }

  .alert { padding: 11px 15px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .alert-error { background: #fdecea; border: 1px solid #f5c6c6; color: #c62828; }
  .alert-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }

  .form-panel { background: #fff9f0; border-radius: 14px; border: 1px solid #e8d5b5; padding: 26px 30px; margin-bottom: 28px; }
  .form-panel-title { font-size: 15px; font-weight: 600; color: #2c1810; margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px solid #f0e8d8; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
  .form-field { display: flex; flex-direction: column; gap: 7px; }
  .form-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .form-input { padding: 10px 13px; border: 1.5px solid #e0d0b8; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; transition: border-color 0.2s; background: #fdf8f0; }
  .form-input:focus { border-color: #3d6b45; background: #fff; }
  .form-actions { display: flex; gap: 10px; margin-top: 22px; }
  .form-hint { font-size: 12px; color: #8a7a65; margin-top: 14px; padding: 11px 14px; background: #fdf8f0; border-radius: 8px; border: 1px solid #f0e8d8; }

  /* Tabs */
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: #ede8df; border-radius: 10px; padding: 4px; width: fit-content; }
  .tab {
    padding: 8px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; background: transparent; color: #8a7a65;
    font-family: 'Inter', sans-serif; transition: all 0.15s;
  }
  .tab.active { background: #fff9f0; color: #2c1810; box-shadow: 0 1px 4px rgba(44,24,16,0.08); }
  .tab-count {
    display: inline-block; margin-left: 6px;
    background: #f0e8d8; color: #8a7a65;
    font-size: 10px; font-weight: 700; padding: 1px 7px;
    border-radius: 20px;
  }
  .tab.active .tab-count { background: #e8d5b5; color: #5a4a35; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
  .section-title { font-size: 14px; font-weight: 600; color: #2c1810; }
  .section-count { font-size: 11px; color: #8a7a65; background: #f0e8d8; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

  .staff-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

  .staff-card {
    background: #fff9f0; border: 1px solid #e8d5b5;
    border-radius: 13px; padding: 22px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .staff-card:hover { transform: translateY(-2px); box-shadow: 0 5px 18px rgba(44,24,16,0.07); }
  .staff-card.deactivated { opacity: 0.6; }

  .staff-card-top { display: flex; align-items: center; gap: 13px; margin-bottom: 16px; }
  .staff-avatar {
    width: 42px; height: 42px; border-radius: 50%;
    background: #2c4a2e; color: #e8a838;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; flex-shrink: 0;
  }
  .staff-card.deactivated .staff-avatar { background: #e0d0b8; color: #a08c72; }
  .staff-name { font-size: 14px; font-weight: 600; color: #2c1810; }
  .staff-email { font-size: 12px; color: #a08c72; margin-top: 2px; }

  .staff-meta { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .staff-meta-row { display: flex; justify-content: space-between; align-items: center; }
  .staff-meta-label { font-size: 10px; color: #c8b89a; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }

  .badge { padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-red { background: #fdecea; color: #c62828; }

  .staff-actions { display: flex; gap: 8px; flex-wrap: wrap; }

  /* Delete confirm modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(44,24,16,0.35);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .modal {
    background: #fff9f0; border-radius: 16px; border: 1px solid #e8d5b5;
    padding: 32px; max-width: 400px; width: 90%; text-align: center;
  }
  .modal-title { font-family: 'Playfair Display', serif; font-size: 20px; color: #2c1810; margin-bottom: 10px; }
  .modal-body { font-size: 13px; color: #8a7a65; margin-bottom: 24px; line-height: 1.6; }
  .modal-actions { display: flex; gap: 10px; justify-content: center; }

  .empty-state { padding: 56px; text-align: center; color: #a08c72; background: #fff9f0; border-radius: 14px; border: 1px solid #e8d5b5; }
  .empty-icon { font-size: 38px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; }
`

export default function ManageStaff() {
    const [staffList, setStaffList] = useState([])
    const [form, setForm]           = useState({ full_name: '', email: '', phone_number: '' })
    const [error, setError]         = useState('')
    const [success, setSuccess]     = useState('')
    const [loading, setLoading]     = useState(false)
    const [showForm, setShowForm]   = useState(false)
    const [activeTab, setActiveTab] = useState('active') // 'active' | 'inactive'
    const [deleteTarget, setDeleteTarget] = useState(null) // staff object to confirm delete

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
            setForm({ full_name: '', email: '', phone_number: '' })
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

    const handleDelete = async () => {
        if (!deleteTarget) return
        try {
            await api.delete(`/admin/staff/${deleteTarget.id}`)
            setSuccess(`${deleteTarget.full_name}'s account has been permanently deleted.`)
            setDeleteTarget(null)
            loadStaff()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not delete staff account')
            setDeleteTarget(null)
        }
    }

    const activeStaff   = staffList.filter(s => s.is_active)
    const inactiveStaff = staffList.filter(s => !s.is_active)
    const displayed     = activeTab === 'active' ? activeStaff : inactiveStaff

    const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const f = (key, val) => setForm(prev => ({...prev, [key]: val}))

    return (
        <>
            <style>{styles}</style>

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-title">Delete Staff Account?</div>
                        <div className="modal-body">
                            You are about to permanently delete <strong>{deleteTarget.full_name}</strong>'s account.
                            This action cannot be undone.
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-danger" onClick={handleDelete}>Yes, Delete</button>
                            <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div>
                            <div className="page-title">Staff Management</div>
                            <div className="page-sub">Create and manage staff accounts</div>
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                            {showForm ? '✕ Cancel' : '+ Add Staff'}
                        </button>
                    </div>

                    {error   && <div className="alert alert-error">⚠ {error}</div>}
                    {success && <div className="alert alert-success">✓ {success}</div>}

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
                                    <input className="form-input" placeholder="e.g. 70000000" value={form.phone_number} onChange={e => f('phone_number', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-hint">
                                📧 A temporary password will be generated and emailed to the staff member. They must change it on first login.
                            </div>
                            <div className="form-actions">
                                <button className="btn btn-primary" onClick={handleCreate} disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Account & Send Email'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </div>
                    )}

                    {/* Active / Inactive tabs */}
                    <div className="tabs">
                        <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
                            Active <span className="tab-count">{activeStaff.length}</span>
                        </button>
                        <button className={`tab ${activeTab === 'inactive' ? 'active' : ''}`} onClick={() => setActiveTab('inactive')}>
                            Inactive <span className="tab-count">{inactiveStaff.length}</span>
                        </button>
                    </div>

                    {displayed.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">{activeTab === 'active' ? '👥' : '🔒'}</div>
                            <div className="empty-text">
                                {activeTab === 'active'
                                    ? 'No active staff accounts. Add your first staff member above.'
                                    : 'No inactive staff accounts.'}
                            </div>
                        </div>
                    ) : (
                        <div className="staff-grid">
                            {displayed.map(s => (
                                <div key={s.id} className={`staff-card ${!s.is_active ? 'deactivated' : ''}`}>
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
                                            <span className={`badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                                                {s.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        {s.phone_number && (
                                            <div className="staff-meta-row">
                                                <span className="staff-meta-label">Phone</span>
                                                <span style={{fontSize:'12px', color:'#5a4a35'}}>{s.phone_number}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="staff-actions">
                                        {s.is_active
                                            ? <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(s.id)}>Deactivate</button>
                                            : <button className="btn btn-success btn-sm" onClick={() => handleReactivate(s.id)}>Reactivate</button>
                                        }
                                        <button className="btn btn-sm" style={{background:'#2c1810',color:'#fff'}} onClick={() => setDeleteTarget(s)}>
                                            Delete
                                        </button>
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