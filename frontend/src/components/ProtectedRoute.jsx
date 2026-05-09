import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps protected routes.
 *
 *   <ProtectedRoute roles={['admin']}>
 *       <AdminDashboard />
 *   </ProtectedRoute>
 *
 * Behaviour:
 *   - Not logged in            → /login
 *   - must_change_password set → /change-password (unless already there)
 *   - Wrong role               → redirected to their own dashboard
 *   - Otherwise                → renders children
 */
export default function ProtectedRoute({ children, roles }) {
    const { isAuthenticated, user, mustChangePassword } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Force password change before anything else
    if (mustChangePassword && location.pathname !== '/change-password') {
        return <Navigate to="/change-password" replace />
    }

    // Role gate
    if (roles && roles.length > 0 && !roles.includes(user?.role)) {
        const home =
            user?.role === 'admin'  ? '/admin/dashboard'  :
            user?.role === 'staff'  ? '/staff/dashboard'  :
            user?.role === 'parent' ? '/parent/dashboard' :
            '/login'
        return <Navigate to={home} replace />
    }

    return children
}