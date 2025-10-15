/**
 * Fallback Event Details Sender
 * 
 * This script provides multiple fallback options to send event details
 * to confirmed guests when WhatsApp templates are not approved.
 * 
 * Options:
 * 1. Direct WhatsApp text messages (no template)
 * 2. SMS messages with event details
 * 3. Email with complete event information
 * 4. Generate manual messages for personal sending
 * 
 * Usage: node fallback-event-details-sender.js [--method=whatsapp|sms|email|manual]
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BASE_URL = 'https://denens50th.netlify.app';
const DELAY_BETWEEN_MESSAGES = 3000; // 3 seconds for fallback methods

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

/**
 * Get list of confirmed guests from both events
 */
async function getConfirmedGuests() {
  const confirmedGuests = [];
  
  try {
    // Load Traditional Party guests
    const tradGuestsPath = path.join(__dirname, '..', 'contacts', 'Guest1.json');
    if (fs.existsSync(tradGuestsPath)) {
      const tradGuests = JSON.parse(fs.readFileSync(tradGuestsPath, 'utf8'));
      const confirmed = tradGuests.filter(guest => guest.RSVPStatus === 'Attending');
      confirmedGuests.push(...confirmed.map(guest => ({ ...guest, eventType: 'tradparty' })));
    }
    
    // Load Cocktail guests
    const cocktailGuestsPath = path.join(__dirname, '..', 'contacts', 'Guest2.json');
    if (fs.existsSync(cocktailGuestsPath)) {
      const cocktailGuests = JSON.parse(fs.readFileSync(cocktailGuestsPath, 'utf8'));
      const confirmed = cocktailGuests.filter(guest => guest.RSVPStatus === 'Attending');
      confirmedGuests.push(...confirmed.map(guest => ({ ...guest, eventType: 'cocktail' })));
    }
  } catch (error) {
    console.error('Error loading guest lists:', error);
  }
  
  return confirmedGuests;
}

/**
 * Create event details message for confirmed guests
 */
function createEventDetailsMessage(guest, eventType) {
  const eventName = eventType === 'cocktail' ? 'Golden Jubilee Cocktail Reception' : 'Golden Jubilee Traditional Party';
  const eventDetails = eventType === 'cocktail' ? 
    process.env.COCKTAIL_DETAILS || 'Cocktail reception details will be provided' :
    process.env.TRADPARTY_DETAILS || 'Traditional party details will be provided';
  
  let message = `🎉 GOLDEN JUBILEE - EVENT DETAILS 🎉

Dear ${guest.Name},

Thank you for confirming your attendance! Here are your complete event details:

📅 EVENT: ${eventName}

${eventDetails}`;

  // Add BLACK TIE notice for cocktail
  if (eventType === 'cocktail') {
    message += `\n\n🎩 DRESS CODE: STRICTLY BLACK TIE
Formal evening attire is mandatory for this exclusive event.`;
  }

  message += `\n\n📱 CONTACT: +234 703 223 2198 | +234 809 667 7883

We look forward to celebrating this milestone with you! 👑

Best regards,
The Golden Jubilee Committee`;

  return message;
}

/**
 * Fallback Method 1: Direct WhatsApp Messages (No Template)
 */
