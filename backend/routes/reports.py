"""
Admin Reports - closes FR 4.13 (attendance report), 4.14 (financial report),
4.15 (PDF export of any report), and 4.16 (incidents with full filters).

Each report has TWO endpoints:
    GET /api/admin/reports/<kind>            -> JSON data for the UI
    GET /api/admin/reports/<kind>/pdf        -> PDF download

All accept the same query parameters so the UI can build a single filter
form per tab and reuse it for both the table and the PDF button.
"""

from datetime import date, datetime
from collections import defaultdict
from decimal import Decimal

from flask import Blueprint, request, jsonify

from app import db
from app.models.user import User
from app.models.camper import Camper
from app.models.session import Session
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.attendance import AttendanceLog
from app.models.incident import IncidentReport
from app.utils.auth_helpers import role_required
from app.utils.pdf import CampMondoPDF, pdf_response


reports_bp = Blueprint('reports', __name__)


def fail(message, status=400):
    return jsonify({'success': False, 'message': message}), status


def ok(data=None, message='Success', status=200):
    return jsonify({'success': True, 'data': data, 'message': message}), status


# ───────────────────────────────────────────────────────────
#  SHARED FILTER PARSING
# ───────────────────────────────────────────────────────────

def _parse_date(raw, field_name):
    """Parse YYYY-MM-DD or return (None, error_response)."""
    if not raw:
        return None, None
    try:
        return datetime.strptime(raw, '%Y-%m-%d').date(), None
    except ValueError:
        return None, fail(f'Invalid {field_name} (expected YYYY-MM-DD)')


def _filter_args():
    """Pull the standard filter args from the request. Returns dict or aborts."""
    session_id = request.args.get('session_id', type=int)
    camper_id  = request.args.get('camper_id',  type=int)
    camper_name = (request.args.get('camper_name') or '').strip()

    start_date, err = _parse_date(request.args.get('start_date'), 'start_date')
    if err: return None, err
    end_date, err = _parse_date(request.args.get('end_date'), 'end_date')
    if err: return None, err

    if start_date and end_date and start_date > end_date:
        return None, fail('start_date cannot be after end_date')

    return {
        'session_id':  session_id,
        'camper_id':   camper_id,
        'camper_name': camper_name or None,
        'start_date':  start_date,
        'end_date':    end_date,
    }, None


# ═══════════════════════════════════════════════════════════
#  FR 4.13 - ATTENDANCE REPORT
# ═══════════════════════════════════════════════════════════

def _build_attendance_report(filters):
    """
    Returns:
        {
            'session': {...} or None,
            'filters': {...},
            'rows': [{ camper_id, camper_name, date, status, checked_in, checked_out }, ...],
            'summary_by_camper': [{ camper_id, camper_name, present, absent, pending, total }, ...],
            'totals': { present, absent, pending, total }
        }
    """
    q = AttendanceLog.query

    if filters['session_id']:
        q = q.filter(AttendanceLog.session_id == filters['session_id'])
    if filters['camper_id']:
        q = q.filter(AttendanceLog.camper_id == filters['camper_id'])
    if filters['start_date']:
        q = q.filter(AttendanceLog.log_date >= filters['start_date'])
    if filters['end_date']:
        q = q.filter(AttendanceLog.log_date <= filters['end_date'])

    # Camper name filter requires a join
    if filters['camper_name']:
        q = q.join(Camper, AttendanceLog.camper_id == Camper.id) \
             .filter(Camper.full_name.ilike(f"%{filters['camper_name']}%"))

    q = q.order_by(AttendanceLog.log_date.asc(), AttendanceLog.camper_id.asc())
    logs = q.all()

    # Bulk-lookup campers so we can name them
    camper_ids = {l.camper_id for l in logs}
    campers = {c.id: c for c in Camper.query.filter(Camper.id.in_(camper_ids)).all()} if camper_ids else {}

    rows = []
    per_camper = defaultdict(lambda: {'present': 0, 'absent': 0, 'pending': 0})
    totals = {'present': 0, 'absent': 0, 'pending': 0, 'total': 0}

    for l in logs:
        camper = campers.get(l.camper_id)
        rows.append({
            'log_id':       l.id,
            'camper_id':    l.camper_id,
            'camper_name':  camper.full_name if camper else f'#{l.camper_id}',
            'session_id':   l.session_id,
            'group_id':     l.group_id,
            'date':         str(l.log_date),
            'status':       l.status,
            'checked_in':   l.checked_in_at.isoformat()  if l.checked_in_at  else None,
            'checked_out':  l.checked_out_at.isoformat() if l.checked_out_at else None,
        })
        per_camper[l.camper_id][l.status] += 1
        totals[l.status] += 1
        totals['total']  += 1

    summary_by_camper = []
    for cid, counts in sorted(per_camper.items()):
        c = campers.get(cid)
        summary_by_camper.append({
            'camper_id':   cid,
            'camper_name': c.full_name if c else f'#{cid}',
            'present':     counts['present'],
            'absent':      counts['absent'],
            'pending':     counts['pending'],
            'total':       sum(counts.values()),
        })

    session = None
    if filters['session_id']:
        s = Session.query.get(filters['session_id'])
        if s:
            session = {'id': s.id, 'name': s.name,
                       'start_date': str(s.start_date), 'end_date': str(s.end_date)}

    return {
        'session':           session,
        'filters':           {k: (str(v) if hasattr(v, 'isoformat') else v) for k, v in filters.items()},
        'rows':              rows,
        'summary_by_camper': summary_by_camper,
        'totals':            totals,
    }


