import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Attendance from "./pages/staff/Attendance";

function App() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>

      <Route path="/login" element={<Login />} />

      <Route
        path="/staff"
        element={
          isAuthenticated && user?.role === "staff"
            ? <Attendance />
            : <Navigate to="/login" />
        }
      />

      <Route path="*" element={<Navigate to="/login" />} />

    </Routes>
  );
}

export default App;