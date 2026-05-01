import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .dash-root {
    min-height: 100vh;
    background: #f4f6f3;
    font-family: 'DM Sans', sans-serif;
  }

  .dash-body { padding: 40px 48px; }

  .dash-header { margin-bottom: 36px; }

  .dash-greeting {
    font-family: 'DM Serif Display', serif;
    font-size: 36px;
    color: #0f1117;
    margin-bottom: 4px;
  }

  .dash-date {
    font-size: 14px;
    color: #888;
    font-weight: 300;
  }

  .dash-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 40px;
  }

  .stat-card {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    border: 1px solid #e8ebe6;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }

  .stat-card.green { background: #0f1117; border-color: #0f1117; }

  .stat-icon { font-size: 28px; margin-bottom: 16px; }

  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #aaa;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .stat-card.green .stat-label { color: rgba(255,255,255,0.4); }

  .stat-value {
    font-size: 36px;
    font-weight: 700;
    color: #0f1117;
    font-family: 'DM Serif Display', serif;
  }

  .stat-card.green .stat-value { color: #63d2a6; }

  .dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .dash-panel {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8ebe6;
    overflow: hidden;
  }

  .panel-header {
    padding: 20px 24px;
    border-bottom: 1px solid #f0f2ee;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f1117;
  }

  .panel-link {
    font-size: 12px;
    color: #63d2a6;
    text-decoration: none;
    font-weight: 600;
  }

  .panel-body { padding: 8px 0; }

  .panel-row {
    display: flex;
    align-items: center;
    padding: 14px 24px;
    border-bottom: 1px solid #f9faf8;
    gap: 14px;
  }

  .panel-row:last-child { border-bottom: none; }

  .row-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #63d2a6;
    flex-shrink: 0;
  }

  .row-dot.orange { background: #f59e0b; }
  .row-dot.red { background: #ef4444; }

  .row-name { font-size: 14px; color: #0f1117; flex: 1; }
  .row-meta { font-size: 12px; color: #aaa; }

  .row-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
  }

  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-orange { background: #fffbeb; color: #d97706; }
  .badge-red { background: #fef2f2; color: #dc2626; }

  .dash-quicklinks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .quick-btn {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 12px;
    padding: 16px 20px;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
    display: block;
    transition: all 0.15s;
  }

  .quick-btn:hover { border-color: #63d2a6; background: #f0fdf8; }

  .quick-btn-icon { font-size: 20px; margin-bottom: 8px; }
  .quick-btn-label { font-size: 13px; font-weight: 600; color: #0f1117; }
  .quick-btn-sub { font-size: 11px; color: #aaa; margin-top: 2px; }

  .loading { padding: 60px; text-align: center; color: #aaa; font-size: 14px; }
`

export default function AdminDashboard() {
    const [stats, setStats]       = useState({ sessions: 0, staff: 0, payments: 0 })
    const [sessions, setSessions] = useState([])
    const [staffList, setStaff]   = useState([])
    const [loading, setLoading]   = useState(true)

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

    useEffect(() => {
        Promise.all([
            api.get('/admin/sessions'),
            api.get('/admin/staff'),
            api.get('/admin/payments'),
        ]).then(([s, st, p]) => {
            setSessions(s.data.data || [])
            setStaff(st.data.data || [])
            setStats({
                sessions: s.data.data?.length || 0,
                staff:    st.data.data?.length || 0,
                payments: p.data.data?.length || 0,
            })
        }).catch(() => {}).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <>
            <style>{styles}</style>
            <div className="dash-root">
                <Navbar />
                <div className="loading">Loading dashboard...</div>
            </div>
        </>
    )

    return (
        <>
            <style>{styles}</style>
            <div className="dash-root">
                <Navbar />
                <div className="dash-body">
                    <div className="dash-header">
                        <div className="dash-greeting">{greeting}, {user.full_name?.split(' ')[0] || 'Admin'} 👋</div>
                        <div className="dash-date">{dateStr}</div>
                    </div>

                    <div className="dash-stats">
                        <div className="stat-card green">
                            <div className="stat-icon">⛺</div>
                            <div className="stat-label">Sessions</div>
                            <div className="stat-value">{stats.sessions}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-label">Staff Members</div>
                            <div className="stat-value">{stats.staff}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">💳</div>
                            <div className="stat-label">Payments</div>
                            <div className="stat-value">{stats.payments}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📋</div>
                            <div className="stat-label">Active Groups</div>
                            <div className="stat-value">—</div>
                        </div>
                    </div>

                    <div className="dash-quicklinks">
                        <a href="/admin/sessions" className="quick-btn">
                            <div className="quick-btn-icon">➕</div>
                            <div className="quick-btn-label">New Session</div>
                            <div className="quick-btn-sub">Create a camp session</div>
                        </a>
                        <a href="/admin/staff" className="quick-btn">
                            <div className="quick-btn-icon">👤</div>
                            <div className="quick-btn-label">Add Staff</div>
                            <div className="quick-btn-sub">Create a staff account</div>
                        </a>
                        <a href="/admin/announcements" className="quick-btn">
                            <div className="quick-btn-icon">📢</div>
                            <div className="quick-btn-label">Post Announcement</div>
                            <div className="quick-btn-sub">Notify parents or staff</div>
                        </a>
                    </div>

                    <div className="dash-grid">
                        <div className="dash-panel">
                            <div className="panel-header">
                                <div className="panel-title">Recent Sessions</div>
                                <a href="/admin/sessions" className="panel-link">View all →</a>
                            </div>
                            <div className="panel-body">
                                {sessions.slice(0, 5).map(s => (
                                    <div key={s.id} className="panel-row">
                                        <div className="row-dot"></div>
                                        <div className="row-name">{s.name}</div>
                                        <div className="row-meta">{s.start_date}</div>
                                    </div>
                                ))}
                                {sessions.length === 0 && <div style={{padding:'24px', color:'#aaa', fontSize:'13px'}}>No sessions yet</div>}
                            </div>
                        </div>

                        <div className="dash-panel">
                            <div className="panel-header">
                                <div className="panel-title">Staff Accounts</div>
                                <a href="/admin/staff" className="panel-link">View all →</a>
                            </div>
                            <div className="panel-body">
                                {staffList.slice(0, 5).map(s => (
                                    <div key={s.id} className="panel-row">
                                        <div className={`row-dot ${s.account_status === 'deactivated' ? 'red' : ''}`}></div>
                                        <div className="row-name">{s.full_name}</div>
                                        <span className={`row-badge ${s.account_status === 'active' ? 'badge-green' : 'badge-red'}`}>
                                            {s.account_status}
                                        </span>
                                    </div>
                                ))}
                                {staffList.length === 0 && <div style={{padding:'24px', color:'#aaa', fontSize:'13px'}}>No staff yet</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
