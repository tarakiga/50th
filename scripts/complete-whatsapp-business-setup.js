/**
 * Complete WhatsApp Business Setup
 * 
 * This script helps you complete the WhatsApp Business setup
 * after connecting your account to Twilio
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_BUSINESS_NUMBER = '+15558810592';
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1460978051832663';

console.log('🎉 WhatsApp Business Setup - Final Steps');
console.log('=======================================\n');

console.log('✅ Great! Your WhatsApp account is connected to Twilio!');
console.log('📋 Now you need to complete the sender setup:\n');

console.log('🔧 **FINAL SETUP STEPS:**');
console.log('========================\n');

console.log('1️⃣ **Create WhatsApp Sender:**');
console.log('   📍 Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders');
console.log('   ➕ Click "Create new sender"');
console.log('   📱 Select "Use your own phone number"');
console.log('   🔢 Enter: +15558810592');
console.log('   ✅ Follow the verification process\n');

console.log('2️⃣ **Select Your WhatsApp Business Account:**');
console.log('   🏢 When prompted, select WABA ID: 1460978051832663');
console.log('   🔐 This is your connected WhatsApp Business Account');
console.log('   ✅ Complete the linking process\n');

console.log('3️⃣ **Verify Phone Number:**');
console.log('   📞 Twilio will send a verification code');
console.log('   🔢 Enter the code to verify ownership');
console.log('   ✅ Complete the verification\n');

console.log('4️⃣ **Test Your Setup:**');
console.log('   🧪 Run: node test-whatsapp-business-production.js');
console.log('   📱 Check if messages are delivered successfully\n');

console.log('⚠️  **Important Notes:**');
console.log('======================');
console.log('✅ Make sure to select WABA ID: 1460978051832663');
console.log('✅ This is your connected WhatsApp Business Account');
console.log('✅ Don\'t create a new WABA - use the existing one');
console.log('✅ The number +15558810592 should be verified\n');

console.log('🎯 **After Setup:**');
console.log('==================');
console.log('✅ Your WhatsApp Business will work with any WhatsApp number');
console.log('✅ No sandbox limitations - professional messaging');
console.log('✅ Perfect for Golden Jubilee invitations');
console.log('✅ Hello world template ready for production\n');

// Test the current setup
async function testCurrentSetup() {
    try {
        console.log('🔍 Testing current WhatsApp Business setup...\n');
        
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        
        // Test sending a message
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${WHATSAPP_BUSINESS_NUMBER}`);
        formData.append('To', 'whatsapp:+2348035665197'); // Test number
        formData.append('Body', `🎉 *WhatsApp Business Test* 🎉

Hello! This is a test from your WhatsApp Business Account.

If you receive this, your setup is complete! ✅

👑 Golden Jubilee Business System`);

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
                
                if (statusData.status === 'delivered') {
                    console.log('   ✅ WhatsApp Business is working perfectly!');
                    console.log('   🎉 Your setup is complete!');
                    console.log('   🎊 Ready for Golden Jubilee invitations!');
                } else if (statusData.status === 'failed') {
                    console.log('   ❌ Setup not complete yet');
                    console.log('   💡 Follow the setup steps above');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                }
            }
            
        } else {
            const errorText = await response.text();
            console.log('❌ Error sending message:');
            console.log(`   HTTP ${response.status}: ${errorText}`);
            
            if (response.status === 400) {
                console.log('\n💡 This means:');
                console.log('   - WhatsApp Business setup not complete');
                console.log('   - Phone number not registered with Twilio');
                console.log('   - Follow the setup steps above');
            }
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Run the test
testCurrentSetup()
    .then(() => {
        console.log('\n✨ Setup test completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Complete the sender setup in Twilio Console');
        console.log('   2. Select WABA ID: 1460978051832663');
        console.log('   3. Verify your phone number');
        console.log('   4. Test again with: node test-whatsapp-business-production.js');
        console.log('   5. Your Golden Jubilee system will be ready!');
    })
    .catch((error) => {
        console.log('\n❌ Setup test failed:', error.message);
    });
