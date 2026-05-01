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
  .error-box { background: #fff0f0; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .success-box { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }

  .layout { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }

  .form-panel { background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; padding: 28px 32px; position: sticky; top: 88px; }
  .form-panel-title { font-size: 15px; font-weight: 600; color: #0f1117; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f2ee; }
  .form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .form-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .form-input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; transition: border-color 0.2s; background: #fafafa; }
  .form-input:focus { border-color: #63d2a6; background: #fff; }
  .form-textarea { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; transition: border-color 0.2s; background: #fafafa; resize: vertical; min-height: 100px; }
  .form-textarea:focus { border-color: #63d2a6; background: #fff; }
  .form-select { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; background: #fafafa; cursor: pointer; }
  .form-select:focus { border-color: #63d2a6; }

  .ann-list { display: flex; flex-direction: column; gap: 14px; }

  .ann-card {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 14px;
    padding: 24px;
    border-left: 4px solid #63d2a6;
    transition: box-shadow 0.2s;
  }

  .ann-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
  .ann-card.targeted { border-left-color: #f59e0b; }
  .ann-card.group { border-left-color: #6366f1; }

  .ann-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .ann-title { font-size: 16px; font-weight: 600; color: #0f1117; }
  .ann-body { font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 14px; }

  .ann-meta { display: flex; gap: 10px; align-items: center; }
  .ann-date { font-size: 12px; color: #bbb; }

  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-yellow { background: #fffbeb; color: #d97706; }
  .badge-purple { background: #f5f3ff; color: #7c3aed; }

  .empty-state { padding: 60px; text-align: center; color: #bbb; background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .section-title { font-size: 15px; font-weight: 600; color: #0f1117; }
  .section-count { font-size: 12px; color: #aaa; background: #f4f6f3; padding: 3px 10px; border-radius: 20px; }
`

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([])
    const [form, setForm] = useState({ title: '', body: '', target_type: 'system_wide', target_id: '' })
    const [error, setError]   = useState('')
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
            await api.post('/admin/announcements', form)
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
        if (type === 'session')     return <span className="badge badge-yellow">Session</span>
        return <span className="badge badge-purple">Group</span>
    }

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div>
                            <div className="page-title">Announcements</div>
                            <div className="page-sub">Post updates to parents and staff</div>
                        </div>
                    </div>

                    {error   && <div className="error-box">⚠ {error}</div>}
                    {success && <div className="success-box">✓ {success}</div>}

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

                            <button className="btn btn-dark" style={{width:'100%'}} onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Posting...' : '📢 Post Announcement'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
