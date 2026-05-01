import { useEffect, useState } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/axios'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  .page-root { min-height: 100vh; background: #f4f6f3; font-family: 'DM Sans', sans-serif; }
  .page-body { padding: 40px 48px; }
  .page-top { margin-bottom: 32px; }
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

  .tabs { display: flex; gap: 4px; background: #fff; border: 1px solid #e8ebe6; border-radius: 12px; padding: 4px; margin-bottom: 28px; width: fit-content; }
  .tab { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: #888; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .tab.active { background: #0f1117; color: #fff; }
  .tab:hover:not(.active) { background: #f4f6f3; color: #333; }

  .filters {
    background: #fff;
    border: 1px solid #e8ebe6;
    border-radius: 14px;
    padding: 20px 24px;
    margin-bottom: 24px;
    display: flex;
    gap: 16px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  .filter-field { display: flex; flex-direction: column; gap: 6px; }
  .filter-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #888; }
  .filter-input { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; background: #fafafa; transition: border-color 0.2s; }
  .filter-input:focus { border-color: #63d2a6; }
  .filter-select { padding: 9px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #0f1117; outline: none; background: #fafafa; cursor: pointer; }

  .report-panel { background: #fff; border-radius: 16px; border: 1px solid #e8ebe6; overflow: hidden; }

  .report-header { padding: 20px 24px; border-bottom: 1px solid #f0f2ee; display: flex; justify-content: space-between; align-items: center; }
  .report-title { font-size: 15px; font-weight: 600; color: #0f1117; }
  .report-actions { display: flex; gap: 10px; }

  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #fafbf9; }
  th { padding: 12px 20px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #999; border-bottom: 1px solid #f0f2ee; }
  td { padding: 14px 20px; font-size: 14px; color: #333; border-bottom: 1px solid #f9faf8; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbf9; }

  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
  .badge-green { background: #f0fdf4; color: #16a34a; }
  .badge-yellow { background: #fffbeb; color: #d97706; }
  .badge-red { background: #fef2f2; color: #dc2626; }
  .badge-gray { background: #f3f4f6; color: #6b7280; }

  .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }

  .summary-card { background: #fff; border: 1px solid #e8ebe6; border-radius: 14px; padding: 22px 24px; }
  .summary-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #aaa; margin-bottom: 8px; font-weight: 600; }
  .summary-value { font-size: 28px; font-weight: 700; color: #0f1117; font-family: 'DM Serif Display', serif; }
  .summary-value.green { color: #16a34a; }
  .summary-value.orange { color: #d97706; }

  .empty-state { padding: 60px; text-align: center; color: #bbb; }
  .empty-icon { font-size: 40px; margin-bottom: 12px; }
  .empty-text { font-size: 14px; }
`

export default function Reports() {
    const [tab, setTab]         = useState('financial')
    const [payments, setPayments]   = useState([])
    const [incidents, setIncidents] = useState([])
    const [filters, setFilters] = useState({ session_id: '', date: '', status: '' })

    useEffect(() => {
        api.get('/admin/payments').then(r => setPayments(r.data.data || []))
        api.get('/admin/incidents').then(r => setIncidents(r.data.data || []))
    }, [])

    const filteredPayments = payments.filter(p => {
        if (filters.status && p.status !== filters.status) return false
        return true
    })

    const totalCollected  = filteredPayments.filter(p => p.status === 'Confirmed').reduce((s, p) => s + parseFloat(p.amount), 0)
    const totalPending    = filteredPayments.filter(p => p.status === 'Pending').reduce((s, p) => s + parseFloat(p.amount), 0)

    const paymentBadge = (status) => {
        if (status === 'Confirmed') return <span className="badge badge-green">Confirmed</span>
        if (status === 'Pending')   return <span className="badge badge-yellow">Pending</span>
        return <span className="badge badge-red">Failed</span>
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
                                    <div className="summary-value orange">${totalPending.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className="filters">
                                <div className="filter-field">
                                    <label className="filter-label">Status</label>
                                    <select className="filter-select" value={filters.status} onChange={e => f('status', e.target.value)}>
                                        <option value=''>All Statuses</option>
                                        <option value='Confirmed'>Confirmed</option>
                                        <option value='Pending'>Pending</option>
                                        <option value='Failed'>Failed</option>
                                    </select>
                                </div>
                                <button className="btn btn-outline btn-sm" onClick={() => setFilters({ session_id: '', date: '', status: '' })}>
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
                                                <th>Amount</th>
                                                <th>Status</th>
                                                <th>Card Last 4</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPayments.map(p => (
                                                <tr key={p.id}>
                                                    <td>#{p.id}</td>
                                                    <td><strong>${parseFloat(p.amount).toFixed(2)}</strong></td>
                                                    <td>{paymentBadge(p.status)}</td>
                                                    <td>•••• {p.card_last4}</td>
                                                    <td>{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '—'}</td>
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
                                <button className="btn btn-outline btn-sm" onClick={() => setFilters({ session_id: '', date: '', status: '' })}>
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
                                                <th>Camper ID</th>
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
                                                    <td>#{i.camper_id}</td>
                                                    <td style={{maxWidth:'300px'}}>{i.description}</td>
                                                    <td>{i.action_taken || <span style={{color:'#ccc'}}>—</span>}</td>
                                                </tr>
                                            ))}
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
