import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get('/parent/dashboard').then((res) => setDashboard(res.data.data));
  }, []);

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', fontFamily: 'Arial' }}>
      <h1>Parent Dashboard</h1>
      <p>Welcome, {user?.full_name}</p>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Link to="/parent/register-camper">Register Camper</Link>
        <Link to="/parent/payments">Payments</Link>
        <Link to="/parent/announcements">Announcements</Link>
        <button onClick={logout}>Logout</button>
      </nav>
      <section>
        <h2>Your campers</h2>
        {!dashboard?.campers?.length && <p>No campers registered yet.</p>}
        {dashboard?.campers?.map((camper) => (
          <div key={camper.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 8 }}>
            <strong>{camper.full_name}</strong>
            <p>DOB: {camper.date_of_birth}</p>
            <p>Emergency: {camper.emergency_contact_name} - {camper.emergency_contact_phone}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
