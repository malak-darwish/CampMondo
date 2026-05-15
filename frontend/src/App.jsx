import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Auth pages
import Login from './pages/Login'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

// Parent pages
import ParentDashboard from './pages/parents/ParentDashboard'
import Sessions from './pages/parents/Sessions'
import RegisterCamper from './pages/parents/RegisterCamper'
import Payments from './pages/parents/Payments'
import Announcements from './pages/parents/Announcements'

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
import IncidentReport from './pages/staff/IncidentReport'
import ActivityLog from './pages/staff/ActivityLog'
import StaffAnnouncements from './pages/staff/StaffAnnouncements'

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
                    <Route path='/admin/assistant' element={
                        <ProtectedRoute roles={['admin']}>
                            <AIAssistant />
                        </ProtectedRoute>
                    } />

                    {/* Staff routes - guarded */}
                    <Route path='/staff/dashboard' element={
                        <ProtectedRoute roles={['staff']}><StaffDashboard /></ProtectedRoute>
                    } />
                    <Route path='/staff/attendance' element={
                        <ProtectedRoute roles={['staff']}><Attendance /></ProtectedRoute>
                    } />
                    <Route path='/staff/incidents' element={
                        <ProtectedRoute roles={['staff']}><IncidentReport /></ProtectedRoute>
                    } />
                    <Route path='/staff/activity-log' element={
                        <ProtectedRoute roles={['staff']}><ActivityLog /></ProtectedRoute>
                    } />
                    <Route path='/staff/activity' element={
                        <Navigate to='/staff/activity-log' replace />
                    } />
                     <Route path='/staff/announcements' element={
                        <ProtectedRoute roles={['staff']}>
                            <StaffAnnouncements />
                        </ProtectedRoute>
                    } />   
                    {/* Parent routes - guarded */}
                    <Route path='/parent' element={
                        <ProtectedRoute roles={['parent']}><Navigate to='/parent/dashboard' replace /></ProtectedRoute>
                    } />
                    <Route path='/parent/dashboard' element={
                        <ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>
                    } />
                    <Route path='/parent/sessions' element={
                        <ProtectedRoute roles={['parent']}><Sessions /></ProtectedRoute>
                    } />
                    <Route path='/parent/register-camper' element={
                        <ProtectedRoute roles={['parent']}><RegisterCamper /></ProtectedRoute>
                    } />
                    <Route path='/parent/register' element={
                        <ProtectedRoute roles={['parent']}><RegisterCamper /></ProtectedRoute>
                    } />
                    <Route path='/parent/payments' element={
                        <ProtectedRoute roles={['parent']}><Payments /></ProtectedRoute>
                    } />
                    <Route path='/parent/announcements' element={
                        <ProtectedRoute roles={['parent']}><Announcements /></ProtectedRoute>
                    } />

                    {/* Catch-all */}
                    <Route path='*' element={<Navigate to='/login' replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
