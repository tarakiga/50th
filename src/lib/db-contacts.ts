/**
 * Database-like Guest Management
 * 
 * Uses external service for production RSVP tracking
 */

import { GuestRow } from '../types';

// Simple in-memory database for production (can be replaced with real DB)
const GUEST_DB = new Map<string, GuestRow>();

// Initialize with test data
GUEST_DB.set('a909f361f2ca4d8fbac37fcc531a8164', {
  Name: 'Tar Akiga',
  PhoneNumber: '+96894398548',
  Token: 'a909f361f2ca4d8fbac37fcc531a8164',
  RSVPStatus: 'None',
  WhatsAppDeliveryStatus: undefined,
  UpdatedAt: undefined
});

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  if (process.env.NODE_ENV === 'production') {
    return GUEST_DB.get(token) || null;
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
    // Update in-memory database
    const updatedGuest = {
      ...guest,
      RSVPStatus: rsvp as any,
      WhatsAppDeliveryStatus: delivery as any,
      UpdatedAt: new Date().toISOString()
    };
    GUEST_DB.set(token, updatedGuest);
    
    console.log(`RSVP Updated: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
    
    // Here you could also send to external service:
    // await sendToExternalService(updatedGuest);
    
    return;
  }
  
  // Development: use file system
  const { updateRSVPAndDelivery: updateFile } = await import('./contacts');
  return updateFile(token, rsvp as any, delivery as any, eventType);
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  if (process.env.NODE_ENV === 'production') {
    return Array.from(GUEST_DB.values());
  }
  
  // Development: use file system
  const { listGuests: listGuestsFile } = await import('./contacts');
  return listGuestsFile(eventType);
}