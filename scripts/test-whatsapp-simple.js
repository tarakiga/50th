/**
 * Simple WhatsApp test with better error handling
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

console.log('🧪 Simple WhatsApp Test');
console.log('======================\n');

// Test with Denen's number (the one that worked for SMS)
const TEST_NUMBER = '+2348035665197'; // Denen's number from SMS test

console.log('✅ Configuration:');
console.log(`   From: ${TWILIO_FROM_NUMBER}`);
console.log(`   To: ${TEST_NUMBER}\n`);

async function testWhatsApp() {
    try {
        console.log('📱 Sending WhatsApp test...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_NUMBER}`);
        formData.append('Body', `🎉 *WhatsApp Test* 🎉

Hello! This is a test from your Golden Jubilee system.

If you receive this, WhatsApp is working! ✅

👑 Golden Jubilee Test`);

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
            console.log('✅ WhatsApp message sent!');
            console.log(`   SID: ${data.sid}`);
            console.log(`   Status: ${data.status}`);
            console.log('\n📱 Check WhatsApp for the message');
            console.log('⏰ Messages can take 1-5 minutes to arrive');
            
            // Wait a moment then check status
            console.log('\n⏳ Waiting 10 seconds to check delivery status...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // Check status
            const statusUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${data.sid}.json`;
            const statusResponse = await fetch(statusUrl, {
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            });
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log('\n📊 Delivery Status:');
                console.log(`   Status: ${statusData.status}`);
                console.log(`   Error Code: ${statusData.error_code || 'None'}`);
                console.log(`   Error Message: ${statusData.error_message || 'None'}`);
                
                if (statusData.status === 'delivered') {
                    console.log('   ✅ Message delivered successfully!');
                } else if (statusData.status === 'undelivered') {
                    console.log('   ❌ Message could not be delivered');
                    console.log('   💡 This usually means:');
                    console.log('      - Recipient doesn\'t have WhatsApp');
                    console.log('      - WhatsApp is not active on their device');
                    console.log('      - Privacy settings are blocking the message');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error sending message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 Common causes:');
                console.log('   1. WhatsApp not enabled on your Twilio number');
                console.log('   2. Invalid phone number format');
                console.log('   3. Number not verified for WhatsApp');
            }
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testWhatsApp()
    .then(() => {
        console.log('\n✨ Test completed!');
        console.log('\n📋 Troubleshooting Tips:');
        console.log('   1. Check if the recipient has WhatsApp installed');
        console.log('   2. Verify WhatsApp is active on their device');
        console.log('   3. Check if they have privacy settings blocking unknown senders');
        console.log('   4. Try sending to your own WhatsApp number for testing');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
