import { isE164 } from "./phone";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
  console.warn("[twilio] Missing Twilio WhatsApp env vars; sends will fail at runtime.");
}

interface SendParams {
  to: string; // E.164
  guestName: string;
  eventName: string;
  eventDetails: string; // Multi-line details
  mapsLink?: string;
}

export async function sendWhatsAppConfirmation(params: SendParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { to, guestName, eventName, eventDetails, mapsLink } = params;
  
  if (!isE164(to)) return { ok: false, error: "Invalid phone format; must be E.164" };
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { ok: false, error: "Twilio WhatsApp not configured" };
  }

  // Format the message with event details
  let message = `Hi ${guestName}! 🎉\n\nThank you for confirming your attendance for:\n\n📅 *${eventName}*\n\n${eventDetails}`;
  
  if (mapsLink) {
    message += `\n\n📍 Location: ${mapsLink}`;
  }
  
  message += `\n\nLooking forward to seeing you there! ✨`;

  // Twilio WhatsApp API endpoint
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  // Create form data for Twilio API
  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
  formData.append('To', `whatsapp:${to}`);
  formData.append('Body', message);

  // Create Basic Auth header
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData
    });

    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => "");
      return { ok: false, error: `HTTP ${resp.status} ${errTxt}` };
    }

    const data = await resp.json().catch(() => ({}));
    return { ok: true, id: data?.sid };
  } catch (error) {
    return { ok: false, error: `Network error: ${error}` };
  }
}