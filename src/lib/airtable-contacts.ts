/**
 * Airtable-based Guest Management
 * 
 * This completely bypasses file system for production RSVP tracking
 */

import { GuestRow } from '../types';

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Guests';

// Fallback guest data for immediate testing (will be replaced by Airtable)
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

/**
 * Make Airtable API request
 */
async function airtableRequest(endpoint: string, options: RequestInit = {}) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    throw new Error('Airtable credentials not configured');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Find guest by token in Airtable
 */
async function findGuestInAirtable(token: string): Promise<GuestRow | null> {
  try {
    const filterFormula = `{Token} = "${token}"`;
    const response = await airtableRequest(`?filterByFormula=${encodeURIComponent(filterFormula)}`);
    
    if (response.records && response.records.length > 0) {
      const record = response.records[0];
      return {
        Name: record.fields.Name || '',
        PhoneNumber: record.fields.PhoneNumber || '',
        Token: record.fields.Token || '',
        RSVPStatus: record.fields.RSVPStatus || 'None',
        WhatsAppDeliveryStatus: record.fields.WhatsAppDeliveryStatus,
        UpdatedAt: record.fields.UpdatedAt,
        _airtableId: record.id // Store for updates
      } as GuestRow & { _airtableId: string };
    }
    
    return null;
  } catch (error) {
    console.warn('Airtable lookup failed, using fallback:', error);
    return null;
  }
}

/**
 * Update guest RSVP in Airtable
 */
async function updateGuestInAirtable(
  token: string, 
  rsvp: string, 
  delivery?: string
): Promise<void> {
  try {
    // First find the guest to get the Airtable record ID
    const guest = await findGuestInAirtable(token) as any;
    if (!guest || !guest._airtableId) {
      throw new Error('Guest not found in Airtable');
    }

    const updateData = {
      fields: {
        RSVPStatus: rsvp,
        UpdatedAt: new Date().toISOString(),
        ...(delivery && { WhatsAppDeliveryStatus: delivery })
      }
    };

    await airtableRequest(`/${guest._airtableId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    console.log(`✅ Airtable updated: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  } catch (error) {
    console.error('❌ Airtable update failed:', error);
    // Log for manual tracking
    const guestInfo = FALLBACK_GUESTS[token as keyof typeof FALLBACK_GUESTS];
    console.log(`📝 RSVP Log: ${guestInfo?.Name || 'Unknown'} (${token}) - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  }
}

/**
 * Find guest by token - works in both dev and production
 */
export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // Try Airtable in production
  if (process.env.NODE_ENV === 'production') {
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      const airtableGuest = await findGuestInAirtable(token);
      if (airtableGuest) {
        return airtableGuest;
      }
    }
    
    // Fallback to embedded data
    console.log('Using fallback guest data');
    return FALLBACK_GUESTS[token as keyof typeof FALLBACK_GUESTS] || null;
  }
  
  // Development: use file system
  try {
    const { findGuestByToken: findGuestFile } = await import('./contacts');
    return findGuestFile(token, eventType);
  } catch (error) {
    console.warn('File system unavailable, using fallback');
    return FALLBACK_GUESTS[token as keyof typeof FALLBACK_GUESTS] || null;
  }
}

/**
 * Update RSVP status - works in both dev and production
 */
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

  // Try Airtable in production
  if (process.env.NODE_ENV === 'production') {
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      await updateGuestInAirtable(token, rsvp, delivery);
      return;
    }
    
    // Fallback logging
    console.log(`📝 RSVP Update: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
    return;
  }
  
  // Development: try file system, fallback to logging
  try {
    const { updateRSVPAndDelivery: updateFile } = await import('./contacts');
    await updateFile(token, rsvp as any, delivery as any, eventType);
  } catch (error) {
    console.warn('File system unavailable, logging RSVP:', error);
    console.log(`📝 RSVP Update: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  }
}

/**
 * List all guests - works in both dev and production
 */
export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  // Try Airtable in production
  if (process.env.NODE_ENV === 'production') {
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      try {
        const response = await airtableRequest('');
        return response.records.map((record: any) => ({
          Name: record.fields.Name || '',
          PhoneNumber: record.fields.PhoneNumber || '',
          Token: record.fields.Token || '',
          RSVPStatus: record.fields.RSVPStatus || 'None',
          WhatsAppDeliveryStatus: record.fields.WhatsAppDeliveryStatus,
          UpdatedAt: record.fields.UpdatedAt,
        }));
      } catch (error) {
        console.warn('Airtable list failed, using fallback');
      }
    }
    
    // Fallback to embedded data
    return Object.values(FALLBACK_GUESTS);
  }
  
  // Development: use file system
  try {
    const { listGuests: listGuestsFile } = await import('./contacts');
    return listGuestsFile(eventType);
  } catch (error) {
    console.warn('File system unavailable, using fallback');
    return Object.values(FALLBACK_GUESTS);
  }
}