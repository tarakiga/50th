/**
 * Check the status of a WhatsApp message
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

// The message SID from your previous successful send
const MESSAGE_SID = 'SM7a7226b06b0a7cf4f3fcc13755efb16a';

console.log('📊 Checking WhatsApp Message Status');
console.log('==================================\n');

async function checkMessageStatus() {
    try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages/${MESSAGE_SID}.json`;
        const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        console.log(`🔍 Checking message: ${MESSAGE_SID}`);
        console.log(`📡 API URL: ${url}\n`);

        const response = await fetch(url, {
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('📊 Message Status Details:');
            console.log(`   SID: ${data.sid}`);
            console.log(`   Status: ${data.status}`);
            console.log(`   Direction: ${data.direction}`);
            console.log(`   From: ${data.from}`);
            console.log(`   To: ${data.to}`);
            console.log(`   Body: ${data.body.substring(0, 50)}...`);
            console.log(`   Date Created: ${data.date_created}`);
            console.log(`   Date Updated: ${data.date_updated}`);
            console.log(`   Date Sent: ${data.date_sent || 'Not sent yet'}`);
            
            if (data.error_code) {
                console.log(`\n❌ Error Details:`);
                console.log(`   Error Code: ${data.error_code}`);
                console.log(`   Error Message: ${data.error_message}`);
            } else {
                console.log(`\n✅ No errors reported`);
            }

            // Interpret the status
            console.log(`\n📋 Status Interpretation:`);
            switch (data.status) {
                case 'queued':
                    console.log('   📤 Message is queued for delivery');
                    break;
                case 'sending':
                    console.log('   📤 Message is being sent');
                    break;
                case 'sent':
                    console.log('   ✅ Message was sent successfully');
                    break;
                case 'delivered':
                    console.log('   ✅ Message was delivered to recipient');
                    break;
                case 'undelivered':
                    console.log('   ❌ Message could not be delivered');
                    break;
                case 'failed':
                    console.log('   ❌ Message failed to send');
                    break;
                default:
                    console.log(`   ❓ Unknown status: ${data.status}`);
            }

        } else {
            const errorText = await response.text();
            console.log(`❌ Error checking message status:`);
            console.log(`   HTTP ${response.status}: ${errorText}`);
        }

    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
    }
}

// Run the check
checkMessageStatus()
    .then(() => {
        console.log('\n✨ Status check completed!');
        console.log('\n📋 Next Steps:');
        console.log('   - If status is "delivered": Check the recipient\'s WhatsApp');
        console.log('   - If status is "sent": Message is on its way, wait a few minutes');
        console.log('   - If status is "failed": Check the error details above');
    })
    .catch((error) => {
        console.log('\n❌ Status check failed:', error.message);
    });
