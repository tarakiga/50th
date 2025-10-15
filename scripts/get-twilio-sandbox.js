/**
 * Get Twilio WhatsApp Sandbox Information
 * 
 * This script shows you the available WhatsApp sandbox numbers
 * and helps you configure the correct FROM number.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('📞 Getting Twilio WhatsApp Sandbox Info');
console.log('======================================\n');

async function getTwilioSandboxInfo() {
    try {
        const { default: twilio } = await import('twilio');
        const client = twilio(accountSid, authToken);

        console.log('🔍 Checking WhatsApp senders...\n');

        // Get available WhatsApp senders
        const senders = await client.messaging.v1.services.list();
        
        if (senders.length === 0) {
            console.log('📋 No messaging services found.');
            console.log('\n💡 You need to set up WhatsApp in your Twilio Console:');
            console.log('   1. Go to: https://console.twilio.com/');
            console.log('   2. Navigate to: Develop → Messaging → WhatsApp');
            console.log('   3. Click "Get started with WhatsApp"');
            console.log('   4. Follow the setup wizard');
        } else {
            console.log('✅ Found messaging services:');
            senders.forEach((service, index) => {
                console.log(`   ${index + 1}. Service SID: ${service.sid}`);
                console.log(`      Friendly Name: ${service.friendlyName}`);
            });
        }

        // Try to get WhatsApp sandbox info
        console.log('\n🏖️  Checking WhatsApp Sandbox...');
        try {
            const sandboxes = await client.conversations.v1.configuration().webhooks.list();
            console.log('Sandbox info:', sandboxes);
        } catch (err) {
            console.log('Unable to get sandbox info:', err.message);
        }

        // Show common Twilio sandbox numbers
        console.log('\n📱 COMMON TWILIO WHATSAPP SANDBOX NUMBERS:');
        console.log('==========================================');
        console.log('🇺🇸 United States: +1 415 523 8886');
        console.log('🇺🇸 United States: +1 626 354 2890'); 
        console.log('🇬🇧 United Kingdom: +44 20 8133 0676');
        console.log('🇩🇪 Germany: +49 30 20917518');
        console.log('🇮🇳 India: +91 80001 93721');

        console.log('\n💡 TO ACTIVATE WHATSAPP SANDBOX:');
        console.log('================================');
        console.log('1. Go to: https://console.twilio.com/us1/develop/sms/whatsapp/sandbox');
        console.log('2. Send "join <your-sandbox-name>" to one of the numbers above');
        console.log('3. Use that number as TWILIO_FROM_NUMBER in your .env file');

        console.log('\n🔧 RECOMMENDED NEXT STEPS:');
        console.log('==========================');
        console.log('1. Visit your Twilio Console WhatsApp section');
        console.log('2. Activate the WhatsApp sandbox');
        console.log('3. Update your .env with the correct FROM number');
        console.log('4. Test again with: node test-twilio-whatsapp.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.status === 401) {
            console.log('\n💡 Authentication failed:');
            console.log('   - Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
            console.log('   - Make sure they are correct in your .env file');
        }
    }
}

getTwilioSandboxInfo();