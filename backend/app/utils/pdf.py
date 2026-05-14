"""
PDF generation helpers for CampMondo reports.

Uses fpdf2 (pip install fpdf2). Latin-1 safe — uses built-in Helvetica
font so we don't have to ship a TTF.
"""

from datetime import datetime
from io import BytesIO

from fpdf import FPDF


COLOR_FOREST    = (44, 74, 46)
COLOR_AMBER     = (232, 168, 56)
COLOR_CREAM     = (245, 240, 232)
COLOR_DARK      = (44, 24, 16)
COLOR_MUTED     = (138, 122, 101)
COLOR_TABLE_ALT = (255, 249, 240)


def _ascii_safe(s):
    """Sanitize Unicode chars that the built-in Latin-1 font can't render."""
    if s is None:
        return ''
    s = str(s)
    replacements = {
        '\u2026': '...', '\u2014': '-', '\u2013': '-',
        '\u2192': '->',  '\u2190': '<-',
        '\u2018': "'",   '\u2019': "'",
        '\u201c': '"',   '\u201d': '"',
        '\u00a0': ' ',   '\u2022': '*',  '\u00d7': 'x',
    }
    for uni, ascii_ in replacements.items():
        s = s.replace(uni, ascii_)
    return s.encode('latin-1', errors='replace').decode('latin-1')


