"""
PDF report generator for OMEN scan results.
"""
import os
import io
from datetime import datetime
from typing import List, Dict

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# severity helpers
def _severity_label(score: float) -> str:
    if score >= 9: return "CRITICAL"
    if score >= 7: return "HIGH"
    if score >= 4: return "MEDIUM"
    return "LOW"

def _severity_color(score: float):
    if score >= 9: return colors.HexColor("#dc2626")
    if score >= 7: return colors.HexColor("#ea580c")
    if score >= 4: return colors.HexColor("#ca8a04")
    return colors.HexColor("#71717a")


def generate_pdf(scan_id: int, target_url: str, vulns: List[Dict]) -> bytes:
    """Generate a PDF report and return raw bytes."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    styles = getSampleStyleSheet()
    RED    = colors.HexColor("#dc2626")
    DARK   = colors.HexColor("#0a0a0a")
    ZINC   = colors.HexColor("#71717a")
    WHITE  = colors.white

    title_style = ParagraphStyle("title", fontSize=22, textColor=RED,
                                  fontName="Helvetica-Bold", spaceAfter=2)
    sub_style   = ParagraphStyle("sub",   fontSize=9,  textColor=ZINC,
                                  fontName="Helvetica", spaceAfter=6)
    section_style = ParagraphStyle("section", fontSize=11, textColor=RED,
                                    fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=6)
    body_style  = ParagraphStyle("body",  fontSize=8,  textColor=colors.HexColor("#d4d4d4"),
                                  fontName="Helvetica", leading=12)
    issue_style = ParagraphStyle("issue", fontSize=8,  textColor=WHITE,
                                  fontName="Helvetica-Bold")

    # counts
    critical = sum(1 for v in vulns if v.get("cvss_score", 0) >= 9)
    high     = sum(1 for v in vulns if 7 <= v.get("cvss_score", 0) < 9)
    medium   = sum(1 for v in vulns if 4 <= v.get("cvss_score", 0) < 7)
    low      = sum(1 for v in vulns if v.get("cvss_score", 0) < 4)

    story = []

    # ── Header ────────────────────────────────────────────────────────────────
    story.append(Paragraph("OMEN", title_style))
    story.append(Paragraph("Intelligent Web Vulnerability Scanner — Scan Report", sub_style))
    story.append(HRFlowable(width="100%", thickness=1, color=RED, spaceAfter=10))

    # meta table
    meta = [
        ["Scan ID",    str(scan_id)],
        ["Target",     target_url],
        ["Generated",  datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Total Issues", str(len(vulns))],
    ]
    meta_table = Table(meta, colWidths=[40*mm, 130*mm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",    (0,0), (-1,-1), "Helvetica"),
        ("FONTSIZE",    (0,0), (-1,-1), 8),
        ("TEXTCOLOR",   (0,0), (0,-1), ZINC),
        ("TEXTCOLOR",   (1,0), (1,-1), colors.HexColor("#e4e4e7")),
        ("FONTNAME",    (0,0), (0,-1), "Helvetica-Bold"),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.HexColor("#0f0f0f"), colors.HexColor("#141414")]),
        ("TOPPADDING",  (0,0), (-1,-1), 4),
        ("BOTTOMPADDING",(0,0),(-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8*mm))

    # ── Summary ───────────────────────────────────────────────────────────────
    story.append(Paragraph("Summary", section_style))
    summary_data = [
        ["CRITICAL", "HIGH", "MEDIUM", "LOW", "TOTAL"],
        [str(critical), str(high), str(medium), str(low), str(len(vulns))],
    ]
    summary_table = Table(summary_data, colWidths=[34*mm]*5)
    summary_table.setStyle(TableStyle([
        ("FONTNAME",    (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE",    (0,0), (-1,-1), 9),
        ("ALIGN",       (0,0), (-1,-1), "CENTER"),
        ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING",  (0,0), (-1,-1), 6),
        ("BOTTOMPADDING",(0,0),(-1,-1), 6),
        # header row
        ("TEXTCOLOR",   (0,0), (0,0), colors.HexColor("#dc2626")),
        ("TEXTCOLOR",   (1,0), (1,0), colors.HexColor("#ea580c")),
        ("TEXTCOLOR",   (2,0), (2,0), colors.HexColor("#ca8a04")),
        ("TEXTCOLOR",   (3,0), (3,0), colors.HexColor("#71717a")),
        ("TEXTCOLOR",   (4,0), (4,0), colors.HexColor("#e4e4e7")),
        # value row
        ("TEXTCOLOR",   (0,1), (0,1), colors.HexColor("#dc2626")),
        ("TEXTCOLOR",   (1,1), (1,1), colors.HexColor("#ea580c")),
        ("TEXTCOLOR",   (2,1), (2,1), colors.HexColor("#ca8a04")),
        ("TEXTCOLOR",   (3,1), (3,1), colors.HexColor("#71717a")),
        ("TEXTCOLOR",   (4,1), (4,1), colors.HexColor("#e4e4e7")),
        ("FONTSIZE",    (0,1), (-1,1), 20),
        ("BACKGROUND",  (0,0), (-1,-1), colors.HexColor("#111111")),
        ("GRID",        (0,0), (-1,-1), 0.5, colors.HexColor("#27272a")),
        ("ROUNDEDCORNERS", [3]),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 8*mm))

    # ── Findings ──────────────────────────────────────────────────────────────
    if not vulns:
        story.append(Paragraph("Findings", section_style))
        story.append(Paragraph("No vulnerabilities detected.", body_style))
    else:
        story.append(Paragraph(f"Findings ({len(vulns)})", section_style))

        # table header
        headers = [["#", "Severity", "Issue", "URL / Parameter", "CVSS"]]
        rows = []
        for i, v in enumerate(vulns, 1):
            score = v.get("cvss_score", 0)
            label = _severity_label(score)
            url_text = v.get("url", "")
            if len(url_text) > 55:
                url_text = url_text[:52] + "..."
            param = v.get("param", "")
            url_cell = url_text + (f"\n[{param}]" if param else "")
            rows.append([
                str(i),
                label,
                Paragraph(v.get("issue", ""), issue_style),
                Paragraph(url_cell, body_style),
                f"{score:.1f}",
            ])

        col_w = [8*mm, 22*mm, 55*mm, 72*mm, 13*mm]
        table = Table(headers + rows, colWidths=col_w, repeatRows=1)

        ts = TableStyle([
            # header
            ("BACKGROUND",   (0,0), (-1,0), colors.HexColor("#1a0000")),
            ("TEXTCOLOR",    (0,0), (-1,0), RED),
            ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",     (0,0), (-1,0), 7),
            ("ALIGN",        (0,0), (-1,0), "CENTER"),
            ("TOPPADDING",   (0,0), (-1,0), 5),
            ("BOTTOMPADDING",(0,0), (-1,0), 5),
            # body
            ("FONTNAME",     (0,1), (-1,-1), "Helvetica"),
            ("FONTSIZE",     (0,1), (-1,-1), 7),
            ("TEXTCOLOR",    (0,1), (0,-1), ZINC),
            ("TEXTCOLOR",    (4,1), (4,-1), colors.HexColor("#e4e4e7")),
            ("ALIGN",        (0,1), (0,-1), "CENTER"),
            ("ALIGN",        (1,1), (1,-1), "CENTER"),
            ("ALIGN",        (4,1), (4,-1), "CENTER"),
            ("VALIGN",       (0,0), (-1,-1), "TOP"),
            ("TOPPADDING",   (0,1), (-1,-1), 5),
            ("BOTTOMPADDING",(0,1), (-1,-1), 5),
            ("LEFTPADDING",  (0,0), (-1,-1), 4),
            ("GRID",         (0,0), (-1,-1), 0.3, colors.HexColor("#27272a")),
            ("ROWBACKGROUNDS",(0,1),(-1,-1), [colors.HexColor("#0d0d0d"), colors.HexColor("#111111")]),
        ])

        # color severity column per row
        for i, v in enumerate(vulns, 1):
            score = v.get("cvss_score", 0)
            c = _severity_color(score)
            ts.add("TEXTCOLOR", (1, i), (1, i), c)
            ts.add("FONTNAME",  (1, i), (1, i), "Helvetica-Bold")

        table.setStyle(ts)
        story.append(table)

    # ── Evidence section ──────────────────────────────────────────────────────
    evidence_vulns = [v for v in vulns if v.get("evidence")]
    if evidence_vulns:
        story.append(Spacer(1, 8*mm))
        story.append(Paragraph("Evidence Details", section_style))
        for v in evidence_vulns[:20]:  # cap at 20
            score = v.get("cvss_score", 0)
            c = _severity_color(score)
            ev_data = [
                [Paragraph(f"<b>{v.get('issue','')}</b>", issue_style), ""],
                ["URL",      Paragraph(v.get("url",""), body_style)],
                ["Evidence", Paragraph(str(v.get("evidence","")), body_style)],
            ]
            ev_table = Table(ev_data, colWidths=[25*mm, 145*mm])
            ev_table.setStyle(TableStyle([
                ("SPAN",        (0,0), (1,0)),
                ("BACKGROUND",  (0,0), (-1,0), colors.HexColor("#1a0000")),
                ("BACKGROUND",  (0,1), (-1,-1), colors.HexColor("#0d0d0d")),
                ("TEXTCOLOR",   (0,1), (0,-1), ZINC),
                ("FONTNAME",    (0,1), (0,-1), "Helvetica-Bold"),
                ("FONTSIZE",    (0,0), (-1,-1), 7),
                ("TOPPADDING",  (0,0), (-1,-1), 4),
                ("BOTTOMPADDING",(0,0),(-1,-1), 4),
                ("LEFTPADDING", (0,0), (-1,-1), 5),
                ("GRID",        (0,0), (-1,-1), 0.3, colors.HexColor("#27272a")),
                ("LINEABOVE",   (0,0), (-1,0), 1, c),
            ]))
            story.append(ev_table)
            story.append(Spacer(1, 3*mm))

    # ── Footer ────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#27272a")))
    story.append(Paragraph(
        "Generated by OMEN — Intelligent Web Vulnerability Scanner. For authorized security testing only.",
        ParagraphStyle("footer", fontSize=7, textColor=ZINC, fontName="Helvetica",
                       alignment=TA_CENTER, spaceBefore=4)
    ))

    doc.build(story)
    return buf.getvalue()
