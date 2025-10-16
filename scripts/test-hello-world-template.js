/**
 * Test Hello World Template for WhatsApp
 * 
 * This script tests the hello_world template to verify WhatsApp message delivery.
 * The hello_world template is a simple template that requires no parameters.
 * 
 * Usage: 
 * 1. Set WHATSAPP_TEMPLATE_NAME=hello_world in your .env
 * 2. Add your phone number as TEST_PHONE_NUMBER
 * 3. Run: node test-hello-world-template.js
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// WhatsApp configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NAME = process.env.WHATSAPP_TEMPLATE_NAME || "hello_world";
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || "en_US";
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;

console.log('🧪 Testing Hello World Template for WhatsApp');
console.log('==========================================\n');

// Check configuration
if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log('❌ Missing WhatsApp credentials in .env file:');
    console.log('   WHATSAPP_CLOUD_API_TOKEN=your_token_here');
    console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here');
    console.log('\n📖 Get these from your WhatsApp Business API setup');
    process.exit(1);
}

if (!TEST_PHONE_NUMBER) {
    console.log('❌ Missing TEST_PHONE_NUMBER in .env file');
    console.log('   Add: TEST_PHONE_NUMBER=+234xxxxxxxxxx');
    console.log('   (Your WhatsApp number in E.164 format)');
    process.exit(1);
}

console.log('✅ Configuration found:');
console.log(`   Template: ${TEMPLATE_NAME}`);
console.log(`   Language: ${TEMPLATE_LANG}`);
console.log(`   Phone ID: ${WHATSAPP_PHONE_ID.substring(0, 10)}...`);
console.log(`   Test Number: ${TEST_PHONE_NUMBER}\n`);

/**
 * Test the hello_world template
 */
async function testHelloWorldTemplate() {
    try {
        console.log('📱 Sending hello_world template message...');
        
        const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;
        
        // Hello world template has no parameters
        const body = {
            messaging_product: "whatsapp",
            to: TEST_PHONE_NUMBER,
            type: "template",
            template: {
                name: "hello_world",
                language: { code: TEMPLATE_LANG }
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error sending template message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 This usually means:');
                console.log('   1. Template "hello_world" not found or not approved');
                console.log('   2. Invalid phone number format');
                console.log('   3. Template language not supported');
            } else if (response.status === 401) {
                console.log('\n💡 This usually means:');
                console.log('   1. Invalid access token');
                console.log('   2. Token expired');
            } else if (response.status === 403) {
                console.log('\n💡 This usually means:');
                console.log('   1. Insufficient permissions');
                console.log('   2. Phone number not verified');
            }
            
            return;
        }

        const data = await response.json();
        console.log('✅ Hello world template sent successfully!');
        console.log(`   Message ID: ${data.messages?.[0]?.id}`);
        console.log('\n📱 Check your WhatsApp for the hello_world template message');
        console.log('🎯 If received, your template system is working perfectly!');
        console.log('\n📋 Next steps:');
        console.log('   1. Verify the message was received');
        console.log('   2. Test with your actual event template');
        console.log('   3. Ready to send invitations to guests!');

    } catch (error) {
        console.log('❌ Error testing template:');
        console.log(`   ${error.message}`);
        console.log('\n🔗 For help: https://developers.facebook.com/docs/whatsapp/cloud-api');
    }
}

/**
 * Test with custom template (if hello_world fails)
 */
async function testCustomTemplate() {
    console.log('\n🔄 Trying with custom template...');
    
    try {
        const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;
        
        // Try with a simple text message instead of template
        const body = {
            messaging_product: "whatsapp",
            to: TEST_PHONE_NUMBER,
            type: "text",
            text: { 
                body: `🎉 *Golden Jubilee Test* 🎉

Hello! This is a test message from your Golden Jubilee invitation system.

If you receive this, your WhatsApp integration is working perfectly! 🎊

👑 Golden Jubilee WhatsApp System` 
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Text message sent successfully!');
            console.log(`   Message ID: ${data.messages?.[0]?.id}`);
            console.log('\n📱 Check your WhatsApp for the test message');
            console.log('🎯 Your WhatsApp integration is working!');
        } else {
            const errorText = await response.text();
            console.log('❌ Text message also failed:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.log('❌ Error with text message:');
        console.log(`   ${error.message}`);
    }
}

// Run the test
console.log('🚀 Starting WhatsApp template test...\n');
testHelloWorldTemplate()
    .then(() => {
        console.log('\n✨ Test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If you received the hello_world template: Template system works!');
        console.log('   - If you received a text message: WhatsApp works, but template needs setup');
        console.log('   - If no message: Check your credentials and phone number');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
