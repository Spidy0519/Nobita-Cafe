"""
Nobita Café — PDF Bill Generator using ReportLab
Generates professional bills on-the-fly, no file storage needed.
"""
import io
import hashlib
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


def generate_order_id(row_number, timestamp):
    """Generate a short unique order ID from row + timestamp."""
    raw = f"{row_number}-{timestamp}"
    return "NC-" + hashlib.md5(raw.encode()).hexdigest()[:6].upper()


def parse_food_items(food_str):
    """Parse 'Latte (x2), Burger (x1)' into list of (name, qty)."""
    items = []
    if not food_str:
        return items
    for part in food_str.split(','):
        part = part.strip()
        if '(x' in part:
            name = part[:part.rfind('(')].strip()
            qty_str = part[part.rfind('(x') + 2:part.rfind(')')]
            try:
                qty = int(qty_str)
            except ValueError:
                qty = 1
            items.append((name, qty))
        else:
            items.append((part, 1))
    return items


def generate_bill_pdf(order_data):
    """
    Generate a PDF bill from order data dict.
    Returns a BytesIO buffer containing the PDF.

    order_data keys: Timestamp, Name, Phone, Food, Address, Map Link, Payment, _row
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=20 * mm, bottomMargin=20 * mm,
        leftMargin=20 * mm, rightMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    # ── Custom Styles ──
    title_style = ParagraphStyle(
        'CafeTitle', parent=styles['Title'],
        fontSize=28, leading=34, textColor=colors.HexColor('#2C1810'),
        alignment=TA_CENTER, spaceAfter=2 * mm,
        fontName='Helvetica-Bold',
    )
    subtitle_style = ParagraphStyle(
        'CafeSubtitle', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#8B7355'),
        alignment=TA_CENTER, spaceAfter=6 * mm,
    )
    heading_style = ParagraphStyle(
        'SectionHead', parent=styles['Normal'],
        fontSize=11, fontName='Helvetica-Bold',
        textColor=colors.HexColor('#2C1810'), spaceAfter=3 * mm,
    )
    normal_style = ParagraphStyle(
        'NormalCustom', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#333333'),
        leading=14,
    )
    footer_style = ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=11, textColor=colors.HexColor('#8B7355'),
        alignment=TA_CENTER, spaceBefore=8 * mm,
    )
    small_style = ParagraphStyle(
        'Small', parent=styles['Normal'],
        fontSize=8, textColor=colors.HexColor('#999999'),
        alignment=TA_CENTER,
    )

    # ── Data ──
    row_num = order_data.get('_row', 0)
    timestamp = order_data.get('Timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    order_id = generate_order_id(row_num, timestamp)
    name = order_data.get('Name', '-')
    phone = str(order_data.get('Phone', '-'))
    food_str = order_data.get('Food', '')
    address = order_data.get('Address', '-')
    map_link = order_data.get('Map Link', '')
    payment = order_data.get('Payment', 'Cash on Delivery')
    food_items = parse_food_items(food_str)

    elements = []

    # ═══════════════════════════════
    # HEADER
    # ═══════════════════════════════
    elements.append(Paragraph("☕ NOBITA CAFE", title_style))
    elements.append(Paragraph("Fresh Coffee • Delicious Food • Fast Delivery", subtitle_style))
    elements.append(HRFlowable(
        width="100%", thickness=1.5,
        color=colors.HexColor('#D4A574'), spaceAfter=6 * mm,
    ))

    # ═══════════════════════════════
    # ORDER INFO
    # ═══════════════════════════════
    info_data = [
        [Paragraph(f"<b>Order ID:</b> {order_id}", normal_style),
         Paragraph(f"<b>Date:</b> {timestamp}", normal_style)],
        [Paragraph(f"<b>Customer:</b> {name}", normal_style),
         Paragraph(f"<b>Phone:</b> {phone}", normal_style)],
        [Paragraph(f"<b>Payment:</b> {payment}", normal_style),
         Paragraph("", normal_style)],
    ]

    info_table = Table(info_data, colWidths=['50%', '50%'])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 4 * mm))

    # Address
    if address and address != '-':
        elements.append(Paragraph(f"<b>Delivery Address:</b> {address}", normal_style))
        if map_link:
            elements.append(Paragraph(
                f'<b>Map:</b> <a href="{map_link}" color="#7c3aed">{map_link}</a>',
                normal_style
            ))
        elements.append(Spacer(1, 4 * mm))

    # ═══════════════════════════════
    # ITEMS TABLE
    # ═══════════════════════════════
    elements.append(HRFlowable(
        width="100%", thickness=0.5,
        color=colors.HexColor('#E0D5C8'), spaceAfter=4 * mm,
    ))
    elements.append(Paragraph("ORDER ITEMS", heading_style))

    # Table header
    header_style_cell = ParagraphStyle(
        'TableHeader', parent=styles['Normal'],
        fontSize=10, fontName='Helvetica-Bold',
        textColor=colors.white,
    )
    qty_header = ParagraphStyle(
        'QtyHeader', parent=header_style_cell,
        alignment=TA_CENTER,
    )

    table_data = [
        [Paragraph("#", qty_header),
         Paragraph("Item", header_style_cell),
         Paragraph("Qty", qty_header)],
    ]

    cell_style = ParagraphStyle('Cell', parent=normal_style, fontSize=10)
    cell_center = ParagraphStyle('CellC', parent=cell_style, alignment=TA_CENTER)

    for i, (item_name, qty) in enumerate(food_items, 1):
        table_data.append([
            Paragraph(str(i), cell_center),
            Paragraph(item_name, cell_style),
            Paragraph(str(qty), cell_center),
        ])

    if not food_items:
        table_data.append([
            Paragraph("-", cell_center),
            Paragraph("No items", cell_style),
            Paragraph("-", cell_center),
        ])

    items_table = Table(table_data, colWidths=[30, '*', 60])
    items_table.setStyle(TableStyle([
        # Header row
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C1810')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E0D5C8')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAF5F0')]),
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # Rounded-ish
        ('ROUNDEDCORNERS', [6, 6, 6, 6]),
    ]))
    elements.append(items_table)
    elements.append(Spacer(1, 4 * mm))

    # Total items
    total_qty = sum(q for _, q in food_items)
    total_line = ParagraphStyle('TotalLine', parent=normal_style, fontSize=12, fontName='Helvetica-Bold', alignment=TA_RIGHT)
    elements.append(Paragraph(f"Total Items: {total_qty}", total_line))

    # ═══════════════════════════════
    # FOOTER
    # ═══════════════════════════════
    elements.append(Spacer(1, 8 * mm))
    elements.append(HRFlowable(
        width="100%", thickness=1,
        color=colors.HexColor('#D4A574'), spaceAfter=6 * mm,
    ))
    elements.append(Paragraph("Thank you for ordering from Nobita Cafe! ☕", footer_style))
    elements.append(Paragraph("We hope you enjoy your meal!", footer_style))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(f"Bill generated on {datetime.now().strftime('%d-%m-%Y %H:%M:%S')}", small_style))

    # ── Build PDF ──
    doc.build(elements)
    buffer.seek(0)
    return buffer, order_id
