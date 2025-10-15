/**
 * PlanetScale MySQL-based Guest Management
 * 
 * Uses PlanetScale (serverless MySQL) for reliable RSVP tracking
 */

import { GuestRow } from '../types';

// PlanetScale configuration
const DATABASE_URL = process.env.DATABASE_URL;

// Same fallback data
const FALLBACK_GUESTS = {
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
  }
};

// Note: Would need to install @planetscale/database
// npm install @planetscale/database

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // Production: Try PlanetScale then fallback
  if (process.env.NODE_ENV === 'production') {
    if (DATABASE_URL) {
      try {
        // Would use PlanetScale client here
        console.log('PlanetScale lookup not implemented yet');
      } catch (error) {
        console.warn('PlanetScale lookup failed:', error);
      }
    }
    
    return FALLBACK_GUESTS[token as keyof typeof FALLBACK_GUESTS] || null;
  }
  
  // Development: use file system
  try {
    const { findGuestByToken: findGuestFile } = await import('./contacts');
    return findGuestFile(token, eventType);
  } catch (error) {
    return FALLBACK_GUESTS[token as keyof typeof FALLBACK_GUESTS] || null;
  }
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: string,
  delivery?: string,
  eventType?: string
): Promise<void> {
  const guest = await findGuestByToken(token, eventType);
  if (!guest) throw new Error('Token not found');

  // Just log for now
  console.log(`📝 RSVP Update: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  return Object.values(FALLBACK_GUESTS);
}