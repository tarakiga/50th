/**
 * Manual Message Generator for Golden Jubilee Invitations
 * 
 * This script generates formatted messages that you can copy-paste manually
 * into WhatsApp, SMS apps, or any messaging platform.
 * 
 * Usage: node generate-manual-messages.js [--format=whatsapp|sms|email]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const BASE_URL = 'https://denens50th.netlify.app';

/**
 * Message formats for different platforms
 */
const MESSAGE_FORMATS = {
  whatsapp: {
    name: 'WhatsApp',
    template: (guest, eventType, inviteUrl, eventName) => {
      let message = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${guest.Name},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*${eventName}*`;
      
      if (eventType === 'cocktail') {
        message += `

🎩 *STRICTLY BLACK TIE EVENT* 🎩
*Formal evening attire required*`;
      }
      
      message += `

Click your personal invitation:
${inviteUrl}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;
      
      return message;
    }
  },

  sms: {
    name: 'SMS',
    template: (guest, eventType, inviteUrl, eventName) => {
      let message = `🎊 GOLDEN JUBILEE INVITATION

Dear ${guest.Name},

You're invited to Denen Ikya's 50th Birthday ${eventName}!`;
      
      if (eventType === 'cocktail') {
        message += `

🎩 STRICTLY BLACK TIE EVENT
Formal evening attire required`;
      }
      
      message += `

Your personal invitation: ${inviteUrl}

Please RSVP via the link. Full details shared after confirmation.

Looking forward to celebrating! 👑`;
      
      return message;
    }
  },

  email: {
    name: 'Email',
    template: (guest, eventType, inviteUrl, eventName) => {
      let message = `Subject: 🎊 Golden Jubilee Invitation - Denen Ikya's 50th Birthday

Dear ${guest.Name},

You are cordially invited to celebrate a very special milestone - Denen Ikya's 50th Birthday Golden Jubilee!

EVENT: ${eventName}`;
      
      if (eventType === 'cocktail') {
        message += `

🎩 STRICTLY BLACK TIE EVENT 🎩
Formal evening attire is required for this exclusive cocktail reception.`;
      }
      
      message += `

Please use your personalized invitation link to RSVP:
${inviteUrl}

For security and exclusivity, full event details including venue address, time, and special instructions will be shared privately with confirmed guests only.

We look forward to celebrating this momentous occasion with you!

Best regards,
The Celebration Committee

👑 Golden Jubilee - 50 Years of Excellence 👑

Note: This invitation is personal and non-transferable. Please RSVP at your earliest convenience.`;
      
      return message;
    }
  },

  formal: {
    name: 'Formal Message',
    template: (guest, eventType, inviteUrl, eventName) => `THE GOLDEN JUBILEE CELEBRATION

Dear ${guest.Name},

You are graciously invited to join us in celebrating the 50th Birthday of DENEN IKYA.

${eventName.toUpperCase()}

Your personal invitation awaits:
${inviteUrl}

Kindly confirm your attendance through the provided link. Complete event details will be communicated to confirmed guests.

We would be honored by your presence at this milestone celebration.

With warm regards,
The Host Committee

👑 GOLDEN JUBILEE 👑`
  }
};

/**
 * Get message format from command line args
 */
function getMessageFormat() {
  const formatArg = process.argv.find(arg => arg.startsWith('--format='));
  const formatName = formatArg ? formatArg.split('=')[1] : 'whatsapp';
  
  const format = MESSAGE_FORMATS[formatName];
  if (!format) {
    console.error(`❌ Unknown message format: ${formatName}`);
    console.log('Available formats:', Object.keys(MESSAGE_FORMATS).join(', '));
    process.exit(1);
  }
  
  return { name: formatName, config: format };
}

/**
 * Generate message for a guest
 */
function generateMessage(guest, eventType, format) {
  const inviteUrl = `${BASE_URL}/${eventType}?token=${guest.Token}`;
  const eventName = eventType === 'cocktail' ? 'Golden Jubilee Cocktail Reception' : 'Golden Jubilee Traditional Party';
  
  return format.config.template(guest, eventType, inviteUrl, eventName);
}

/**
 * Generate messages for all guests
 */
