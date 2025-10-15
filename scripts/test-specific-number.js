/**
 * Test Invitation to Specific Number
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const BASE_URL = process.env.BASE_URL || 'https://denens50th.netlify.app';

const testNumber = '+96894398548';
const testName = 'Test Recipient';

console.log('🧪 Sending Test Invitation');
console.log('=========================\n');
console.log(`📱 To: ${testNumber}`);
console.log(`👤 Name: ${testName}\n`);

async function sendTestInvitation() {
    try {
        // Generate test invitation message
        const testToken = 'a909f361f2ca4d8fbac37fcc531a8164';
        const inviteUrl = `${BASE_URL}/tradparty?token=${testToken}`;
        
        const message = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${testName},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*Golden Jubilee Traditional Party*

Click your personal invitation:
${inviteUrl}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;

        console.log('📝 Message content:');
        console.log('=' .repeat(50));
        console.log(message);
        console.log('=' .repeat(50) + '\n');

        // Send via Twilio
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        console.log('📤 Sending message...');
        
        const result = await client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${testNumber}`,
            body: message
        });

        console.log('✅ Message sent successfully!');
        console.log(`   Message SID: ${result.sid}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   To: ${result.to}`);
        console.log(`   From: ${result.from}\n`);
        
        console.log('📱 Check WhatsApp on +96894398548 for the invitation!');
        console.log('🎯 If received, your system is ready for mass sending.');

    } catch (error) {
        console.error('❌ Error sending test invitation:');
        console.log(`   ${error.message}`);
        
        if (error.code === 20003) {
            console.log('\n💡 This usually means:');
            console.log('   - Phone number format issue');
            console.log('   - WhatsApp not available on this number');
            console.log('   - Number not verified with the sandbox');
        } else if (error.code === 21408) {
            console.log('\n💡 This usually means:');
            console.log('   - The recipient needs to join the WhatsApp sandbox first');
            console.log('   - Send "join <sandbox-code>" to +14155238886 from +96894398548');
        }
        
        console.log('\n🔗 For help: https://www.twilio.com/docs/whatsapp/sandbox');
    }
}

sendTestInvitation();