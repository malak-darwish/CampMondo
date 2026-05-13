import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Announcements() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get('/parent/announcements').then((res) => setItems(res.data.data)); }, []);
  return (
    <main style={{ maxWidth: 800, margin: '30px auto', fontFamily: 'Arial' }}>
      <Link to="/parent">Back</Link>
      <h1>Announcements</h1>
      {items.map((item) => <article key={item.id} style={{ border: '1px solid #ddd', padding: 12, marginBottom: 10 }}><h2>{item.title}</h2><p>{item.body}</p></article>)}
    </main>
  );
}
