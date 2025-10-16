/**
 * Test WhatsApp using Twilio Sandbox
 * 
 * This script tests WhatsApp using the Twilio sandbox mode
 * which should work with any number that has joined the sandbox
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

console.log('🏖️  Testing WhatsApp with Twilio Sandbox');
console.log('========================================\n');

// Common Twilio sandbox numbers
const SANDBOX_NUMBERS = [
    '+14155238886',  // US sandbox
    '+16263542890',  // US sandbox
    '+442081330676', // UK sandbox
    '+493020917518', // Germany sandbox
    '+918000193721'  // India sandbox
];

const TEST_NUMBER = '+2348035665197'; // Denen's number

console.log('✅ Configuration:');
console.log(`   Account SID: ${TWILIO_ACCOUNT_SID.substring(0, 10)}...`);
console.log(`   Test Number: ${TEST_NUMBER}\n`);

async function testSandboxWhatsApp() {
    for (const sandboxNumber of SANDBOX_NUMBERS) {
        console.log(`📱 Testing with sandbox number: ${sandboxNumber}`);
        
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
            
            const formData = new URLSearchParams();
            formData.append('From', `whatsapp:${sandboxNumber}`);
            formData.append('To', `whatsapp:${TEST_NUMBER}`);
            formData.append('Body', `🏖️  *Sandbox WhatsApp Test* 🏖️

Hello! This is a test from the Twilio WhatsApp sandbox.

If you receive this, the sandbox is working! ✅

👑 Golden Jubilee Sandbox Test`);

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
                console.log(`   ✅ Message sent! SID: ${data.sid}`);
                console.log(`   📱 Check WhatsApp for message from ${sandboxNumber}`);
                
                // Wait and check status
                await new Promise(resolve => setTimeout(resolve, 5000));
                
                const statusUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${data.sid}.json`;
                const statusResponse = await fetch(statusUrl, {
                    headers: {
                        "Authorization": `Basic ${credentials}`
                    }
                });
                
                if (statusResponse.ok) {
                    const statusData = await statusResponse.json();
                    console.log(`   📊 Status: ${statusData.status}`);
                    
                    if (statusData.status === 'delivered') {
                        console.log(`   🎉 SUCCESS! Sandbox ${sandboxNumber} is working!`);
                        console.log(`   📱 You should have received a message from ${sandboxNumber}`);
                        return sandboxNumber; // Return the working sandbox number
                    } else if (statusData.status === 'undelivered') {
                        console.log(`   ❌ Delivery failed with ${sandboxNumber}`);
                    } else {
                        console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                    }
                }
                
            } else {
                const errorText = await response.text();
                console.log(`   ❌ Error: HTTP ${response.status}`);
                console.log(`   ${errorText.substring(0, 100)}...`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
    
    return null;
}

// Run the test
testSandboxWhatsApp()
    .then((workingSandbox) => {
        console.log('\n✨ Sandbox test completed!');
        
        if (workingSandbox) {
            console.log(`\n🎉 SUCCESS! Found working sandbox: ${workingSandbox}`);
            console.log('\n📋 Next Steps:');
            console.log('   1. Update your .env file:');
            console.log(`      TWILIO_FROM_NUMBER=${workingSandbox}`);
            console.log('   2. Test again with: node test-twilio-whatsapp-working.js');
            console.log('   3. Your sandbox WhatsApp is working!');
        } else {
            console.log('\n❌ No working sandbox found');
            console.log('\n💡 Solutions:');
            console.log('   1. Go to Twilio Console → Messaging → WhatsApp');
            console.log('   2. Set up WhatsApp sandbox');
            console.log('   3. Or use production WhatsApp Business API');
            console.log('   4. Check if the test number has joined the sandbox');
        }
    })
    .catch((error) => {
        console.log('\n❌ Sandbox test failed:', error.message);
    });
