/**
 * Test Twilio WhatsApp Integration
 * 
 * This script tests your Twilio WhatsApp setup before sending invitations.
 * 
 * Usage: 
 * 1. Set up your Twilio credentials in .env
 * 2. Add your phone number as TEST_PHONE_NUMBER
 * 3. Run: node test-twilio-whatsapp.js
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER; // Twilio WhatsApp number
const testPhoneNumber = process.env.TEST_PHONE_NUMBER; // Your phone number to test

console.log('🧪 Testing Twilio WhatsApp Integration');
console.log('=====================================\n');

// Check configuration
if (!accountSid || !authToken || !fromNumber) {
    console.log('❌ Missing Twilio credentials in .env file:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=your_auth_token_here');
    console.log('   TWILIO_FROM_NUMBER=+1415xxxxxxx');
    console.log('\n📖 Get these from: https://console.twilio.com/');
    process.exit(1);
}

if (!testPhoneNumber) {
    console.log('❌ Missing TEST_PHONE_NUMBER in .env file');
    console.log('   Add: TEST_PHONE_NUMBER=+234xxxxxxxxxx');
    console.log('   (Your WhatsApp number in E.164 format)');
    process.exit(1);
}

console.log('✅ Configuration found:');
console.log(`   Account SID: ${accountSid.substring(0, 10)}...`);
console.log(`   From Number: ${fromNumber}`);
console.log(`   Test Number: ${testPhoneNumber}\n`);

// Import and initialize Twilio
async function testTwilioWhatsApp() {
    try {
        // Dynamic import for Twilio
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        console.log('📱 Sending test message...');
        
        const message = await client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${testPhoneNumber}`,
            body: `🎉 *Golden Jubilee Test Message*

Dear Test User,

This is a test message from your Golden Jubilee invitation system!

If you receive this, your Twilio WhatsApp integration is working perfectly! 🎊

Reply "YES" to confirm you received this message.

👑 Golden Jubilee WhatsApp System`
        });

        console.log('✅ Test message sent successfully!');
        console.log(`   Message SID: ${message.sid}`);
        console.log(`   Status: ${message.status}`);
        console.log('\n📱 Check your WhatsApp for the test message');
        console.log('🎯 If received, your system is ready to send invitations!');

    } catch (error) {
        console.log('❌ Error sending test message:');
        console.log(`   ${error.message}`);
        
        if (error.code === 20003) {
            console.log('\n💡 This usually means:');
            console.log('   1. Invalid phone number format (use +234xxxxxxxxxx)');
            console.log('   2. WhatsApp not enabled on recipient number');
        } else if (error.code === 20404) {
            console.log('\n💡 This usually means:');
            console.log('   1. Invalid Twilio phone number');
            console.log('   2. WhatsApp not enabled on your Twilio number');
        } else if (error.status === 401) {
            console.log('\n💡 This usually means:');
            console.log('   1. Invalid Account SID or Auth Token');
            console.log('   2. Check your credentials in Twilio Console');
        }
        
        console.log('\n🔗 For help: https://www.twilio.com/docs/whatsapp');
    }
}

// Run the test
testTwilioWhatsApp();