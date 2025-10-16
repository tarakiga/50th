/**
 * Debug WhatsApp Business Configuration
 * 
 * This script helps debug the WhatsApp Business setup
 * to identify why error 63112 is occurring
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const WHATSAPP_BUSINESS_NUMBER = '+15558810592';
const WHATSAPP_BUSINESS_ACCOUNT_ID = '1460978051832663';

console.log('🔍 Debugging WhatsApp Business Configuration');
console.log('==========================================\n');

console.log('📋 Current Setup:');
console.log(`   WhatsApp Business Number: ${WHATSAPP_BUSINESS_NUMBER}`);
console.log(`   Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
console.log(`   Twilio Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...\n`);

async function debugWhatsAppBusiness() {
    try {
        console.log('🔍 Checking WhatsApp Business configuration...\n');
        
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
        
        // Check messaging services
        console.log('📱 Checking Messaging Services...');
        const servicesResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messaging/Services.json`,
            {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            }
        );
        
        if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            console.log(`   Found ${servicesData.services?.length || 0} messaging services`);
            
            if (servicesData.services && servicesData.services.length > 0) {
                servicesData.services.forEach((service, index) => {
                    console.log(`   ${index + 1}. ${service.friendly_name} (${service.sid})`);
                });
            }
        }
        
        // Check phone numbers
        console.log('\n📞 Checking Phone Numbers...');
        const phoneResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/IncomingPhoneNumbers.json`,
            {
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            }
        );
        
        if (phoneResponse.ok) {
            const phoneData = await phoneResponse.json();
            const phoneNumbers = phoneData.incoming_phone_numbers || [];
            
            console.log(`   Found ${phoneNumbers.length} phone numbers`);
            
            const whatsappNumber = phoneNumbers.find(num => num.phone_number === WHATSAPP_BUSINESS_NUMBER);
            if (whatsappNumber) {
                console.log(`   ✅ Found WhatsApp number: ${whatsappNumber.phone_number}`);
                console.log(`   Capabilities: ${JSON.stringify(whatsappNumber.capabilities)}`);
            } else {
                console.log(`   ❌ WhatsApp number ${WHATSAPP_BUSINESS_NUMBER} not found in Twilio`);
            }
        }
        
        // Test with different approaches
        console.log('\n🧪 Testing different message formats...\n');
        
        const testFormats = [
            {
                name: 'Standard WhatsApp format',
                from: `whatsapp:${WHATSAPP_BUSINESS_NUMBER}`,
                to: 'whatsapp:+2348035665197'
            },
            {
                name: 'Without whatsapp: prefix',
                from: WHATSAPP_BUSINESS_NUMBER,
                to: '+2348035665197'
            },
            {
                name: 'With messaging service',
                from: WHATSAPP_BUSINESS_NUMBER,
                to: '+2348035665197',
                messagingServiceSid: 'MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' // This would need to be set
            }
        ];
        
        for (const format of testFormats) {
            console.log(`📤 Testing: ${format.name}`);
            
            try {
                const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
                
                const formData = new URLSearchParams();
                formData.append('From', format.from);
                formData.append('To', format.to);
                formData.append('Body', `🧪 Test: ${format.name}`);
                
                if (format.messagingServiceSid) {
                    formData.append('MessagingServiceSid', format.messagingServiceSid);
                }
                
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
                    console.log(`   ✅ Success! SID: ${data.sid}`);
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ Error: HTTP ${response.status}`);
                    console.log(`   ${errorText.substring(0, 100)}...`);
                }
                
            } catch (error) {
                console.log(`   ❌ Error: ${error.message}`);
            }
            
            console.log(''); // Empty line
        }
        
    } catch (error) {
        console.log('❌ Debug error:', error.message);
    }
}

// Run the debug
debugWhatsAppBusiness()
    .then(() => {
        console.log('\n✨ Debug completed!');
        console.log('\n📋 Common Solutions for Error 63112:');
        console.log('   1. WhatsApp Business not properly linked to Twilio');
        console.log('   2. Phone number not verified in WhatsApp Business');
        console.log('   3. Missing messaging service configuration');
        console.log('   4. WhatsApp Business Account not active');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Check Twilio Console → Messaging → WhatsApp');
        console.log('   2. Verify your sender is active and linked');
        console.log('   3. Check WhatsApp Business Account status');
        console.log('   4. Try using a messaging service instead');
    })
    .catch((error) => {
        console.log('\n❌ Debug failed:', error.message);
    });
