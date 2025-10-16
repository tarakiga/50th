/**
 * Setup WhatsApp Business with Nigerian Number
 * 
 * This script helps you set up WhatsApp Business with your Nigerian number
 * +2348171111940 for your Golden Jubilee invitations
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1460978051832663';
const NIGERIA_WHATSAPP_NUMBER = '+2348171111940';

console.log('🇳🇬 Setting up WhatsApp Business with Nigerian Number');
console.log('==================================================\n');

console.log('📋 Your Configuration:');
console.log(`   Nigerian WhatsApp Number: ${NIGERIA_WHATSAPP_NUMBER}`);
console.log(`   WhatsApp Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
console.log(`   Twilio Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...\n`);

console.log('🔧 **SETUP STEPS:**');
console.log('==================\n');

console.log('1️⃣ **Delete Current Sender (if exists):**');
console.log('   📍 Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders');
console.log('   🗑️  Delete the current sender with +15558810592');
console.log('   ✅ This will free up the WABA for your Nigerian number\n');

console.log('2️⃣ **Create New Sender with Nigerian Number:**');
console.log('   ➕ Click "Create new sender"');
console.log('   📱 Select "Use your own phone number"');
console.log('   🔢 Enter: +2348171111940');
console.log('   ✅ Follow the verification process\n');

console.log('3️⃣ **Link Your WhatsApp Business Account:**');
console.log('   🏢 When prompted, select WABA ID: 1460978051832663');
console.log('   🔐 This is your connected WhatsApp Business Account');
console.log('   ✅ Complete the linking process\n');

console.log('4️⃣ **Verify Nigerian Phone Number:**');
console.log('   📞 Twilio will send a verification code to +2348171111940');
console.log('   🔢 Enter the code to verify ownership');
console.log('   ✅ Complete the verification\n');

console.log('5️⃣ **Test Your Setup:**');
console.log('   🧪 Run: node test-nigeria-whatsapp-business.js');
console.log('   📱 Check if messages are delivered successfully\n');

console.log('⚠️  **Important Notes:**');
console.log('==========================');
console.log('✅ Make sure to select WABA ID: 1460978051832663');
console.log('✅ This is your connected WhatsApp Business Account');
console.log('✅ Don\'t create a new WABA - use the existing one');
console.log('✅ The number +2348171111940 should be verified\n');

console.log('🎯 **Why This is Better:**');
console.log('=========================');
console.log('✅ No sandbox limitations - works with any WhatsApp number');
console.log('✅ Professional WhatsApp Business messaging');
console.log('✅ Perfect for Golden Jubilee invitations');
console.log('✅ Guests don\'t need to join anything');
console.log('✅ Nigerian number for local guests\n');

// Test the current setup
async function testCurrentSetup() {
    try {
        console.log('🔍 Testing current setup with Nigerian number...\n');
        
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        
        // Test sending a message
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${NIGERIA_WHATSAPP_NUMBER}`);
        formData.append('To', 'whatsapp:+2348035665197'); // Test number
        formData.append('Body', `🇳🇬 *Nigerian WhatsApp Business Test* 🇳🇬

Hello! This is a test from your Nigerian WhatsApp Business Account.

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
                
                if (statusData.status === 'delivered') {
                    console.log('   ✅ Nigerian WhatsApp Business is working perfectly!');
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
                console.log('   - Nigerian WhatsApp Business setup not complete');
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
        console.log('   1. Delete current sender in Twilio Console');
        console.log('   2. Create new sender with +2348171111940');
        console.log('   3. Select WABA ID: 1460978051832663');
        console.log('   4. Verify the Nigerian phone number');
        console.log('   5. Test again with: node test-nigeria-whatsapp-business.js');
        console.log('   6. Your Golden Jubilee system will be ready!');
    })
    .catch((error) => {
        console.log('\n❌ Setup test failed:', error.message);
    });
