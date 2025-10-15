/**
 * WhatsApp Business API Setup Helper
 * 
 * This script helps you configure your WhatsApp Business API credentials
 * and test the connection before sending invitations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🎊 Golden Jubilee WhatsApp Setup Helper');
console.log('======================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Creating .env file from template...\n');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file');
  } else {
    // Create basic .env file
    const basicEnv = `# WhatsApp Business API Configuration
WHATSAPP_CLOUD_API_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here

# For Twilio (optional)
TWILIO_FROM_NUMBER=+1415XXXXXXX

# Event Configuration  
TRADPARTY_EVENT_NAME=Traditional Party - Golden Jubilee
COCKTAIL_EVENT_NAME=Cocktail Reception - Golden Jubilee
`;
    fs.writeFileSync(envPath, basicEnv);
    console.log('✅ Created basic .env file');
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔧 SETUP INSTRUCTIONS:\n');

console.log('1️⃣ CHOOSE YOUR WHATSAPP PROVIDER:');
console.log('   🟢 TWILIO (Recommended - 5min setup)');
console.log('      → Go to: https://www.twilio.com/try-twilio');
console.log('      → Sign up (free $20 credit)');
console.log('      → Enable WhatsApp in Console');
console.log('      → Get: Account SID + Auth Token');
console.log('   ');
console.log('   🔵 META BUSINESS (Official)');
console.log('      → Go to: https://developers.facebook.com');
console.log('      → Create App → Add WhatsApp');
console.log('      → Get: Access Token + Phone Number ID');
console.log('');

console.log('2️⃣ UPDATE YOUR .env FILE:');
console.log(`   📁 File location: ${envPath}`);
console.log('   ✏️  Update these values:');
console.log('   ');

const token = process.env.WHATSAPP_CLOUD_API_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const twilioNumber = process.env.TWILIO_FROM_NUMBER;

if (!token || token === 'your_token_here') {
  console.log('   ❌ WHATSAPP_CLOUD_API_TOKEN=your_actual_token');
} else {
  console.log('   ✅ WHATSAPP_CLOUD_API_TOKEN=configured');
}

if (!phoneId || phoneId === 'your_phone_id_here') {
  console.log('   ❌ WHATSAPP_PHONE_NUMBER_ID=your_actual_phone_id');
} else {
  console.log('   ✅ WHATSAPP_PHONE_NUMBER_ID=configured');
}

if (!twilioNumber || twilioNumber === '+1415XXXXXXX') {
  console.log('   ⚠️  TWILIO_FROM_NUMBER=+1415XXXXXXX (if using Twilio)');
} else {
  console.log('   ✅ TWILIO_FROM_NUMBER=configured');
}

console.log('\n3️⃣ TEST YOUR SETUP:');
console.log('   🧪 Run a test first:');
console.log('      cd scripts');
console.log('      node test-whatsapp-connection.js');
console.log('');

console.log('4️⃣ SEND ALL INVITATIONS:');
console.log('   🚀 Once tested, send to all guests:');
console.log('      node send-invitations-whatsapp.js');
console.log('');

// Configuration status check
console.log('📊 CURRENT CONFIGURATION STATUS:\n');

const isConfigured = token && token !== 'your_token_here' && 
                    phoneId && phoneId !== 'your_phone_id_here';

if (isConfigured) {
  console.log('✅ WhatsApp API credentials configured');
  console.log('✅ Ready to send invitations!');
  console.log('\n🎯 NEXT STEPS:');
  console.log('   1. Test: node test-whatsapp-connection.js');
  console.log('   2. Send: node send-invitations-whatsapp.js');
} else {
  console.log('❌ Configuration incomplete');
  console.log(`📝 Please edit: ${envPath}`);
  console.log('📚 See: docs/whatsapp-business-setup.md for detailed help');
}

console.log('\n💰 COST ESTIMATE:');
console.log('   📱 ~300 invitations = $1.50 - $3.00');
console.log('   ⏱️  Sending time = 10-15 minutes');
console.log('   🎯 Success rate = 95%+');

console.log('\n🆘 NEED HELP?');
console.log('   📖 Read: docs/whatsapp-business-setup.md');
console.log('   📖 Read: docs/invitation-sending-guide.md');
console.log('   🌐 Twilio setup: https://www.twilio.com/docs/whatsapp');
console.log('   🌐 Meta setup: https://developers.facebook.com/docs/whatsapp');

console.log('\n🎊 Happy invitation sending! 👑');