@reports_bp.get('/attendance')
@role_required('admin')
def attendance_report():
    filters, err = _filter_args()
    if err: return err
    return ok(_build_attendance_report(filters))


@reports_bp.get('/attendance/pdf')
@role_required('admin')
def attendance_report_pdf():
    filters, err = _filter_args()
    if err: return err
    report = _build_attendance_report(filters)

    subtitle_parts = []
    if report['session']:
        subtitle_parts.append(f"Session: {report['session']['name']}")
    if filters['start_date'] or filters['end_date']:
        subtitle_parts.append(
            f"Range: {filters['start_date'] or '...'} -> {filters['end_date'] or '...'}"
        )
    subtitle = ' | '.join(subtitle_parts) if subtitle_parts else 'All sessions, all dates'

    pdf = CampMondoPDF(title='Attendance Report', subtitle=subtitle)
    pdf.title_block()

    # Totals
    pdf.section_heading('Summary')
    t = report['totals']
    pdf.key_value_row('Total records', t['total'])
    pdf.key_value_row('Present', t['present'])
    pdf.key_value_row('Absent', t['absent'])
    pdf.key_value_row('Pending', t['pending'])

    # Per-camper summary
    if report['summary_by_camper']:
        pdf.section_heading('Per-Camper Summary')
        pdf.table(
            headers=['Camper', 'Present', 'Absent', 'Pending', 'Total'],
            rows=[
                [r['camper_name'], r['present'], r['absent'], r['pending'], r['total']]
                for r in report['summary_by_camper']
            ],
            col_widths=[80, 25, 25, 25, 25],
        )

    # Detailed log
    if report['rows']:
        pdf.section_heading('Detailed Records')
        pdf.table(
            headers=['Date', 'Camper', 'Status', 'Checked In', 'Checked Out'],
            rows=[
                [r['date'], r['camper_name'], r['status'].title(),
                 (r['checked_in']  or '-')[:16],
                 (r['checked_out'] or '-')[:16]]
                for r in report['rows']
            ],
            col_widths=[25, 60, 25, 35, 35],
        )
    else:
        pdf.section_heading('Detailed Records')
        pdf.set_font('Helvetica', 'I', 10)
        pdf.cell(0, 6, 'No attendance records found for the selected filters.', ln=1)

    return pdf_response(pdf, f"attendance-report-{date.today().isoformat()}.pdf")


# ═══════════════════════════════════════════════════════════
#  FR 4.14 - FINANCIAL REPORT (per-session, per-camper summary)
# ═══════════════════════════════════════════════════════════

