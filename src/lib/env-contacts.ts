/**
 * Environment Variable Based Guest Storage
 * 
 * Store guest data in environment variables for production
 */

import { GuestRow } from '../types';

// Parse guest data from environment variables
function parseEnvGuests(): Record<string, GuestRow> {
  const guestData: Record<string, GuestRow> = {};
  
  // Format: GUEST_TOKEN_<token>=Name|PhoneNumber
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('GUEST_TOKEN_')) {
      const token = key.replace('GUEST_TOKEN_', '');
      const value = process.env[key];
      if (value) {
        const [name, phoneNumber] = value.split('|');
        guestData[token] = {
          Name: name,
          PhoneNumber: phoneNumber,
          Token: token,
          RSVPStatus: 'None',
          WhatsAppDeliveryStatus: undefined,
          UpdatedAt: undefined
        };
      }
    }
  });
  
  return guestData;
}

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  if (process.env.NODE_ENV === 'production') {
    const guests = parseEnvGuests();
    return guests[token] || null;
  }
  
  // Development: use file system
  const { findGuestByToken: findGuestFile } = await import('./contacts');
  return findGuestFile(token, eventType);
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: string,
  delivery?: string,
  eventType?: string
): Promise<void> {
  const guest = await findGuestByToken(token, eventType);
  if (!guest) throw new Error('Token not found');
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`RSVP: ${guest.Name} (${token}) - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
    return;
  }
  
  // Development: use file system
  const { updateRSVPAndDelivery: updateFile } = await import('./contacts');
  return updateFile(token, rsvp as any, delivery as any, eventType);
}