/**
 * Test WhatsApp Business Production Setup
 * 
 * This script tests your WhatsApp Business Account with the verified sender number
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_BUSINESS_NUMBER = '+15558810592'; // Your verified WhatsApp Business number
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1460978051832663'; // Your WhatsApp Business Account ID
const TEST_NUMBER = '+2348035665197'; // Test number

console.log('🏢 Testing WhatsApp Business Production Setup');
console.log('============================================\n');

console.log('✅ Configuration:');
console.log(`   WhatsApp Business Number: ${WHATSAPP_BUSINESS_NUMBER}`);
console.log(`   Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
console.log(`   Test Number: ${TEST_NUMBER}\n`);

async function testWhatsAppBusiness() {
    try {
        console.log('📱 Sending WhatsApp Business message...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${WHATSAPP_BUSINESS_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_NUMBER}`);
        formData.append('Body', `🏢 *WhatsApp Business Test* 🏢

Hello! This is a test from your WhatsApp Business Account.

If you receive this, your production WhatsApp is working! ✅

👑 Golden Jubilee Business System`);

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
            console.log('✅ WhatsApp Business message sent!');
            console.log(`   SID: ${data.sid}`);
            console.log(`   Status: ${data.status}`);
            console.log('\n📱 Check WhatsApp for the message');
            console.log('⏰ Messages should arrive within 1-2 minutes');
            
            // Wait and check status
            console.log('\n⏳ Waiting 15 seconds to check delivery status...');
            await new Promise(resolve => setTimeout(resolve, 15000));
            
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
                    console.log('   ✅ WhatsApp Business message delivered successfully!');
                    console.log('   🎉 Your production WhatsApp is working perfectly!');
                    console.log('   🎊 Ready for Golden Jubilee invitations!');
                } else if (statusData.status === 'undelivered') {
                    console.log('   ❌ Message could not be delivered');
                    console.log('   💡 This might be due to:');
                    console.log('      - Recipient doesn\'t have WhatsApp');
                    console.log('      - Privacy settings blocking messages');
                    console.log('      - WhatsApp not active on device');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                    console.log('   📱 Check your WhatsApp - the message might still arrive');
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error sending message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 Common causes:');
                console.log('   1. WhatsApp Business not properly configured');
                console.log('   2. Invalid phone number format');
                console.log('   3. Business account not verified');
            } else if (response.status === 401) {
                console.log('\n💡 Authentication issue:');
                console.log('   1. Check your Twilio credentials');
                console.log('   2. Verify Account SID and Auth Token');
            }
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testWhatsAppBusiness()
    .then(() => {
        console.log('\n✨ WhatsApp Business test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If you received the message: Production WhatsApp is working!');
        console.log('   - If not received but status is "delivered": System is working!');
        console.log('   - If status is "undelivered": Check recipient WhatsApp setup');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Update your .env with the production number');
        console.log('   2. Test the hello world template');
        console.log('   3. Ready for Golden Jubilee invitations!');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
