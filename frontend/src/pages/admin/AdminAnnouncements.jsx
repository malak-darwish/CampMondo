import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f5f0e8; font-family: 'Inter', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { margin-bottom: 32px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #2c1810; }
  .page-sub { font-size: 13px; color: #8a7a65; margin-top: 4px; }

  .btn { padding: 10px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-primary { background: #3d6b45; color: #fff; }
  .btn-primary:hover { background: #2c4a2e; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { background: transparent; border: 1.5px solid #c8b89a; color: #5a4a35; }
  .btn-secondary:hover { border-color: #8a7a65; }

  .alert { padding: 11px 15px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .alert-error { background: #fdecea; border: 1px solid #f5c6c6; color: #c62828; }
  .alert-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }

  .layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .section-title { font-size: 14px; font-weight: 600; color: #2c1810; }
  .section-count { font-size: 11px; color: #8a7a65; background: #f0e8d8; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

  .ann-list { display: flex; flex-direction: column; gap: 12px; }

  .ann-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-left: 4px solid #3d6b45;
    border-radius: 13px;
    padding: 22px;
    transition: box-shadow 0.2s;
  }

  .ann-card:hover { box-shadow: 0 4px 14px rgba(44,24,16,0.06); }
  .ann-card.session { border-left-color: #e8a838; }
  .ann-card.group { border-left-color: #6b5b3d; }

  .ann-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .ann-title { font-size: 15px; font-weight: 600; color: #2c1810; }
  .ann-body { font-size: 13px; color: #5a4a35; line-height: 1.6; margin-bottom: 14px; }
  .ann-meta { display: flex; gap: 10px; align-items: center; }
  .ann-date { font-size: 11px; color: #a08c72; }

  .badge { padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-amber { background: #fef3e2; color: #b45309; }
  .badge-brown { background: #f5ede0; color: #6b5b3d; }

  .form-panel {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 13px;
    padding: 22px;
    position: sticky;
    top: 80px;
  }

  .form-panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0e8d8;
  }

  .form-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
  .form-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .form-input { padding: 10px 13px; border: 1.5px solid #e0d0b8; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; transition: border-color 0.2s; background: #fdf8f0; }
  .form-input:focus { border-color: #3d6b45; background: #fff; }
  .form-textarea { padding: 10px 13px; border: 1.5px solid #e0d0b8; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; transition: border-color 0.2s; background: #fdf8f0; resize: vertical; min-height: 100px; }
  .form-textarea:focus { border-color: #3d6b45; background: #fff; }
  .form-select { padding: 10px 13px; border: 1.5px solid #e0d0b8; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; background: #fdf8f0; cursor: pointer; }
  .form-select:focus { border-color: #3d6b45; }

  .empty-state { padding: 56px; text-align: center; color: #a08c72; background: #fff9f0; border-radius: 13px; border: 1px solid #e8d5b5; }
  .empty-icon { font-size: 38px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; }
`

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([])
    const [form, setForm]   = useState({ title: '', body: '', target_type: 'system_wide', target_id: '' })
    const [error, setError]     = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const loadAnnouncements = () => {
        api.get('/admin/announcements').then(r => setAnnouncements(r.data.data || []))
    }

    useEffect(() => { loadAnnouncements() }, [])

    const handleSubmit = async () => {
        setError(''); setSuccess('')
        if (!form.title || !form.body) return setError('Title and body are required')
        setLoading(true)
        try {
            const payload = {
                ...form,
                target_id: form.target_id ? parseInt(form.target_id) : null
            }
            await api.post('/admin/announcements', payload)
            setSuccess('Announcement posted successfully')
            setForm({ title: '', body: '', target_type: 'system_wide', target_id: '' })
            loadAnnouncements()
        } catch (err) {
            setError(err.response?.data?.message || 'Error posting announcement')
        } finally {
            setLoading(false)
        }
    }

    const f = (key, val) => setForm(prev => ({...prev, [key]: val}))

    const targetBadge = (type) => {
        if (type === 'system_wide') return <span className="badge badge-green">System-wide</span>
        if (type === 'session')     return <span className="badge badge-amber">Session</span>
        return <span className="badge badge-brown">Group</span>
    }

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div className="page-title">Announcements</div>
                        <div className="page-sub">Post updates to parents and staff</div>
                    </div>

                    {error   && <div className="alert alert-error">⚠ {error}</div>}
                    {success && <div className="alert alert-success">✓ {success}</div>}

                    <div className="layout">
                        <div>
                            <div className="section-header">
                                <div className="section-title">All Announcements</div>
                                <div className="section-count">{announcements.length} posts</div>
                            </div>

                            {announcements.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">📢</div>
                                    <div className="empty-text">No announcements yet. Post your first one using the form.</div>
                                </div>
                            ) : (
                                <div className="ann-list">
                                    {announcements.map(a => (
                                        <div key={a.id} className={`ann-card ${a.target_type}`}>
                                            <div className="ann-header">
                                                <div className="ann-title">{a.title}</div>
                                                {targetBadge(a.target_type)}
                                            </div>
                                            <div className="ann-body">{a.body}</div>
                                            <div className="ann-meta">
                                                <div className="ann-date">📅 {formatDate(a.published_at)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-panel">
                            <div className="form-panel-title">📢 New Announcement</div>

                            <div className="form-field">
                                <label className="form-label">Title</label>
                                <input className="form-input" placeholder="Announcement title" value={form.title} onChange={e => f('title', e.target.value)} />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Message</label>
                                <textarea className="form-textarea" placeholder="Write your announcement here..." value={form.body} onChange={e => f('body', e.target.value)} />
                            </div>

                            <div className="form-field">
                                <label className="form-label">Target Audience</label>
                                <select className="form-select" value={form.target_type} onChange={e => f('target_type', e.target.value)}>
                                    <option value="system_wide">Everyone (System-wide)</option>
                                    <option value="session">Specific Session</option>
                                    <option value="group">Specific Group</option>
                                </select>
                            </div>

                            {form.target_type !== 'system_wide' && (
                                <div className="form-field">
                                    <label className="form-label">{form.target_type === 'session' ? 'Session ID' : 'Group ID'}</label>
                                    <input className="form-input" type="number" placeholder="Enter ID" value={form.target_id} onChange={e => f('target_id', e.target.value)} />
                                </div>
                            )}

                            <button className="btn btn-primary" style={{width:'100%'}} onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Posting...' : '📢 Post Announcement'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}