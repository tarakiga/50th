export type RSVPStatus = "Attending" | "Declined" | "None";
export type WhatsAppDeliveryStatus = "Pending" | "Sent" | "Failed";

export interface GuestRow {
  Name: string;
  PhoneNumber: string; // E.164
  Token: string;
  RSVPStatus: RSVPStatus;
  WhatsAppDeliveryStatus?: WhatsAppDeliveryStatus;
  UpdatedAt?: string; // ISO timestamp
}
