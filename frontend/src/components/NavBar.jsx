import { useState } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  .navbar {
    min-height: 62px;
    background: #2c4a2e;
    display: flex;
    align-items: center;
    padding: 0 36px;
    justify-content: space-between;
    gap: 18px;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .navbar-brand {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #fff;
    text-decoration: none;
    letter-spacing: -0.3px;
  }

  .navbar-brand span { color: #e8a838; }

  .navbar-links {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 2px;
    list-style: none;
    min-width: 0;
  }

  .navbar-links a {
    display: block;
    padding: 7px 13px;
    border-radius: 7px;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .navbar-links a:hover { color: #fff; background: rgba(255,255,255,0.07); }
  .navbar-links a.active { color: #e8a838; background: rgba(232,168,56,0.12); }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 5px 10px;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .navbar-user:hover { background: rgba(255,255,255,0.06); }

  .navbar-avatar {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: #e8a838;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #2c1810;
    font-family: 'Inter', sans-serif;
    flex-shrink: 0;
  }

  .navbar-username {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    font-family: 'Inter', sans-serif;
  }

  .navbar-role {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .navbar-logout {
    padding: 7px 14px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 7px;
    color: rgba(255,255,255,0.55);
    font-size: 12px;
    font-family: 'Inter', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .navbar-logout:hover { background: rgba(220,60,60,0.15); border-color: rgba(220,60,60,0.3); color: #ff7070; }

  @media (max-width: 980px) {
    .navbar {
      align-items: flex-start;
      flex-direction: column;
      padding: 14px 20px;
    }

    .navbar-links {
      justify-content: flex-start;
    }

    .navbar-right {
      width: 100%;
      justify-content: space-between;
    }
  }
`

const adminLinks = [
    { href: '/admin/dashboard',     label: 'Dashboard' },
    { href: '/admin/sessions',      label: 'Sessions' },
    { href: '/admin/groups',        label: 'Groups' },
    { href: '/admin/staff',         label: 'Staff' },
    { href: '/admin/announcements', label: 'Announcements' },
    { href: '/admin/reports',       label: 'Reports' },
    { href: '/admin/assistant', label: 'AI Assistant' },
]

const staffLinks = [
    { href: '/staff/dashboard',  label: 'Dashboard' },
    { href: '/staff/attendance', label: 'Attendance' },
    { href: '/staff/incidents',  label: 'Incidents' },
    { href: '/staff/activity-log', label: 'Activity Log' },
    { href: '/staff/announcements', label: 'Announcements' },
]

const parentLinks = [
    { href: '/parent/dashboard',     label: 'Dashboard' },
    { href: '/parent/sessions',      label: 'Sessions' },
    { href: '/parent/register',      label: 'Register Camper' },
    { href: '/parent/payments',      label: 'Payments' },
    { href: '/parent/announcements', label: 'Announcements' },
]

export default function Navbar() {
    const user    = JSON.parse(localStorage.getItem('user') || '{}')
    const role    = user.role || 'admin'
    const current = window.location.pathname
    const links   = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : parentLinks
    const initials = (user.full_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    return (
        <>
            <style>{styles}</style>
            <nav className="navbar">
                <a href={`/${role}/dashboard`} className="navbar-brand">
                    Camp<span>Mondo</span>
                </a>
                <ul className="navbar-links">
                    {links.map(link => (
                        <li key={link.href}>
                            <a href={link.href} className={current === link.href ? 'active' : ''}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="navbar-right">
                    <div className="navbar-user">
                        <div className="navbar-avatar">{initials}</div>
                        <div>
                            <div className="navbar-username">{user.full_name || 'Admin'}</div>
                            <div className="navbar-role">{role}</div>
                        </div>
                    </div>
                    <button className="navbar-logout" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </>
    )
}
