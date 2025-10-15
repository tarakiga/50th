/**
 * Test Single Invitation Send
 * 
 * This script sends one invitation to verify everything works
 * before sending to all guests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const BASE_URL = process.env.BASE_URL || 'https://denens50th.netlify.app';

console.log('🧪 Testing Single Invitation Send');
console.log('=================================\n');

async function testSingleInvitation() {
    try {
        // Load first guest from Guest1.json
        const guestFilePath = path.join(__dirname, '..', 'contacts', 'Guest1.json');
        const guests = JSON.parse(fs.readFileSync(guestFilePath, 'utf8'));
        const testGuest = guests[0]; // First guest

        console.log(`👤 Sending test invitation to: ${testGuest.Name}`);
        console.log(`📱 Phone: ${testGuest.PhoneNumber}\n`);

        // Generate invitation message
        const inviteUrl = `${BASE_URL}/tradparty?token=${testGuest.Token}`;
        const message = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${testGuest.Name},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*Golden Jubilee Traditional Party*

Click your personal invitation:
${inviteUrl}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;

        console.log('📝 Message content:');
        console.log('=' .repeat(40));
        console.log(message);
        console.log('=' .repeat(40) + '\n');

        // Send via Twilio
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        console.log('📤 Sending message...');
        const result = await client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${testGuest.PhoneNumber}`,
            body: message
        });

        console.log('✅ Message sent successfully!');
        console.log(`   Message SID: ${result.sid}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   To: ${result.to}`);
        console.log(`   From: ${result.from}\n`);

        console.log('🎯 If this test worked, you can now send to all guests with:');
        console.log('   node send-invitations-twilio.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code) {
            console.log(`   Error Code: ${error.code}`);
        }
        
        if (error.status) {
            console.log(`   HTTP Status: ${error.status}`);
        }
    }
}

testSingleInvitation();