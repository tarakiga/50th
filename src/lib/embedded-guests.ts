/**
 * Embedded Guest Data for Production
 * 
 * This file contains the guest data embedded in the application
 * to avoid file system dependencies in serverless environments.
 */

import { GuestRow } from '../types';

// Import guest data - these will be bundled with the application
let guest1Data: GuestRow[] = [];
let guest2Data: GuestRow[] = [];

// Load data at build time if in development, or use embedded data in production
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  // Development: Try to load from files
  try {
    const fs = require('fs');
    const path = require('path');
    const guest1Path = path.resolve(process.cwd(), 'contacts', 'Guest1.json');
    const guest2Path = path.resolve(process.cwd(), 'contacts', 'Guest2.json');
    
    if (fs.existsSync(guest1Path)) {
      guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
    }
    if (fs.existsSync(guest2Path)) {
      guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));
    }
  } catch (error) {
    console.warn('Could not load guest files in development:', error);
  }
} else {
  // Production: Use embedded data loaded at build time
  // This will be populated by a build script
  try {
    // @ts-ignore - These imports are generated at build time
    guest1Data = require('../../contacts/Guest1.json');
    guest2Data = require('../../contacts/Guest2.json');
  } catch (error) {
    console.warn('Could not load embedded guest data:', error);
  }
}

/**
 * Find guest by token across all guest lists
 */
export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  const searchLists = eventType === 'tradparty' ? [guest1Data] : 
                    eventType === 'cocktail' ? [guest2Data] :
                    [guest1Data, guest2Data];

  for (const guestList of searchLists) {
    const guest = guestList.find(g => g.Token === token);
    if (guest) {
      return guest;
    }
  }
  return null;
}

/**
 * List all guests
 */
export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  if (eventType === 'tradparty') {
    return [...guest1Data];
  } else if (eventType === 'cocktail') {
    return [...guest2Data];
  } else {
    return [...guest1Data, ...guest2Data];
  }
}

/**
 * Update RSVP status - in production, this only logs
 */
export async function updateRSVPAndDelivery(
  token: string,
  rsvp: string,
  delivery?: string,
  eventType?: string
): Promise<void> {
  // Find the guest to get their info for logging
  const guest = await findGuestByToken(token, eventType);
  if (!guest) {
    throw new Error('Token not found');
  }

  // In production, we can't write to files, so we log the RSVP
  console.log(`RSVP Update: ${guest.Name} (${guest.PhoneNumber}) - Status: ${rsvp}${delivery ? `, Delivery: ${delivery}` : ''} [Token: ${token}]`);
  
  // In development, we could update the in-memory data
  // but since it's loaded from files, changes won't persist anyway
}