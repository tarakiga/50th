import { isE164 } from "./phone";

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER; // SMS-capable number

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
  // eslint-disable-next-line no-console
  console.warn("[twilio-sms] Missing Twilio SMS env vars; sends will fail at runtime.");
}

interface SendParams {
  to: string; // E.164
  guestName: string;
  eventName: string;
  eventDetails: string; // Multi-line details
  mapsLink?: string;
}

export async function sendSMSDetails(params: SendParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  const { to, guestName, eventName, eventDetails, mapsLink } = params;

  if (!isE164(to)) return { ok: false, error: "Invalid phone format; must be E.164" };
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { ok: false, error: "Twilio SMS not configured" };
  }

  let message = `Hi ${guestName}! You're confirmed for ${eventName}.\n\n${eventDetails}`;
  if (mapsLink) {
    message += `\n\nLocation: ${mapsLink}`;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const formData = new URLSearchParams();
  formData.append("From", TWILIO_FROM_NUMBER);
  formData.append("To", to);
  formData.append("Body", message);

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!resp.ok) {
      const errTxt = await resp.text().catch(() => "");
      return { ok: false, error: `HTTP ${resp.status} ${errTxt}` };
    }

    const data = await resp.json().catch(() => ({} as any));
    return { ok: true, id: data?.sid };
  } catch (error) {
    return { ok: false, error: `Network error: ${error}` };
  }
}


