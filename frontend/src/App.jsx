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
import AIAssistant from './pages/admin/AIAssistant'

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard'
import Attendance from './pages/staff/Attendance'
import ActivityLog from './pages/staff/ActivityLog'
import IncidentReport from './pages/staff/IncidentReport'

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* Default route */}
                    <Route
                        path='/'
                        element={<Navigate to='/login' replace />}
                    />

                    {/* Public auth routes */}
                    <Route
                        path='/login'
                        element={<Login />}
                    />

                    <Route
                        path='/forgot-password'
                        element={<ForgotPassword />}
                    />

                    <Route
                        path='/reset-password'
                        element={<ResetPassword />}
                    />

                    {/* Change Password */}
                    <Route
                        path='/change-password'
                        element={
                            <ProtectedRoute>
                                <ChangePassword />
                            </ProtectedRoute>
                        }
                    />

                    {/* ================= ADMIN ROUTES ================= */}

                    <Route
                        path='/admin/dashboard'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/sessions'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <ManageSessions />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/groups'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <ManageGroups />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/staff'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <ManageStaff />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/announcements'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminAnnouncements />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/reports'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <Reports />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/admin/assistant'
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <AIAssistant />
                            </ProtectedRoute>
                        }
                    />

                    {/* ================= STAFF ROUTES ================= */}

                    <Route
                        path='/staff/dashboard'
                        element={
                            <ProtectedRoute roles={['staff']}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/staff/attendance'
                        element={
                            <ProtectedRoute roles={['staff']}>
                                <Attendance />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/staff/activity-log'
                        element={
                            <ProtectedRoute roles={['staff']}>
                                <ActivityLog />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path='/staff/incidents'
                        element={
                            <ProtectedRoute roles={['staff']}>
                                <IncidentReport />
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all */}
                    <Route
                        path='*'
                        element={<Navigate to='/login' replace />}
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}