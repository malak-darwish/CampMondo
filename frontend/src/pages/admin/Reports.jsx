import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f5f0e8; font-family: 'Inter', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { margin-bottom: 28px; }
  .page-title { font-family: 'Playfair Display', serif; font-size: 32px; color: #2c1810; }
  .page-sub { font-size: 13px; color: #8a7a65; margin-top: 4px; }

  .btn { padding: 10px 20px; border-radius: 9px; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif; cursor: pointer; border: none; transition: all 0.15s; }
  .btn-secondary { background: transparent; border: 1.5px solid #c8b89a; color: #5a4a35; }
  .btn-secondary:hover { border-color: #8a7a65; }
  .btn-success { background: #2e7d32; color: #fff; }
  .btn-success:hover { background: #256528; }
  .btn-danger { background: #c62828; color: #fff; }
  .btn-danger:hover { background: #a61f1f; }
  .btn-sm { padding: 6px 13px; font-size: 12px; }

  .tabs {
    display: flex;
    gap: 4px;
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 11px;
    padding: 4px;
    margin-bottom: 26px;
    width: fit-content;
  }

  .tab {
    padding: 9px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #8a7a65;
    font-family: 'Inter', sans-serif;
    transition: all 0.15s;
  }

  .tab.active { background: #2c4a2e; color: #fff; }
  .tab:hover:not(.active) { background: #f0e8d8; color: #2c1810; }

  .summary-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-bottom: 22px;
  }

  .summary-card {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 13px;
    padding: 20px 22px;
  }

  .summary-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #a08c72; margin-bottom: 8px; font-weight: 600; }
  .summary-value { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #2c1810; }
  .summary-value.green { color: #2e7d32; }
  .summary-value.amber { color: #b45309; }

  .filters {
    background: #fff9f0;
    border: 1px solid #e8d5b5;
    border-radius: 13px;
    padding: 18px 22px;
    margin-bottom: 20px;
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .filter-field { display: flex; flex-direction: column; gap: 6px; }
  .filter-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8a7a65; }
  .filter-input { padding: 8px 12px; border: 1.5px solid #e0d0b8; border-radius: 7px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; background: #fdf8f0; transition: border-color 0.2s; }
  .filter-input:focus { border-color: #3d6b45; }
  .filter-select { padding: 8px 12px; border: 1.5px solid #e0d0b8; border-radius: 7px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; background: #fdf8f0; cursor: pointer; }
  .filter-select:focus { border-color: #3d6b45; }

  .report-panel {
    background: #fff9f0;
    border-radius: 13px;
    border: 1px solid #e8d5b5;
    overflow: hidden;
  }

  .report-header {
    padding: 18px 22px;
    border-bottom: 1px solid #f0e8d8;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .report-title { font-size: 14px; font-weight: 600; color: #2c1810; }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #fdf8f0; }
  th { padding: 11px 18px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #a08c72; border-bottom: 1px solid #f0e8d8; }
  td { padding: 13px 18px; font-size: 13px; color: #3a2e1e; border-bottom: 1px solid #f8f4ee; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fdf8f0; }

  .badge { padding: 2px 9px; border-radius: 20px; font-size: 10px; font-weight: 600; }
  .badge-green { background: #e8f5e9; color: #2e7d32; }
  .badge-amber { background: #fef3e2; color: #b45309; }
  .badge-red { background: #fdecea; color: #c62828; }
  .actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

  .empty-state { padding: 56px; text-align: center; color: #a08c72; }
  .empty-icon { font-size: 38px; margin-bottom: 12px; }
  .empty-text { font-size: 13px; }
`

export default function Reports() {
    const [tab, setTab]           = useState('financial')
    const [payments, setPayments] = useState([])
    const [incidents, setIncidents] = useState([])
    const [filters, setFilters]   = useState({ status: '', date: '' })
    const [busyPaymentId, setBusyPaymentId] = useState(null)

    const loadPayments = () => {
        api.get('/admin/payments').then(r => setPayments(r.data.data || []))
    }

    useEffect(() => {
        loadPayments()
        api.get('/admin/incidents').then(r => setIncidents(r.data.data || []))
    }, [])

    const filteredPayments = payments.filter(p => {
        if (filters.status && p.status !== filters.status) return false
        return true
    })

    const totalCollected = filteredPayments
        .filter(p => p.status === 'confirmed')
        .reduce((s, p) => s + parseFloat(p.amount), 0)

    const totalPending = filteredPayments
        .filter(p => p.status === 'pending')
        .reduce((s, p) => s + parseFloat(p.amount), 0)

    const paymentBadge = (status) => {
        if (status === 'confirmed') return <span className="badge badge-green">Confirmed</span>
        if (status === 'pending')   return <span className="badge badge-amber">Pending</span>
        return <span className="badge badge-red">Failed</span>
    }

    const updatePaymentStatus = async (paymentId, status) => {
        setBusyPaymentId(paymentId)
        try {
            await api.put(`/admin/payments/${paymentId}/status`, { status })
            loadPayments()
        } finally {
            setBusyPaymentId(null)
        }
    }

    const f = (key, val) => setFilters(prev => ({...prev, [key]: val}))

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div className="page-title">Reports</div>
                        <div className="page-sub">Financial and incident data across all sessions</div>
                    </div>

                    <div className="tabs">
                        <button className={`tab ${tab === 'financial' ? 'active' : ''}`} onClick={() => setTab('financial')}>💳 Financial</button>
                        <button className={`tab ${tab === 'incidents' ? 'active' : ''}`} onClick={() => setTab('incidents')}>🚨 Incidents</button>
                    </div>

                    {tab === 'financial' && (
                        <>
                            <div className="summary-cards">
                                <div className="summary-card">
                                    <div className="summary-label">Total Payments</div>
                                    <div className="summary-value">{payments.length}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Collected</div>
                                    <div className="summary-value green">${totalCollected.toFixed(2)}</div>
                                </div>
                                <div className="summary-card">
                                    <div className="summary-label">Pending</div>
                                    <div className="summary-value amber">${totalPending.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="filters">
                                <div className="filter-field">
                                    <label className="filter-label">Status</label>
                                    <select className="filter-select" value={filters.status} onChange={e => f('status', e.target.value)}>
                                        <option value=''>All Statuses</option>
                                        <option value='confirmed'>Confirmed</option>
                                        <option value='pending'>Pending</option>
                                        <option value='failed'>Failed</option>
                                    </select>
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', date: '' })}>
                                    Clear Filters
                                </button>
                            </div>

                            <div className="report-panel">
                                <div className="report-header">
                                    <div className="report-title">Payment Records ({filteredPayments.length})</div>
                                </div>
                                {filteredPayments.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">💳</div>
                                        <div className="empty-text">No payment records found</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Camper</th>
                                                <th>Session</th>
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPayments.map(p => (
                                                <tr key={p.id}>
                                                    <td>#{p.id}</td>
                                                    <td>{p.camper_name || '—'}</td>
                                                    <td>{p.session_name || '—'}</td>
                                                    <td><strong>${parseFloat(p.amount).toFixed(2)}</strong></td>
                                                    <td>{paymentBadge(p.status)}</td>
                                                    <td>{p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '—'}</td>
                                                    <td>
                                                        {p.status === 'pending' ? (
                                                            <div className="actions">
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    disabled={busyPaymentId === p.id}
                                                                    onClick={() => updatePaymentStatus(p.id, 'confirmed')}
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    className="btn btn-danger btn-sm"
                                                                    disabled={busyPaymentId === p.id}
                                                                    onClick={() => updatePaymentStatus(p.id, 'failed')}
                                                                >
                                                                    Fail
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span style={{color:'#a08c72'}}>No action</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}

                    {tab === 'incidents' && (
                        <>
                            <div className="filters">
                                <div className="filter-field">
                                    <label className="filter-label">Date</label>
                                    <input className="filter-input" type="date" value={filters.date} onChange={e => f('date', e.target.value)} />
                                </div>
                                <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', date: '' })}>
                                    Clear Filters
                                </button>
                            </div>

                            <div className="report-panel">
                                <div className="report-header">
                                    <div className="report-title">Incident Reports ({incidents.length})</div>
                                </div>
                                {incidents.length === 0 ? (
                                    <div className="empty-state">
                                        <div className="empty-icon">🚨</div>
                                        <div className="empty-text">No incident reports found</div>
                                    </div>
                                ) : (
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Camper</th>
                                                <th>Session</th>
                                                <th>Reported By</th>
                                                <th>Description</th>
                                                <th>Action Taken</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {incidents
                                                .filter(i => !filters.date || i.incident_date === filters.date)
                                                .map(i => (
                                                    <tr key={i.id}>
                                                        <td>{i.incident_date}</td>
                                                        <td>{i.incident_time}</td>
                                                        <td>{i.camper_name || `#${i.camper_id}`}</td>
                                                        <td>{i.session_name || `#${i.session_id}`}</td>
                                                        <td>{i.reported_by_name || `#${i.reported_by}`}</td>
                                                        <td style={{maxWidth:'280px'}}>{i.description}</td>
                                                        <td>{i.action_taken || <span style={{color:'#c8b89a'}}>—</span>}</td>
                                                    </tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}
