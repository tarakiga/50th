/**
 * Get Twilio WhatsApp Sandbox Join Code
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('🏖️  Getting Twilio WhatsApp Sandbox Code');
console.log('========================================\n');

async function getSandboxCode() {
    try {
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        // Get sandbox configuration
        const sandbox = await client.messaging.v1.services.list({ limit: 1 });
        
        console.log('📋 To receive WhatsApp messages from your Twilio sandbox:');
        console.log('======================================================');
        console.log('1. Open WhatsApp on +96894398548');
        console.log('2. Send a message to: +14155238886');
        console.log('3. Message content: "join <sandbox-code>"');
        console.log('');
        console.log('🔍 To find your specific sandbox code:');
        console.log('   → Go to: https://console.twilio.com/us1/develop/sms/whatsapp/sandbox');
        console.log('   → Look for the "join" command (e.g., "join large-tree")');
        console.log('');
        console.log('📱 Common sandbox codes include:');
        console.log('   - join large-tree');
        console.log('   - join happy-dog'); 
        console.log('   - join blue-moon');
        console.log('   - join red-bird');
        console.log('');
        console.log('✅ After joining, re-run the test:');
        console.log('   node test-specific-number.js');

    } catch (error) {
        console.log('📋 Manual steps to get your sandbox code:');
        console.log('=========================================');
        console.log('1. Go to: https://console.twilio.com/');
        console.log('2. Navigate to: Develop → Messaging → WhatsApp');
        console.log('3. Click on "Sandbox Settings"');
        console.log('4. Find the "join" command');
        console.log('');
        console.log('Then send that join command from +96894398548 to +14155238886');
    }
}

getSandboxCode();