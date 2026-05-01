import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function RegisterCamper() {
  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', gender: '', emergency_contact_name: '', emergency_contact_phone: '', medical_alerts: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await api.post('/parent/campers', form);
      setMessage(res.data.message);
      setForm({ full_name: '', date_of_birth: '', gender: '', emergency_contact_name: '', emergency_contact_phone: '', medical_alerts: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create camper');
    }
  }

  return (
    <main style={{ maxWidth: 700, margin: '30px auto', fontFamily: 'Arial' }}>
      <Link to="/parent">Back</Link>
      <h1>Register Camper</h1>
      <form onSubmit={submit}>
        {Object.keys(form).map((field) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label>{field.replaceAll('_', ' ')}</label>
            <input type={field === 'date_of_birth' ? 'date' : 'text'} value={form[field]} onChange={(e) => update(field, e.target.value)} style={{ display: 'block', width: '100%', padding: 10 }} />
          </div>
        ))}
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button style={{ padding: 10 }}>Create Camper</button>
      </form>
    </main>
  );
}
