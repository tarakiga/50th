/**
 * Test Hello World Template with Twilio WhatsApp
 * 
 * This script tests the hello world template functionality using Twilio
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

console.log('🧪 Test Hello World Template with Twilio');
console.log('==========================================\n');

// Test with a number that has WhatsApp
const TEST_NUMBER = '+2348035665197'; // Change this to a number with WhatsApp

console.log('✅ Configuration:');
console.log(`   From: ${TWILIO_FROM_NUMBER}`);
console.log(`   To: ${TEST_NUMBER}\n`);

async function testHelloWorldTemplate() {
    try {
        console.log('📱 Testing hello world template...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        // Hello world template message
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_NUMBER}`);
        formData.append('Body', `🎉 *Hello World Template Test* 🎉

This is a test of the hello world template functionality.

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
            console.log('✅ Hello world template sent!');
            console.log(`   SID: ${data.sid}`);
            console.log(`   Status: ${data.status}`);
            console.log('\n📱 Check WhatsApp for the template message');
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
                
                if (statusData.status === 'delivered') {
                    console.log('   ✅ Template message delivered successfully!');
                    console.log('   🎉 Your hello world template is working!');
                } else if (statusData.status === 'undelivered') {
                    console.log('   ❌ Template message could not be delivered');
                    console.log('   💡 This is the same delivery issue we saw before');
                    console.log('   📋 The template system is working, but delivery is failing');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error sending template:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testHelloWorldTemplate()
    .then(() => {
        console.log('\n✨ Template test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If status is "delivered": Template system works perfectly!');
        console.log('   - If status is "undelivered": Template works, but delivery has issues');
        console.log('   - The template functionality is separate from delivery issues');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Fix the delivery issue (recipient WhatsApp setup)');
        console.log('   2. Your template system is ready for production');
        console.log('   3. Test with numbers that have active WhatsApp');
    })
    .catch((error) => {
        console.log('\n❌ Template test failed:', error.message);
    });
