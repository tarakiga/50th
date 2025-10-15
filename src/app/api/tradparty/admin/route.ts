import { NextRequest, NextResponse } from "next/server";
import { listGuests } from "@/src/lib/supabase-contacts";

export async function GET(req: NextRequest) {
  // Direct access - no token validation required
  // Only admins with access to this URL can view the data
  
  try {
    // Read from Traditional Party contacts (Guest1.json)
    const items = await listGuests('tradparty');
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error loading guest data:', error);
    return NextResponse.json({ error: "Failed to load guest data" }, { status: 500 });
  }
}
