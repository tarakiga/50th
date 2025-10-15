/**
 * Simple Google Sheets Guest Management
 * 
 * Uses your existing Google Sheets credentials for RSVP tracking
 */

import { google } from 'googleapis';
import { GuestRow } from '../types';

// Use existing Google credentials from your .env
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || "").replace(/\\n/g, "\n");

// Fallback guest data
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

function getClient() {
  return new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

export async function findGuestByToken(token: string, eventType?: string): Promise<GuestRow | null> {
  // Production: Try Google Sheets then fallback
  if (process.env.NODE_ENV === 'production') {
    if (SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY) {
      try {
        const auth = getClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Search in RSVPs sheet
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'RSVPs!A:F',
        });

        const rows = response.data.values || [];
        for (const row of rows) {
          if (row[2] === token) { // Token is in column C
            return {
              Name: row[0] || '',
              PhoneNumber: row[1] || '',
              Token: row[2] || '',
              RSVPStatus: row[3] || 'None',
              WhatsAppDeliveryStatus: row[4],
              UpdatedAt: row[5],
            };
          }
        }
      } catch (error) {
        console.warn('Google Sheets lookup failed:', error);
      }
    }
    
    // Fallback to embedded data
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

  // Production: Try Google Sheets then fallback to logging
  if (process.env.NODE_ENV === 'production') {
    if (SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY) {
      try {
        const auth = getClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Find the row with this token
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'RSVPs!A:F',
        });

        const rows = response.data.values || [];
        let rowIndex = -1;
        
        for (let i = 0; i < rows.length; i++) {
          if (rows[i][2] === token) {
            rowIndex = i + 1; // Sheets are 1-indexed
            break;
          }
        }

        if (rowIndex > 0) {
          // Update the existing row
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `RSVPs!D${rowIndex}:F${rowIndex}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [[rsvp, delivery || '', new Date().toISOString()]]
            },
          });
          console.log(`✅ Google Sheets updated: ${guest.Name} - ${rsvp}`);
          return;
        } else {
          // Add new row
          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'RSVPs!A:F',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[guest.Name, guest.PhoneNumber, token, rsvp, delivery || '', new Date().toISOString()]]
            },
          });
          console.log(`✅ Google Sheets added: ${guest.Name} - ${rsvp}`);
          return;
        }
      } catch (error) {
        console.error('❌ Google Sheets update failed:', error);
      }
    }
    
    // Fallback logging
    console.log(`📝 RSVP Update: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
    return;
  }
  
  // Development: try file system
  try {
    const { updateRSVPAndDelivery: updateFile } = await import('./contacts');
    await updateFile(token, rsvp as any, delivery as any, eventType);
  } catch (error) {
    console.log(`📝 RSVP Update: ${guest.Name} - ${rsvp}${delivery ? ` - ${delivery}` : ''}`);
  }
}

export async function listGuests(eventType?: string): Promise<GuestRow[]> {
  // Production: Try Google Sheets then fallback
  if (process.env.NODE_ENV === 'production') {
    if (SPREADSHEET_ID && CLIENT_EMAIL && PRIVATE_KEY) {
      try {
        const auth = getClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range: 'RSVPs!A:F',
        });

        const rows = response.data.values || [];
        return rows.map(row => ({
          Name: row[0] || '',
          PhoneNumber: row[1] || '',
          Token: row[2] || '',
          RSVPStatus: row[3] || 'None',
          WhatsAppDeliveryStatus: row[4],
          UpdatedAt: row[5],
        }));
      } catch (error) {
        console.warn('Google Sheets list failed:', error);
      }
    }
    
    return Object.values(FALLBACK_GUESTS);
  }
  
  // Development: use file system
  try {
    const { listGuests: listGuestsFile } = await import('./contacts');
    return listGuestsFile(eventType);
  } catch (error) {
    return Object.values(FALLBACK_GUESTS);
  }
}