def _build_financial_report(filters):
    """
    Returns total collected (confirmed payments), total outstanding (pending +
    failed), and a per-camper breakdown.
    """
    q = Payment.query.join(Enrollment, Payment.enrollment_id == Enrollment.id)

    if filters['session_id']:
        q = q.filter(Enrollment.session_id == filters['session_id'])
    if filters['camper_id']:
        q = q.filter(Enrollment.camper_id == filters['camper_id'])
    if filters['start_date']:
        q = q.filter(Payment.submitted_at >= datetime.combine(filters['start_date'], datetime.min.time()))
    if filters['end_date']:
        q = q.filter(Payment.submitted_at <= datetime.combine(filters['end_date'], datetime.max.time()))
    if filters['camper_name']:
        q = q.join(Camper, Enrollment.camper_id == Camper.id) \
             .filter(Camper.full_name.ilike(f"%{filters['camper_name']}%"))

    payments = q.all()

    # Bulk lookups
    enrollment_ids = {p.enrollment_id for p in payments}
    enrollments = {
        e.id: e for e in Enrollment.query.filter(Enrollment.id.in_(enrollment_ids)).all()
    } if enrollment_ids else {}

    camper_ids = {e.camper_id for e in enrollments.values()}
    campers = {c.id: c for c in Camper.query.filter(Camper.id.in_(camper_ids)).all()} if camper_ids else {}

    total_collected   = Decimal('0.00')
    total_outstanding = Decimal('0.00')

    per_camper = defaultdict(lambda: {
        'collected': Decimal('0.00'),
        'pending':   Decimal('0.00'),
        'failed':    Decimal('0.00'),
    })

    rows = []
    for p in payments:
        enr = enrollments.get(p.enrollment_id)
        camper_id   = enr.camper_id if enr else None
        camper      = campers.get(camper_id) if camper_id else None
        camper_name = camper.full_name if camper else '-'

        rows.append({
            'payment_id':   p.id,
            'camper_id':    camper_id,
            'camper_name':  camper_name,
            'session_id':   enr.session_id if enr else None,
            'amount':       float(p.amount),
            'status':       p.status,
            'submitted_at': p.submitted_at.isoformat() if p.submitted_at else None,
            'admin_note':   p.admin_note,
        })

        if p.status == 'confirmed':
            total_collected += p.amount
            per_camper[camper_id]['collected'] += p.amount
        elif p.status == 'pending':
            total_outstanding += p.amount
            per_camper[camper_id]['pending'] += p.amount
        elif p.status == 'failed':
            total_outstanding += p.amount
            per_camper[camper_id]['failed'] += p.amount

    summary_by_camper = []
    for cid, sums in per_camper.items():
        c = campers.get(cid)
        summary_by_camper.append({
            'camper_id':   cid,
            'camper_name': c.full_name if c else '-',
            'collected':   float(sums['collected']),
            'pending':     float(sums['pending']),
            'failed':      float(sums['failed']),
            'outstanding': float(sums['pending'] + sums['failed']),
            'total_owed':  float(sums['collected'] + sums['pending'] + sums['failed']),
        })
    summary_by_camper.sort(key=lambda r: r['camper_name'].lower())

    session = None
    if filters['session_id']:
        s = Session.query.get(filters['session_id'])
        if s:
            session = {'id': s.id, 'name': s.name,
                       'enrollment_fee': float(s.enrollment_fee)}

    return {
        'session':           session,
        'totals': {
            'collected':   float(total_collected),
            'outstanding': float(total_outstanding),
            'payments':    len(payments),
        },
        'rows':              rows,
        'summary_by_camper': summary_by_camper,
    }


@reports_bp.get('/financial')
@role_required('admin')
def financial_report():
    filters, err = _filter_args()
    if err: return err
    return ok(_build_financial_report(filters))


@reports_bp.get('/financial/pdf')
@role_required('admin')
def financial_report_pdf():
    filters, err = _filter_args()
    if err: return err
    report = _build_financial_report(filters)

    subtitle_parts = []
    if report['session']:
        subtitle_parts.append(f"Session: {report['session']['name']}")
    if filters['start_date'] or filters['end_date']:
        subtitle_parts.append(f"Range: {filters['start_date'] or '...'} -> {filters['end_date'] or '...'}")
    subtitle = ' | '.join(subtitle_parts) if subtitle_parts else 'All sessions, all dates'

    pdf = CampMondoPDF(title='Financial Report', subtitle=subtitle)
    pdf.title_block()

    pdf.section_heading('Summary')
    pdf.key_value_row('Total collected', f"${report['totals']['collected']:.2f}")
    pdf.key_value_row('Total outstanding', f"${report['totals']['outstanding']:.2f}")
    pdf.key_value_row('Transactions', report['totals']['payments'])

    if report['summary_by_camper']:
        pdf.section_heading('Per-Camper Summary')
        pdf.table(
            headers=['Camper', 'Collected', 'Outstanding', 'Total'],
            rows=[
                [r['camper_name'],
                 f"${r['collected']:.2f}",
                 f"${r['outstanding']:.2f}",
                 f"${r['total_owed']:.2f}"]
                for r in report['summary_by_camper']
            ],
            col_widths=[80, 35, 35, 30],
        )

    if report['rows']:
        pdf.section_heading('Transactions')
        pdf.table(
            headers=['Date', 'Camper', 'Amount', 'Status'],
            rows=[
                [(r['submitted_at'] or '-')[:10],
                 r['camper_name'],
                 f"${r['amount']:.2f}",
                 r['status'].title()]
                for r in report['rows']
            ],
            col_widths=[30, 80, 35, 35],
        )
    else:
        pdf.section_heading('Transactions')
        pdf.set_font('Helvetica', 'I', 10)
        pdf.cell(0, 6, 'No payments found for the selected filters.', ln=1)

    return pdf_response(pdf, f"financial-report-{date.today().isoformat()}.pdf")


