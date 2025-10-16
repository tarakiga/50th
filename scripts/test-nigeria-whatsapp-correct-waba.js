/**
 * Test Nigerian WhatsApp Business with Correct WABA ID
 * 
 * This script tests your Nigerian WhatsApp Business setup
 * using the correct WABA ID: 280806281776138
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const NIGERIA_WHATSAPP_NUMBER = '+2348171111940';
const CORRECT_WABA_ID = '280806281776138';
const TEST_NUMBER = '+2348035665197'; // Denen's number

console.log('🇳🇬 Testing Nigerian WhatsApp Business with Correct WABA');
console.log('======================================================\n');

console.log('✅ Configuration:');
console.log(`   Nigerian WhatsApp Number: ${NIGERIA_WHATSAPP_NUMBER}`);
console.log(`   Correct WABA ID: ${CORRECT_WABA_ID}`);
console.log(`   Test Number: ${TEST_NUMBER}\n`);

async function testNigerianWhatsAppBusiness() {
    try {
        console.log('📱 Sending Nigerian WhatsApp Business message...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${NIGERIA_WHATSAPP_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_NUMBER}`);
        formData.append('Body', `🇳🇬 *Nigerian WhatsApp Business Test* 🇳🇬

Hello! This is a test from your Nigerian WhatsApp Business Account.

WABA ID: ${CORRECT_WABA_ID}

If you receive this, your Nigerian setup is working! ✅

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
            console.log('✅ Nigerian WhatsApp Business message sent!');
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
                    console.log('   ✅ Nigerian WhatsApp Business is working perfectly!');
                    console.log('   🎉 Your setup is complete!');
                    console.log('   🎊 Ready for Golden Jubilee invitations!');
                } else if (statusData.status === 'failed') {
                    console.log('   ❌ Setup not complete yet');
                    console.log('   💡 You need to register this number with Twilio');
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
                console.log('\n💡 This means:');
                console.log('   - Nigerian WhatsApp Business setup not complete');
                console.log('   - Phone number not registered with Twilio');
                console.log('   - You need to create a sender with this number');
            } else if (response.status === 401) {
                console.log('\n💡 Authentication issue:');
                console.log('   - Check your Twilio credentials');
                console.log('   - Verify Account SID and Auth Token');
            }
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testNigerianWhatsAppBusiness()
    .then(() => {
        console.log('\n✨ Nigerian WhatsApp Business test completed!');
        console.log('\n📋 Summary:');
        console.log('   - If you received the message: Nigerian setup is working!');
        console.log('   - If not received but status is "delivered": System is working!');
        console.log('   - If status is "failed": You need to register the number with Twilio');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Go to Twilio Console → WhatsApp → Senders');
        console.log('   2. Create new sender with: +2348171111940');
        console.log('   3. Select WABA ID: 280806281776138');
        console.log('   4. Complete the verification process');
        console.log('   5. Test again with: node test-nigeria-whatsapp-correct-waba.js');
        console.log('   6. Your Golden Jubilee system will be ready!');
    })
    .catch((error) => {
        console.log('\n❌ Test failed:', error.message);
    });
