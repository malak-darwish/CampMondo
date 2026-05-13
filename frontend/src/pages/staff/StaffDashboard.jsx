import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .staff-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .staff-body {
    padding: 40px 48px;
  }

  .staff-header {
    margin-bottom: 36px;
  }

  .staff-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 6px;
  }

  .staff-subtitle {
    font-size: 14px;
    color: #8a7a65;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-bottom: 32px;
  }

  .stat-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 16px;
    padding: 24px;
    transition: 0.2s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(44,24,16,0.08);
  }

  .stat-label {
    font-size: 13px;
    color: #8a7a65;
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .stat-value {
    font-size: 34px;
    font-weight: 700;
    color: #2c1810;
  }

  .staff-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    margin-bottom: 28px;
  }

  .staff-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 16px;
    padding: 28px;
    text-decoration: none;
    transition: all 0.2s;
    color: inherit;
  }

  .staff-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(44,24,16,0.08);
    border-color: #3d6b45;
    background: #f0f7f1;
  }

  .staff-icon {
    font-size: 34px;
    margin-bottom: 18px;
  }

  .staff-card-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 8px;
  }

  .staff-card-text {
    font-size: 13px;
    color: #8a7a65;
    line-height: 1.6;
  }

  .activity-feed {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 16px;
    padding: 24px;
  }

  .feed-title {
    font-size: 20px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 18px;
  }

  .feed-item {
    padding: 14px 0;
    border-top: 1px solid #f0e6d8;
  }

  .feed-item:first-child {
    border-top: none;
    padding-top: 0;
  }

  .feed-message {
    font-size: 14px;
    color: #2c1810;
    margin-bottom: 4px;
  }

  .feed-time {
    font-size: 12px;
    color: #8a7a65;
  }

  .empty-feed {
    color: #8a7a65;
    font-size: 13px;
  }

  @media(max-width: 1100px) {

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .staff-grid {
      grid-template-columns: 1fr;
    }
  }

  @media(max-width: 700px) {

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .staff-body {
      padding: 28px 20px;
    }
  }
`

export default function StaffDashboard() {

    const user = JSON.parse(
        localStorage.getItem('user') || '{}'
    )

    const [stats, setStats] = useState(null)

    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {

        fetchStats()
        fetchRecentActivity()

    }, [])

    const fetchStats = async () => {

        try {

            const res = await api.get('/staff/dashboard-stats')

            const data = res.data

            setStats(data.data)

        } catch {

            console.log('Dashboard stats API error')

        }
    }

    const fetchRecentActivity = async () => {

        try {

            const res = await api.get('/staff/recent-activity')

            const data = res.data

            setRecentActivity(data.data || [])

        } catch {

            console.log('Recent activity API error')

        }
    }

    return (
        <>
            <style>{styles}</style>

            <div className="staff-root">

                <Navbar />

                <div className="staff-body">

                    <div className="staff-header">

                        <div className="staff-title">
                            Welcome back, {user.full_name?.split(' ')[0] || 'Staff'} 👋
                        </div>

                        <div className="staff-subtitle">
                            Manage attendance, incidents, and activity logs.
                        </div>

                    </div>

                    <div className="stats-grid">

                        <div className="stat-card">

                            <div className="stat-label">
                                Total Campers
                            </div>

                            <div className="stat-value">
                                {stats
                                    ? stats.total_campers
                                    : '—'}
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-label">
                                Present Today
                            </div>

                            <div className="stat-value">
                                {stats
                                    ? stats.present_today
                                    : '—'}
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-label">
                                Incidents Logged
                            </div>

                            <div className="stat-value">
                                {stats
                                    ? stats.total_incidents
                                    : '—'}
                            </div>

                        </div>

                        <div className="stat-card">

                            <div className="stat-label">
                                Activities Logged
                            </div>

                            <div className="stat-value">
                                {stats
                                    ? stats.total_activities
                                    : '—'}
                            </div>

                        </div>

                    </div>

                    <div className="staff-grid">

                        <a
                            href="/staff/attendance"
                            className="staff-card"
                        >

                            <div className="staff-icon">
                                📋
                            </div>

                            <div className="staff-card-title">
                                Attendance
                            </div>

                            <div className="staff-card-text">
                                Track camper attendance,
                                check-ins, and check-outs.
                            </div>

                        </a>

                        <a
                            href="/staff/activity-log"
                            className="staff-card"
                        >

                            <div className="staff-icon">
                                📝
                            </div>

                            <div className="staff-card-title">
                                Activity Logs
                            </div>

                            <div className="staff-card-text">
                                Record camp activities and
                                daily events professionally.
                            </div>

                        </a>

                        <a
                            href="/staff/incidents"
                            className="staff-card"
                        >

                            <div className="staff-icon">
                                ⚠️
                            </div>

                            <div className="staff-card-title">
                                Incident Reports
                            </div>

                            <div className="staff-card-text">
                                Submit and monitor incidents
                                and safety issues.
                            </div>

                        </a>

                    </div>

                    <div className="activity-feed">

                        <div className="feed-title">
                            Recent System Activity
                        </div>

                        {!recentActivity.length ? (

                            <div className="empty-feed">
                                No recent activity.
                            </div>

                        ) : (

                            recentActivity.map((item, index) => (

                                <div
                                    className="feed-item"
                                    key={index}
                                >

                                    <div className="feed-message">
                                        {item.message}
                                    </div>

                                    <div className="feed-time">
                                        {new Date(item.time)
                                            .toLocaleString()}
                                    </div>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            </div>
        </>
    )
}