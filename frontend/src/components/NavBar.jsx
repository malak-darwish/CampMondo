import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {

    const { user, logout } = useAuth()
    const location = useLocation()

    const navLinks = [

        {
            name: 'Dashboard',
            path: '/staff/dashboard'
        },

        {
            name: 'Attendance',
            path: '/staff/attendance'
        },

        {
            name: 'Incidents',
            path: '/staff/incidents'
        },

        {
            name: 'Activity Log',
            path: '/staff/activity-log'
        }

    ]

    return (

        <nav style={styles.navbar}>

            {/* LEFT SIDE */}
            <div style={styles.leftSection}>

                <Link
                    to='/staff/dashboard'
                    style={styles.logo}
                >
                    Camp<span style={styles.logoAccent}>Mondo</span>
                </Link>

                <div style={styles.linksContainer}>

                    {
                        navLinks.map((link) => (

                            <Link
                                key={link.path}
                                to={link.path}
                                style={{
                                    ...styles.link,
                                    ...(location.pathname === link.path
                                        ? styles.activeLink
                                        : {})
                                }}
                            >
                                {link.name}
                            </Link>

                        ))
                    }

                </div>

            </div>

            {/* RIGHT SIDE */}
            <div style={styles.rightSection}>

                <div style={styles.userInfo}>

                    <div style={styles.avatar}>
                        {user?.username?.charAt(0)?.toUpperCase() || 'S'}
                    </div>

                    <div>

                        <div style={styles.username}>
                            {user?.username || 'Staff User'}
                        </div>

                        <div style={styles.role}>
                            STAFF
                        </div>

                    </div>

                </div>

                <button
                    onClick={logout}
                    style={styles.logoutBtn}
                >
                    Logout
                </button>

            </div>

        </nav>
    )
}

export default Navbar


const styles = {

    navbar: {
        height: '78px',
        background: '#234b27',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        boxSizing: 'border-box'
    },

    leftSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '50px'
    },

    logo: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#fff',
        textDecoration: 'none'
    },

    logoAccent: {
        color: '#d8a43a'
    },

    linksContainer: {
        display: 'flex',
        gap: '12px'
    },

    link: {
        padding: '12px 18px',
        borderRadius: '10px',
        textDecoration: 'none',
        color: '#cfd8cf',
        fontWeight: '600',
        transition: '0.2s'
    },

    activeLink: {
        background: 'rgba(216,164,58,0.15)',
        color: '#f0b43c'
    },

    rightSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
    },

    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },

    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#f0b43c',
        color: '#111',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700'
    },

    username: {
        color: '#fff',
        fontWeight: '600',
        fontSize: '16px'
    },

    role: {
        color: '#cfd8cf',
        fontSize: '12px',
        letterSpacing: '1px'
    },

    logoutBtn: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '10px 18px',
        borderRadius: '10px',
        cursor: 'pointer',
        fontWeight: '600'
    }

}