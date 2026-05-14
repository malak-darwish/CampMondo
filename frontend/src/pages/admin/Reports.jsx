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
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: transparent; border: 1.5px solid #c8b89a; color: #5a4a35; }
  .btn-secondary:hover:not(:disabled) { border-color: #8a7a65; }
  .btn-success { background: #2e7d32; color: #fff; }
  .btn-success:hover:not(:disabled) { background: #256528; }
  .btn-danger { background: #c62828; color: #fff; }
  .btn-danger:hover:not(:disabled) { background: #a61f1f; }
  .btn-accent { background: #e8a838; color: #2c1810; }
  .btn-accent:hover:not(:disabled) { background: #d4961f; }
  .btn-primary { background: #3d6b45; color: #fff9f0; }
  .btn-primary:hover:not(:disabled) { background: #2c4a2e; }
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
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
  .summary-value.red   { color: #c62828; }

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
  .filter-input, .filter-select { padding: 8px 12px; border: 1.5px solid #e0d0b8; border-radius: 7px; font-size: 13px; font-family: 'Inter', sans-serif; color: #2c1810; outline: none; background: #fdf8f0; transition: border-color 0.2s; }
  .filter-input:focus, .filter-select:focus { border-color: #3d6b45; }
  .filter-spacer { flex: 1; }
  .filter-actions { display: flex; gap: 10px; }

  .report-panel {
    background: #fff9f0;
    border-radius: 13px;
    border: 1px solid #e8d5b5;
    overflow: hidden;
    margin-bottom: 20px;
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

  .loading { padding: 40px; text-align: center; color: #8a7a65; font-size: 13px; }

  .error-box {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  /* Modal (justification note) */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(44, 24, 16, 0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
  }
  .modal-card {
    background: #fff9f0;
    border-radius: 13px;
    padding: 28px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  }
  .modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    color: #2c1810;
    margin-bottom: 6px;
  }
  .modal-subtitle {
    font-size: 13px;
    color: #8a7a65;
    margin-bottom: 18px;
    line-height: 1.5;
  }
  .modal-label {
    display: block;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #5a4a35;
    margin-bottom: 6px;
  }
  .modal-textarea {
    width: 100%;
    min-height: 90px;
    padding: 11px 13px;
    border: 1.5px solid #e0d0b8;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Inter', sans-serif;
    color: #2c1810;
    background: #fff;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s;
  }
  .modal-textarea:focus { border-color: #3d6b45; }
  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }
  .modal-error {
    background: #fdecea;
    border: 1px solid #f5c6c6;
    color: #c62828;
    padding: 9px 12px;
    border-radius: 7px;
    font-size: 12px;
    margin-top: 10px;
  }
`

// ───────────────────────────────────────────────────────────
//  Helpers
// ───────────────────────────────────────────────────────────

const fmtMoney = (v) => `$${Number(v || 0).toFixed(2)}`
const fmtDate  = (v) => (v ? String(v).slice(0, 10) : '—')

function buildQueryString(filters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params.append(k, v)
    })
    const s = params.toString()
    return s ? `?${s}` : ''
}

async function downloadPdf(url, filename) {
    const res = await api.get(url, { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(link.href)
}


// ───────────────────────────────────────────────────────────
//  Justification Note Modal (FR 4.12)
// ───────────────────────────────────────────────────────────

function NoteModal({ open, action, payment, onClose, onConfirm }) {
    const [note, setNote] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => { if (open) { setNote(''); setError('') } }, [open])

    if (!open) return null

    const submit = async () => {
        if (!note.trim()) { setError('A justification note is required'); return }
        setSubmitting(true); setError('')
        try {
            await onConfirm(note.trim())
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update payment')
        } finally {
            setSubmitting(false)
        }
    }

    const actionLabel = action === 'confirmed' ? 'Confirm Payment' : 'Mark as Failed'
    const actionVerb  = action === 'confirmed' ? 'confirming' : 'marking as failed'

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
                <div className="modal-title">{actionLabel}</div>
                <div className="modal-subtitle">
                    You are {actionVerb} payment #{payment?.id} for{' '}
                    <strong>{payment?.camper_name || 'this camper'}</strong>
                    {' '}({fmtMoney(payment?.amount)}). Please provide a justification note for the audit trail.
                </div>

                <label className="modal-label">Justification Note <span style={{color:'#c62828'}}>*</span></label>
                <textarea
                    className="modal-textarea"
                    placeholder="e.g. Confirmed via bank transfer receipt #12345"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    autoFocus
                />

                {error && <div className="modal-error">⚠ {error}</div>}

                <div className="modal-actions">
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={onClose}
                        disabled={submitting}
                    >Cancel</button>
                    <button
                        className={`btn btn-sm ${action === 'confirmed' ? 'btn-success' : 'btn-danger'}`}
                        onClick={submit}
                        disabled={submitting}
                    >{submitting ? 'Saving…' : actionLabel}</button>
                </div>
            </div>
        </div>
    )
}


// ───────────────────────────────────────────────────────────
//  Filter Bar (shared)
// ───────────────────────────────────────────────────────────

function FilterBar({ filters, setFilters, sessions, campers, fields, onClear, onRun, onPdf, loading, pdfLoading }) {
    const show = (k) => fields.includes(k)
    return (
        <div className="filters">
            {show('session_id') && (
                <div className="filter-field">
                    <label className="filter-label">Session</label>
                    <select
                        className="filter-select"
                        value={filters.session_id}
                        onChange={e => setFilters({ ...filters, session_id: e.target.value })}
                    >
                        <option value=''>All Sessions</option>
                        {sessions.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {show('camper_id') && (
                <div className="filter-field">
                    <label className="filter-label">Camper</label>
                    <select
                        className="filter-select"
                        value={filters.camper_id}
                        onChange={e => setFilters({ ...filters, camper_id: e.target.value })}
                    >
                        <option value=''>All Campers</option>
                        {(campers || []).map(c => (
                            <option key={c.id} value={c.id}>{c.full_name}</option>
                        ))}
                    </select>
                </div>
            )}

            {show('status') && (
                <div className="filter-field">
                    <label className="filter-label">Status</label>
                    <select
                        className="filter-select"
                        value={filters.status}
                        onChange={e => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value=''>All Statuses</option>
                        <option value='confirmed'>Confirmed</option>
                        <option value='pending'>Pending</option>
                        <option value='failed'>Failed</option>
                    </select>
                </div>
            )}

            {show('start_date') && (
                <div className="filter-field">
                    <label className="filter-label">Start Date</label>
                    <input
                        className="filter-input"
                        type="date"
                        value={filters.start_date}
                        onChange={e => setFilters({ ...filters, start_date: e.target.value })}
                    />
                </div>
            )}

            {show('end_date') && (
                <div className="filter-field">
                    <label className="filter-label">End Date</label>
                    <input
                        className="filter-input"
                        type="date"
                        value={filters.end_date}
                        onChange={e => setFilters({ ...filters, end_date: e.target.value })}
                    />
                </div>
            )}

            <div className="filter-spacer" />

            <div className="filter-actions">
                <button className="btn btn-secondary btn-sm" onClick={onClear}>Clear</button>
                <button className="btn btn-primary btn-sm" onClick={onRun} disabled={loading}>
                    {loading ? 'Loading…' : 'Apply'}
                </button>
                <button className="btn btn-accent btn-sm" onClick={onPdf} disabled={pdfLoading || loading}>
                    {pdfLoading ? 'Generating…' : '⬇ Download PDF'}
                </button>
            </div>
        </div>
    )
}


// ───────────────────────────────────────────────────────────
//  Attendance Tab (FR 4.13)
// ───────────────────────────────────────────────────────────

const emptyAttFilters  = { session_id: '', camper_id: '', start_date: '', end_date: '' }

function AttendanceTab({ sessions }) {
    const [filters, setFilters] = useState(emptyAttFilters)
    const [campers, setCampers] = useState([])
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [error, setError]     = useState('')

    const load = async () => {
        setLoading(true); setError('')
        try {
            const res = await api.get('/admin/reports/attendance' + buildQueryString(filters))
            setData(res.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendance report')
        } finally {
            setLoading(false)
        }
    }

    const dlPdf = async () => {
        setPdfLoading(true); setError('')
        try {
            await downloadPdf(
                '/admin/reports/attendance/pdf' + buildQueryString(filters),
                `attendance-${new Date().toISOString().slice(0,10)}.pdf`
            )
        } catch {
            setError('Failed to download PDF')
        } finally {
            setPdfLoading(false)
        }
    }

    useEffect(() => { load() /* eslint-disable-line */ }, [])

    // Refetch campers when session changes; clear stale camper selection.
    useEffect(() => {
        const qs = filters.session_id ? `?session_id=${filters.session_id}` : ''
        api.get('/admin/campers' + qs)
            .then(r => setCampers(r.data.data || []))
            .catch(() => setCampers([]))
        if (filters.camper_id) setFilters(f => ({ ...f, camper_id: '' }))
        // eslint-disable-next-line
    }, [filters.session_id])

    const statusBadge = (s) =>
        s === 'present' ? <span className="badge badge-green">Present</span> :
        s === 'absent'  ? <span className="badge badge-red">Absent</span> :
        <span className="badge badge-amber">Pending</span>

    return (
        <>
            <FilterBar
                filters={filters} setFilters={setFilters}
                sessions={sessions} campers={campers}
                fields={['session_id', 'camper_id', 'start_date', 'end_date']}
                onClear={() => setFilters(emptyAttFilters)}
                onRun={load} onPdf={dlPdf}
                loading={loading} pdfLoading={pdfLoading}
            />

            {error && <div className="error-box">⚠ {error}</div>}

            {data && (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="summary-label">Total Records</div>
                            <div className="summary-value">{data.totals.total}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Present</div>
                            <div className="summary-value green">{data.totals.present}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Absent</div>
                            <div className="summary-value red">{data.totals.absent}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Pending</div>
                            <div className="summary-value amber">{data.totals.pending}</div>
                        </div>
                    </div>

                    <div className="report-panel">
                        <div className="report-header">
                            <div className="report-title">Per-Camper Summary</div>
                        </div>
                        {data.summary_by_camper.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">📋</div>
                                <div className="empty-text">No attendance records found</div>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Camper</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Pending</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.summary_by_camper.map(r => (
                                        <tr key={r.camper_id}>
                                            <td>{r.camper_name}</td>
                                            <td>{r.present}</td>
                                            <td>{r.absent}</td>
                                            <td>{r.pending}</td>
                                            <td><strong>{r.total}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {data.rows.length > 0 && (
                        <div className="report-panel">
                            <div className="report-header">
                                <div className="report-title">Detailed Records ({data.rows.length})</div>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Camper</th>
                                        <th>Status</th>
                                        <th>Checked In</th>
                                        <th>Checked Out</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map(r => (
                                        <tr key={r.log_id}>
                                            <td>{r.date}</td>
                                            <td>{r.camper_name}</td>
                                            <td>{statusBadge(r.status)}</td>
                                            <td>{r.checked_in  ? String(r.checked_in).slice(11, 16)  : '—'}</td>
                                            <td>{r.checked_out ? String(r.checked_out).slice(11, 16) : '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {loading && !data && <div className="loading">Loading attendance report…</div>}
        </>
    )
}


// ───────────────────────────────────────────────────────────
//  Financial Tab (FR 4.10, 4.11, 4.12, 4.14)
// ───────────────────────────────────────────────────────────

const emptyFinFilters = { session_id: '', camper_id: '', status: '', start_date: '', end_date: '' }

function FinancialTab({ sessions }) {
    const [filters, setFilters] = useState(emptyFinFilters)
    const [campers, setCampers] = useState([])
    const [data, setData]       = useState(null)
    const [payments, setPayments] = useState([])    // for the editable transactions table
    const [loading, setLoading] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [error, setError]     = useState('')
    const [busyPaymentId, setBusyPaymentId] = useState(null)

    // Modal state
    const [modalOpen, setModalOpen]       = useState(false)
    const [modalAction, setModalAction]   = useState('confirmed')
    const [modalPayment, setModalPayment] = useState(null)

    const load = async () => {
        setLoading(true); setError('')
        try {
            // Run both in parallel
            const qs = buildQueryString(filters)
            const [reportRes, paymentsRes] = await Promise.all([
                api.get('/admin/reports/financial' + qs),
                api.get('/admin/payments' + buildQueryString({
                    session_id: filters.session_id,
                    camper_id:  filters.camper_id,
                    status:     filters.status,
                    start_date: filters.start_date,
                    end_date:   filters.end_date,
                })),
            ])
            setData(reportRes.data.data)
            setPayments(paymentsRes.data.data || [])
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load financial report')
        } finally {
            setLoading(false)
        }
    }

    const dlPdf = async () => {
        setPdfLoading(true); setError('')
        try {
            await downloadPdf(
                '/admin/reports/financial/pdf' + buildQueryString(filters),
                `financial-${new Date().toISOString().slice(0,10)}.pdf`
            )
        } catch {
            setError('Failed to download PDF')
        } finally {
            setPdfLoading(false)
        }
    }

    useEffect(() => { load() /* eslint-disable-line */ }, [])

    // Refetch campers when session changes; clear stale camper selection.
    useEffect(() => {
        const qs = filters.session_id ? `?session_id=${filters.session_id}` : ''
        api.get('/admin/campers' + qs)
            .then(r => setCampers(r.data.data || []))
            .catch(() => setCampers([]))
        if (filters.camper_id) setFilters(f => ({ ...f, camper_id: '' }))
        // eslint-disable-next-line
    }, [filters.session_id])

    // Server filters by camper_id now, so no client-side filtering needed
    const filteredPayments = payments

    const openNoteModal = (payment, action) => {
        setModalPayment(payment)
        setModalAction(action)
        setModalOpen(true)
    }

    const submitOverride = async (note) => {
        setBusyPaymentId(modalPayment.id)
        try {
            await api.put(`/admin/payments/${modalPayment.id}/status`, {
                status: modalAction,
                note:   note,
            })
            await load()
        } finally {
            setBusyPaymentId(null)
        }
    }

    const paymentBadge = (status) =>
        status === 'confirmed' ? <span className="badge badge-green">Confirmed</span> :
        status === 'pending'   ? <span className="badge badge-amber">Pending</span> :
        <span className="badge badge-red">Failed</span>

    return (
        <>
            <FilterBar
                filters={filters} setFilters={setFilters} sessions={sessions} campers={campers}
                fields={['session_id', 'camper_id', 'status', 'start_date', 'end_date']}
                onClear={() => setFilters(emptyFinFilters)}
                onRun={load} onPdf={dlPdf}
                loading={loading} pdfLoading={pdfLoading}
            />

            {error && <div className="error-box">⚠ {error}</div>}

            {data && (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="summary-label">Transactions</div>
                            <div className="summary-value">{data.totals.payments}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Collected</div>
                            <div className="summary-value green">{fmtMoney(data.totals.collected)}</div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-label">Outstanding</div>
                            <div className="summary-value amber">{fmtMoney(data.totals.outstanding)}</div>
                        </div>
                    </div>

                    {data.summary_by_camper.length > 0 && (
                        <div className="report-panel">
                            <div className="report-header">
                                <div className="report-title">Per-Camper Summary</div>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Camper</th>
                                        <th>Collected</th>
                                        <th>Outstanding</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.summary_by_camper.map(r => (
                                        <tr key={r.camper_id || r.camper_name}>
                                            <td>{r.camper_name}</td>
                                            <td>{fmtMoney(r.collected)}</td>
                                            <td>{fmtMoney(r.outstanding)}</td>
                                            <td><strong>{fmtMoney(r.total_owed)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

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
                                            <td><strong>{fmtMoney(p.amount)}</strong></td>
                                            <td>{paymentBadge(p.status)}</td>
                                            <td>{p.submitted_at ? new Date(p.submitted_at).toLocaleDateString() : '—'}</td>
                                            <td>
                                                {p.status === 'pending' ? (
                                                    <div className="actions">
                                                        <button
                                                            className="btn btn-success btn-sm"
                                                            disabled={busyPaymentId === p.id}
                                                            onClick={() => openNoteModal(p, 'confirmed')}
                                                        >Approve</button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            disabled={busyPaymentId === p.id}
                                                            onClick={() => openNoteModal(p, 'failed')}
                                                        >Fail</button>
                                                    </div>
                                                ) : (
                                                    <span style={{color:'#a08c72'}} title={p.admin_note || ''}>
                                                        {p.admin_note ? '📝 ' : ''}No action
                                                    </span>
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

            {loading && !data && <div className="loading">Loading financial report…</div>}

            <NoteModal
                open={modalOpen}
                action={modalAction}
                payment={modalPayment}
                onClose={() => setModalOpen(false)}
                onConfirm={submitOverride}
            />
        </>
    )
}


// ───────────────────────────────────────────────────────────
//  Incidents Tab (FR 4.16)
// ───────────────────────────────────────────────────────────

const emptyIncFilters = { session_id: '', camper_id: '', start_date: '', end_date: '' }

function IncidentsTab({ sessions }) {
    const [filters, setFilters] = useState(emptyIncFilters)
    const [campers, setCampers] = useState([])
    const [data, setData]       = useState(null)
    const [loading, setLoading] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)
    const [error, setError]     = useState('')

    const load = async () => {
        setLoading(true); setError('')
        try {
            const res = await api.get('/admin/reports/incidents' + buildQueryString(filters))
            setData(res.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load incident reports')
        } finally {
            setLoading(false)
        }
    }

    const dlPdf = async () => {
        setPdfLoading(true); setError('')
        try {
            await downloadPdf(
                '/admin/reports/incidents/pdf' + buildQueryString(filters),
                `incidents-${new Date().toISOString().slice(0,10)}.pdf`
            )
        } catch {
            setError('Failed to download PDF')
        } finally {
            setPdfLoading(false)
        }
    }

    useEffect(() => { load() /* eslint-disable-line */ }, [])

    // Refetch campers when session changes; clear stale camper selection.
    useEffect(() => {
        const qs = filters.session_id ? `?session_id=${filters.session_id}` : ''
        api.get('/admin/campers' + qs)
            .then(r => setCampers(r.data.data || []))
            .catch(() => setCampers([]))
        if (filters.camper_id) setFilters(f => ({ ...f, camper_id: '' }))
        // eslint-disable-next-line
    }, [filters.session_id])

    return (
        <>
            <FilterBar
                filters={filters} setFilters={setFilters} sessions={sessions} campers={campers}
                fields={['session_id', 'camper_id', 'start_date', 'end_date']}
                onClear={() => setFilters(emptyIncFilters)}
                onRun={load} onPdf={dlPdf}
                loading={loading} pdfLoading={pdfLoading}
            />

            {error && <div className="error-box">⚠ {error}</div>}

            {data && (
                <>
                    <div className="summary-cards">
                        <div className="summary-card">
                            <div className="summary-label">Total Incidents</div>
                            <div className="summary-value">{data.totals.count}</div>
                        </div>
                    </div>

                    <div className="report-panel">
                        <div className="report-header">
                            <div className="report-title">Incident Reports ({data.rows.length})</div>
                        </div>
                        {data.rows.length === 0 ? (
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
                                    {data.rows.map(i => (
                                        <tr key={i.id}>
                                            <td>{fmtDate(i.incident_date || i.created_at)}</td>
                                            <td>{i.incident_time || '—'}</td>
                                            <td>{i.camper_name || `#${i.camper_id}`}</td>
                                            <td>{i.session_name || (i.session_id ? `#${i.session_id}` : '—')}</td>
                                            <td>{i.reported_by_name || (i.reported_by ? `#${i.reported_by}` : '—')}</td>
                                            <td style={{maxWidth:'280px'}}>{i.description || '—'}</td>
                                            <td>{i.action_taken || <span style={{color:'#c8b89a'}}>—</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {loading && !data && <div className="loading">Loading incident reports…</div>}
        </>
    )
}


// ───────────────────────────────────────────────────────────
//  Page
// ───────────────────────────────────────────────────────────

export default function Reports() {
    const [tab, setTab] = useState('financial')
    const [sessions, setSessions] = useState([])

    useEffect(() => {
        api.get('/admin/sessions')
            .then(r => setSessions(r.data.data || []))
            .catch(() => setSessions([]))
    }, [])

    return (
        <>
            <style>{styles}</style>
            <div className="page-root">
                <Navbar />
                <div className="page-body">
                    <div className="page-top">
                        <div className="page-title">Reports</div>
                        <div className="page-sub">
                            Attendance, financial, and incident data — filter by session, camper, or date range, and export as PDF
                        </div>
                    </div>

                    <div className="tabs">
                        <button
                            className={`tab ${tab === 'attendance' ? 'active' : ''}`}
                            onClick={() => setTab('attendance')}
                        >📋 Attendance</button>
                        <button
                            className={`tab ${tab === 'financial' ? 'active' : ''}`}
                            onClick={() => setTab('financial')}
                        >💳 Financial</button>
                        <button
                            className={`tab ${tab === 'incidents' ? 'active' : ''}`}
                            onClick={() => setTab('incidents')}
                        >🚨 Incidents</button>
                    </div>

                    {tab === 'attendance' && <AttendanceTab sessions={sessions} />}
                    {tab === 'financial'  && <FinancialTab  sessions={sessions} />}
                    {tab === 'incidents'  && <IncidentsTab  sessions={sessions} />}
                </div>
            </div>
        </>
    )
}