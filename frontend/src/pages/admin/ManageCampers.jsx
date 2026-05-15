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
    padding: 40px 48px;
  }

  .page-top {
    margin-bottom: 28px;
  }

  .page-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    color: #2c1810;
  }

  .page-sub {
    font-size: 13px;
    color: #8a7a65;
    margin-top: 4px;
  }

  /* ── filters ── */
  .filters {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 26px;
  }

  .filter-box {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 16px;
  }

  .filter-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8a7a65;
    margin-bottom: 8px;
  }

  .filter-input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1.5px solid #e0d0b8;
    background: #fdf8f0;
    font-size: 13px;
    outline: none;
    color: #2c1810;
    transition: border-color 0.2s;
  }

  .filter-input:focus {
    border-color: #3d6b45;
  }

  .filter-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── count bar ── */
  .count-bar {
    font-size: 12px;
    color: #8a7a65;
    margin-bottom: 18px;
  }

  .count-bar strong {
    color: #3d6b45;
  }

  /* ── grid ── */
  .campers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  /* ── card ── */
  .camper-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    padding: 22px;
    position: relative;
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .camper-card:hover {
    box-shadow: 0 4px 20px rgba(44,26,16,0.08);
    transform: translateY(-2px);
  }

  /* medical alert banner on top of card */
  .camper-card.has-alert {
    border-color: #c0392b;
  }

  .alert-banner {
    display: flex;
    align-items: center;
    gap: 6px;
    background: #fdf0ef;
    border: 1px solid #f5b7b1;
    border-radius: 8px;
    padding: 7px 10px;
    margin-bottom: 16px;
    font-size: 11px;
    font-weight: 600;
    color: #922b21;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .alert-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #c0392b;
    flex-shrink: 0;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(1.3); }
  }

  .camper-top {
    display: flex;
    gap: 14px;
    align-items: center;
    margin-bottom: 18px;
  }

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #2c4a2e;
    color: #e8a838;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .avatar.alert-avatar {
    background: #922b21;
    color: #fdf0ef;
  }

  .camper-name {
    font-size: 15px;
    font-weight: 700;
    color: #2c1810;
  }

  .camper-age {
    font-size: 12px;
    color: #8a7a65;
    margin-top: 2px;
  }

  .camper-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-label {
    font-size: 10px;
    color: #b29b7d;
    text-transform: uppercase;
    font-weight: 700;
    flex-shrink: 0;
    padding-top: 1px;
  }

  .detail-value {
    font-size: 13px;
    color: #5a4a35;
    text-align: right;
  }

  /* medical note inside card */
  .medical-note {
    margin-top: 14px;
    padding: 10px 12px;
    background: #fdf0ef;
    border-left: 3px solid #c0392b;
    border-radius: 0 8px 8px 0;
    font-size: 12px;
    color: #922b21;
    line-height: 1.5;
  }

  .medical-note-label {
    font-weight: 700;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  /* empty state */
  .empty-state {
    grid-column: 1 / -1;
    text-align: center;
    padding: 60px 0;
    color: #8a7a65;
    font-size: 14px;
  }

  .empty-icon {
    font-size: 36px;
    margin-bottom: 12px;
    opacity: 0.4;
  }
`

export default function ManageCampers() {
  const [campers, setCampers]             = useState([])
  const [allSessions, setAllSessions]     = useState([])
  const [groups, setGroups]               = useState([])
  const [search, setSearch]               = useState('')
  const [sessionFilter, setSessionFilter] = useState('')
  const [groupFilter, setGroupFilter]     = useState('')
  const [loading, setLoading]             = useState(true)

  // ── load full list once on mount to populate session dropdown ────────────
  useEffect(() => {
    setLoading(true)
    api.get('/admin/campers')
      .then(res => {
        const data = res.data.data || []
        setCampers(data)
        // derive unique sessions
        const seen = new Map()
        data.forEach(c => {
          if (c.session?.id && !seen.has(c.session.id)) {
            seen.set(c.session.id, c.session)
          }
        })
        setAllSessions([...seen.values()])
      })
      .finally(() => setLoading(false))
  }, [])

  // ── when session filter changes, re-fetch with session_id param ───────────
  // and re-derive groups for that session
  useEffect(() => {
    if (!sessionFilter) {
      // no session selected — go back to full list
      setLoading(true)
      api.get('/admin/campers')
        .then(res => {
          const data = res.data.data || []
          setCampers(data)
        })
        .finally(() => setLoading(false))
      setGroups([])
      setGroupFilter('')
      return
    }

    setLoading(true)
    api.get('/admin/campers', { params: { session_id: sessionFilter } })
      .then(res => {
        const data = res.data.data || []
        setCampers(data)
        // derive groups from returned campers
        const seen = new Map()
        data.forEach(c => {
          if (c.group?.id && !seen.has(c.group.id)) {
            seen.set(c.group.id, c.group)
          }
        })
        setGroups([...seen.values()])
        setGroupFilter('')
      })
      .finally(() => setLoading(false))
  }, [sessionFilter])

  // ── when group filter changes, re-fetch with both params ─────────────────
  useEffect(() => {
    if (!groupFilter) return   // handled by session effect above
    setLoading(true)
    api.get('/admin/campers', { params: { session_id: sessionFilter, group_id: groupFilter } })
      .then(res => setCampers(res.data.data || []))
      .finally(() => setLoading(false))
  }, [groupFilter])

  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // search is client-side only
  const filtered = campers.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.parent_name?.toLowerCase().includes(q)
    )
  })
  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <Navbar />
        <div className="page-body">

          <div className="page-top">
            <div className="page-title">Registered Campers</div>
            <div className="page-sub">All campers across every session and group</div>
          </div>

          <div className="filters">

            <div className="filter-box">
              <div className="filter-label">Search</div>
              <input
                className="filter-input"
                placeholder="Camper or parent name"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-box">
              <div className="filter-label">Session</div>
              <select
                className="filter-input"
                value={sessionFilter}
                onChange={e => {
                  setSessionFilter(e.target.value)
                  setGroupFilter('')   // reset group when session changes
                }}
              >
                <option value="">All Sessions</option>
                {allSessions.map(s => (
                  <option key={s.id} value={s.id}>{s.name || s.session_name}</option>
                ))}
              </select>
            </div>

            <div className="filter-box">
              <div className="filter-label">Group</div>
              {/* group dropdown is disabled until a session is selected */}
              <select
                className="filter-input"
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                disabled={!sessionFilter}
              >
                <option value="">
                  {sessionFilter ? 'All Groups' : 'Select a session first'}
                </option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name || g.group_name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="count-bar">
            Showing <strong>{filtered.length}</strong> of {campers.length} campers
            {filtered.filter(c => c.medical_alerts).length > 0 && (
              <span style={{ color: '#922b21', marginLeft: 12 }}>
                · {filtered.filter(c => c.medical_alerts).length} with medical alerts
              </span>
            )}
          </div>

          <div className="campers-grid">

            {loading && (
              <div className="empty-state">Loading campers…</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏕️</div>
                No campers match the current filters.
              </div>
            )}

            {!loading && filtered.map(camper => (
              <div
                className={`camper-card${camper.medical_alerts ? ' has-alert' : ''}`}
                key={camper.id}
              >
                {/* medical alert banner */}
                {camper.medical_alerts && (
                  <div className="alert-banner">
                    <span className="alert-dot" />
                    Medical alert
                  </div>
                )}

                <div className="camper-top">
                  <div className={`avatar${camper.medical_alerts ? ' alert-avatar' : ''}`}>
                    {initials(camper.full_name)}
                  </div>
                  <div>
                    <div className="camper-name">{camper.full_name}</div>
                    <div className="camper-age">{camper.age} years old</div>
                  </div>
                </div>

                <div className="camper-details">
                  <div className="detail-row">
                    <span className="detail-label">Parent</span>
                    <span className="detail-value">{camper.parent_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{camper.parent_phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Session</span>
                    <span className="detail-value">{camper.session?.name || camper.session?.session_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Group</span>
                    <span className="detail-value">{camper.group?.name || camper.group?.group_name || '—'}</span>
                  </div>
                </div>

                {/* medical note detail */}
                {camper.medical_alerts && (
                  <div className="medical-note">
                    <div className="medical-note-label">Medical note</div>
                    {camper.medical_alerts}
                  </div>
                )}

              </div>
            ))}

          </div>
        </div>
      </div>
    </>
  )
}