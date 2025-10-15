/**
 * Simple Fallback-Only Guest Management
 * 
 * No external dependencies - works everywhere immediately
 * Logs RSVPs to console for tracking
 */

import { GuestRow } from '../types';

// Test guests (you can expand this with more tokens)
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
  },
  '2d8b6a6a131cb5074b4ab67e9d5d0a4e': {
    Name: 'REBECCA MANVEN',
    PhoneNumber: '+2348033407091',
    Token: '2d8b6a6a131cb5074b4ab67e9d5d0a4e',
    RSVPStatus: 'None' as const,
    WhatsAppDeliveryStatus: undefined,
    UpdatedAt: undefined
  }
};

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // Production: use embedded data
  if (process.env.NODE_ENV === 'production') {
    return PRODUCTION_GUESTS[token as keyof typeof PRODUCTION_GUESTS] || null;
  }
  
  // Development: try file system first, then fallback
  try {
    const { findGuestByToken: findGuestFile } = await import('./contacts');
    return findGuestFile(token, eventType);
  } catch (error) {
    console.warn('File system unavailable, using embedded data');
    return PRODUCTION_GUESTS[token as keyof typeof PRODUCTION_GUESTS] || null;
  }
}

export async function updateRSVPAndDelivery(
  token: string,
  rsvp: string,
  delivery?: string,
  eventType?: string
): Promise<void> {
  const guest = await findGuestByToken(token, eventType);
  if (!guest) {
    throw new Error('Token not found');
  }

  // Production: comprehensive logging for manual tracking
  if (process.env.NODE_ENV === 'production') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      guest_name: guest.Name,
      phone_number: guest.PhoneNumber,
      token,
      rsvp_status: rsvp,
      whatsapp_delivery: delivery || 'N/A',
      event_type: eventType || 'general'
    };
    
    // Detailed console logging that can be captured by deployment logs
    console.log('=== GOLDEN JUBILEE RSVP ===');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Guest: ${guest.Name}`);
    console.log(`Phone: ${guest.PhoneNumber}`);
    console.log(`Token: ${token}`);
    console.log(`RSVP Status: ${rsvp}`);
    console.log(`WhatsApp Delivery: ${delivery || 'N/A'}`);
    console.log(`Event: ${eventType || 'general'}`);
    console.log('========================');
    
    // Also log as JSON for easy parsing
    console.log('RSVP_JSON:', JSON.stringify(logEntry));
    return;
  }
  
  // Development: try file system, fallback to logging
  try {
    const { updateRSVPAndDelivery: updateFile } = await import('./contacts');
    await updateFile(token, rsvp as any, delivery as any, eventType);
  } catch (error) {
    console.log(`📝 Dev RSVP: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  }
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  // Production: return embedded data
  if (process.env.NODE_ENV === 'production') {
    return Object.values(PRODUCTION_GUESTS);
  }
  
  // Development: try file system first
  try {
    const { listGuests: listGuestsFile } = await import('./contacts');
    return listGuestsFile(eventType);
  } catch (error) {
    console.warn('File system unavailable, using embedded data');
    return Object.values(PRODUCTION_GUESTS);
  }
}