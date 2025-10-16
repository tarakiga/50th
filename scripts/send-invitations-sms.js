/**
 * SMS Bulk Invitation Sender
 * 
 * This script sends personalized invitation SMS messages with links to all guests.
 * Supports multiple SMS providers (Twilio, Infobip, etc.)
 * 
 * Usage: node send-invitations-sms.js [--provider=twilio] [--dry-run]
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BASE_URL = 'https://denens50th.netlify.app';
const DELAY_BETWEEN_MESSAGES = 1500; // 1.5 seconds
const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_ARG = process.argv.find(arg => arg.startsWith('--only='));
const ONLY_NUMBER = ONLY_ARG ? ONLY_ARG.split('=')[1] : undefined;

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * SMS Providers Configuration
 */
const SMS_PROVIDERS = {
  twilio: {
    name: 'Twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    
    async send(to, message, credentials) {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${credentials.accountSid}/Messages.json`;
      const body = new URLSearchParams({
        To: to,
        From: credentials.fromNumber,
        Body: message
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body
      });

      return await response.json();
    }
  },
  
  infobip: {
    name: 'Infobip',
    apiKey: process.env.INFOBIP_API_KEY,
    baseUrl: process.env.INFOBIP_BASE_URL || 'https://api.infobip.com',
    fromNumber: process.env.INFOBIP_FROM_NUMBER,
    
    async send(to, message, credentials) {
      const url = `${credentials.baseUrl}/sms/2/text/advanced`;
      const body = {
        messages: [{
          from: credentials.fromNumber,
          destinations: [{ to: to }],
          text: message
        }]
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `App ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      return await response.json();
    }
  },
  
  // Add more providers as needed
  custom: {
    name: 'Custom SMS API',
    apiUrl: process.env.SMS_API_URL,
    apiKey: process.env.SMS_API_KEY,
    fromNumber: process.env.SMS_FROM_NUMBER,
    
    async send(to, message, credentials) {
      // Customize this for your SMS provider
      const response = await fetch(credentials.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: to,
          from: credentials.fromNumber,
          message: message
        })
      });

      return await response.json();
    }
  }
};

/**
 * Get SMS provider based on command line args or environment
 */
function getSMSProvider() {
  const providerArg = process.argv.find(arg => arg.startsWith('--provider='));
  const providerName = providerArg ? providerArg.split('=')[1] : 'twilio';
  
  const provider = SMS_PROVIDERS[providerName];
  if (!provider) {
    console.error(`❌ Unknown SMS provider: ${providerName}`);
    console.log('Available providers:', Object.keys(SMS_PROVIDERS).join(', '));
    process.exit(1);
  }
  
  return { name: providerName, config: provider };
}

/**
 * Create SMS message content
 */
function createSMSMessage(guest, eventType) {
  const inviteUrl = `${BASE_URL}/${eventType}?token=${guest.Token}`;
  const eventName = eventType === 'cocktail' ? 'Cocktail Reception' : 'Traditional Party';
  
  let message = `🎊 GOLDEN JUBILEE INVITATION

Dear ${guest.Name},

You're invited to Denen Ikya's 50th Birthday ${eventName}!`;
  
  // Add BLACK TIE notice for cocktail events
  if (eventType === 'cocktail') {
    message += `

🎩 STRICTLY BLACK TIE EVENT
Formal evening attire required`;
  }
  
  message += `

Your personal invitation: ${inviteUrl}

Please RSVP via the link. Full details shared after confirmation.

Looking forward to celebrating! 👑`;
  
  return message;
}

/**
 * Send SMS invitation
 */
async function sendSMSInvitation(guest, eventType, provider) {
  const message = createSMSMessage(guest, eventType);
  
  if (DRY_RUN) {
    console.log(`📱 [DRY RUN] Would send to ${guest.Name} (${guest.PhoneNumber}):`);
    console.log(`   Message: ${message.substring(0, 50)}...`);
    return { success: true, dryRun: true };
  }
  
  try {
    const result = await provider.config.send(guest.PhoneNumber, message, provider.config);
    
    // Check success based on provider response format
    const isSuccess = result.sid || result.messages?.[0]?.status?.groupId === 1 || result.success;
    
    if (isSuccess) {
      console.log(`✅ SMS sent to ${guest.Name} (${guest.PhoneNumber})`);
      return { success: true, result };
    } else {
      console.error(`❌ Failed to send SMS to ${guest.Name}: ${JSON.stringify(result)}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error(`❌ Error sending SMS to ${guest.Name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS invitations to all guests
 */
async function sendSMSInvitations(contactFile, eventType, provider) {
  const filePath = path.join(__dirname, '..', 'contacts', contactFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Contact file not found: ${contactFile}`);
    return;
  }

  let guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (ONLY_NUMBER) {
    guests = guests.filter(g => (g.PhoneNumber || '').trim() === ONLY_NUMBER.trim());
    console.log(`   ▶ Filtering by --only: ${ONLY_NUMBER} → ${guests.length} match(es)`);
  }
  const results = { sent: 0, failed: 0, errors: [] };
  
  console.log(`\n📱 Sending ${eventType} SMS invitations to ${guests.length} guests via ${provider.config.name}...\n`);
  
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    console.log(`[${i + 1}/${guests.length}] Sending SMS to ${guest.Name}...`);
    
    const result = await sendSMSInvitation(guest, eventType, provider);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({ guest: guest.Name, error: result.error });
    }
    
    // Rate limiting delay
    if (i < guests.length - 1 && !DRY_RUN) {
      console.log(`   ⏳ Waiting ${DELAY_BETWEEN_MESSAGES/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_MESSAGES));
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('📱 Golden Jubilee SMS Invitation Sender');
  console.log('=====================================\n');
  
  if (DRY_RUN) {
    console.log('🧪 DRY RUN MODE - No SMS will be sent\n');
  }
  
  const provider = getSMSProvider();
  console.log(`📡 Using SMS Provider: ${provider.config.name}\n`);
  
  try {
    // Send Traditional Party SMS invitations
    console.log('📋 Processing Traditional Party SMS invitations...');
    const tradResults = await sendSMSInvitations('Guest1.json', 'tradparty', provider);
    
    console.log('\n' + '='.repeat(50));
    
    // Send Cocktail SMS invitations  
    console.log('🍸 Processing Cocktail SMS invitations...');
    const cocktailResults = await sendSMSInvitations('Guest2.json', 'cocktail', provider);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL SUMMARY');
    console.log('='.repeat(50));
    console.log(`Traditional Party: ${tradResults.sent} sent, ${tradResults.failed} failed`);
    console.log(`Cocktail Reception: ${cocktailResults.sent} sent, ${cocktailResults.failed} failed`);
    console.log(`Total: ${tradResults.sent + cocktailResults.sent} sent, ${tradResults.failed + cocktailResults.failed} failed`);
    
    if (tradResults.errors.length > 0 || cocktailResults.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      [...tradResults.errors, ...cocktailResults.errors].forEach(error => {
        console.log(`   ${error.guest}: ${JSON.stringify(error.error)}`);
      });
    }
    
    console.log(`\n🎉 SMS invitation sending complete! (${DRY_RUN ? 'DRY RUN' : 'LIVE'})`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { sendSMSInvitation, sendSMSInvitations };