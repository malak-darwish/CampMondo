import { useState } from 'react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');

  .navbar {
    height: 64px;
    background: #0f1117;
    display: flex;
    align-items: center;
    padding: 0 32px;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .navbar-brand {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: #fff;
    text-decoration: none;
    letter-spacing: -0.5px;
  }

  .navbar-brand span { color: #63d2a6; }

  .navbar-links {
    display: flex;
    align-items: center;
    gap: 4px;
    list-style: none;
  }

  .navbar-links a {
    display: block;
    padding: 8px 14px;
    border-radius: 8px;
    color: rgba(255,255,255,0.5);
    text-decoration: none;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
  }

  .navbar-links a:hover { color: #fff; background: rgba(255,255,255,0.06); }
  .navbar-links a.active { color: #63d2a6; background: rgba(99,210,166,0.08); }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .navbar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 8px;
    transition: background 0.15s;
  }

  .navbar-user:hover { background: rgba(255,255,255,0.06); }

  .navbar-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: #63d2a6;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: #0f1117;
    font-family: 'DM Sans', sans-serif;
  }

  .navbar-username {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255,255,255,0.7);
    font-family: 'DM Sans', sans-serif;
  }

  .navbar-role {
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    font-family: 'DM Sans', sans-serif;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .navbar-logout {
    padding: 8px 16px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: all 0.15s;
  }

  .navbar-logout:hover { background: rgba(255,80,80,0.15); border-color: rgba(255,80,80,0.3); color: #ff6b6b; }
`

const adminLinks = [
    { href: '/admin/dashboard',    label: 'Dashboard' },
    { href: '/admin/sessions',     label: 'Sessions' },
    { href: '/admin/groups',       label: 'Groups' },
    { href: '/admin/staff',        label: 'Staff' },
    { href: '/admin/announcements',label: 'Announcements' },
    { href: '/admin/reports',      label: 'Reports' },
]

const staffLinks = [
    { href: '/staff/dashboard',  label: 'Dashboard' },
    { href: '/staff/attendance', label: 'Attendance' },
    { href: '/staff/incidents',  label: 'Incidents' },
    { href: '/staff/activity',   label: 'Activity Log' },
]

const parentLinks = [
    { href: '/parent/dashboard',  label: 'Dashboard' },
    { href: '/parent/register',   label: 'Register Camper' },
    { href: '/parent/payments',   label: 'Payments' },
    { href: '/parent/announcements', label: 'Announcements' },
]

export default function Navbar() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const role = user.role || 'admin'
    const current = window.location.pathname

    const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : parentLinks

    const initials = (user.full_name || 'A')
        .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

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
                            <a
                                href={link.href}
                                className={current === link.href ? 'active' : ''}
                            >
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
