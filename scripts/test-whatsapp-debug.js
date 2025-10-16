/**
 * Debug WhatsApp delivery issues
 * 
 * This script helps troubleshoot why WhatsApp messages aren't being received
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

console.log('🔍 WhatsApp Delivery Debug Tool');
console.log('==============================\n');

// Check configuration
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.log('❌ Missing Twilio credentials');
    process.exit(1);
}

console.log('✅ Twilio credentials found:');
console.log(`   Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
console.log(`   From Number: ${TWILIO_FROM_NUMBER}\n`);

/**
 * Test WhatsApp with multiple numbers
 */
async function testMultipleNumbers() {
    const testNumbers = [
        '+2348035665197', // Denen's number (from SMS test)
        '+96894398548',   // Current test number
        '+2348033207783', // From guest list
        '+2348033117930'  // From guest list
    ];

    console.log('📱 Testing WhatsApp delivery to multiple numbers...\n');

    for (const phoneNumber of testNumbers) {
        console.log(`📤 Testing: ${phoneNumber}`);
        
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
            
            const formData = new URLSearchParams();
            formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
            formData.append('To', `whatsapp:${phoneNumber}`);
            formData.append('Body', `🔍 *WhatsApp Debug Test* 🔍

Testing WhatsApp delivery to: ${phoneNumber}

If you receive this, WhatsApp is working for this number! ✅

👑 Golden Jubilee Debug System`);

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
                console.log(`   ✅ Sent successfully! SID: ${data.sid}`);
                console.log(`   📱 Check WhatsApp for: ${phoneNumber}`);
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Failed: HTTP ${response.status}`);
                console.log(`   Error: ${errorText.substring(0, 100)}...`);
            }

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }

        console.log(''); // Empty line for readability
        
        // Wait 2 seconds between messages
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

/**
 * Check message status
 */
async function checkMessageStatus(messageSid) {
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${messageSid}.json`;
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const response = await fetch(url, {
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Message Status:');
            console.log(`   SID: ${data.sid}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Direction: ${data.direction}`);
            console.log(`   From: ${data.from}`);
            console.log(`   To: ${data.to}`);
            console.log(`   Date Created: ${data.date_created}`);
            console.log(`   Date Updated: ${data.date_updated}`);
            
            if (data.error_code) {
                console.log(`   Error Code: ${data.error_code}`);
                console.log(`   Error Message: ${data.error_message}`);
            }
        }
    } catch (error) {
        console.log(`❌ Error checking status: ${error.message}`);
    }
}

// Run the tests
console.log('🚀 Starting WhatsApp debug tests...\n');

testMultipleNumbers()
    .then(() => {
        console.log('\n✨ Debug tests completed!');
        console.log('\n📋 Troubleshooting Tips:');
        console.log('   1. Check if any of the test numbers received messages');
        console.log('   2. Verify the phone numbers have WhatsApp installed');
        console.log('   3. Check if WhatsApp is active on the recipient devices');
        console.log('   4. Messages might take 1-5 minutes to arrive');
        console.log('   5. Some numbers might have privacy settings blocking unknown senders');
        
        console.log('\n🔧 Next Steps:');
        console.log('   - If any number received the message: WhatsApp is working!');
        console.log('   - If no numbers received messages: Check Twilio WhatsApp setup');
        console.log('   - Try sending to your own WhatsApp number for testing');
    })
    .catch((error) => {
        console.log('\n❌ Debug test failed:', error.message);
    });
