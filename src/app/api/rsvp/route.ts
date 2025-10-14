import { NextRequest, NextResponse } from "next/server";
import { updateRSVPAndDelivery, findGuestByToken } from "@/src/lib/contacts";
import { sendWhatsAppConfirmation } from "@/src/lib/whatsapp";
import { getRequiredEnv } from "@/src/lib/env";
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
    const venueAddress = getRequiredEnv("VENUE_ADDRESS");
    const mapsLink = process.env.MAPS_LINK || undefined;

    const send = await sendWhatsAppConfirmation({
      to: guest.PhoneNumber,
      guestName: guest.Name,
      eventName,
      venueAddress,
      mapsLink,
    });

    await updateRSVPAndDelivery(token, "Attending", send.ok ? "Sent" : "Failed");

    if (!send.ok) return NextResponse.json({ error: send.error || "send failed" }, { status: 502 });

    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