async function sendWhatsAppDirect(guest, eventType) {
  const message = createEventDetailsMessage(guest, eventType);
  
  // Use the same WhatsApp API but with direct text (no template)
  const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const IS_TWILIO = WHATSAPP_PHONE_ID && WHATSAPP_PHONE_ID.startsWith('AC');
  
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    return { success: false, error: 'WhatsApp credentials not configured' };
  }

  let url, headers, body;
  
  if (IS_TWILIO) {
    // Twilio API
    url = `https://api.twilio.com/2010-04-01/Accounts/${WHATSAPP_PHONE_ID}/Messages.json`;
    headers = {
      'Authorization': `Basic ${Buffer.from(`${WHATSAPP_PHONE_ID}:${WHATSAPP_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    body = new URLSearchParams({
      From: `whatsapp:${process.env.TWILIO_FROM_NUMBER}`,
      To: `whatsapp:${guest.PhoneNumber}`,
      Body: message
    });
  } else {
    // Meta API
    url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;
    headers = {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    };
    body = JSON.stringify({
      messaging_product: "whatsapp",
      to: guest.PhoneNumber,
      type: "text",
      text: { body: message }
    });
  }

  try {
    const response = await fetch(url, { method: 'POST', headers, body });
    const result = await response.json();
    
    if (response.ok && (result.sid || result.messages?.[0]?.id)) {
      return { success: true, messageId: result.sid || result.messages[0].id };
    } else {
      return { success: false, error: result.error || result };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fallback Method 2: SMS Messages
 */
async function sendSMSDetails(guest, eventType) {
  const message = createEventDetailsMessage(guest, eventType);
  
  // Use Twilio SMS
  const accountSid = process.env.TWILIO_ACCOUNT_SID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.WHATSAPP_CLOUD_API_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER || process.env.SMS_FROM_NUMBER;
  
  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'SMS credentials not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        To: guest.PhoneNumber,
        From: fromNumber,
        Body: message
      })
    });

    const result = await response.json();
    
    if (response.ok && result.sid) {
      return { success: true, messageId: result.sid };
    } else {
      return { success: false, error: result };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fallback Method 3: Email (if email addresses available)
 */
function createEmailContent(guest, eventType) {
  const eventName = eventType === 'cocktail' ? 'Golden Jubilee Cocktail Reception' : 'Golden Jubilee Traditional Party';
  const eventDetails = eventType === 'cocktail' ? 
    process.env.COCKTAIL_DETAILS || 'Cocktail reception details will be provided' :
    process.env.TRADPARTY_DETAILS || 'Traditional party details will be provided';

  let subject = `🎉 Golden Jubilee Event Details - ${eventName}`;
  
  let body = `Dear ${guest.Name},

Thank you for confirming your attendance at Denen Ikya's Golden Jubilee celebration!

We are delighted to provide you with the complete event details:

═════════════════════════════════════════

📅 EVENT: ${eventName}

${eventDetails}`;

  if (eventType === 'cocktail') {
    body += `

🎩 IMPORTANT DRESS CODE REQUIREMENT:
STRICTLY BLACK TIE EVENT FOR COCKTAIL

This is a formal evening event requiring:
• Men: Black tuxedo with black bow tie
• Women: Formal evening gown or cocktail dress
• Black tie attire is mandatory for entry`;
  }

  body += `

═════════════════════════════════════════

📱 CONTACT INFORMATION:
For any questions or assistance:
+234 703 223 2198 | +234 809 667 7883

🎊 We look forward to celebrating this momentous occasion with you!

With warm regards,
The Golden Jubilee Committee

👑 Golden Jubilee - 50 Years of Excellence 👑

---
This email contains your personal event details. Please keep this information secure.`;

  return { subject, body };
}

/**
 * Fallback Method 4: Generate Manual Messages
 */
function generateManualMessages(confirmedGuests, outputPath) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `confirmed-guests-event-details-${timestamp}.txt`;
  const filepath = path.join(outputPath || __dirname, filename);
  
  let content = `GOLDEN JUBILEE - EVENT DETAILS FOR CONFIRMED GUESTS\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Confirmed Guests: ${confirmedGuests.length}\n`;
  content += `${'='.repeat(80)}\n\n`;
  
  confirmedGuests.forEach((guest, index) => {
    const message = createEventDetailsMessage(guest, guest.eventType);
    
    content += `[${index + 1}] ${guest.Name} (${guest.PhoneNumber}) - ${guest.eventType.toUpperCase()}\n`;
    content += `${'='.repeat(60)}\n`;
    content += `📱 MESSAGE TO COPY-PASTE:\n\n`;
    content += message + '\n';
    content += `${'='.repeat(60)}\n\n`;
  });
  
  fs.writeFileSync(filepath, content, 'utf8');
  return filepath;
}

/**
 * Main execution function
 */
async function main() {
  console.log('🎊 Golden Jubilee Fallback Event Details Sender');
  console.log('===============================================\n');
  
  // Get method from command line
  const methodArg = process.argv.find(arg => arg.startsWith('--method='));
  const method = methodArg ? methodArg.split('=')[1] : 'manual';
  
  console.log(`📋 Method: ${method.toUpperCase()}\n`);
  
  // Get confirmed guests
  console.log('🔍 Loading confirmed guests...');
  const confirmedGuests = await getConfirmedGuests();
  
  if (confirmedGuests.length === 0) {
    console.log('❌ No confirmed guests found. Make sure guests have RSVP\'d first.');
    return;
  }
  
  console.log(`✅ Found ${confirmedGuests.length} confirmed guests:`);
  console.log(`   Traditional Party: ${confirmedGuests.filter(g => g.eventType === 'tradparty').length}`);
  console.log(`   Cocktail Reception: ${confirmedGuests.filter(g => g.eventType === 'cocktail').length}\n`);
  
  const results = { sent: 0, failed: 0, errors: [] };
  
  switch (method) {
    case 'whatsapp':
      console.log('📱 Sending direct WhatsApp messages...\n');
      for (let i = 0; i < confirmedGuests.length; i++) {
        const guest = confirmedGuests[i];
        console.log(`[${i + 1}/${confirmedGuests.length}] Sending to ${guest.Name}...`);
        
        const result = await sendWhatsAppDirect(guest, guest.eventType);
        
        if (result.success) {
          console.log(`✅ Sent to ${guest.Name}`);
          results.sent++;
        } else {
          console.log(`❌ Failed to send to ${guest.Name}: ${JSON.stringify(result.error)}`);
          results.failed++;
          results.errors.push({ guest: guest.Name, error: result.error });
        }
        
        if (i < confirmedGuests.length - 1) {
          console.log(`   ⏳ Waiting ${DELAY_BETWEEN_MESSAGES/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_MESSAGES));
        }
      }
      break;
      
    case 'sms':
      console.log('📲 Sending SMS messages...\n');
      for (let i = 0; i < confirmedGuests.length; i++) {
        const guest = confirmedGuests[i];
        console.log(`[${i + 1}/${confirmedGuests.length}] Sending SMS to ${guest.Name}...`);
        
        const result = await sendSMSDetails(guest, guest.eventType);
        
        if (result.success) {
          console.log(`✅ SMS sent to ${guest.Name}`);
          results.sent++;
        } else {
          console.log(`❌ Failed to send SMS to ${guest.Name}: ${JSON.stringify(result.error)}`);
          results.failed++;
          results.errors.push({ guest: guest.Name, error: result.error });
        }
        
        if (i < confirmedGuests.length - 1) {
          console.log(`   ⏳ Waiting ${DELAY_BETWEEN_MESSAGES/1000}s...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_MESSAGES));
        }
      }
      break;
      
    case 'email':
      console.log('📧 Generating email content...\n');
      confirmedGuests.forEach(guest => {
        const emailContent = createEmailContent(guest, guest.eventType);
        console.log(`📧 ${guest.Name} (${guest.eventType.toUpperCase()}):`);
        console.log(`   Subject: ${emailContent.subject}`);
        console.log(`   Body preview: ${emailContent.body.substring(0, 100)}...`);
        console.log('');
      });
      console.log('💡 Copy the above content to your email client to send manually.');
      break;
      
    case 'manual':
    default:
      console.log('📝 Generating manual messages file...\n');
      const filepath = generateManualMessages(confirmedGuests);
      console.log(`✅ Manual messages generated: ${filepath}`);
      console.log('\n📱 You can now copy-paste these messages to WhatsApp, SMS, or any messaging app.');
      break;
  }
  
  // Summary
  if (method === 'whatsapp' || method === 'sms') {
    console.log(`\n${'='.repeat(50)}`);
    console.log('📊 FINAL SUMMARY');
    console.log(`${'='.repeat(50)}`);
    console.log(`Successfully sent: ${results.sent}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total confirmed guests: ${confirmedGuests.length}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      results.errors.forEach(error => {
        console.log(`   ${error.guest}: ${JSON.stringify(error.error)}`);
      });
    }
  }
  
  console.log('\n🎉 Event details delivery process complete!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { getConfirmedGuests, createEventDetailsMessage, sendWhatsAppDirect, sendSMSDetails };