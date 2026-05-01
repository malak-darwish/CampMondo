import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ParentDashboard from './pages/parents/ParentDashboard';
import RegisterCamper from './pages/parents/RegisterCamper';
import Payments from './pages/parents/Payments';
import Announcements from './pages/parents/Announcements';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/parent" element={<ProtectedRoute allowedRoles={["parent"]}><ParentDashboard /></ProtectedRoute>} />
      <Route path="/parent/register-camper" element={<ProtectedRoute allowedRoles={["parent"]}><RegisterCamper /></ProtectedRoute>} />
      <Route path="/parent/payments" element={<ProtectedRoute allowedRoles={["parent"]}><Payments /></ProtectedRoute>} />
      <Route path="/parent/announcements" element={<ProtectedRoute allowedRoles={["parent"]}><Announcements /></ProtectedRoute>} />
    </Routes>
  );
}
