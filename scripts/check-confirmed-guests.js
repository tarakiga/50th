/**
 * Quick Check: Confirmed Guests Counter
 * 
 * This script quickly shows how many guests have confirmed attendance
 * for both events, so you know how many will need event details.
 * 
 * Usage: node check-confirmed-guests.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function checkConfirmedGuests() {
  console.log('🎊 Golden Jubilee - Confirmed Guest Counter');
  console.log('=========================================\n');
  
  let totalConfirmed = 0;
  let tradConfirmed = 0;
  let cocktailConfirmed = 0;
  
  // Check Traditional Party guests (Guest1.json)
  try {
    const tradGuestsPath = path.join(__dirname, '..', 'contacts', 'Guest1.json');
    if (fs.existsSync(tradGuestsPath)) {
      const tradGuests = JSON.parse(fs.readFileSync(tradGuestsPath, 'utf8'));
      const confirmed = tradGuests.filter(guest => guest.RSVPStatus === 'Attending');
      tradConfirmed = confirmed.length;
      
      console.log(`🎭 TRADITIONAL PARTY:`);
      console.log(`   Total Invited: ${tradGuests.length}`);
      console.log(`   Confirmed (Attending): ${tradConfirmed}`);
      console.log(`   Declined: ${tradGuests.filter(g => g.RSVPStatus === 'Declined').length}`);
      console.log(`   No Response: ${tradGuests.filter(g => !g.RSVPStatus || g.RSVPStatus === 'None').length}`);
      
      if (tradConfirmed > 0) {
        console.log('\n   📋 Confirmed Guests:');
        confirmed.forEach((guest, i) => {
          console.log(`   ${(i + 1).toString().padStart(2, ' ')}. ${guest.Name}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Error reading Traditional Party guests:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Check Cocktail guests (Guest2.json)
  try {
    const cocktailGuestsPath = path.join(__dirname, '..', 'contacts', 'Guest2.json');
    if (fs.existsSync(cocktailGuestsPath)) {
      const cocktailGuests = JSON.parse(fs.readFileSync(cocktailGuestsPath, 'utf8'));
      const confirmed = cocktailGuests.filter(guest => guest.RSVPStatus === 'Attending');
      cocktailConfirmed = confirmed.length;
      
      console.log(`🍸 COCKTAIL RECEPTION (VIP - ALL EVENTS):`);
      console.log(`   Total Invited: ${cocktailGuests.length}`);
      console.log(`   Confirmed (Attending): ${cocktailConfirmed}`);
      console.log(`   Declined: ${cocktailGuests.filter(g => g.RSVPStatus === 'Declined').length}`);
      console.log(`   No Response: ${cocktailGuests.filter(g => !g.RSVPStatus || g.RSVPStatus === 'None').length}`);
      
      if (cocktailConfirmed > 0) {
        console.log('\n   📋 Confirmed Guests:');
        confirmed.forEach((guest, i) => {
          console.log(`   ${(i + 1).toString().padStart(2, ' ')}. ${guest.Name}`);
        });
      }
    }
  } catch (error) {
    console.log('❌ Error reading Cocktail guests:', error.message);
  }
  
  totalConfirmed = tradConfirmed + cocktailConfirmed;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Traditional Party Confirmed: ${tradConfirmed}`);
  console.log(`Cocktail Reception Confirmed: ${cocktailConfirmed}`);
  console.log(`TOTAL CONFIRMED GUESTS: ${totalConfirmed}`);
  
  if (totalConfirmed === 0) {
    console.log('\n⚠️  No confirmed guests yet. Guests need to RSVP first!');
    console.log('   Send invitations using: node send-invitations-whatsapp.js');
  } else {
    console.log(`\n🎯 ${totalConfirmed} confirmed guests will need event details!`);
    console.log('\n📱 Next steps:');
    console.log('   1. If WhatsApp template approved: Continue as normal');
    console.log('   2. If template NOT approved: Use fallback methods');
    console.log('      → node fallback-event-details-sender.js --method=whatsapp');
  }
  
  console.log('\n👑 Ready for your Golden Jubilee celebration!');
}

// Run the check
checkConfirmedGuests();