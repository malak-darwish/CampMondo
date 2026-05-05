from io import BytesIO

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


def build_financial_report_pdf(report_data):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    y = height - 50
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(50, y, "CampMondo Financial Report")

    y -= 35
    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y, f"Total Collected: ${report_data['total_collected']:.2f}")
    y -= 18
    pdf.drawString(50, y, f"Total Outstanding: ${report_data['total_outstanding']:.2f}")

    y -= 35
    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(50, y, "Camper")
    pdf.drawString(180, y, "Session")
    pdf.drawString(330, y, "Amount")
    pdf.drawString(420, y, "Status")

    pdf.setFont("Helvetica", 10)
    y -= 18
    for row in report_data["payments"]:
        if y < 50:
            pdf.showPage()
            y = height - 50
            pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, str(row.get("camper_name") or ""))
        pdf.drawString(180, y, str(row.get("session_name") or ""))
        pdf.drawString(330, y, f"${row.get('amount', 0):.2f}")
        pdf.drawString(420, y, str(row.get("status") or ""))
        y -= 16

    pdf.save()
    buffer.seek(0)
    return buffer
