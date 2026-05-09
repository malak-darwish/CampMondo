import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageSessions from './pages/admin/ManageSessions'
import ManageGroups from './pages/admin/ManageGroups'
import ManageStaff from './pages/admin/ManageStaff'
import AdminAnnouncements from './pages/admin/AdminAnnouncements'
import Reports from './pages/admin/Reports'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Default route */}
                    <Route path='/' element={<Navigate to='/login' replace />} />

                    {/* Public auth routes */}
                    <Route path='/login'           element={<Login />} />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route path='/reset-password'  element={<ResetPassword />} />

                    {/* Change-password is auth-required but role-agnostic.
                        ProtectedRoute will route the user here automatically when
                        must_change_password is true. */}
                    <Route
                        path='/change-password'
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin routes — guarded */}
                    <Route path='/admin/dashboard' element={
                        <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
                    } />
                    <Route path='/admin/sessions' element={
                        <ProtectedRoute roles={['admin']}><ManageSessions /></ProtectedRoute>
                    } />
                    <Route path='/admin/groups' element={
                        <ProtectedRoute roles={['admin']}><ManageGroups /></ProtectedRoute>
                    } />
                    <Route path='/admin/staff' element={
                        <ProtectedRoute roles={['admin']}><ManageStaff /></ProtectedRoute>
                    } />
                    <Route path='/admin/announcements' element={
                        <ProtectedRoute roles={['admin']}><AdminAnnouncements /></ProtectedRoute>
                    } />
                    <Route path='/admin/reports' element={
                        <ProtectedRoute roles={['admin']}><Reports /></ProtectedRoute>
                    } />

                    {/* Catch-all */}
                    <Route path='*' element={<Navigate to='/login' replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}