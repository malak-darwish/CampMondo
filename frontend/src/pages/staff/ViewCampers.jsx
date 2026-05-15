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

  /* ── session pills (staff sees multiple group assignments) ── */
  .session-pills {
    display: flex;
    gap: 10px;
    margin-bottom: 24px;
    flex-wrap: wrap;
  }

  .session-pill {
    padding: 7px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    border: 1.5px solid #c5d9c7;
    background: #fff9f0;
    color: #3d6b45;
    cursor: pointer;
    transition: all 0.15s;
  }

  .session-pill.active {
    background: #3d6b45;
    border-color: #3d6b45;
    color: #fff;
  }

  /* ── search ── */
  .search-box {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 22px;
    max-width: 380px;
  }

  .search-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8a7a65;
    margin-bottom: 8px;
  }

  .search-input {
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

  .search-input:focus {
    border-color: #3d6b45;
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
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .camper-card:hover {
    box-shadow: 0 4px 20px rgba(44,26,16,0.08);
    transform: translateY(-2px);
  }

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

  /* emergency contact section */
  .emergency-section {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px dashed #e8d5b5;
  }

  .emergency-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #8a7a65;
    margin-bottom: 8px;
  }

  /* empty / error states */
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

  .no-group-notice {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    color: #8a7a65;
    font-size: 14px;
    margin-top: 40px;
  }
`

export default function ViewCampers() {
  const [campers, setCampers]           = useState([])
  const [sessions, setSessions]         = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)

  // ── fetch campers in the staff member's own groups ────────────────────────
  // The backend should enforce this — staff can only get campers
  // belonging to groups they are assigned to.
  // The endpoint returns campers grouped by session so staff can
  // switch between their sessions using the pill tabs.
  useEffect(() => {
    api.get('/staff/campers')
      .then(res => {
        const data = res.data.data || []
        setCampers(data)

        // derive sessions this staff member is assigned to
        const seen = new Map()
        data.forEach(c => {
          if (c.session && !seen.has(c.session.id)) seen.set(c.session.id, c.session)
        })
        const uniqueSessions = [...seen.values()].map(s => s.name)
        setSessions(uniqueSessions)

        // default to first session
        if (uniqueSessions.length > 0) setActiveSession(uniqueSessions[0])
      })
      .catch(() => setError('Could not load your campers. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  const initials = (name = '') =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  // filter by active session tab + search
  const filtered = campers.filter(c => {
    const matchesSession = !activeSession || c.session?.name === activeSession
    const matchesSearch  =
      !search ||
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.parent_name?.toLowerCase().includes(search.toLowerCase())
    return matchesSession && matchesSearch
  })

  const alertCount = filtered.filter(c => c.medical_alerts).length

  return (
    <>
      <style>{styles}</style>
      <div className="page-root">
        <Navbar />
        <div className="page-body">

          <div className="page-top">
            <div className="page-title">My Group Campers</div>
            <div className="page-sub">
              Campers assigned to your groups — across your active sessions
            </div>
          </div>

          {/* no assignment notice */}
          {!loading && sessions.length === 0 && (
            <div className="no-group-notice">
              You are not currently assigned to any group.
              Contact the camp administrator to be assigned.
            </div>
          )}

          {/* session pill tabs — only shown when staff has multiple sessions */}
          {sessions.length > 1 && (
            <div className="session-pills">
              {sessions.map(s => (
                <button
                  key={s}
                  className={`session-pill${activeSession === s ? ' active' : ''}`}
                  onClick={() => setActiveSession(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* search — only shown when there are campers */}
          {!loading && sessions.length > 0 && (
            <div className="search-box">
              <div className="search-label">Search</div>
              <input
                className="search-input"
                placeholder="Camper or parent name"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* count bar */}
          {!loading && sessions.length > 0 && (
            <div className="count-bar">
              <strong>{filtered.length}</strong> camper{filtered.length !== 1 ? 's' : ''} in your group
              {alertCount > 0 && (
                <span style={{ color: '#922b21', marginLeft: 12 }}>
                  · {alertCount} with medical alert{alertCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* error state */}
          {error && (
            <div className="empty-state" style={{ color: '#922b21' }}>{error}</div>
          )}

          <div className="campers-grid">

            {loading && (
              <div className="empty-state">Loading your campers…</div>
            )}

            {!loading && !error && filtered.length === 0 && sessions.length > 0 && (
              <div className="empty-state">
                <div className="empty-icon">🏕️</div>
                No campers match your search.
              </div>
            )}

            {!loading && !error && filtered.map(camper => (
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
                    <span className="detail-label">Session</span>
                    <span className="detail-value">{camper.session?.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Group</span>
                    <span className="detail-value">{camper.group?.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Parent</span>
                    <span className="detail-value">{camper.parent_name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{camper.parent_phone}</span>
                  </div>
                </div>

                {/* medical note */}
                {camper.medical_alerts && (
                  <div className="medical-note">
                    <div className="medical-note-label">Medical note</div>
                    {camper.medical_alerts}
                  </div>
                )}

                {/* emergency contact — always shown for staff since safety matters */}
                {camper.emergency_contacts?.length > 0 && (
                  <div className="emergency-section">
                    <div className="emergency-title">Emergency contact</div>
                    <div className="detail-row">
                      <span className="detail-label">Name</span>
                      <span className="detail-value">{camper.emergency_contacts[0].contact_name}</span>
                    </div>
                    <div className="detail-row" style={{ marginTop: 8 }}>
                      <span className="detail-label">Phone</span>
                      <span className="detail-value">{camper.emergency_contacts[0].phone_number}</span>
                    </div>
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