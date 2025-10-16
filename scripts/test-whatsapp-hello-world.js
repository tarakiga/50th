/**
 * Test WhatsApp Hello World Template using the app's WhatsApp library
 * 
 * This script uses the same WhatsApp library that the app uses to test
 * the hello_world template with your actual configuration.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// Set template to hello_world for testing
process.env.WHATSAPP_TEMPLATE_NAME = 'hello_world';

// Import the WhatsApp library
import { sendWhatsAppConfirmation } from '../src/lib/whatsapp.ts';

const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;

console.log('🧪 Testing WhatsApp Hello World Template');
console.log('======================================\n');

// Check configuration
if (!process.env.WHATSAPP_CLOUD_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log('❌ Missing WhatsApp credentials in .env file:');
    console.log('   WHATSAPP_CLOUD_API_TOKEN=your_token_here');
    console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here');
    process.exit(1);
}

if (!TEST_PHONE_NUMBER) {
    console.log('❌ Missing TEST_PHONE_NUMBER in .env file');
    console.log('   Add: TEST_PHONE_NUMBER=+234xxxxxxxxxx');
    process.exit(1);
}

console.log('✅ Configuration found:');
console.log(`   Template: ${process.env.WHATSAPP_TEMPLATE_NAME}`);
console.log(`   Language: ${process.env.WHATSAPP_TEMPLATE_LANG || 'en_US'}`);
console.log(`   Test Number: ${TEST_PHONE_NUMBER}\n`);

/**
 * Test the hello_world template using the app's library
 */
async function testHelloWorldTemplate() {
    try {
        console.log('📱 Sending hello_world template using app library...');
        
        const result = await sendWhatsAppConfirmation({
            to: TEST_PHONE_NUMBER,
            guestName: 'Test User',
            eventName: 'Golden Jubilee Test',
            eventDetails: 'This is a test message to verify your WhatsApp integration is working.',
            mapsLink: 'https://example.com'
        });

        if (result.ok) {
            console.log('✅ Hello world template sent successfully!');
            console.log(`   Message ID: ${result.id}`);
            console.log('\n📱 Check your WhatsApp for the hello_world template message');
            console.log('🎯 If received, your template system is working perfectly!');
            console.log('\n📋 Next steps:');
            console.log('   1. Verify the message was received');
            console.log('   2. Your system is ready to send invitations to guests!');
        } else {
            console.log('❌ Failed to send template:');
            console.log(`   Error: ${result.error}`);
            
            if (result.error?.includes('template')) {
                console.log('\n💡 Template issues:');
                console.log('   1. Template "hello_world" not found or not approved');
                console.log('   2. Check your WhatsApp Business API template status');
                console.log('   3. Try using a different template name');
            } else if (result.error?.includes('phone')) {
                console.log('\n💡 Phone number issues:');
                console.log('   1. Invalid phone number format (use +234xxxxxxxxxx)');
                console.log('   2. Phone number not verified for WhatsApp');
            } else if (result.error?.includes('token')) {
                console.log('\n💡 Authentication issues:');
                console.log('   1. Invalid access token');
                console.log('   2. Token expired or revoked');
            }
        }

    } catch (error) {
        console.log('❌ Error testing template:');
        console.log(`   ${error.message}`);
        console.log('\n🔗 For help: https://developers.facebook.com/docs/whatsapp/cloud-api');
    }
}

// Run the test
console.log('🚀 Starting WhatsApp template test...\n');
testHelloWorldTemplate()
    .then(() => {
        console.log('\n✨ Test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If you received the hello_world template: Template system works!');
        console.log('   - If you received an error: Check your template setup and credentials');
        console.log('   - If no message: Verify your phone number and WhatsApp setup');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
