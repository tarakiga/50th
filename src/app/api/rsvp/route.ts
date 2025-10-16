import { NextRequest, NextResponse } from "next/server";
import { updateRSVPAndDelivery, findGuestByToken } from "@/src/lib/supabase-contacts";
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

    const status = action === "attending" ? "Attending" : "Declined";
    await updateRSVPAndDelivery(token, status);
    
    console.log(`✅ RSVP recorded: ${guest.Name} - ${status}`);
    return NextResponse.json({ 
      status: "ok", 
      message: "Thanks your attendance been recorded"
    });
    
  } catch (e: any) {
    console.error("RSVP Error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" }, 
      { status: 500 }
    );
  }
}
