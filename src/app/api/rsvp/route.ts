import { NextRequest, NextResponse } from "next/server";
import { updateRSVPAndDelivery, findGuestByToken } from "@/src/lib/supabase-contacts";
import { sendWhatsAppConfirmation } from "@/src/lib/twilio-whatsapp";
import { sendSMSDetails } from "@/src/lib/twilio-sms";
import { RSVPBodySchema } from "@/src/schemas/rsvp";

export async function POST(req: NextRequest) {
  try {
    const parsed = RSVPBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Bad request", details: parsed.error.flatten() }, { status: 400 });
    }
    const { token, action } = parsed.data;

    const guest = await findGuestByToken(token);
    if (!guest) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

    if (action === "declined") {
      await updateRSVPAndDelivery(token, "Declined");
      return NextResponse.json({ status: "ok" });
    }

    // attending
    const eventName = process.env.EVENT_NAME || "Golden Hour Cocktail";
    const eventDetails = process.env.EVENT_DETAILS || "Thank you for confirming your attendance!";
    const mapsLink = process.env.MAPS_LINK || undefined;

    const preferSMS = (process.env.DETAILS_VIA_SMS || "false").toLowerCase() === "true";
    const send = preferSMS
      ? await sendSMSDetails({
          to: guest.PhoneNumber,
          guestName: guest.Name,
          eventName,
          eventDetails,
          mapsLink,
        })
      : await sendWhatsAppConfirmation({
          to: guest.PhoneNumber,
          guestName: guest.Name,
          eventName,
          eventDetails,
          mapsLink,
        });

    // Handle WhatsApp not being configured (for testing)
    if (!send.ok && (send.error === "WhatsApp not configured" || send.error === "Twilio WhatsApp not configured" || send.error === "Twilio SMS not configured")) {
      await updateRSVPAndDelivery(token, "Attending", "Skipped");
      console.log(`✅ RSVP recorded (WhatsApp disabled): ${guest.Name} - Attending`);
      return NextResponse.json({ status: "ok", message: "RSVP recorded (WhatsApp disabled)" });
    }

    await updateRSVPAndDelivery(token, "Attending", send.ok ? "Sent" : "Failed");

    if (!send.ok) return NextResponse.json({ error: send.error || "send failed" }, { status: 502 });

    return NextResponse.json({ status: "ok", channel: preferSMS ? "sms" : "whatsapp" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
