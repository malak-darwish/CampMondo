import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageSessions from './pages/admin/ManageSessions'
import ManageGroups from './pages/admin/ManageGroups'
import ManageStaff from './pages/admin/ManageStaff'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import Reports from './pages/admin/Reports'

// Shared
import Login from './pages/Login'

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default route */}
                <Route path='/' element={<Navigate to='/login' />} />

                {/* Auth */}
                <Route path='/login' element={<Login />} />

                {/* Admin routes */}
                <Route path='/admin/dashboard'      element={<AdminDashboard />} />
                <Route path='/admin/sessions'        element={<ManageSessions />} />
                <Route path='/admin/groups'          element={<ManageGroups />} />
                <Route path='/admin/staff'           element={<ManageStaff />} />
                <Route path='/admin/announcements'   element={<AdminAnnouncements />} />
                <Route path='/admin/reports'         element={<Reports />} />
            </Routes>
        </BrowserRouter>
    )
}