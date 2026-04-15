"""
Nobita Café — Google Sheets Integration via gspread + oauth2client

Sheet headers (Row 1):
  Timestamp | Name | Phone | Food | Address | Map Link | Payment | Status | Complaint
"""

import os
import json
import logging
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from pathlib import Path

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
CREDENTIALS_FILE = Path(
    os.environ.get("GOOGLE_CREDENTIALS_FILE", str(BASE_DIR / "credentials.json"))
)

SCOPES = [
    "https://spreadsheets.google.com/feeds",
    "https://www.googleapis.com/auth/spreadsheets",
]

# Column indices (1-based) matching the header row
COL_TIMESTAMP = 1
COL_NAME = 2
COL_PHONE = 3
COL_FOOD = 4
COL_ADDRESS = 5
COL_MAP_LINK = 6
COL_PAYMENT = 7
COL_STATUS = 8
COL_COMPLAINT = 9


def get_sheet():
    """Connect to Google Sheets and return the first worksheet."""
    sheet_id = os.environ.get("GOOGLE_SHEET_ID", "").strip()
    if not sheet_id:
        raise ValueError("GOOGLE_SHEET_ID is not configured")

    credentials_json = os.environ.get("GOOGLE_CREDENTIALS_JSON", "").strip()
    if credentials_json:
        try:
            creds_dict = json.loads(credentials_json)
        except json.JSONDecodeError as exc:
            raise ValueError("GOOGLE_CREDENTIALS_JSON is not valid JSON") from exc
        creds = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, SCOPES)
    else:
        if not CREDENTIALS_FILE.exists():
            raise FileNotFoundError(
                "Google credentials are not configured. Set GOOGLE_CREDENTIALS_JSON "
                f"or provide file at {CREDENTIALS_FILE}"
            )
        creds = ServiceAccountCredentials.from_json_keyfile_name(
            str(CREDENTIALS_FILE), SCOPES
        )

    client = gspread.authorize(creds)
    spreadsheet = client.open_by_key(sheet_id)
    sheet = spreadsheet.sheet1
    return sheet


def ensure_headers(sheet):
    """Make sure headers include Status and Complaint columns."""
    headers = sheet.row_values(1)
    updated = False
    if len(headers) < COL_STATUS or headers[COL_STATUS - 1] != "Status":
        sheet.update_cell(1, COL_STATUS, "Status")
        updated = True
    if len(headers) < COL_COMPLAINT or headers[COL_COMPLAINT - 1] != "Complaint":
        sheet.update_cell(1, COL_COMPLAINT, "Complaint")
        updated = True
    if updated:
        logger.info("Updated sheet headers to include Status and Complaint columns")


def append_order(timestamp, name, phone, food, address, map_link, payment):
    """Append a new order row with default status 'Pending'."""
    try:
        sheet = get_sheet()
        ensure_headers(sheet)
        row = [timestamp, name, phone, food, address, map_link, payment, "Pending", ""]
        sheet.append_row(row, value_input_option="USER_ENTERED")
        logger.info(f"Order saved: {name} — {food}")
        return True
    except Exception as e:
        logger.error(f"Failed to save order: {e}")
        raise


def fetch_all_orders():
    """Fetch all orders with row numbers for updating."""
    try:
        sheet = get_sheet()
        ensure_headers(sheet)
        all_values = sheet.get_all_values()

        if len(all_values) <= 1:
            return []

        headers = all_values[0]
        orders = []
        for row_idx, row in enumerate(all_values[1:], start=2):
            order = {}
            for col_idx, header in enumerate(headers):
                order[header] = row[col_idx] if col_idx < len(row) else ""
            order["_row"] = row_idx  # Row number for updates
            orders.append(order)
        return orders
    except Exception as e:
        logger.error(f"Failed to fetch orders: {e}")
        raise


def update_order_status(row_number, new_status):
    """Update the Status column for a specific row."""
    try:
        sheet = get_sheet()
        sheet.update_cell(row_number, COL_STATUS, new_status)
        logger.info(f"Row {row_number} status updated to: {new_status}")
        return True
    except Exception as e:
        logger.error(f"Failed to update status: {e}")
        raise


def add_complaint(row_number, complaint_text):
    """Add or update the Complaint column for a specific row."""
    try:
        sheet = get_sheet()
        # Append to existing complaint if any
        existing = sheet.cell(row_number, COL_COMPLAINT).value or ""
        if existing:
            complaint_text = f"{existing} | {complaint_text}"
        sheet.update_cell(row_number, COL_COMPLAINT, complaint_text)
        logger.info(f"Row {row_number} complaint added")
        return True
    except Exception as e:
        logger.error(f"Failed to add complaint: {e}")
        raise
