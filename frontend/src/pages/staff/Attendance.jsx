import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import api from "../../api/axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  .attendance-root { min-height: 100vh; background: #f5f0e8; font-family: 'Inter', sans-serif; }
  .attendance-body { padding: 40px 48px; }

  .attendance-header { margin-bottom: 30px; }
  .attendance-title { font-family: 'Playfair Display', serif; font-size: 34px; color: #2c1810; margin-bottom: 5px; }
  .attendance-subtitle { color: #8a7a65; font-size: 14px; }

  .attendance-grid { display: grid; grid-template-columns: 340px 1fr; gap: 22px; }
  .attendance-right { display: flex; flex-direction: column; gap: 22px; }

  .attendance-card { background: #fff9f0; border-radius: 16px; border: 1px solid #e8d5b5; padding: 24px; }

  .section-title { font-size: 15px; font-weight: 600; color: #2c1810; margin-bottom: 18px; }
  .section-sub { font-size: 12px; color: #8a7a65; margin-top: -12px; margin-bottom: 16px; }

  .input {
    width: 100%; padding: 11px 13px; border-radius: 10px;
    border: 1.5px solid #e0d3bf; background: #fdf8f0;
    margin-bottom: 12px; font-size: 13px; outline: none;
    font-family: 'Inter', sans-serif; color: #2c1810; transition: border-color 0.2s;
  }
  .input:focus { border-color: #3d6b45; background: #fff; }

  .group-info {
    margin-bottom: 12px; padding: 10px 13px;
    border-radius: 10px; background: #f0f7f1;
    border: 1px solid #b5d4bb; font-size: 13px; color: #2c4a2e;
    display: flex; align-items: center; gap: 8px;
  }
  .group-dot { width: 8px; height: 8px; border-radius: 50%; background: #3d6b45; flex-shrink: 0; }

  .medical-box {
    margin-bottom: 14px; padding: 11px 13px;
    border-radius: 10px; background: #fff4e5;
    border: 1px solid #f0d3a1; font-size: 13px; color: #7a4b00;
  }
  .medical-label { font-weight: 600; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }

  .btn-group { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
  .btn { border: none; border-radius: 10px; padding: 11px 20px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s; font-family: 'Inter', sans-serif; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-green { background: #2c4a2e; color: white; }
  .btn-green:hover:not(:disabled) { background: #3d6b45; }
  .btn-red { background: #c62828; color: white; }
  .btn-red:hover:not(:disabled) { background: #d84343; }

  .message-box {
    margin-top: 14px; padding: 10px 13px;
    border-radius: 8px; font-size: 13px; font-weight: 500;
  }
  .message-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: #2e7d32; }
  .message-error   { background: #fdecea; border: 1px solid #f5c6c6; color: #c62828; }
  /* Camper list */
.camper-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; max-height: 320px; overflow-y: auto; }
.camper-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 10px; cursor: pointer;
  border: 1.5px solid transparent; background: #fdf8f0;
  transition: all 0.15s; font-size: 13px; color: #2c1810;
}
.camper-item:hover { border-color: #c8b89a; background: #fff; }
.camper-item.selected { border-color: #3d6b45; background: #f0f7f1; }
.camper-name { flex: 1; font-weight: 500; }
.medical-flag {
  font-size: 11px; font-weight: 700; padding: 2px 8px;
  border-radius: 20px; background: #fff3e0; color: #e65100;
  border: 1px solid #ffcc80; white-space: nowrap;
}
.no-campers { font-size: 13px; color: #a08c72; font-style: italic; padding: 8px 0; }
  /* Summary cards */
  .summary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .summary-card { padding: 14px 16px; border-radius: 12px; text-align: center; }
  .summary-card .sc-num { font-size: 26px; font-weight: 700; font-family: 'Playfair Display', serif; }
  .summary-card .sc-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
  .sc-present  { background: #e8f5e9; color: #2e7d32; border: 1px solid #a5d6a7; }
  .sc-absent   { background: #fdecea; color: #c62828; border: 1px solid #f5c6c6; }
  .sc-pending  { background: #fff8e1; color: #e65100; border: 1px solid #ffe082; }

  /* Filter bar */
  .filter-bar { display: flex; gap: 10px; margin-bottom: 16px; }
  .search-input, .filter-select {
    padding: 9px 13px; border-radius: 10px;
    border: 1.5px solid #d8c7aa; background: white;
    font-size: 13px; outline: none; font-family: 'Inter', sans-serif; color: #2c1810;
  }
  .search-input { flex: 1; }
  .search-input:focus, .filter-select:focus { border-color: #3d6b45; }

  /* Table */
  .attendance-table { width: 100%; border-collapse: collapse; }
  .attendance-table th {
    background: #f8f2e8; color: #6e5d48;
    font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px;
    padding: 12px 14px; text-align: left; font-weight: 600;
  }
  .attendance-table td { padding: 13px 14px; border-top: 1px solid #f0e6d8; font-size: 13px; color: #2c1810; }
  .attendance-table tr:hover td { background: #fffdf9; }

  .status-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-present  { background: #e8f5e9; color: #2e7d32; }
  .badge-checkout { background: #fdecea; color: #c62828; }
  .badge-absent   { background: #fce4ec; color: #880e4f; }
  .badge-pending  { background: #fff8e1; color: #e65100; }

  .time-cell { font-size: 12px; color: #5a4a35; font-variant-numeric: tabular-nums; }
  .time-dash { color: #c8b89a; }

  .empty-state { padding: 40px; text-align: center; color: #a08c72; font-size: 13px; }

  /* Inside camp */
  .inside-chip {
    display: inline-flex; align-items: center; gap: 8px;
    background: #e8f5e9; border: 1px solid #a5d6a7;
    border-radius: 20px; padding: 5px 12px; font-size: 12px; color: #1b5e20;
    margin: 4px;
  }
  .inside-chip-time { color: #3d6b45; font-weight: 600; }
  .inside-chips { display: flex; flex-wrap: wrap; padding: 4px 0; }

  @media(max-width: 950px) {
    .attendance-grid { grid-template-columns: 1fr; }
    .filter-bar { flex-direction: column; }
    .summary-row { grid-template-columns: repeat(3,1fr); }
  }
`;

function fmt(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getStatus(record, todayStr) {
  if (record.check_out_time) return 'checked_out';
  if (record.check_in_time)  return 'present';
  if (record.date === todayStr) return 'absent';
  return 'absent';
}

export default function Attendance() {
  const [camperId, setCamperId]       = useState('');
  const [message, setMessage]         = useState('');
  const [msgType, setMsgType]         = useState('success'); // 'success' | 'error'
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [records, setRecords]         = useState([]);
  const [campers, setCampers]         = useState([]);
  const [groups, setGroups]           = useState([]);
  const [insideCamp, setInsideCamp]   = useState([]);
  const [selectedCamper, setSelectedCamper] = useState(null);

  const [loading, setLoading]         = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Auto-select group: staff typically have one group
  const autoGroupId = selectedGroupId || (groups.length > 0 ? groups[0].id : null);

  const showMsg = (text, type = 'success') => { setMessage(text); setMsgType(type); };

  const fetchAll = () => {
    fetchAttendance();
    fetchCampers();
    fetchGroups();
    fetchCurrentlyInside();
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/staff/attendance');
      setRecords(res.data.data || []);
    } catch { showMsg('Error loading attendance records', 'error'); }
    finally { setLoading(false); }
  };

  const fetchCampers = async () => {
    try {
      const res = await api.get('/staff/campers');
      setCampers(res.data.data || []);
    } catch {}
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/staff/groups');
      setGroups(res.data.data || []);
    } catch {}
  };

  const fetchCurrentlyInside = async () => {
    try {
      const res = await api.get('/staff/currently-inside');
      setInsideCamp(res.data.data || []);
    } catch {}
  };

  const checkIn = async () => {
    if (!camperId) { showMsg('Please select a camper', 'error'); return; }
    if (!autoGroupId) { showMsg('No group assigned to you', 'error'); return; }

    setActionLoading(true);
    try {
      const res = await api.post('/staff/checkin', {
        camper_id: parseInt(camperId),
        group_id:  autoGroupId,
      });
      showMsg(res.data.message || 'Checked in successfully', 'success');
      setCamperId(''); setSelectedCamper(null);
      fetchAttendance(); fetchCurrentlyInside();
    } catch (err) {
      // FR 3.4 — show exact backend message
      const msg = err.response?.data?.message || 'Check-in failed';
      showMsg(msg === 'Camper already checked in' ? 'Camper is already checked in.' : msg, 'error');
    } finally { setActionLoading(false); }
  };

  const checkOut = async () => {
    if (!camperId) { showMsg('Please select a camper', 'error'); return; }

    setActionLoading(true);
    try {
      const res = await api.post('/staff/checkout', { camper_id: parseInt(camperId) });
      showMsg(res.data.message || 'Checked out successfully', 'success');
      setCamperId(''); setSelectedCamper(null);
      fetchAttendance(); fetchCurrentlyInside();
    } catch (err) {
      // FR 3.5 — show exact backend message
      const msg = err.response?.data?.message || 'Check-out failed';
      showMsg(msg === 'No active check-in found' ? 'Camper has not been checked in today.' : msg, 'error');
    } finally { setActionLoading(false); }
  };

  // FR 3.6 — summary counts for today
const groupCampers = campers.filter(c => !autoGroupId || c.group?.id == autoGroupId);
const todayRecords = records.filter(r => r.date === today && (!autoGroupId || r.group_id == autoGroupId));
const presentCount = insideCamp.filter(r => !autoGroupId || r.group_id == autoGroupId).length;
const checkedOutCount = todayRecords.filter(r => r.check_out_time).length;
const absentCount = groupCampers.length - todayRecords.length < 0 ? 0 : groupCampers.length - todayRecords.length;

  const filteredRecords = records.filter(r => {
  const matchGroup  = !autoGroupId || r.group_id == autoGroupId;
  const matchSearch = r.camper_name?.toLowerCase().includes(searchTerm.toLowerCase());
  const status = getStatus(r, today);
  const matchStatus =
    statusFilter === 'all'         ? true :
    statusFilter === 'present'     ? status === 'present' :
    statusFilter === 'checked_out' ? status === 'checked_out' :
    statusFilter === 'absent'      ? status === 'absent' : true;
  return matchGroup && matchSearch && matchStatus;
});

const exportToExcel = () => {
  if (!records.length) { showMsg('No attendance data', 'error'); return; }
  const formatted = records.map(r => ({
    Camper:    r.camper_name,
    Date:      r.date,
    CheckIn:   fmt(r.check_in_time) || '—',
    CheckOut:  fmt(r.check_out_time) || '—',
    Status:    getStatus(r, today),
  }));
  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'attendance.xlsx');
};
  return (
    <>
      <style>{styles}</style>
      <div className="attendance-root">
        <Navbar />
        <div className="attendance-body">

          <div className="attendance-header">
            <div className="attendance-title">Attendance</div>
            <div className="attendance-subtitle">Record and track daily camper attendance for your group</div>
          </div>

          <div className="attendance-grid">

            {/* ── LEFT PANEL ── */}
            <div className="attendance-card">
              <div className="section-title">Record Attendance</div>

              {/* FR 3.1 — show which group this staff is assigned to */}
             {groups.length > 1 ? (
                <select
                  className="input"
                  value={selectedGroupId}
                  onChange={e => { setSelectedGroupId(e.target.value); setCamperId(''); setSelectedCamper(null); }}
                >
                  <option value="">Select Group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}{g.session_name ? ` · ${g.session_name}` : ''}</option>
                  ))}
                </select>
              ) : groups.length === 1 ? (
                <div className="group-info">
                  <div className="group-dot" />
                  <span><strong>{groups[0].name}</strong>{groups[0].session_name ? ` · ${groups[0].session_name}` : ''}</span>
                </div>
              ) : null}

              {/* FR 3.1 — camper list comes from /staff/campers = only their group's campers */}
              {/* FR 3.1 + FR 3.8 — visible camper list with medical alert flags */}
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8a7a65', marginBottom: 8 }}>
                Campers in Group
              </div>
              <div className="camper-list">
                {campers.filter(c => !autoGroupId || c.group?.id == autoGroupId).length === 0
                  ? <div className="no-campers">No campers in this group.</div>
                  : campers
                      .filter(c => !autoGroupId || c.group?.id == autoGroupId)
                      .map(c => (
                        <div
                          key={c.id}
                          className={`camper-item${camperId == c.id ? ' selected' : ''}`}
                          onClick={() => { setCamperId(c.id); setSelectedCamper(c); }}
                        >
                          <span className="camper-name">{c.full_name}</span>
                          {c.medical_alerts && c.medical_alerts !== 'None' && c.medical_alerts.trim() !== '' && (
                            <span className="medical-flag">⚠ Medical</span>
                          )}
                        </div>
                      ))
                }
              </div>

              {/* Medical alerts — always visible once camper selected */}
              <div className="medical-box">
                <div className="medical-label">⚕ Medical Alerts</div>
                <div style={{ marginTop: 4 }}>
                  {selectedCamper?.medical_alerts || 'None'}
                </div>
              </div>

              <div className="btn-group">
                <button className="btn btn-green" onClick={checkIn} disabled={actionLoading}>
                  {actionLoading ? '...' : '✓ Check In'}
                </button>
                <button className="btn btn-red" onClick={checkOut} disabled={actionLoading}>
                  {actionLoading ? '...' : '✕ Check Out'}
                </button>
                <button className="btn btn-blue" onClick={exportToExcel}>⬇ Export Excel</button>
              </div>

              {message && (
                <div className={`message-box ${msgType === 'error' ? 'message-error' : 'message-success'}`}>
                  {message}
                </div>
              )}
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="attendance-right">

              {/* FR 3.6 — daily summary cards */}
              <div className="attendance-card">
                <div className="section-title">Today's Summary</div>
                <div className="summary-row">
                  <div className="summary-card sc-present">
                    <div className="sc-num">{presentCount}</div>
                    <div className="sc-label">Present</div>
                  </div>
                  <div className="summary-card sc-absent">
                    <div className="sc-num">{absentCount < 0 ? 0 : absentCount}</div>
                    <div className="sc-label">Absent</div>
                  </div>
                  <div className="summary-card sc-pending">
                    <div className="sc-num">{checkedOutCount}</div>
                    <div className="sc-label">Checked Out</div>
                  </div>
                </div>

                {/* Currently inside chips */}
                {insideCamp.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8a7a65', marginBottom: 8 }}>
                      Currently Inside
                    </div>
                    <div className="inside-chips">
                     {insideCamp.filter(r => !autoGroupId || r.group_id == autoGroupId).map((r, i) => (
                        <div className="inside-chip" key={i}>
                          <span>{r.camper_name}</span>
                          <span className="inside-chip-time">{fmt(r.check_in_time)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* FR 3.6 — attendance records table with check-in, check-out, status */}
              <div className="attendance-card">
                <div className="section-title">Attendance Records</div>

                <div className="filter-bar">
                  <input
                    type="text"
                    placeholder="Search camper..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="checked_out">Checked Out</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>

                {loading ? (
                  <div className="empty-state">Loading attendance...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="empty-state">No records found.</div>
                ) : (
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Camper</th>
                        <th>Date</th>
                        <th>Check-In</th>
                        <th>Check-Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((r, i) => {
                        const status = getStatus(r, today);
                        return (
                          <tr key={i}>
                            <td>
                            <strong>{r.camper_name}</strong>
                            {(() => {
                              const camper = campers.find(c => c.full_name === r.camper_name);
                              return camper?.medical_alerts && camper.medical_alerts.trim() !== '' && camper.medical_alerts !== 'None'
                                ? <span className="medical-flag" style={{ marginLeft: 8 }}>⚠ Medical</span>
                                : null;
                            })()}
                          </td>
                            <td>{r.date}</td>
                            <td className="time-cell">
                              {fmt(r.check_in_time) || <span className="time-dash">—</span>}
                            </td>
                            <td className="time-cell">
                              {fmt(r.check_out_time) || <span className="time-dash">—</span>}
                            </td>
                            <td>
                              {status === 'present'     && <span className="status-badge badge-present">Present</span>}
                              {status === 'checked_out' && <span className="status-badge badge-checkout">Checked Out</span>}
                              {status === 'absent'      && <span className="status-badge badge-absent">Absent</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}