class CampMondoPDF(FPDF):
    """Base PDF class with branded header + footer."""

    def __init__(self, title='Report', subtitle=''):
        super().__init__(orientation='P', unit='mm', format='A4')
        self._doc_title    = _ascii_safe(title)
        self._doc_subtitle = _ascii_safe(subtitle)
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(left=15, top=15, right=15)
        self.add_page()

    def header(self):
        self.set_fill_color(*COLOR_FOREST)
        self.rect(0, 0, 210, 18, style='F')

        self.set_y(5); self.set_x(15)
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(255, 249, 240)
        self.cell(28, 8, 'Camp', ln=0)
        self.set_text_color(*COLOR_AMBER)
        self.cell(20, 8, 'Mondo', ln=0)

        self.set_text_color(255, 249, 240)
        self.set_font('Helvetica', '', 8)
        ts = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
        self.set_xy(140, 7)
        self.cell(55, 5, f'Generated: {ts}', ln=0, align='R')

        self.set_y(26)
        self.set_text_color(*COLOR_DARK)

    def footer(self):
        self.set_y(-12)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(*COLOR_MUTED)
        self.cell(0, 8, f'Page {self.page_no()} / {{nb}}', align='C')

    def title_block(self):
        self.set_text_color(*COLOR_DARK)
        self.set_font('Helvetica', 'B', 18)
        self.cell(0, 8, self._doc_title, ln=1)
        if self._doc_subtitle:
            self.set_font('Helvetica', '', 11)
            self.set_text_color(*COLOR_MUTED)
            self.cell(0, 6, self._doc_subtitle, ln=1)
        self.ln(4)

    def section_heading(self, text):
        self.ln(2)
        self.set_font('Helvetica', 'B', 12)
        self.set_text_color(*COLOR_FOREST)
        self.cell(0, 7, _ascii_safe(text), ln=1)
        self.set_text_color(*COLOR_DARK)
        self.ln(1)

    def key_value_row(self, label, value):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(*COLOR_MUTED)
        self.cell(45, 6, _ascii_safe(label), ln=0)
        self.set_font('Helvetica', '', 10)
        self.set_text_color(*COLOR_DARK)
        self.cell(0, 6, _ascii_safe(value), ln=1)

    # ─── Simple single-line table (truncates) ──────────────

    def table(self, headers, rows, col_widths=None):
        if not col_widths:
            usable = 210 - 15 - 15
            col_widths = [usable / len(headers)] * len(headers)

        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(*COLOR_FOREST)
        self.set_text_color(255, 249, 240)
        for header, w in zip(headers, col_widths):
            self.cell(w, 8, _ascii_safe(header), border=0, ln=0, align='L', fill=True)
        self.ln()

        self.set_font('Helvetica', '', 9)
        self.set_text_color(*COLOR_DARK)

        for i, row in enumerate(rows):
            if i % 2 == 0:
                self.set_fill_color(*COLOR_TABLE_ALT)
            else:
                self.set_fill_color(255, 255, 255)
            for value, w in zip(row, col_widths):
                s = _ascii_safe(value)
                if len(s) > int(w * 0.7):
                    s = s[: max(0, int(w * 0.7) - 3)] + '...'
                self.cell(w, 7, s, border=0, ln=0, align='L', fill=True)
            self.ln()

        self.set_draw_color(*COLOR_MUTED)
        self.set_line_width(0.2)
        x_start = self.l_margin
        y = self.get_y()
        self.line(x_start, y, x_start + sum(col_widths), y)
        self.ln(2)

    # ─── Multi-line wrapping table ──────────────────────────
    #  Use this when any column may contain long text.

    def wrap_table(self, headers, rows, col_widths=None, line_height=5):
        """
        Render a table where each cell wraps to multiple lines as needed.
        Long descriptions stay readable instead of getting truncated.
        """
        if not col_widths:
            usable = 210 - 15 - 15
            col_widths = [usable / len(headers)] * len(headers)

        # Header row
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(*COLOR_FOREST)
        self.set_text_color(255, 249, 240)
        for header, w in zip(headers, col_widths):
            self.cell(w, 8, _ascii_safe(header), border=0, ln=0, align='L', fill=True)
        self.ln()

        self.set_font('Helvetica', '', 9)
        self.set_text_color(*COLOR_DARK)

        for i, row in enumerate(rows):
            sanitized = [_ascii_safe(v) for v in row]

            # Pre-compute how many lines each cell will need
            line_counts = []
            for value, w in zip(sanitized, col_widths):
                # split_only=True returns list of lines without rendering
                try:
                    lines = self.multi_cell(w, line_height, value or ' ',
                                            split_only=True)
                except TypeError:
                    # Older fpdf2 versions
                    lines = [value or ' ']
                line_counts.append(max(1, len(lines)))

            row_height = line_height * max(line_counts)

            # Check for page break BEFORE drawing the row so it doesn't split
            if self.get_y() + row_height > self.h - self.b_margin:
                self.add_page()
                # Repeat the header on the new page
                self.set_font('Helvetica', 'B', 10)
                self.set_fill_color(*COLOR_FOREST)
                self.set_text_color(255, 249, 240)
                for header, w in zip(headers, col_widths):
                    self.cell(w, 8, _ascii_safe(header), border=0, ln=0,
                              align='L', fill=True)
                self.ln()
                self.set_font('Helvetica', '', 9)
                self.set_text_color(*COLOR_DARK)

            # Pick fill color for the row
            if i % 2 == 0:
                fill_color = COLOR_TABLE_ALT
            else:
                fill_color = (255, 255, 255)

            # Draw background rect for the full row first
            x_start = self.get_x()
            y_start = self.get_y()
            self.set_fill_color(*fill_color)
            self.rect(x_start, y_start, sum(col_widths), row_height, style='F')

            # Now draw each cell with multi_cell, positioning manually
            for value, w in zip(sanitized, col_widths):
                cell_x = self.get_x()
                cell_y = self.get_y()
                self.multi_cell(w, line_height, value or ' ', border=0,
                                align='L', fill=False)
                # multi_cell moves down by N lines; reset to row baseline
                self.set_xy(cell_x + w, cell_y)

            # Move to next row baseline
            self.set_xy(x_start, y_start + row_height)

        # Bottom rule
        self.set_draw_color(*COLOR_MUTED)
        self.set_line_width(0.2)
        x_start = self.l_margin
        y = self.get_y()
        self.line(x_start, y, x_start + sum(col_widths), y)
        self.ln(2)



    def wrap_table(self, headers, rows, col_widths=None, row_min_height=7):
        """
        Like table(), but cells wrap text to multiple lines instead of truncating.
        Use this for tables with long-text columns (descriptions, notes).
        """
        if not col_widths:
            usable = 210 - 15 - 15
            col_widths = [usable / len(headers)] * len(headers)

        # Header
        self.set_font('Helvetica', 'B', 10)
        self.set_fill_color(*COLOR_FOREST)
        self.set_text_color(255, 249, 240)
        for header, w in zip(headers, col_widths):
            self.cell(w, 8, _ascii_safe(header), border=0, ln=0, align='L', fill=True)
        self.ln()

        # Body
        self.set_font('Helvetica', '', 9)
        self.set_text_color(*COLOR_DARK)

        for i, row in enumerate(rows):
            # Sanitize all cells first
            cells = [_ascii_safe(v) for v in row]

            # Figure out the tallest cell so all cells in this row use the same height.
            # We approximate: ~2mm of width per char, then multiply by line height.
            line_h = 5
            max_lines = 1
            for txt, w in zip(cells, col_widths):
                # rough estimate of how many lines this cell will need
                # (fpdf2's multi_cell does the real wrapping, this is just for height)
                approx_chars_per_line = max(1, int(w / 1.8))
                # count explicit newlines + wrap by length
                lines = 0
                for piece in txt.split('\n'):
                    if not piece:
                        lines += 1
                    else:
                        lines += max(1, -(-len(piece) // approx_chars_per_line))
                max_lines = max(max_lines, lines)

            row_h = max(row_min_height, max_lines * line_h)

            # If row would overflow the page, add a new page (header will repeat via header())
            if self.get_y() + row_h > self.h - self.b_margin:
                self.add_page()
                # Re-render header on the new page
                self.set_font('Helvetica', 'B', 10)
                self.set_fill_color(*COLOR_FOREST)
                self.set_text_color(255, 249, 240)
                for header, w in zip(headers, col_widths):
                    self.cell(w, 8, _ascii_safe(header), border=0, ln=0, align='L', fill=True)
                self.ln()
                self.set_font('Helvetica', '', 9)
                self.set_text_color(*COLOR_DARK)

            # Stripe
            if i % 2 == 0:
                self.set_fill_color(*COLOR_TABLE_ALT)
            else:
                self.set_fill_color(255, 255, 255)

            y_start = self.get_y()
            x_start = self.get_x()

            # Render each cell as a multi_cell so it wraps
            for txt, w in zip(cells, col_widths):
                x_cell = self.get_x()
                # Fill background first by drawing an empty cell behind
                self.cell(w, row_h, '', border=0, ln=0, fill=True)
                # Now overlay the wrapped text on top
                self.set_xy(x_cell + 1, y_start + 1)
                self.multi_cell(w - 2, line_h, txt, border=0, align='L', fill=False)
                # Reset to next column position
                self.set_xy(x_cell + w, y_start)

            self.set_y(y_start + row_h)
            self.set_x(x_start - sum(col_widths))  # back to left margin

        # bottom border
        self.set_draw_color(*COLOR_MUTED)
        self.set_line_width(0.2)
        y = self.get_y()
        self.line(self.l_margin, y, self.l_margin + sum(col_widths), y)
        self.ln(2)


def render_to_bytes(pdf: FPDF) -> bytes:
    out = pdf.output(dest='S')
    return bytes(out) if isinstance(out, bytearray) else out.encode('latin-1')


def pdf_response(pdf: FPDF, filename: str):
    from flask import send_file
    buf = BytesIO(render_to_bytes(pdf))
    buf.seek(0)
    return send_file(buf, mimetype='application/pdf',
                     as_attachment=True, download_name=filename)