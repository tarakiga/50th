/**
 * Test WhatsApp with your own number
 * 
 * This script helps you test WhatsApp delivery to your own number
 * to verify the system is working correctly.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

console.log('🧪 Test WhatsApp with Your Own Number');
console.log('====================================\n');

console.log('📱 Please enter your WhatsApp number in E.164 format:');
console.log('   Example: +2348035665197 (for Nigeria)');
console.log('   Example: +1234567890 (for US)');
console.log('   Example: +447123456789 (for UK)\n');

// You can change this to your own number for testing
const YOUR_WHATSAPP_NUMBER = '+2348035665197'; // Change this to your number

console.log(`🎯 Testing with: ${YOUR_WHATSAPP_NUMBER}`);
console.log('   (Change this in the script if needed)\n');

async function testWithYourNumber() {
    try {
        console.log('📱 Sending WhatsApp test to your number...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
        formData.append('To', `whatsapp:${YOUR_WHATSAPP_NUMBER}`);
        formData.append('Body', `🎉 *WhatsApp Test to Your Number* 🎉

Hello! This is a test message from your Golden Jubilee system.

If you receive this, your WhatsApp integration is working perfectly! ✅

👑 Golden Jubilee Test System`);

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
            console.log('\n📱 Check your WhatsApp for the message');
            console.log('⏰ Messages can take 1-5 minutes to arrive');
            
            // Wait and check status
            console.log('\n⏳ Waiting 15 seconds to check delivery status...');
            await new Promise(resolve => setTimeout(resolve, 15000));
            
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
                    console.log('   🎉 Your WhatsApp integration is working!');
                } else if (statusData.status === 'undelivered') {
                    console.log('   ❌ Message could not be delivered');
                    console.log('   💡 This usually means:');
                    console.log('      - The number doesn\'t have WhatsApp');
                    console.log('      - WhatsApp is not active on the device');
                    console.log('      - Privacy settings are blocking the message');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                    console.log('   📱 Check your WhatsApp - the message might still arrive');
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error sending message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testWithYourNumber()
    .then(() => {
        console.log('\n✨ Test completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Check your WhatsApp for the message');
        console.log('   2. If you received it: WhatsApp is working!');
        console.log('   3. If not received: Check the error details above');
        console.log('   4. Try with a different number that you know has WhatsApp');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
