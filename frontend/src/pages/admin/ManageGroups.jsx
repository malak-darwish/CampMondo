import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f5f0e8; font-family: 'Inter', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #2c1810; }
  .page-sub { font-size: 13px; color: #8a7a65; margin-top: 4px; }

  .btn { padding: 10px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-primary { background: #3d6b45; color: #fff; }
  .btn-primary:hover { background: #2c4a2e; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .alert { padding: 11px 15px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }
  .alert-error { background: #fdecea; border: 1px solid #f5c6c6; color: #c62828; }
  .alert-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }

  .session-picker {
    background: #fff9f0;
    border-radius: 14px;
    border: 1px solid #e8d5b5;
    padding: 24px 28px;
    margin-bottom: 24px;
  }

  .picker-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #8a7a65;
    margin-bottom: 10px;
    display: block;
  }

  .session-select {
    width: 100%;
    max-width: 420px;
    padding: 11px 14px;
    border: 1.5px solid #e0d0b8;
    border-radius: 9px;
    font-size: 14px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    background: #fdf8f0;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .session-select:focus { border-color: #3d6b45; }

  .groups-layout { display: grid; grid-template-columns: 1fr 320px; gap: 22px; align-items: start; }

  .groups-count { font-size: 13px; font-weight: 600; color: #5a4a35; margin-bottom: 14px; }

  .groups-list { display: flex; flex-direction: column; gap: 12px; }

  .group-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 13px;
    padding: 20px 22px;
    transition: box-shadow 0.2s;
  }

  .group-card:hover { box-shadow: 0 4px 14px rgba(44,24,16,0.06); }

  .group-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .group-name { font-size: 15px; font-weight: 600; color: #2c1810; }
  .group-id { font-size: 11px; color: #c8b89a; }

  .group-staff-row { display: flex; align-items: center; gap: 12px; }
  .staff-label { font-size: 10px; color: #a08c72; text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; font-weight: 600; }

  .staff-select {
    flex: 1;
    padding: 8px 11px;
    border: 1.5px solid #e0d0b8;
    border-radius: 7px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    background: #fdf8f0;
    outline: none;
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .staff-select:focus { border-color: #3d6b45; }

  .staff-assigned {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .staff-dot { width: 7px; height: 7px; border-radius: 50%; background: #3d6b45; flex-shrink: 0; }
  .staff-name { font-size: 13px; color: #2c1810; font-weight: 500; }

  .create-panel {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 13px;
    padding: 22px;
    position: sticky;
    top: 80px;
  }

  .create-panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #2c1810;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0e8d8;
  }

  .form-field { display: flex; flex-direction: column; gap: 7px; margin-bottom: 14px; }
  .form-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .form-input {
    padding: 10px 13px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    outline: none;
    transition: border-color 0.2s;
    background: #fdf8f0;
  }
  .form-input:focus { border-color: #3d6b45; background: #fff; }

  .empty-state {
    padding: 44px 28px;
    text-align: center;
    color: #a08c72;
    background: #fff9f0;
    border-radius: 13px;
    border: 1px solid #e8d5b5;
  }
  .empty-icon { font-size: 34px; margin-bottom: 10px; }
  .empty-text { font-size: 13px; }

  .no-session { padding: 72px; text-align: center; color: #a08c72; }
  .no-session-icon { font-size: 44px; margin-bottom: 14px; }
  .no-session-text { font-size: 14px; }
`

export default function ManageGroups() {
    const [sessions, setSessions]        = useState([])
    const [selectedSession, setSelected] = useState('')
    const [groups, setGroups]            = useState([])
    const [staffList, setStaffList]      = useState([])
    const [groupName, setGroupName]      = useState('')
    const [error, setError]              = useState('')
    const [success, setSuccess]          = useState('')
    const [loading, setLoading]          = useState(false)

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

                    {error   && <div className="alert alert-error">⚠ {error}</div>}
                    {success && <div className="alert alert-success">✓ {success}</div>}

                    <div className="session-picker">
                        <label className="picker-label">Select Session</label>
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
                                <div className="groups-count">Groups ({groups.length})</div>
                                {groups.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">👥</div>
                                        <div className="empty-text">No groups yet. Create one using the panel on the right.</div>
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
                                                        <div className="staff-label">Staff</div>
                                                        {assignedName ? (
                                                            <div className="staff-assigned">
                                                                <div className="staff-dot"></div>
                                                                <div className="staff-name">{assignedName}</div>
                                                                <select
                                                                    className="staff-select"
                                                                    style={{maxWidth:'150px'}}
                                                                    defaultValue=''
                                                                    onChange={e => e.target.value && handleAssignStaff(g.id, e.target.value)}
                                                                >
                                                                    <option value=''>Reassign...</option>
                                                                    {staffList.filter(s => s.is_active).map(s => (
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
                                                                {staffList.filter(s => s.is_active).map(s => (
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

                            <div className="create-panel">
                                <div className="create-panel-title">Create New Group</div>
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
                                <button
                                    className="btn btn-primary"
                                    style={{width:'100%'}}
                                    onClick={handleCreateGroup}
                                    disabled={loading}
                                >
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