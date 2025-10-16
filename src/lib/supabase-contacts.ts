/**
 * Supabase-based Guest Management
 * 
 * Uses Supabase (PostgreSQL) for reliable RSVP tracking
 * Handles E.164 phone numbers correctly
 */

import { GuestRow } from '../types';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Fallback guest data for immediate testing
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
 * Make Supabase API request
 */
async function supabaseRequest(endpoint: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials not configured');
  }

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Find guest by token in Supabase
 */
async function findGuestInSupabase(token: string): Promise<GuestRow | null> {
  try {
    const guests = await supabaseRequest(`guests?token=eq.${token}&select=*`);
    
    if (guests && guests.length > 0) {
      const guest = guests[0];
      return {
        Name: guest.name || '',
        PhoneNumber: guest.phone_number || '',
        Token: guest.token || '',
        RSVPStatus: guest.rsvp_status || 'None',
        WhatsAppDeliveryStatus: guest.whatsapp_delivery_status,
        UpdatedAt: guest.updated_at,
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Supabase lookup failed:', error);
    return null;
  }
}

/**
 * Update guest RSVP in Supabase
 */
async function updateGuestInSupabase(
  token: string,
  rsvp: string,
  delivery?: string
): Promise<void> {
  try {
    const updateData = {
      rsvp_status: rsvp,
      updated_at: new Date().toISOString(),
      ...(delivery && { whatsapp_delivery_status: delivery })
    };

    await supabaseRequest(`guests?token=eq.${token}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });

    console.log(`✅ Supabase updated: Token ${token} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  } catch (error) {
    console.error('❌ Supabase update failed:', error);
    throw error;
  }
}

/**
 * Find guest by token - works in both dev and production
 */
export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // Try Supabase in production
  if (process.env.NODE_ENV === 'production') {
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabaseGuest = await findGuestInSupabase(token);
      if (supabaseGuest) {
        return supabaseGuest;
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
  // First try Supabase if credentials are available
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      // Update both RSVP status and timestamp
      const now = new Date().toISOString();
      const updates: Record<string, any> = {
        rsvp_status: rsvp,
        updated_at: now
      };
      
      if (delivery) {
        updates.whatsapp_delivery_status = delivery;
      }
      
      const response = await fetch(`${SUPABASE_URL}/rest/v1/guests?token=eq.${token}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Supabase update failed: ${error}`);
      }
      
      console.log(`✅ Updated RSVP in Supabase for token ${token}: ${rsvp}`);
      return;
    } catch (error) {
      console.error('Supabase update error:', error);
      throw error; // Re-throw to be handled by the caller
    }
  }
  
  // Fallback for development or if Supabase is not configured
  const guest = await findGuestByToken(token, eventType);
  if (!guest) {
    throw new Error('Token not found');
  }
  
  console.log(`📝 RSVP Update (local): ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
}

/**
 * List all guests - works in both dev and production
 */
export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  // Always try Supabase first if credentials are available
  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const guests = await supabaseRequest('guests?select=*');
      if (!Array.isArray(guests)) {
        throw new Error('Invalid response from Supabase');
      }
      
      const mappedGuests = guests
        .map((guest: any) => ({
          Name: guest.name || '',
          PhoneNumber: guest.phone_number || '',
          Token: guest.token || '',
          RSVPStatus: guest.rsvp_status || 'None',
          WhatsAppDeliveryStatus: guest.whatsapp_delivery_status,
          UpdatedAt: guest.updated_at,
        }))
        // Filter by event type if specified
        .filter((guest: GuestRow) => {
          if (!eventType) return true;
          const name = guest.Name.toLowerCase();
          if (eventType === 'tradparty') {
            return name.includes('(traditional)');
          } else if (eventType === 'cocktail') {
            return name.includes('(cocktail)');
          }
          return true;
        });
      
      console.log(`Fetched ${mappedGuests.length} ${eventType} guests from Supabase`);
      return mappedGuests;
    } catch (error) {
      console.error('Supabase list failed:', error);
      // Only use fallback in development
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using fallback data');
        return Object.values(FALLBACK_GUESTS);
      }
      // In production, return empty array instead of fallback
      return [];
    }
  }
  
  // Development: use file system if Supabase not available
  if (process.env.NODE_ENV !== 'production') {
    try {
      const { listGuests: listGuestsFile } = await import('./contacts');
      return listGuestsFile(eventType);
    } catch (error) {
      console.warn('File system unavailable, using fallback');
      return Object.values(FALLBACK_GUESTS);
    }
  }
  
  // If we get here in production without Supabase, return empty array
  return [];
}