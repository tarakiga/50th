/**
 * Simple Hello World Template Test
 * 
 * This script tests the hello_world template without importing TypeScript files.
 * It directly calls the WhatsApp Business API to test template delivery.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

// WhatsApp configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER;

console.log('🧪 Simple Hello World Template Test');
console.log('==================================\n');

// Check configuration
if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.log('❌ Missing WhatsApp credentials in .env file:');
    console.log('   WHATSAPP_CLOUD_API_TOKEN=your_token_here');
    console.log('   WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here');
    console.log('\n📖 Get these from your WhatsApp Business API setup');
    console.log('🔗 Guide: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started');
    process.exit(1);
}

if (!TEST_PHONE_NUMBER) {
    console.log('❌ Missing TEST_PHONE_NUMBER in .env file');
    console.log('   Add: TEST_PHONE_NUMBER=+234xxxxxxxxxx');
    console.log('   (Your WhatsApp number in E.164 format)');
    process.exit(1);
}

console.log('✅ Configuration found:');
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
                language: { code: "en_US" }
            }
        };

        console.log('📤 Sending request to WhatsApp API...');
        console.log(`   URL: ${url}`);
        console.log(`   Template: hello_world`);
        console.log(`   To: ${TEST_PHONE_NUMBER}\n`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        console.log(`📥 Response received: HTTP ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error sending template message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 This usually means:');
                console.log('   1. Template "hello_world" not found or not approved');
                console.log('   2. Invalid phone number format');
                console.log('   3. Template language not supported');
                console.log('\n🔧 Solutions:');
                console.log('   - Check if hello_world template is approved in your WhatsApp Business account');
                console.log('   - Verify phone number is in E.164 format (+234xxxxxxxxxx)');
                console.log('   - Try a different template name if hello_world is not available');
            } else if (response.status === 401) {
                console.log('\n💡 This usually means:');
                console.log('   1. Invalid access token');
                console.log('   2. Token expired');
                console.log('\n🔧 Solutions:');
                console.log('   - Check your WHATSAPP_CLOUD_API_TOKEN');
                console.log('   - Generate a new token from your WhatsApp Business account');
            } else if (response.status === 403) {
                console.log('\n💡 This usually means:');
                console.log('   1. Insufficient permissions');
                console.log('   2. Phone number not verified');
                console.log('\n🔧 Solutions:');
                console.log('   - Verify your phone number in WhatsApp Business account');
                console.log('   - Check your account permissions');
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
 * Test with a simple text message if template fails
 */
async function testTextMessage() {
    console.log('\n🔄 Trying with simple text message...');
    
    try {
        const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`;
        
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
            console.log('\n📋 Note: Templates may need approval, but text messages work immediately');
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
        console.log('\n🔧 To fix template issues:');
        console.log('   1. Go to your WhatsApp Business account');
        console.log('   2. Check if hello_world template is approved');
        console.log('   3. If not, create and approve a custom template');
        console.log('   4. Update WHATSAPP_TEMPLATE_NAME in your .env file');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
