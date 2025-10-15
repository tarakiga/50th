/**
 * WhatsApp Business API Bulk Invitation Sender
 * 
 * This script sends personalized invitation messages with links to all guests
 * using WhatsApp Business API. It supports rate limiting and error handling.
 * 
 * Prerequisites:
 * - WhatsApp Business Account with approved message templates
 * - Environment variables configured for WhatsApp API
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const BASE_URL = 'https://denens50th.netlify.app';
const DELAY_BETWEEN_MESSAGES = 2000; // 2 seconds to respect rate limits

// Detect if using Twilio (Account SID starts with 'AC')
const IS_TWILIO = WHATSAPP_PHONE_ID && WHATSAPP_PHONE_ID.startsWith('AC');

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
  console.error('❌ Missing WhatsApp API credentials in environment variables');
  console.log('Required: WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID');
  process.exit(1);
}

/**
 * Send WhatsApp message with invitation link
 */
async function sendInvitationMessage(guest, eventType) {
  const inviteUrl = `${BASE_URL}/${eventType}?token=${guest.Token}`;
  const eventName = eventType === 'cocktail' ? 'Golden Jubilee Cocktail Reception' : 'Golden Jubilee Traditional Party';
  
  let messageText = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${guest.Name},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*${eventName}*`;
  
  // Add BLACK TIE notice for cocktail events
  if (eventType === 'cocktail') {
    messageText += `

🎩 *STRICTLY BLACK TIE EVENT* 🎩
*Formal evening attire required*`;
  }
  
  messageText += `

Click your personal invitation:
${inviteUrl}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;

  let url, headers, body;
  
  if (IS_TWILIO) {
    // Twilio API format
    url = `https://api.twilio.com/2010-04-01/Accounts/${WHATSAPP_PHONE_ID}/Messages.json`;
    headers = {
      'Authorization': `Basic ${Buffer.from(`${WHATSAPP_PHONE_ID}:${WHATSAPP_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    body = new URLSearchParams({
      From: `whatsapp:${TWILIO_FROM_NUMBER}`,
      To: `whatsapp:${guest.PhoneNumber}`,
      Body: messageText
    });
  } else {
    // Meta/Facebook API format
    url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;
    headers = {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    };
    body = JSON.stringify({
      messaging_product: "whatsapp",
      to: guest.PhoneNumber,
      type: "text",
      text: { body: messageText }
    });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    const result = await response.json();
    
    const isSuccess = response.ok && (result.sid || result.messages?.[0]?.id);
    
    if (isSuccess) {
      console.log(`✅ Sent to ${guest.Name} (${guest.PhoneNumber})`);
      return { success: true, messageId: result.sid || result.messages[0].id };
    } else {
      console.error(`❌ Failed to send to ${guest.Name}: ${result.error?.message || result.message || 'Unknown error'}`);
      return { success: false, error: result.error || result };
    }
  } catch (error) {
    console.error(`❌ Error sending to ${guest.Name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Send invitations to all guests in a contact file
 */
async function sendInvitations(contactFile, eventType) {
  const filePath = path.join(__dirname, '..', 'contacts', contactFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Contact file not found: ${contactFile}`);
    return;
  }

  const guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const results = { sent: 0, failed: 0, errors: [] };
  
  console.log(`\n📱 Sending ${eventType} invitations to ${guests.length} guests...\n`);
  
  for (let i = 0; i < guests.length; i++) {
    const guest = guests[i];
    console.log(`[${i + 1}/${guests.length}] Sending to ${guest.Name}...`);
    
    const result = await sendInvitationMessage(guest, eventType);
    
    if (result.success) {
      results.sent++;
    } else {
      results.failed++;
      results.errors.push({ guest: guest.Name, error: result.error });
    }
    
    // Rate limiting delay
    if (i < guests.length - 1) {
      console.log(`   ⏳ Waiting ${DELAY_BETWEEN_MESSAGES/1000}s before next message...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_MESSAGES));
    }
  }
  
  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log('🎊 Golden Jubilee Invitation Sender');
  console.log('==================================\n');
  
  try {
    // Send Traditional Party invitations
    console.log('📋 Processing Traditional Party invitations...');
    const tradResults = await sendInvitations('Guest1.json', 'tradparty');
    
    console.log('\n' + '='.repeat(50));
    
    // Send Cocktail invitations  
    console.log('🍸 Processing Cocktail invitations...');
    const cocktailResults = await sendInvitations('Guest2.json', 'cocktail');
    
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
        console.log(`   ${error.guest}: ${error.error.message || error.error}`);
      });
    }
    
    console.log('\n🎉 Invitation sending complete!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { sendInvitationMessage, sendInvitations };