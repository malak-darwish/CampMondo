import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .dash-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .dash-body { padding: 40px 48px; }

  .dash-header { margin-bottom: 36px; }

  .dash-greeting {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 4px;
  }

  .dash-date {
    font-size: 13px;
    color: #8a7a65;
    font-weight: 400;
  }

  .dash-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: #fff9f0;
    border-radius: 14px;
    padding: 24px;
    border: 1px solid #e8d5b5;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(44,24,16,0.08); }

  .stat-card.featured { background: #2c4a2e; border-color: #2c4a2e; }

  .stat-icon { font-size: 24px; margin-bottom: 14px; }

  .stat-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #a08c72;
    margin-bottom: 6px;
    font-weight: 600;
  }

  .stat-card.featured .stat-label { color: rgba(255,255,255,0.35); }

  .stat-value {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    font-weight: 700;
    color: #2c1810;
  }

  .stat-card.featured .stat-value { color: #e8a838; }

  .dash-quicklinks {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }

  .quick-btn {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 16px 20px;
    text-align: left;
    cursor: pointer;
    text-decoration: none;
    display: block;
    transition: all 0.15s;
  }

  .quick-btn:hover { border-color: #3d6b45; background: #f0f7f1; }

  .quick-btn-icon { font-size: 20px; margin-bottom: 8px; }
  .quick-btn-label { font-size: 13px; font-weight: 600; color: #2c1810; }
  .quick-btn-sub { font-size: 11px; color: #a08c72; margin-top: 2px; }

  .dash-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .dash-panel {
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
  }

  .panel-body { padding: 6px 0; }

  .panel-row {
    display: flex;
    align-items: center;
    padding: 12px 22px;
    border-bottom: 1px solid #f8f4ee;
    gap: 12px;
  }

  .panel-row:last-child { border-bottom: none; }

  .row-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #3d6b45;
    flex-shrink: 0;
  }

  .row-dot.amber { background: #e8a838; }
  .row-dot.red { background: #c62828; }

  .row-name { font-size: 13px; color: #2c1810; flex: 1; }
  .row-meta { font-size: 12px; color: #a08c72; }

  .row-badge {
    padding: 2px 9px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 600;
  }

  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-red { background: #fdecea; color: #c62828; }

  .empty-note {
    padding: 24px;
    color: #a08c72;
    font-size: 13px;
  }

  .loading {
    padding: 60px;
    text-align: center;
    color: #a08c72;
    font-size: 14px;
  }
`

export default function AdminDashboard() {
    const [stats, setStats]       = useState({ sessions: 0, staff: 0, payments: 0 })
    const [sessions, setSessions] = useState([])
    const [staffList, setStaff]   = useState([])
    const [loading, setLoading]   = useState(true)

    const user     = JSON.parse(localStorage.getItem('user') || '{}')
    const hour     = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
    const dateStr  = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

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
                        <div className="stat-card featured">
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
                                {sessions.length === 0
                                    ? <div className="empty-note">No sessions yet</div>
                                    : sessions.slice(0, 5).map(s => (
                                        <div key={s.id} className="panel-row">
                                            <div className="row-dot"></div>
                                            <div className="row-name">{s.name}</div>
                                            <div className="row-meta">{s.start_date}</div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>

                        <div className="dash-panel">
                            <div className="panel-header">
                                <div className="panel-title">Staff Accounts</div>
                                <a href="/admin/staff" className="panel-link">View all →</a>
                            </div>
                            <div className="panel-body">
                                {staffList.length === 0
                                    ? <div className="empty-note">No staff yet</div>
                                    : staffList.slice(0, 5).map(s => (
                                        <div key={s.id} className="panel-row">
                                            <div className={`row-dot ${!s.is_active ? 'red' : ''}`}></div>
                                            <div className="row-name">{s.full_name}</div>
                                            <span className={`row-badge ${s.is_active ? 'badge-green' : 'badge-red'}`}>
                                                {s.is_active ? 'active' : 'deactivated'}
                                            </span>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}