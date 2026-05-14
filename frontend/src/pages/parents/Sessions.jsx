import { useEffect, useMemo, useState } from 'react'
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
    width: min(1120px, calc(100% - 48px));
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

  .message {
    margin-bottom: 18px;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 13px;
  }

  .message.success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #c7e8c9;
  }

  .message.error {
    background: #fdecea;
    color: #c62828;
    border: 1px solid #f5c6c6;
  }

  .sessions-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .session-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    overflow: hidden;
  }

  .session-top {
    padding: 20px 22px;
    border-bottom: 1px solid #f0e8d8;
  }

  .session-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 6px;
  }

  .session-dates,
  .session-meta {
    color: #8a7a65;
    font-size: 13px;
  }

  .session-body { padding: 18px 22px 22px; }

  .activity-list,
  .selected-activity-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 14px 0 18px;
  }

  .activity-pill {
    border-radius: 999px;
    background: #f0e8d8;
    color: #5a4a35;
    padding: 5px 10px;
    font-size: 12px;
  }

  .activity-picker {
    margin: 16px 0;
    padding: 12px;
    border: 1px solid #efe1ca;
    border-radius: 10px;
    background: #fffdf8;
  }

  .activity-picker-title {
    margin-bottom: 10px;
    font-size: 11px;
    font-weight: 700;
    color: #5a4a35;
    text-transform: uppercase;
    letter-spacing: 0.9px;
  }

  .activity-option {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    min-height: 32px;
    padding: 7px 0;
    border-top: 1px solid #f3eadf;
    color: #2c1810;
    font-size: 13px;
    cursor: pointer;
  }

  .activity-option:first-of-type { border-top: none; }

  .activity-option input { width: 16px; height: 16px; }

  .activity-fee {
    color: #8a7a65;
    font-weight: 600;
  }

  .fee-preview,
  .fee-breakdown {
    margin: 10px 0 16px;
    padding: 10px 12px;
    border-radius: 10px;
    background: #f7efe1;
    color: #5a4a35;
    font-size: 12px;
    line-height: 1.7;
  }

  .fee-preview strong,
  .fee-breakdown strong { color: #2c1810; }

  .enrollment-list {
    display: grid;
    gap: 8px;
    margin: 0 0 16px;
  }

  .enrollment-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid #e8d5b5;
    border-radius: 10px;
    background: #fffdf8;
  }

  .enrollment-name {
    font-size: 13px;
    font-weight: 600;
    color: #2c1810;
  }

  .enrollment-note {
    margin-top: 3px;
    font-size: 11px;
    color: #8a7a65;
  }

  .cancel-btn {
    min-height: 34px;
    padding: 0 12px;
    background: #fff;
    color: #b3261e;
    border: 1px solid #efc4bf;
    border-radius: 7px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .cancel-btn:hover { background: #fdecea; }
  .cancel-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .enroll-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .form-select {
    width: 100%;
    min-height: 40px;
    padding: 0 12px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    background: #fff;
    color: #2c1810;
    font: inherit;
    font-size: 14px;
    outline: none;
  }

  .form-select:focus { border-color: #3d6b45; }

  .primary-btn {
    min-height: 40px;
    padding: 0 16px;
    background: #3d6b45;
    border: none;
    border-radius: 8px;
    color: #fff;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }

  .primary-btn:hover { background: #2c4a2e; }
  .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .status {
    display: inline-flex;
    margin-top: 12px;
    padding: 4px 10px;
    border-radius: 999px;
    background: #e8f5e9;
    color: #2e7d32;
    font-size: 11px;
    font-weight: 600;
  }

  .status.full {
    background: #fdecea;
    color: #c62828;
  }

  .empty-state,
  .loading {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 14px;
    padding: 26px;
    color: #8a7a65;
    font-size: 13px;
  }

  @media (max-width: 900px) {
    .page-body {
      width: min(100% - 32px, 1120px);
      padding: 28px 0;
    }
    .sessions-grid { grid-template-columns: 1fr; }
    .enroll-row,
    .enrollment-row { grid-template-columns: 1fr; }
  }
`

function money(value) {
    const number = Number(value || 0)
    return number.toFixed(2)
}

function feePreview(session, selectedActivityIds) {
    const sessionFee = Number(session.enrollment_fee || 0)
    const selectedSet = new Set((selectedActivityIds || []).map(String))
    const selectedActivities = (session.activities || []).filter((activity) => selectedSet.has(String(activity.id)))
    const activityTotal = selectedActivities.reduce((sum, activity) => sum + Number(activity.fee || 0), 0)
    return {
        sessionFee,
        selectedActivities,
        activityTotal,
        total: sessionFee + activityTotal,
    }
}

export default function Sessions() {
    const [sessions, setSessions] = useState([])
    const [campers, setCampers] = useState([])
    const [selectedCampers, setSelectedCampers] = useState({})
    const [selectedActivities, setSelectedActivities] = useState({})
    const [loading, setLoading] = useState(true)
    const [savingSessionId, setSavingSessionId] = useState(null)
    const [cancellingEnrollmentId, setCancellingEnrollmentId] = useState(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    async function load() {
        const [sessionsRes, campersRes] = await Promise.all([
            api.get('/parent/sessions'),
            api.get('/parent/campers'),
        ])
        setSessions(sessionsRes.data.data || [])
        setCampers(campersRes.data.data || [])
    }

    useEffect(() => {
        load()
            .catch((err) => setError(err.response?.data?.message || 'Could not load sessions'))
            .finally(() => setLoading(false))
    }, [])

    const camperById = useMemo(() => {
        return campers.reduce((map, camper) => {
            map[String(camper.id)] = camper
            return map
        }, {})
    }, [campers])

    function toggleActivity(sessionId, activityId) {
        setSelectedActivities((prev) => {
            const current = new Set((prev[sessionId] || []).map(String))
            const key = String(activityId)
            if (current.has(key)) current.delete(key)
            else current.add(key)
            return { ...prev, [sessionId]: Array.from(current) }
        })
    }

    async function enroll(session) {
        const sessionId = session.id
        const camperId = selectedCampers[sessionId]
        const activityIds = selectedActivities[sessionId] || []
        setMessage('')
        setError('')

        if (!camperId) {
            setError('Choose a camper before enrolling')
            return
        }

        if ((session.activities || []).length > 0 && activityIds.length === 0) {
            setError('Select at least one activity program before enrolling')
            return
        }

        setSavingSessionId(sessionId)
        try {
            const res = await api.post('/parent/enrollments', {
                camper_id: camperId,
                session_id: sessionId,
                activity_program_ids: activityIds.map(Number),
            })
            const camperName = camperById[String(camperId)]?.full_name || 'Camper'
            setMessage(`${camperName} enrolled successfully.`)
            await load()
            setSelectedCampers((prev) => ({ ...prev, [sessionId]: '' }))
            setSelectedActivities((prev) => ({ ...prev, [sessionId]: [] }))
            return res
        } catch (err) {
            setError(err.response?.data?.message || 'Could not enroll camper')
        } finally {
            setSavingSessionId(null)
        }
    }

    async function cancelEnrollment(enrollment) {
        const confirmed = window.confirm(
            `Cancel ${enrollment.camper_name}'s enrollment? This is only allowed at least 7 days before the session starts.`
        )
        if (!confirmed) return

        setMessage('')
        setError('')
        setCancellingEnrollmentId(enrollment.id)
        try {
            const res = await api.delete(`/parent/enrollments/${enrollment.id}`)
            setMessage(res.data.message || 'Enrollment cancelled successfully.')
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Could not cancel enrollment')
        } finally {
            setCancellingEnrollmentId(null)
        }
    }

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <main className="page-body">
                    <h1 className="page-title">Available Sessions</h1>
                    <p className="page-subtitle">Review camp sessions, choose activity programs, enroll campers, or cancel eligible enrollments.</p>

                    {message && <div className="message success">{message}</div>}
                    {error && <div className="message error">{error}</div>}

                    {loading ? (
                        <div className="loading">Loading sessions...</div>
                    ) : sessions.length === 0 ? (
                        <div className="empty-state">No sessions are available yet.</div>
                    ) : (
                        <div className="sessions-grid">
                            {sessions.map((session) => {
                                const activeEnrollments = session.parent_enrollments || []
                                const enrolledNames = activeEnrollments.length > 0
                                    ? activeEnrollments.map((enrollment) => enrollment.camper_name).filter(Boolean)
                                    : (session.enrolled_camper_ids || [])
                                        .map((id) => camperById[String(id)]?.full_name)
                                        .filter(Boolean)
                                const chosenActivityIds = selectedActivities[session.id] || []
                                const preview = feePreview(session, chosenActivityIds)

                                return (
                                    <article key={session.id} className="session-card">
                                        <div className="session-top">
                                            <div className="session-name">{session.name}</div>
                                            <div className="session-dates">{session.start_date} to {session.end_date}</div>
                                            <div className="session-meta">
                                                ${money(session.enrollment_fee)} enrollment fee | {session.spots_left} spots left
                                            </div>
                                        </div>
                                        <div className="session-body">
                                            <div className="activity-list">
                                                {(session.activities || []).length === 0
                                                    ? <span className="activity-pill">No activities listed</span>
                                                    : session.activities.map((activity) => (
                                                        <span key={activity.id} className="activity-pill">
                                                            {activity.name} (${money(activity.fee)})
                                                        </span>
                                                    ))}
                                            </div>

                                            {activeEnrollments.length > 0 ? (
                                                <div className="enrollment-list">
                                                    {activeEnrollments.map((enrollment) => (
                                                        <div key={enrollment.id} className="enrollment-row">
                                                            <div>
                                                                <div className="enrollment-name">Enrolled: {enrollment.camper_name}</div>
                                                                <div className="selected-activity-list">
                                                                    {(enrollment.selected_activities || []).length === 0
                                                                        ? <span className="activity-pill">No selected activities</span>
                                                                        : enrollment.selected_activities.map((activity) => (
                                                                            <span key={activity.id} className="activity-pill">
                                                                                {activity.name} (${money(activity.fee)})
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                                <div className="fee-breakdown">
                                                                    Session fee: ${money(enrollment.fee_breakdown?.session_fee)}<br />
                                                                    Activity fees: ${money(enrollment.fee_breakdown?.activity_total)}<br />
                                                                    <strong>Total due: ${money(enrollment.fee_breakdown?.total_due)}</strong>
                                                                </div>
                                                                <div className="enrollment-note">
                                                                    {enrollment.can_cancel
                                                                        ? `Cancellation allowed until ${enrollment.cancellation_deadline}.`
                                                                        : 'Cancellation deadline has passed.'}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="cancel-btn"
                                                                onClick={() => cancelEnrollment(enrollment)}
                                                                disabled={!enrollment.can_cancel || cancellingEnrollmentId === enrollment.id}
                                                            >
                                                                {cancellingEnrollmentId === enrollment.id ? 'Cancelling...' : 'Cancel enrollment'}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : enrolledNames.length > 0 && (
                                                <div className="status">Enrolled: {enrolledNames.join(', ')}</div>
                                            )}

                                            {session.is_full ? (
                                                <div className="status full">Session full</div>
                                            ) : (
                                                <>
                                                    {(session.activities || []).length > 0 && (
                                                        <div className="activity-picker">
                                                            <div className="activity-picker-title">Select activity programs</div>
                                                            {session.activities.map((activity) => {
                                                                const checked = chosenActivityIds.map(String).includes(String(activity.id))
                                                                return (
                                                                    <label key={activity.id} className="activity-option">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={checked}
                                                                            onChange={() => toggleActivity(session.id, activity.id)}
                                                                        />
                                                                        <span>{activity.name}</span>
                                                                        <span className="activity-fee">${money(activity.fee)}</span>
                                                                    </label>
                                                                )
                                                            })}
                                                        </div>
                                                    )}

                                                    <div className="fee-preview">
                                                        Session fee: ${money(preview.sessionFee)}<br />
                                                        Activity fees: ${money(preview.activityTotal)}<br />
                                                        <strong>Total due: ${money(preview.total)}</strong>
                                                    </div>

                                                    <div className="enroll-row">
                                                        <select
                                                            className="form-select"
                                                            value={selectedCampers[session.id] || ''}
                                                            onChange={(e) => setSelectedCampers({ ...selectedCampers, [session.id]: e.target.value })}
                                                            disabled={campers.length === 0}
                                                        >
                                                            <option value="">{campers.length === 0 ? 'Register a camper first' : 'Choose camper'}</option>
                                                            {campers.map((camper) => (
                                                                <option key={camper.id} value={camper.id}>{camper.full_name}</option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            className="primary-btn"
                                                            onClick={() => enroll(session)}
                                                            disabled={campers.length === 0 || savingSessionId === session.id}
                                                        >
                                                            {savingSessionId === session.id ? 'Enrolling...' : 'Enroll'}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}
