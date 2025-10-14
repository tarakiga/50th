import { promises as fs } from "fs";
import path from "path";
import { GuestRow, RSVPStatus, WhatsAppDeliveryStatus } from "../types";

function contactsDir(): string {
  const dir = process.env.CONTACTS_DIR || path.resolve(process.cwd(), "contacts");
  return dir;
}

async function listJsonFiles(eventType?: string): Promise<string[]> {
  const dir = contactsDir();
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    let files = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".json"))
      .map((e) => path.join(dir, e.name));
    
    // Filter by event type if specified
    if (eventType) {
      const targetFile = eventType === 'tradparty' ? 'Guest1.json' : 'Guest2.json';
      files = files.filter(file => file.endsWith(targetFile));
    }
    
    return files;
  } catch (e) {
    return [];
  }
}

async function readJson(filePath: string): Promise<GuestRow[]> {
  try {
    const txt = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(txt);
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn(`JSON file ${filePath} does not contain an array, skipping`);
      return [];
    }
    return data.map(toGuest);
  } catch (error) {
    console.warn(`Failed to read JSON file ${filePath}:`, error);
    return [];
  }
}

async function writeJson(filePath: string, guests: GuestRow[]): Promise<void> {
  const jsonContent = JSON.stringify(guests, null, 2);
  await fs.writeFile(filePath, jsonContent, "utf8");
}

function toGuest(obj: any): GuestRow {
  return {
    Name: obj?.Name || "",
    PhoneNumber: obj?.PhoneNumber || "",
    Token: obj?.Token || "",
    RSVPStatus: (obj?.RSVPStatus as RSVPStatus) || "None",
    WhatsAppDeliveryStatus: (obj?.WhatsAppDeliveryStatus as WhatsAppDeliveryStatus) || undefined,
    UpdatedAt: obj?.UpdatedAt || undefined,
  };
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  const files = await listJsonFiles(eventType);
  const all: GuestRow[] = [];
  for (const file of files) {
    const guests = await readJson(file);
    all.push(...guests);
  }
  return all;
}

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  const files = await listJsonFiles(eventType);
  for (const file of files) {
    const guests = await readJson(file);
    const guest = guests.find(g => g.Token === token);
    if (guest) {
      return guest;
    }
  }
  return null;
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: RSVPStatus,
  delivery?: WhatsAppDeliveryStatus,
  eventType?: string
): Promise<void> {
  const files = await listJsonFiles(eventType);
  for (const file of files) {
    const guests = await readJson(file);
    const guestIndex = guests.findIndex(g => g.Token === token);
    if (guestIndex !== -1) {
      guests[guestIndex].RSVPStatus = rsvp;
      if (delivery) guests[guestIndex].WhatsAppDeliveryStatus = delivery;
      guests[guestIndex].UpdatedAt = new Date().toISOString();
      await writeJson(file, guests);
      return;
    }
  }
  throw new Error("Token not found");
}
