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
    grid-template-columns: 1fr 1fr 1fr;
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
    .camper-row { grid-template-columns: 1fr; }
  }
`

export default function ParentDashboard() {
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const firstName = user?.full_name?.split(' ')[0] || 'Parent'
    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    })

    useEffect(() => {
        api.get('/parent/dashboard')
            .then((res) => setDashboard(res.data.data))
            .catch((err) => setError(err.response?.data?.message || 'Could not load parent dashboard'))
            .finally(() => setLoading(false))
    }, [])

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

                    {error && <div className="error-state">{error}</div>}

                    {!error && (
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
                                            </div>
                                            <div className="camper-meta">Gender: {camper.gender || 'Not set'}</div>
                                            <div className="camper-meta">
                                                Emergency: {camper.emergency_contact_name} - {camper.emergency_contact_phone}
                                            </div>
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
