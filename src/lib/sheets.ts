import { google } from "googleapis";
import type { JWT } from "google-auth-library";
import { GuestRow, RSVPStatus, WhatsAppDeliveryStatus } from "../types";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID as string;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL as string;
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
  // Do not throw at module top; allow build to proceed. Runtime will validate.
  // eslint-disable-next-line no-console
  console.warn("[sheets] Missing Google Sheets env vars; API calls will fail at runtime.");
}

let jwt: JWT | null = null;

function getClient(): JWT {
  if (!jwt) {
    jwt = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return jwt;
}

const SHEET_NAME = "Guests"; // Expect this sheet/tab name

export async function findGuestByToken(token: string): Promise<GuestRow | null> {
  const auth = getClient();
  const sheets = google.sheets({ version: "v4", auth });
  const range = `${SHEET_NAME}!A2:F`; // Assuming header row at A1:F1
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range });
  const rows = resp.data.values || [];
  const header = ["Name", "PhoneNumber", "Token", "RSVPStatus", "WhatsAppDeliveryStatus", "UpdatedAt"];
  for (const row of rows) {
    const obj = Object.fromEntries(header.map((h, i) => [h, row[i] || ""])) as any;
    if (obj.Token === token) {
      return obj as GuestRow;
    }
  }
  return null;
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: RSVPStatus,
  delivery?: WhatsAppDeliveryStatus
): Promise<void> {
  const auth = getClient();
  const sheets = google.sheets({ version: "v4", auth });
  const range = `${SHEET_NAME}!A2:F`;
  const resp = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range, valueRenderOption: "UNFORMATTED_VALUE" });
  const rows = resp.data.values || [];
  const header = ["Name", "PhoneNumber", "Token", "RSVPStatus", "WhatsAppDeliveryStatus", "UpdatedAt"];

  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if ((rows[i][2] || "") === token) {
      rowIndex = i;
      break;
    }
  }
  if (rowIndex === -1) throw new Error("Token not found");

  const now = new Date().toISOString();
  const row = rows[rowIndex];
  row[3] = rsvp; // RSVPStatus
  if (delivery) row[4] = delivery; // WhatsAppDeliveryStatus
  row[5] = now; // UpdatedAt

  const targetRange = `${SHEET_NAME}!A${rowIndex + 2}:F${rowIndex + 2}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: targetRange,
    valueInputOption: "RAW",
    requestBody: { values: [row] },
  });
}
