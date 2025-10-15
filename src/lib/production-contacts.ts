/**
 * Production-Safe Contacts Module
 * 
 * This completely bypasses file system operations in production
 */

import { GuestRow } from '../types';

// In production, we'll embed a minimal guest lookup
const PRODUCTION_GUESTS = {
  'a909f361f2ca4d8fbac37fcc531a8164': {
    Name: 'Tar Akiga',
    PhoneNumber: '+96894398548',
    Token: 'a909f361f2ca4d8fbac37fcc531a8164',
    RSVPStatus: 'None' as const,
    WhatsAppDeliveryStatus: undefined,
    UpdatedAt: undefined
  },
  '0c743ea9088453a65a33343e9ff4c0ee': {
    Name: 'TERFA +1',
    PhoneNumber: '+2348033207783',
    Token: '0c743ea9088453a65a33343e9ff4c0ee',
    RSVPStatus: 'None' as const,
    WhatsAppDeliveryStatus: undefined,
    UpdatedAt: undefined
  },
  '67f50253a9354645fd334767ab0a334d': {
    Name: 'TERWASE ALABI',
    PhoneNumber: '+2348033117930',
    Token: '67f50253a9354645fd334767ab0a334d',
    RSVPStatus: 'None' as const,
    WhatsAppDeliveryStatus: undefined,
    UpdatedAt: undefined
  },
  'b23ec5f314300c99053432d2896c19e9': {
    Name: 'YIMA',
    PhoneNumber: '+2347032114422',
    Token: 'b23ec5f314300c99053432d2896c19e9',
    RSVPStatus: 'None' as const,
    WhatsAppDeliveryStatus: undefined,
    UpdatedAt: undefined
  }
};

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // In production, use embedded lookup
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_GUESTS[token as keyof typeof PRODUCTION_GUESTS] || null;
  }
  
  // In development, use original file-based method
  const { findGuestByToken: findGuestFile } = await import('./contacts');
  return findGuestFile(token, eventType);
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: string,
  delivery?: string,
  eventType?: string
): Promise<void> {
  // In production, just log
  if (process.env.NODE_ENV === 'production') {
    const guest = await findGuestByToken(token, eventType);
    console.log(`RSVP Update: ${guest?.Name || 'Unknown'} - Status: ${rsvp}${delivery ? `, Delivery: ${delivery}` : ''}`);
    return;
  }
  
  // In development, use original file-based method
  const { updateRSVPAndDelivery: updateRSVPFile } = await import('./contacts');
  return updateRSVPFile(token, rsvp as any, delivery as any, eventType);
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  // In production, return embedded guests
  if (process.env.NODE_ENV === 'production') {
    return Object.values(PRODUCTION_GUESTS);
  }
  
  // In development, use original file-based method
  const { listGuests: listGuestsFile } = await import('./contacts');
  return listGuestsFile(eventType);
}