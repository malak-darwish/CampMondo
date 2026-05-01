import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f4f6f3; font-family: 'DM Sans', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .page-title { font-family: 'DM Serif Display', serif; font-size: 32px; color: #0f1117; }
  .page-sub { font-size: 14px; color: #888; margin-top: 4px; }
  .btn { padding: 11px 22px; border-radius: 10px; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-dark { background: #0f1117; color: #fff; }
  .btn-dark:hover { background: #1e2330; }
  .btn-outline { background: transparent; border: 1.5px solid #e0e3de; color: #555; }
  .btn-outline:hover { border-color: #aaa; }
  .btn-sm { padding: 7px 14px; font-size: 12px; }
  .btn-green { background: #f0fdf4; color: #16a34a; border: 1.5px solid #86efac; }
  .btn-green:hover { background: #dcfce7; }
  .error-box { background: #fff0f0; border: 1px solid #fca5a5; color: #dc2626; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .success-box { background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }

  .session-picker {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #e8ebe6;
    padding: 28px 32px;
    margin-bottom: 28px;
  }

  .session-picker-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #555; margin-bottom: 10px; display: block; }

  .session-select {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #0f1117;
    background: #fafafa;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
    max-width: 400px;
  }

  .session-select:focus { border-color: #63d2a6; }

  .groups-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }

  .groups-list { display: flex; flex-direction: column; gap: 14px; }

  .group-card {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 14px;
    padding: 22px 24px;
    transition: box-shadow 0.2s;
  }

  .group-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.05); }

  .group-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .group-name { font-size: 16px; font-weight: 600; color: #0f1117; }
  .group-id { font-size: 11px; color: #ccc; }

  .group-staff-row { display: flex; align-items: center; gap: 12px; }
  .group-staff-label { font-size: 12px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }

  .staff-select {
    flex: 1;
    padding: 9px 12px;
    border: 1.5px solid #e5e7eb;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    color: #0f1117;
    background: #fafafa;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .staff-select:focus { border-color: #63d2a6; }

  .staff-assigned {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .staff-dot { width: 8px; height: 8px; border-radius: 50%; background: #63d2a6; }
  .staff-assigned-name { font-size: 13px; color: #0f1117; font-weight: 500; }

  .create-group-panel {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 14px;
    padding: 24px;
    position: sticky;
    top: 88px;
  }

  .create-group-title { font-size: 15px; font-weight: 600; color: #0f1117; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid #f0f2ee; }

  .form-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
  .form-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #555; }
  .form-input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; transition: border-color 0.2s; background: #fafafa; }
  .form-input:focus { border-color: #63d2a6; background: #fff; }

  .empty-state { padding: 48px 32px; text-align: center; color: #bbb; background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; }
  .empty-icon { font-size: 36px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }

  .no-session { padding: 80px; text-align: center; color: #bbb; }
  .no-session-icon { font-size: 48px; margin-bottom: 16px; }
  .no-session-text { font-size: 15px; }
`

export default function ManageGroups() {
    const [sessions, setSessions]         = useState([])
    const [selectedSession, setSelected]  = useState('')
    const [groups, setGroups]             = useState([])
    const [staffList, setStaffList]       = useState([])
    const [groupName, setGroupName]       = useState('')
    const [error, setError]               = useState('')
    const [success, setSuccess]           = useState('')
    const [loading, setLoading]           = useState(false)

    useEffect(() => {
        api.get('/admin/sessions').then(r => setSessions(r.data.data || []))
        api.get('/admin/staff').then(r => setStaffList(r.data.data || []))
    }, [])

    const loadGroups = (sessionId) => {
        api.get(`/admin/sessions/${sessionId}/groups`).then(r => setGroups(r.data.data || []))
    }

    const handleSessionChange = (e) => {
        setSelected(e.target.value)
        setError(''); setSuccess('')
        if (e.target.value) loadGroups(e.target.value)
        else setGroups([])
    }

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return setError('Group name is required')
        setError(''); setSuccess('')
        setLoading(true)
        try {
            await api.post(`/admin/sessions/${selectedSession}/groups`, { name: groupName })
            setSuccess(`Group "${groupName}" created`)
            setGroupName('')
            loadGroups(selectedSession)
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating group')
        } finally {
            setLoading(false)
        }
    }

    const handleAssignStaff = async (groupId, staffId) => {
        setError(''); setSuccess('')
        try {
            await api.put(`/admin/groups/${groupId}/assign-staff`, { staff_id: parseInt(staffId) })
            setSuccess('Staff assigned successfully')
            loadGroups(selectedSession)
        } catch (err) {
            setError(err.response?.data?.message || 'Error assigning staff')
        }
    }

    const getStaffName = (staffId) => {
        const s = staffList.find(s => s.id === staffId)
        return s ? s.full_name : null
    }

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div>
                            <div className="page-title">Groups</div>
                            <div className="page-sub">Assign staff and manage groups within sessions</div>
                        </div>
                    </div>

                    {error   && <div className="error-box">⚠ {error}</div>}
                    {success && <div className="success-box">✓ {success}</div>}

                    <div className="session-picker">
                        <label className="session-picker-label">Select Session</label>
                        <select className="session-select" value={selectedSession} onChange={handleSessionChange}>
                            <option value=''>— Choose a session —</option>
                            {sessions.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.start_date} → {s.end_date})</option>
                            ))}
                        </select>
                    </div>

                    {!selectedSession ? (
                        <div className="no-session">
                            <div className="no-session-icon">👆</div>
                            <div className="no-session-text">Select a session above to manage its groups</div>
                        </div>
                    ) : (
                        <div className="groups-layout">
                            <div>
                                <div style={{fontSize:'15px', fontWeight:'600', color:'#0f1117', marginBottom:'16px'}}>
                                    Groups ({groups.length})
                                </div>

                                {groups.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">👥</div>
                                        <div className="empty-text">No groups yet. Create the first group using the panel on the right.</div>
                                    </div>
                                ) : (
                                    <div className="groups-list">
                                        {groups.map(g => {
                                            const assignedName = getStaffName(g.staff_id)
                                            return (
                                                <div key={g.id} className="group-card">
                                                    <div className="group-card-top">
                                                        <div className="group-name">📋 {g.name}</div>
                                                        <div className="group-id">ID #{g.id}</div>
                                                    </div>
                                                    <div className="group-staff-row">
                                                        <div className="group-staff-label">Staff</div>
                                                        {assignedName ? (
                                                            <div className="staff-assigned">
                                                                <div className="staff-dot"></div>
                                                                <div className="staff-assigned-name">{assignedName}</div>
                                                                <select
                                                                    className="staff-select"
                                                                    style={{maxWidth:'160px'}}
                                                                    defaultValue=''
                                                                    onChange={e => e.target.value && handleAssignStaff(g.id, e.target.value)}
                                                                >
                                                                    <option value=''>Reassign...</option>
                                                                    {staffList.filter(s => s.account_status === 'active').map(s => (
                                                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        ) : (
                                                            <select
                                                                className="staff-select"
                                                                defaultValue=''
                                                                onChange={e => e.target.value && handleAssignStaff(g.id, e.target.value)}
                                                            >
                                                                <option value=''>— Assign staff member —</option>
                                                                {staffList.filter(s => s.account_status === 'active').map(s => (
                                                                    <option key={s.id} value={s.id}>{s.full_name}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="create-group-panel">
                                <div className="create-group-title">Create New Group</div>
                                <div className="form-field">
                                    <label className="form-label">Group Name</label>
                                    <input
                                        className="form-input"
                                        placeholder="e.g. Group A"
                                        value={groupName}
                                        onChange={e => setGroupName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
                                    />
                                </div>
                                <button className="btn btn-dark" style={{width:'100%'}} onClick={handleCreateGroup} disabled={loading}>
                                    {loading ? 'Creating...' : '+ Create Group'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