function generateMessages(contactFile, eventType, format) {
  const filePath = path.join(__dirname, '..', 'contacts', contactFile);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Contact file not found: ${contactFile}`);
    return [];
  }

  const guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const messages = [];
  
  guests.forEach((guest, index) => {
    const message = generateMessage(guest, eventType, format);
    messages.push({
      index: index + 1,
      guest: guest.Name,
      phone: guest.PhoneNumber,
      message: message,
      separator: '\n' + '='.repeat(80) + '\n'
    });
  });
  
  return messages;
}

/**
 * Save messages to files
 */
function saveMessagesToFiles(messages, eventType, format) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${eventType}-invitations-${format.name.toLowerCase()}-${timestamp}.txt`;
  const filepath = path.join(__dirname, filename);
  
  let content = `GOLDEN JUBILEE INVITATION MESSAGES\n`;
  content += `Event: ${eventType.toUpperCase()}\n`;
  content += `Format: ${format.config.name}\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Messages: ${messages.length}\n`;
  content += '='.repeat(80) + '\n\n';
  
  messages.forEach(msg => {
    content += `[${msg.index}] ${msg.guest} (${msg.phone})\n`;
    content += msg.separator;
    content += msg.message + '\n';
    content += msg.separator;
  });
  
  fs.writeFileSync(filepath, content, 'utf8');
  return filepath;
}

/**
 * Display messages in console with copy-paste sections
 */
function displayMessages(messages, eventType, format) {
  console.log(`\n📋 Generated ${messages.length} ${format.config.name} messages for ${eventType}\n`);
  
  messages.forEach(msg => {
    console.log(`${'='.repeat(60)}`);
    console.log(`[${msg.index}] ${msg.guest} (${msg.phone})`);
    console.log(`${'='.repeat(60)}`);
    console.log('\n📱 COPY THIS MESSAGE:\n');
    console.log(msg.message);
    console.log('\n' + '-'.repeat(60) + '\n');
  });
}

/**
 * Generate contact list for quick access
 */
function generateContactList(contactFile) {
  const filePath = path.join(__dirname, '..', 'contacts', contactFile);
  const guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  console.log('\n📞 CONTACT LIST FOR QUICK ACCESS:');
  console.log('='.repeat(50));
  
  guests.forEach((guest, index) => {
    console.log(`${(index + 1).toString().padStart(3, '0')}. ${guest.Name.padEnd(30, ' ')} ${guest.PhoneNumber}`);
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('📝 Golden Jubilee Manual Message Generator');
  console.log('==========================================\n');
  
  const format = getMessageFormat();
  console.log(`📄 Message Format: ${format.config.name}\n`);
  
  try {
    // Generate Traditional Party messages
    console.log('📋 Generating Traditional Party messages...');
    const tradMessages = generateMessages('Guest1.json', 'tradparty', format);
    const tradFile = saveMessagesToFiles(tradMessages, 'tradparty', format);
    console.log(`✅ Saved to: ${tradFile}`);
    
    // Generate Cocktail messages
    console.log('\n🍸 Generating Cocktail messages...');
    const cocktailMessages = generateMessages('Guest2.json', 'cocktail', format);
    const cocktailFile = saveMessagesToFiles(cocktailMessages, 'cocktail', format);
    console.log(`✅ Saved to: ${cocktailFile}`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Traditional Party Messages: ${tradMessages.length}`);
    console.log(`Cocktail Messages: ${cocktailMessages.length}`);
    console.log(`Total Messages: ${tradMessages.length + cocktailMessages.length}`);
    console.log(`Format: ${format.config.name}`);
    
    // Ask user what they want to see
    console.log('\\n📋 WHAT WOULD YOU LIKE TO DO?');
    console.log('1. Display Traditional Party messages in console');
    console.log('2. Display Cocktail messages in console');
    console.log('3. Show contact lists only');
    console.log('4. Exit (messages saved to files)');
    
    // For now, just show contact lists
    generateContactList('Guest1.json');
    generateContactList('Guest2.json');
    
    console.log('\\n✅ All messages have been generated and saved to files!');
    console.log('📁 You can find them in the scripts/ directory');
    console.log('\\n📱 Usage: Copy and paste individual messages to your preferred messaging app');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateMessage, generateMessages, MESSAGE_FORMATS };