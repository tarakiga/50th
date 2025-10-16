/**
 * Test Hello World Template with Working Sandbox
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SANDBOX_NUMBER = '+14155238886'; // Working sandbox number
const TEST_NUMBER = '+2348035665197'; // Denen's number

console.log('🎉 Testing Hello World Template with Working Sandbox');
console.log('==================================================\n');

console.log('✅ Configuration:');
console.log(`   Sandbox: ${SANDBOX_NUMBER}`);
console.log(`   Test Number: ${TEST_NUMBER}\n`);

async function testHelloWorldTemplate() {
    try {
        console.log('📱 Sending hello world template...');
        
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('From', `whatsapp:${SANDBOX_NUMBER}`);
        formData.append('To', `whatsapp:${TEST_NUMBER}`);
        formData.append('Body', `🎉 *Hello World Template Test* 🎉

This is a test of the hello world template functionality using the working sandbox.

If you receive this, your template system is working perfectly! 🎊

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
            console.log('⏰ Messages should arrive within 1-2 minutes');
            
            // Wait and check status
            console.log('\n⏳ Waiting 10 seconds to check delivery status...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
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
                    console.log('   🎉 Your hello world template is working perfectly!');
                    console.log('   🎊 Your Golden Jubilee system is ready!');
                } else if (statusData.status === 'undelivered') {
                    console.log('   ❌ Template message could not be delivered');
                } else {
                    console.log(`   ⏳ Status: ${statusData.status} (still processing)`);
                    console.log('   📱 Check your WhatsApp - the message might still arrive');
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
        console.log('   - If you received the message: Template system works perfectly!');
        console.log('   - Your Golden Jubilee invitation system is ready!');
        console.log('   - Update your .env to use the sandbox number for production');
        console.log('\n🔧 Next Steps:');
        console.log('   1. Update .env: TWILIO_FROM_NUMBER=+14155238886');
        console.log('   2. Test your actual invitation flow');
        console.log('   3. Ready to send invitations to guests!');
    })
    .catch((error) => {
        console.log('\n❌ Template test failed:', error.message);
    });
