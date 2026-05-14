import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .page-root {
    min-height: 100vh;
    background: #f5f0e8;
    font-family: 'Inter', sans-serif;
  }

  .page-body {
    width: min(900px, calc(100% - 48px));
    margin: 0 auto;
    padding: 40px 0;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 34px;
    color: #2c1810;
    margin-bottom: 6px;
  }

  .page-subtitle {
    color: #8a7a65;
    font-size: 14px;
    margin-bottom: 28px;
  }

  .announcement-list {
    display: grid;
    gap: 14px;
  }

  .announcement-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    padding: 22px;
  }

  .announcement-title {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 8px;
  }

  .announcement-body {
    color: #6f604d;
    font-size: 14px;
    line-height: 1.6;
  }

  .empty-state,
  .loading,
  .error-state {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    padding: 26px;
    color: #8a7a65;
    font-size: 13px;
  }

  .error-state {
    color: #c62828;
    border-color: #f5c6c6;
    background: #fdecea;
  }

  @media (max-width: 760px) {
    .page-body {
      width: min(100% - 32px, 900px);
      padding: 28px 0;
    }
  }
`

export default function Announcements() {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        api.get('/parent/announcements')
            .then((res) => setItems(res.data.data || []))
            .catch((err) => setError(err.response?.data?.message || 'Could not load announcements'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <main className="page-body">
                    <h1 className="page-title">Announcements</h1>
                    <p className="page-subtitle">Read updates shared with parent accounts.</p>

                    {loading && <div className="loading">Loading announcements...</div>}
                    {!loading && error && <div className="error-state">{error}</div>}
                    {!loading && !error && items.length === 0 && <div className="empty-state">No announcements yet.</div>}
                    {!loading && !error && items.length > 0 && (
                        <div className="announcement-list">
                            {items.map((item) => (
                                <article key={item.id} className="announcement-card">
                                    <h2 className="announcement-title">{item.title}</h2>
                                    <p className="announcement-body">{item.body}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}
