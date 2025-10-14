import { NextRequest, NextResponse } from "next/server";
import { listGuests } from "@/src/lib/contacts";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "").trim();
  const headerToken = (req.headers.get("x-admin-token") || "").trim();
  const provided = bearer || headerToken;
  const expected = (process.env.ADMIN_TOKEN || "").trim();

  if (!provided || !expected || provided !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read from Traditional Party contacts (Guest1.json)
  const items = await listGuests('tradparty');
  return NextResponse.json({ items });
}