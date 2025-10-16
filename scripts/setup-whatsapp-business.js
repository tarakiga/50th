/**
 * Setup WhatsApp Business with Twilio
 * 
 * This script helps you configure your WhatsApp Business Account
 * with your Twilio phone number
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_BUSINESS_NUMBER = '+15558810592';
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1460978051832663';

console.log('🔧 WhatsApp Business Setup Guide');
console.log('===============================\n');

console.log('📋 Your Configuration:');
console.log(`   Twilio Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
console.log(`   WhatsApp Business Number: ${WHATSAPP_BUSINESS_NUMBER}`);
console.log(`   Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}\n`);

console.log('🔧 SETUP STEPS:');
console.log('===============\n');

console.log('1️⃣ **Register Your Phone Number with Twilio:**');
console.log('   📍 Go to: https://console.twilio.com/us1/develop/sms/whatsapp/senders');
console.log('   📱 Click "Create new sender"');
console.log('   📞 Select "Use your own phone number"');
console.log('   🔢 Enter: +15558810592');
console.log('   ✅ Follow the verification process\n');

console.log('2️⃣ **Link Your WhatsApp Business Account:**');
console.log('   🔗 During registration, you\'ll be prompted to link your WABA');
console.log('   📋 Use your WABA ID: 1460978051832663');
console.log('   🔐 Log in with your Facebook account');
console.log('   ✅ Complete the linking process\n');

console.log('3️⃣ **Create Messaging Service:**');
console.log('   📍 Go to: https://console.twilio.com/us1/develop/sms/services');
console.log('   ➕ Click "Create Messaging Service"');
console.log('   📱 Add your registered WhatsApp sender number');
console.log('   ✅ Save the configuration\n');

console.log('4️⃣ **Test Your Setup:**');
console.log('   🧪 Run: node test-whatsapp-business-production.js');
console.log('   📱 Check if messages are delivered successfully\n');

console.log('⚠️  **Common Issues:**');
console.log('===================');
console.log('❌ Error 63112: Phone number not registered with Twilio');
console.log('❌ Error 63007: WhatsApp not enabled on the number');
console.log('❌ Error 20404: Invalid phone number format');
console.log('\n💡 **Solutions:**');
console.log('   - Make sure the number is registered in Twilio Console');
console.log('   - Verify the number is linked to your WABA');
console.log('   - Check that WhatsApp is enabled on the number');
console.log('   - Ensure the number is in E.164 format (+15558810592)\n');

console.log('🎯 **After Setup:**');
console.log('==================');
console.log('✅ Your WhatsApp Business will work with any WhatsApp number');
console.log('✅ No need for recipients to join a sandbox');
console.log('✅ Production-ready for your Golden Jubilee invitations');
console.log('✅ Professional WhatsApp Business messaging\n');

console.log('📞 **Need Help?**');
console.log('================');
console.log('🔗 Twilio WhatsApp Documentation:');
console.log('   https://www.twilio.com/docs/whatsapp');
console.log('🔗 WhatsApp Business API Guide:');
console.log('   https://developers.facebook.com/docs/whatsapp');
console.log('\n💬 **Support:**');
console.log('   - Twilio Support: https://support.twilio.com/');
console.log('   - WhatsApp Business Support: https://business.whatsapp.com/support');

// Check current status
async function checkCurrentStatus() {
    try {
        console.log('\n🔍 Checking current WhatsApp configuration...\n');
        
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        
        // Check if the number is registered
        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
            {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            const phoneNumbers = data.incoming_phone_numbers || [];
            
            console.log('📱 Current Phone Numbers:');
            phoneNumbers.forEach((number, index) => {
                console.log(`   ${index + 1}. ${number.phone_number}`);
                console.log(`      Friendly Name: ${number.friendly_name}`);
                console.log(`      Capabilities: ${JSON.stringify(number.capabilities)}`);
                console.log('');
            });
            
            const whatsappNumber = phoneNumbers.find(num => num.phone_number === WHATSAPP_BUSINESS_NUMBER);
            if (whatsappNumber) {
                console.log('✅ Found your WhatsApp number in Twilio!');
                console.log(`   Number: ${whatsappNumber.phone_number}`);
                console.log(`   Capabilities: ${JSON.stringify(whatsappNumber.capabilities)}`);
            } else {
                console.log('❌ Your WhatsApp number not found in Twilio');
                console.log('   You need to register it first');
            }
        }
        
    } catch (error) {
        console.log('❌ Error checking status:', error.message);
    }
}

// Run the check
checkCurrentStatus()
    .then(() => {
        console.log('\n✨ Setup guide completed!');
        console.log('\n📋 Next Steps:');
        console.log('   1. Follow the setup steps above');
        console.log('   2. Register your phone number with Twilio');
        console.log('   3. Link your WhatsApp Business Account');
        console.log('   4. Test with: node test-whatsapp-business-production.js');
        console.log('   5. Your Golden Jubilee system will be ready!');
    })
    .catch((error) => {
        console.log('\n❌ Setup check failed:', error.message);
    });
