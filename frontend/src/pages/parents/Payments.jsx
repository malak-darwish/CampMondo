import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Payments() {
  const [campers, setCampers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ camper_id: '', amount: '', card_number: '', expiry_date: '', cvv: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    const [campersRes, paymentsRes] = await Promise.all([api.get('/parent/campers'), api.get('/parent/payments')]);
    setCampers(campersRes.data.data);
    setPayments(paymentsRes.data.data);
  }

  useEffect(() => { load(); }, []);

  function update(field, value) { setForm((prev) => ({ ...prev, [field]: value })); }

  async function submit(e) {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      const res = await api.post('/parent/payments', form);
      setMessage(res.data.message);
      setForm({ camper_id: '', amount: '', card_number: '', expiry_date: '', cvv: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Payment failed'); }
  }

  return (
    <main style={{ maxWidth: 900, margin: '30px auto', fontFamily: 'Arial' }}>
      <Link to="/parent">Back</Link>
      <h1>Payments</h1>
      <form onSubmit={submit} style={{ marginBottom: 30 }}>
        <select value={form.camper_id} onChange={(e) => update('camper_id', e.target.value)} style={{ padding: 10, width: '100%', marginBottom: 10 }}>
          <option value="">Select camper</option>
          {campers.map((c) => <option key={c.id} value={c.id}>{c.full_name}</option>)}
        </select>
        <input placeholder="Amount" value={form.amount} onChange={(e) => update('amount', e.target.value)} style={{ padding: 10, width: '100%', marginBottom: 10 }} />
        <input placeholder="Card number" value={form.card_number} onChange={(e) => update('card_number', e.target.value)} style={{ padding: 10, width: '100%', marginBottom: 10 }} />
        <input placeholder="Expiry date MM/YY" value={form.expiry_date} onChange={(e) => update('expiry_date', e.target.value)} style={{ padding: 10, width: '100%', marginBottom: 10 }} />
        <input placeholder="CVV" value={form.cvv} onChange={(e) => update('cvv', e.target.value)} style={{ padding: 10, width: '100%', marginBottom: 10 }} />
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button style={{ padding: 10 }}>Submit Payment</button>
      </form>
      <h2>Payment history</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead><tr><th>Camper</th><th>Amount</th><th>Status</th><th>Date</th><th>Card</th></tr></thead>
        <tbody>{payments.map((p) => <tr key={p.id}><td>{p.camper_name}</td><td>${p.amount}</td><td>{p.status}</td><td>{p.payment_date}</td><td>**** {p.card_last4}</td></tr>)}</tbody>
      </table>
    </main>
  );
}
