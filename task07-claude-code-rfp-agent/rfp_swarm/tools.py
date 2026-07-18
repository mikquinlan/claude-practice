"""Custom SDK tool: generate a BTS-branded proposal .docx with python-docx.

Codifies the ad-hoc branding the orchestrator's agent-memory (`env_no_pandoc.md`)
built by hand: navy heading banner, gold accent rules, shaded tables. Avoids the
pandoc dependency the plain `docx` skill needs (noted unreliable in agent-memory).
"""

from __future__ import annotations

import os
import re

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt, RGBColor

from claude_agent_sdk import create_sdk_mcp_server, tool

from .context import TASK_DIR, within_task_dir

# BTS brand palette
NAVY = "0B1F3A"
GOLD = "C9A227"
LIGHT = "F2F4F7"
WHITE = "FFFFFF"
NAVY_RGB = RGBColor(0x0B, 0x1F, 0x3A)
GOLD_RGB = RGBColor(0xC9, 0xA2, 0x27)


def _shade(element, fill_hex: str) -> None:
    """Set background shading on a paragraph (pPr) or table cell (tcPr)."""
    pr = element.get_or_add_tcPr() if element.tag.endswith("}tc") else element.get_or_add_pPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), fill_hex)
    pr.append(shd)


def _bottom_border(paragraph, color_hex: str, size: int = 12) -> None:
    """Add a coloured bottom rule under a paragraph (used as a gold accent line)."""
    pPr = paragraph._p.get_or_add_pPr()
    pbdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), color_hex)
    pbdr.append(bottom)
    pPr.append(pbdr)


def _banner(doc: Document, title: str, subtitle: str) -> None:
    """Full-width navy banner cell with gold title text — the branded masthead."""
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    _shade(cell._tc, NAVY)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    run = p.add_run(title)
    run.bold = True
    run.font.size = Pt(22)
    run.font.color.rgb = GOLD_RGB
    if subtitle:
        p2 = cell.add_paragraph()
        r2 = p2.add_run(subtitle)
        r2.font.size = Pt(11)
        r2.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    doc.add_paragraph()


def _heading(doc: Document, text: str) -> None:
    """Navy section heading with a gold accent rule beneath it."""
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.bold = True
    run.font.size = Pt(15)
    run.font.color.rgb = NAVY_RGB
    _bottom_border(p, GOLD)


def _looks_like_table(block: str) -> bool:
    lines = [ln for ln in block.splitlines() if ln.strip()]
    return len(lines) >= 2 and all("|" in ln for ln in lines[:2]) and set(lines[1].strip()) <= set("|-: ")


def _add_markdown_table(doc: Document, block: str) -> None:
    """Render a pipe-delimited markdown table as a navy-header, zebra-shaded table."""
    rows = [ln for ln in block.splitlines() if ln.strip() and "|" in ln]

    def cells(line: str) -> list[str]:
        return [c.strip() for c in line.strip().strip("|").split("|")]

    header = cells(rows[0])
    body = [cells(r) for r in rows[2:]]  # skip the separator row
    table = doc.add_table(rows=1, cols=len(header))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, htext in enumerate(header):
        c = table.rows[0].cells[i]
        _shade(c._tc, NAVY)
        r = c.paragraphs[0].add_run(htext)
        r.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    for ri, row in enumerate(body):
        cellrow = table.add_row().cells
        for ci in range(len(header)):
            c = cellrow[ci]
            if ri % 2 == 1:
                _shade(c._tc, LIGHT)
            text = row[ci] if ci < len(row) else ""
            c.paragraphs[0].add_run(text)
    doc.add_paragraph()


def _add_body(doc: Document, body: str) -> None:
    """Render a section body: blank-line-separated blocks, markdown tables, `- ` bullets."""
    for block in re.split(r"\n\s*\n", body.strip()):
        if not block.strip():
            continue
        if _looks_like_table(block):
            _add_markdown_table(doc, block)
            continue
        lines = block.splitlines()
        if all(ln.strip().startswith(("-", "*")) for ln in lines if ln.strip()):
            for ln in lines:
                if ln.strip():
                    doc.add_paragraph(ln.strip().lstrip("-*").strip(), style="List Bullet")
        else:
            doc.add_paragraph(block.strip())


def _build_docx(args: dict) -> str:
    doc = Document()
    customer = args.get("customer", "Customer")
    date = args.get("date", "")
    title = args.get("title") or f"Proposal — {customer} Enterprise Data Platform"
    _banner(doc, title, f"Prepared by BTS-Synthetic Deal Desk · {date}".strip(" ·"))

    _heading(doc, "Executive Summary")
    for bullet in args.get("executive_summary", []):
        doc.add_paragraph(str(bullet), style="List Bullet")

    sections = [
        ("Our Understanding of Your Need", "understanding"),
        ("Why We're the Right Fit", "why_we_fit"),
        ("Commercial Proposal", "commercial"),
        ("Contract Approach", "contract_approach"),
        ("Risks and Mitigations", "risks"),
    ]
    for heading, key in sections:
        value = args.get(key)
        if not value:
            continue
        _heading(doc, heading)
        _add_body(doc, str(value))

    out = args["output_path"]
    if not within_task_dir(out):
        raise ValueError(f"output_path {out!r} is outside the project directory ({TASK_DIR}).")
    if not os.path.isabs(out):
        out = str(TASK_DIR / out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    doc.save(out)
    return out


DOCX_INPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "output_path": {
            "type": "string",
            "description": "Where to save the .docx, e.g. outputs/proposal-acme-corp-2026-07-05.docx (relative to the task dir).",
        },
        "customer": {"type": "string", "description": "Customer name, e.g. Acme Corp."},
        "date": {"type": "string", "description": "Proposal date, YYYY-MM-DD."},
        "title": {"type": "string", "description": "Optional document title; a default is used if omitted."},
        "executive_summary": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Exactly the executive-summary bullets (3 recommended).",
        },
        "understanding": {"type": "string", "description": "Our understanding of the customer's need."},
        "why_we_fit": {"type": "string", "description": "Why we're the right fit (Technical Fit + Competitive)."},
        "commercial": {
            "type": "string",
            "description": "Commercial proposal (Pricing). Markdown pipe-tables are rendered as branded tables.",
        },
        "contract_approach": {"type": "string", "description": "Contract approach (Legal counter-positions)."},
        "risks": {"type": "string", "description": "Risks and how we mitigate them."},
    },
    "required": [
        "output_path",
        "customer",
        "executive_summary",
        "understanding",
        "why_we_fit",
        "commercial",
        "contract_approach",
        "risks",
    ],
}


@tool("generate_branded_docx", "Generate a BTS-branded proposal Word document (.docx) with navy/gold branding, shaded section headings, and styled tables. Pass the six proposal sections as structured fields.", DOCX_INPUT_SCHEMA)
async def generate_branded_docx(args: dict) -> dict:
    try:
        path = _build_docx(args)
        size = os.path.getsize(path)
        return {"content": [{"type": "text", "text": f"Branded proposal written to {path} ({size} bytes)."}]}
    except Exception as exc:  # surface the failure to the coordinator so it can retry
        return {"content": [{"type": "text", "text": f"ERROR building docx: {exc!r}"}], "is_error": True}


def branding_server():
    """SDK MCP server exposing the branding tool as mcp__branding__generate_branded_docx."""
    return create_sdk_mcp_server("branding", version="1.0.0", tools=[generate_branded_docx])
