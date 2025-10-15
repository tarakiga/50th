/**
 * Send Golden Jubilee Invitations via Twilio WhatsApp
 * 
 * This script sends personalized WhatsApp invitations to all guests
 * using Twilio's WhatsApp Business API.
 * 
 * Usage: node send-invitations-twilio.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../.env' });

// Twilio configuration
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

// App configuration
const BASE_URL = process.env.BASE_URL || 'https://denens50th.netlify.app';
const DELAY_BETWEEN_MESSAGES = 3000; // 3 seconds between messages (safe rate)

console.log('🎊 Golden Jubilee WhatsApp Invitations (Twilio)');
console.log('===============================================\n');

// Check configuration
if (!accountSid || !authToken || !fromNumber) {
    console.log('❌ Missing Twilio credentials. Add to .env:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=your_auth_token_here');
    console.log('   TWILIO_FROM_NUMBER=+1415xxxxxxx');
    process.exit(1);
}

/**
 * Generate invitation message for a guest
 */
function generateInvitationMessage(guest, eventType) {
    const inviteUrl = `${BASE_URL}/${eventType}?token=${guest.Token}`;
    const eventName = eventType === 'cocktail' 
        ? 'Golden Jubilee Cocktail Reception' 
        : 'Golden Jubilee Traditional Party';
    
    let message = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${guest.Name},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*${eventName}*`;

    // Add dress code for cocktail events
    if (eventType === 'cocktail') {
        message += `

🎩 *STRICTLY BLACK TIE EVENT* 🎩
*Formal evening attire required*`;
    }

    message += `

Click your personal invitation:
${inviteUrl}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;

    return message;
}

/**
 * Send WhatsApp message via Twilio
 */
async function sendWhatsAppMessage(client, guest, eventType) {
    try {
        const message = generateInvitationMessage(guest, eventType);
        
        const result = await client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${guest.PhoneNumber}`,
            body: message
        });

        return {
            success: true,
            messageId: result.sid,
            status: result.status
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

/**
 * Load guest list from JSON file
 */
function loadGuestList(filename) {
    const filePath = path.join(__dirname, '..', 'contacts', filename);
    
    if (!fs.existsSync(filePath)) {
        throw new Error(`Contact file not found: ${filename}`);
    }
    
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to send all invitations
 */
async function sendAllInvitations() {
    try {
        // Dynamic import for Twilio
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        console.log('✅ Twilio client initialized');
        console.log(`📤 Sending from: ${fromNumber}\n`);

        // Load guest lists
        const tradPartyGuests = loadGuestList('Guest1.json');
        const cocktailGuests = loadGuestList('Guest2.json');

        console.log(`📋 Traditional Party: ${tradPartyGuests.length} guests`);
        console.log(`🍸 Cocktail Reception: ${cocktailGuests.length} guests`);
        console.log(`📱 Total invitations: ${tradPartyGuests.length + cocktailGuests.length}\n`);

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        // Send Traditional Party invitations
        console.log('🎭 Sending Traditional Party invitations...');
        for (let i = 0; i < tradPartyGuests.length; i++) {
            const guest = tradPartyGuests[i];
            console.log(`[${i + 1}/${tradPartyGuests.length}] ${guest.Name} (${guest.PhoneNumber})`);
            
            const result = await sendWhatsAppMessage(client, guest, 'tradparty');
            
            if (result.success) {
                console.log(`   ✅ Sent (${result.messageId})`);
                results.success++;
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
                results.failed++;
                results.errors.push({
                    guest: guest.Name,
                    phone: guest.PhoneNumber,
                    error: result.error,
                    event: 'Traditional Party'
                });
            }
            
            // Rate limiting delay
            if (i < tradPartyGuests.length - 1) {
                await sleep(DELAY_BETWEEN_MESSAGES);
            }
        }

        console.log(`\n🍸 Sending Cocktail Reception invitations...`);
        // Send Cocktail invitations
        for (let i = 0; i < cocktailGuests.length; i++) {
            const guest = cocktailGuests[i];
            console.log(`[${i + 1}/${cocktailGuests.length}] ${guest.Name} (${guest.PhoneNumber})`);
            
            const result = await sendWhatsAppMessage(client, guest, 'cocktail');
            
            if (result.success) {
                console.log(`   ✅ Sent (${result.messageId})`);
                results.success++;
            } else {
                console.log(`   ❌ Failed: ${result.error}`);
                results.failed++;
                results.errors.push({
                    guest: guest.Name,
                    phone: guest.PhoneNumber,
                    error: result.error,
                    event: 'Cocktail Reception'
                });
            }
            
            // Rate limiting delay
            if (i < cocktailGuests.length - 1) {
                await sleep(DELAY_BETWEEN_MESSAGES);
            }
        }

        // Final report
        console.log('\n' + '='.repeat(50));
        console.log('📊 INVITATION SENDING COMPLETE');
        console.log('='.repeat(50));
        console.log(`✅ Successfully sent: ${results.success}`);
        console.log(`❌ Failed to send: ${results.failed}`);
        console.log(`📱 Total processed: ${results.success + results.failed}`);

        if (results.failed > 0) {
            console.log(`\n❌ FAILED INVITATIONS:`);
            results.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.guest} (${error.phone}) - ${error.event}`);
                console.log(`   Error: ${error.error}`);
            });
        }

        // Save results to file
        const reportPath = path.join(__dirname, 'invitation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
                success: results.success,
                failed: results.failed,
                total: results.success + results.failed
            },
            errors: results.errors
        }, null, 2));

        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        console.log(`\n🎊 Invitation campaign complete! 👑`);

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    sendAllInvitations();
}

export { sendAllInvitations, generateInvitationMessage };