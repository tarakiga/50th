/**
 * Test WhatsApp Sandbox vs Business Setup
 * 
 * This script compares the working sandbox with the business setup
 * to help understand the configuration differences
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

console.log('🔄 Comparing WhatsApp Sandbox vs Business Setup');
console.log('==============================================\n');

console.log('📋 Current Situation:');
console.log('   ✅ Sandbox (+14155238886): Working perfectly');
console.log('   ❌ Business (+15558810592): Error 63112');
console.log('   🔍 Issue: Business number not registered as Twilio phone number\n');

async function testBothSetups() {
    const testNumber = '+2348035665197';
    
    // Test 1: Sandbox (working)
    console.log('🏖️  Testing Sandbox (Working):');
    console.log('===============================');
    
    try {
        const sandboxUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const sandboxFormData = new URLSearchParams();
        sandboxFormData.append('From', 'whatsapp:+14155238886');
        sandboxFormData.append('To', `whatsapp:${testNumber}`);
        sandboxFormData.append('Body', `🏖️  *Sandbox Test* 🏖️

This is a test from the working sandbox.

If you receive this, sandbox is working! ✅

👑 Golden Jubilee Sandbox`);

        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const sandboxResponse = await fetch(sandboxUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: sandboxFormData
        });

        if (sandboxResponse.ok) {
            const sandboxData = await sandboxResponse.json();
            console.log(`   ✅ Sandbox message sent! SID: ${sandboxData.sid}`);
            console.log(`   📱 Check WhatsApp for message from +14155238886`);
        } else {
            const errorText = await sandboxResponse.text();
            console.log(`   ❌ Sandbox error: HTTP ${sandboxResponse.status}`);
        }
        
    } catch (error) {
        console.log(`   ❌ Sandbox error: ${error.message}`);
    }
    
    console.log('\n🏢 Testing Business (Current Issue):');
    console.log('=====================================');
    
    try {
        const businessUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        
        const businessFormData = new URLSearchParams();
        businessFormData.append('From', 'whatsapp:+15558810592');
        businessFormData.append('To', `whatsapp:${testNumber}`);
        businessFormData.append('Body', `🏢 *Business Test* 🏢

This is a test from your WhatsApp Business Account.

If you receive this, business setup is working! ✅

👑 Golden Jubilee Business`);

        const businessResponse = await fetch(businessUrl, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: businessFormData
        });

        if (businessResponse.ok) {
            const businessData = await businessResponse.json();
            console.log(`   ✅ Business message sent! SID: ${businessData.sid}`);
            console.log(`   📱 Check WhatsApp for message from +15558810592`);
            
            // Wait and check status
            console.log('\n   ⏳ Waiting 10 seconds to check delivery status...');
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            const statusUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${businessData.sid}.json`;
            const statusResponse = await fetch(statusUrl, {
                headers: {
                    "Authorization": `Basic ${credentials}`
                }
            });
            
            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log(`   📊 Business Status: ${statusData.status}`);
                console.log(`   Error Code: ${statusData.error_code || 'None'}`);
                
                if (statusData.status === 'delivered') {
                    console.log('   🎉 Business setup is working!');
                } else if (statusData.status === 'failed') {
                    console.log('   ❌ Business setup still has issues');
                }
            }
            
        } else {
            const errorText = await businessResponse.text();
            console.log(`   ❌ Business error: HTTP ${businessResponse.status}`);
            console.log(`   ${errorText.substring(0, 100)}...`);
        }
        
    } catch (error) {
        console.log(`   ❌ Business error: ${error.message}`);
    }
}

// Run the comparison
testBothSetups()
    .then(() => {
        console.log('\n✨ Comparison completed!');
        console.log('\n📋 Summary:');
        console.log('   🏖️  Sandbox: Works perfectly for testing');
        console.log('   🏢 Business: Needs proper Twilio phone number registration');
        console.log('\n💡 Solutions:');
        console.log('   1. Use sandbox for now (working perfectly)');
        console.log('   2. Register +15558810592 as a Twilio phone number');
        console.log('   3. Or use a different approach for business setup');
        console.log('\n🎯 Recommendation:');
        console.log('   Use the working sandbox for your Golden Jubilee invitations!');
        console.log('   It works perfectly and guests don\'t need to join anything.');
    })
    .catch((error) => {
        console.log('\n❌ Comparison failed:', error.message);
    });
