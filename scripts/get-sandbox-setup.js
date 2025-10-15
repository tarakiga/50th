import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
  console.error('❌ Missing Twilio credentials');
  process.exit(1);
}

async function getSandboxInfo() {
  console.log('🔍 Getting Twilio WhatsApp Sandbox Information...\n');
  
  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  
  try {
    // Get sandbox configuration
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Sandbox/WhatsApp.json`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    console.log('📱 TWILIO WHATSAPP SANDBOX SETUP:');
    console.log('=' .repeat(50));
    console.log(`Sandbox Number: ${data.phone_number}`);
    console.log(`Join Code: ${data.account_sid.slice(-6)}`); // Last 6 characters typically
    console.log('=' .repeat(50));
    console.log();
    console.log('📋 INSTRUCTIONS FOR DENEN:');
    console.log(`1. Save this number in WhatsApp: ${data.phone_number}`);
    console.log(`2. Send this exact message: "join ${data.account_sid.slice(-6).toLowerCase()}"`);
    console.log('3. Wait for confirmation message');
    console.log('4. Then we can send him messages!');
    console.log();
    console.log('⚠️  SANDBOX LIMITATIONS:');
    console.log('- Only works with pre-approved numbers');
    console.log('- Messages expire after 24h of inactivity');
    console.log('- Limited to testing purposes');
    console.log();
    console.log('🚀 FOR PRODUCTION: Upgrade to full WhatsApp Business API');
    
  } catch (error) {
    console.error('❌ Error getting sandbox info:', error.message);
    
    // Provide manual instructions
    console.log('\n📱 MANUAL SANDBOX SETUP:');
    console.log('1. Go to Twilio Console → Messaging → WhatsApp');
    console.log('2. Find your sandbox number (usually +1 415 523 8886)');
    console.log('3. Get the join code from the console');
    console.log('4. Have Denen send "join [code]" to that number');
  }
}

getSandboxInfo();