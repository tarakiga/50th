import { NextRequest, NextResponse } from "next/server";
import { updateRSVPAndDelivery, findGuestByToken } from "@/src/lib/contacts";
import { sendWhatsAppConfirmation } from "@/src/lib/whatsapp";
import { RSVPBodySchema } from "@/src/schemas/rsvp";

export async function POST(req: NextRequest) {
  try {
    const parsed = RSVPBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Bad request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { token, action } = parsed.data;

    const guest = await findGuestByToken(token, 'tradparty');
    if (!guest) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

    if (action === "declined") {
      await updateRSVPAndDelivery(token, "Declined", undefined, 'tradparty');
      return NextResponse.json({ status: "ok" });
    }

    // attending
    const eventName = process.env.TRADPARTY_EVENT_NAME || "Traditional Party / Disco Tech";
    const eventDetails = (process.env.TRADPARTY_DETAILS || "Details will be shared privately").replace(/\\n/g, '\n');
    const mapsLink = process.env.TRADPARTY_MAPS_LINK || undefined;

    const send = await sendWhatsAppConfirmation({
      to: guest.PhoneNumber,
      guestName: guest.Name,
      eventName,
      eventDetails,
      mapsLink,
    });

    await updateRSVPAndDelivery(token, "Attending", send.ok ? "Sent" : "Failed", 'tradparty');

    if (!send.ok) return NextResponse.json({ error: send.error || "send failed" }, { status: 502 });

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}