/**
 * Test WhatsApp using your working Twilio credentials
 * 
 * This script uses the same Twilio credentials that SMS is working with
 * to test WhatsApp functionality.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const TEST_PHONE_NUMBER = process.env.TEST_PHONE_NUMBER || '+2348035665197'; // Denen's number

console.log('🧪 Testing WhatsApp with Working Twilio Credentials');
console.log('==================================================\n');

// Check configuration
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log('❌ Missing Twilio credentials in .env file:');
    console.log('   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('   TWILIO_AUTH_TOKEN=your_auth_token_here');
    console.log('   TWILIO_FROM_NUMBER=+12293634760');
    process.exit(1);
}

console.log('✅ Twilio credentials found:');
console.log(`   Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
console.log(`   From Number: ${TWILIO_FROM_NUMBER}`);
console.log(`   Test Number: ${TEST_PHONE_NUMBER}\n`);

/**
 * Test WhatsApp using Twilio API
 */
async function testTwilioWhatsApp() {
    try {
        console.log('📱 Sending WhatsApp test message...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        // Create form data for Twilio API
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_PHONE_NUMBER}`);
        formData.append('Body', `🎉 *Golden Jubilee WhatsApp Test* 🎉

Hello! This is a test message from your Golden Jubilee invitation system.

If you receive this, your WhatsApp integration is working perfectly! 🎊

👑 Golden Jubilee WhatsApp System`);

        // Create Basic Auth header
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Error sending WhatsApp message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 This usually means:');
                console.log('   1. WhatsApp not enabled on your Twilio number');
                console.log('   2. Invalid phone number format');
                console.log('   3. Number not verified for WhatsApp');
                console.log('\n🔧 Solutions:');
                console.log('   1. Go to Twilio Console → Messaging → WhatsApp → Senders');
                console.log('   2. Add your number: +12293634760');
                console.log('   3. Complete the verification process');
                console.log('   4. Wait 5-10 minutes for activation');
            } else if (response.status === 401) {
                console.log('\n💡 This usually means:');
                console.log('   1. Invalid Account SID or Auth Token');
                console.log('   2. Check your credentials in Twilio Console');
            }
            
            return;
        }

        const data = await response.json();
        console.log('✅ WhatsApp message sent successfully!');
        console.log(`   Message SID: ${data.sid}`);
        console.log('\n📱 Check your WhatsApp for the test message');
        console.log('🎯 If received, your WhatsApp integration is working perfectly!');
        console.log('\n📋 Next steps:');
        console.log('   1. Verify the message was received');
        console.log('   2. Test the hello world template');
        console.log('   3. Ready to send invitations to guests!');

    } catch (error) {
        console.log('❌ Error testing WhatsApp:');
        console.log(`   ${error.message}`);
        console.log('\n🔗 For help: https://www.twilio.com/docs/whatsapp');
    }
}

/**
 * Test hello world template using Twilio
 */
async function testHelloWorldTemplate() {
    console.log('\n🔄 Testing hello_world template...');
    
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        // Hello world template (if available)
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_PHONE_NUMBER}`);
        formData.append('Body', `🎉 *Hello World Template Test* 🎉

This is a test of the hello_world template functionality.

If you receive this, your template system is working! 🎊

👑 Golden Jubilee Template System`);

        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Template test sent successfully!');
            console.log(`   Message SID: ${data.sid}`);
            console.log('\n📱 Check your WhatsApp for the template test message');
        } else {
            const errorText = await response.text();
            console.log('❌ Template test failed:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.log('❌ Error with template test:');
        console.log(`   ${error.message}`);
    }
}

// Run the test
console.log('🚀 Starting WhatsApp test with working Twilio credentials...\n');
testTwilioWhatsApp()
    .then(() => {
        console.log('\n✨ WhatsApp test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If you received the WhatsApp message: Integration works!');
        console.log('   - If you got an error: WhatsApp needs to be enabled on your Twilio number');
        console.log('   - Next: Enable WhatsApp in Twilio Console and test again');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
