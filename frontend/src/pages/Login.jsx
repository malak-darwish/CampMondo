import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.ok) return setError(result.message);
    if (result.user.role === 'parent') navigate('/parent');
    else if (result.user.role === 'staff') navigate('/staff');
    else if (result.user.role === 'admin') navigate('/admin');
  }

  return (
    <main style={{ maxWidth: 420, margin: '80px auto', fontFamily: 'Arial' }}>
      <h1>CampMondo Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 10, marginBottom: 12 }} />
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button disabled={loading} style={{ padding: 10, width: '100%' }}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
    </main>
  );
}
