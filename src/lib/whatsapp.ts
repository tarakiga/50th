import { isE164 } from "./phone";

const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "golden_ticket_confirm";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";
// If your template only has 3 variables (no directions link), set this to "false"
const INCLUDE_DIRECTIONS = (process.env.WHATSAPP_TEMPLATE_INCLUDE_DIRECTIONS ?? "true").toLowerCase() !== "false";

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
  // eslint-disable-next-line no-console
  console.warn("[whatsapp] Missing WhatsApp env vars; sends will fail at runtime.");
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
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return { ok: false, error: "WhatsApp not configured" };

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;

  // Handle different template types
  let body: any;
  
  if (TEMPLATE_NAME === "hello_world") {
    // hello_world template has no parameters
    body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: "hello_world",
        language: { code: TEMPLATE_LANG }
      }
    };
  } else {
    // Custom template with parameters
    const parameters: any[] = [
      { type: "text", text: guestName },
      { type: "text", text: eventName },
      { type: "text", text: eventDetails },
    ];
    if (INCLUDE_DIRECTIONS) {
      parameters.push({ type: "text", text: mapsLink || "" });
    }

    body = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: TEMPLATE_NAME,
        language: { code: TEMPLATE_LANG },
        components: [
          {
            type: "body",
            parameters
          }
        ]
      }
    };
  }

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const errTxt = await resp.text().catch(() => "");
    return { ok: false, error: `HTTP ${resp.status} ${errTxt}` };
  }
  const data = (await resp.json().catch(() => ({}))) as any;
  return { ok: true, id: data?.messages?.[0]?.id };
}