# ═══════════════════════════════════════════════════════════
#  FR 4.16 - INCIDENTS REPORT (with full filters + PDF)
# ═══════════════════════════════════════════════════════════

def _build_incidents_report(filters):
    q = IncidentReport.query

    if filters['session_id']:
        q = q.filter(IncidentReport.session_id == filters['session_id'])
    if filters['camper_id']:
        q = q.filter(IncidentReport.camper_id == filters['camper_id'])

    # Incident date may be called incident_date or created_at depending on
    # Person 2's model. We filter on whichever exists.
    date_col = getattr(IncidentReport, 'incident_date', None) \
            or getattr(IncidentReport, 'created_at', None)
    if date_col is not None:
        if filters['start_date']:
            q = q.filter(date_col >= filters['start_date'])
        if filters['end_date']:
            q = q.filter(date_col <= filters['end_date'])

    if filters['camper_name']:
        q = q.join(Camper, IncidentReport.camper_id == Camper.id) \
             .filter(Camper.full_name.ilike(f"%{filters['camper_name']}%"))

    incidents = q.all()

    camper_ids = {i.camper_id for i in incidents if i.camper_id}
    campers = {c.id: c for c in Camper.query.filter(Camper.id.in_(camper_ids)).all()} if camper_ids else {}

    rows = []
    for inc in incidents:
        d = inc.to_dict() if hasattr(inc, 'to_dict') else {}
        camper = campers.get(inc.camper_id) if inc.camper_id else None
        d['camper_name'] = camper.full_name if camper else '-'
        rows.append(d)

    return {
        'rows':    rows,
        'totals':  {'count': len(rows)},
    }


@reports_bp.get('/incidents')
@role_required('admin')
def incidents_report():
    filters, err = _filter_args()
    if err: return err
    try:
        return ok(_build_incidents_report(filters))
    except Exception as exc:
        # Incident model has been flaky in development (Person 2's work).
        return fail(f'Could not load incidents: {exc}', 500)


@reports_bp.get('/incidents/pdf')
@role_required('admin')
def incidents_report_pdf():
    filters, err = _filter_args()
    if err: return err
    try:
        report = _build_incidents_report(filters)
    except Exception as exc:
        return fail(f'Could not load incidents: {exc}', 500)

    subtitle_parts = []
    if filters['session_id']:
        s = Session.query.get(filters['session_id'])
        if s: subtitle_parts.append(f"Session: {s.name}")
    if filters['start_date'] or filters['end_date']:
        subtitle_parts.append(f"Range: {filters['start_date'] or '...'} -> {filters['end_date'] or '...'}")
    subtitle = ' | '.join(subtitle_parts) if subtitle_parts else 'All sessions, all dates'

    pdf = CampMondoPDF(title='Incident Reports', subtitle=subtitle)
    pdf.title_block()

    pdf.section_heading('Summary')
    pdf.key_value_row('Total incidents', report['totals']['count'])

    if report['rows']:
        pdf.section_heading('Incidents')
        # Build rows resiliently - incident model schema isn't finalized yet.
        table_rows = []
        for r in report['rows']:
            date_val = r.get('incident_date') or r.get('created_at') or r.get('date') or '-'
            description = r.get('description') or '-'
            action = r.get('action_taken') or '-'
            table_rows.append([
                str(date_val)[:10],
                r.get('camper_name', '-'),
                description,
                action,
            ])
        # Use wrap_table so long descriptions span multiple lines instead
        # of getting truncated. Total = 180mm (page width minus margins).
        pdf.wrap_table(
            headers=['Date', 'Camper', 'Description', 'Action Taken'],
            rows=table_rows,
            col_widths=[22, 38, 70, 50],
        )
    else:
        pdf.section_heading('Incidents')
        pdf.set_font('Helvetica', 'I', 10)
        pdf.cell(0, 6, 'No incidents found for the selected filters.', ln=1)

    return pdf_response(pdf, f"incidents-report-{date.today().isoformat()}.pdf")