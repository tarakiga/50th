// Script to create Guest3.json with guests in Guest1.json but not in Guest2.json
const fs = require('fs');
const path = require('path');

function createGuest3() {
  console.log('🔍 Creating Guest3.json with guests only in Traditional Party...\n');

  try {
    // Read both guest files
    const guest1Path = path.join('contacts', 'Guest1.json');
    const guest2Path = path.join('contacts', 'Guest2.json');
    const guest3Path = path.join('contacts', 'Guest3.json');

    if (!fs.existsSync(guest1Path)) {
      console.error('❌ Guest1.json not found');
      return;
    }

    if (!fs.existsSync(guest2Path)) {
      console.error('❌ Guest2.json not found');
      return;
    }

    const guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
    const guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));

    console.log(`📊 Source Files Summary:`);
    console.log(`   Guest1.json (Traditional Party): ${guest1Data.length} guests`);
    console.log(`   Guest2.json (Cocktail): ${guest2Data.length} guests\n`);

    // Create sets for comparison using phone numbers as primary identifier
    // For guests without phone numbers, use name as fallback
    const guest2Identifiers = new Set();
    
    guest2Data.forEach(guest => {
      if (guest.PhoneNumber && guest.PhoneNumber.trim()) {
        // Use phone number as primary identifier
        guest2Identifiers.add(guest.PhoneNumber.trim());
      } else {
        // Fallback to name for guests without phone numbers
        guest2Identifiers.add(`NAME:${guest.Name.trim().toUpperCase()}`);
      }
    });

    // Find guests in Guest1 that are NOT in Guest2
    const guest3Data = [];
    const foundInGuest2 = [];
    const notFoundInGuest2 = [];

    guest1Data.forEach((guest, index) => {
      let identifier;
      let found = false;

      if (guest.PhoneNumber && guest.PhoneNumber.trim()) {
        // Check by phone number first
        identifier = guest.PhoneNumber.trim();
        found = guest2Identifiers.has(identifier);
      } else {
        // Check by name for guests without phone numbers
        identifier = `NAME:${guest.Name.trim().toUpperCase()}`;
        found = guest2Identifiers.has(identifier);
      }

      if (found) {
        foundInGuest2.push({
          name: guest.Name,
          phone: guest.PhoneNumber || 'No phone',
          position: index + 1
        });
      } else {
        notFoundInGuest2.push({
          name: guest.Name,
          phone: guest.PhoneNumber || 'No phone',
          position: index + 1
        });
        // Add to Guest3 data
        guest3Data.push(guest);
      }
    });

    console.log(`🎯 Analysis Results:`);
    console.log(`   ✅ Guests found in both lists: ${foundInGuest2.length}`);
    console.log(`   ❌ Guests only in Traditional Party: ${notFoundInGuest2.length}\n`);

    if (notFoundInGuest2.length > 0) {
      console.log(`📋 Guests only in Traditional Party (will be in Guest3.json):`);
      notFoundInGuest2.forEach((guest, index) => {
        console.log(`   ${index + 1}. ${guest.name} - ${guest.phone} (original position: ${guest.position})`);
      });
      console.log('');
    }

    // Create Guest3.json
    if (guest3Data.length > 0) {
      fs.writeFileSync(guest3Path, JSON.stringify(guest3Data, null, 2));
      console.log(`✅ Guest3.json created successfully!`);
      console.log(`   📁 Location: ${guest3Path}`);
      console.log(`   📊 Contains: ${guest3Data.length} guests\n`);

      // Show statistics about Guest3
      const guest3WithPhone = guest3Data.filter(g => g.PhoneNumber && g.PhoneNumber.trim());
      const guest3WithoutPhone = guest3Data.filter(g => !g.PhoneNumber || !g.PhoneNumber.trim());

      console.log(`📊 Guest3.json Statistics:`);
      console.log(`   - Total guests: ${guest3Data.length}`);
      console.log(`   - Guests with phone numbers: ${guest3WithPhone.length}`);
      console.log(`   - Guests without phone numbers: ${guest3WithoutPhone.length}`);
      
      if (guest3WithoutPhone.length > 0) {
        console.log(`\n📵 Guests without phone numbers in Guest3.json:`);
        guest3WithoutPhone.forEach((guest, index) => {
          console.log(`   ${index + 1}. ${guest.Name}`);
        });
      }

      // Show first few guests as sample
      console.log(`\n📝 Sample guests in Guest3.json (first 5):`);
      guest3Data.slice(0, 5).forEach((guest, index) => {
        console.log(`   ${index + 1}. ${guest.Name} - ${guest.PhoneNumber || 'No phone'}`);
      });
      
      if (guest3Data.length > 5) {
        console.log(`   ... and ${guest3Data.length - 5} more guests`);
      }

    } else {
      console.log(`ℹ️  No guests found that are only in Traditional Party`);
      console.log(`   All guests in Guest1.json are also in Guest2.json`);
      console.log(`   Guest3.json was not created.`);
    }

    // Summary
    console.log(`\n🎯 FINAL SUMMARY:`);
    console.log(`   📊 Guest Distribution:`);
    console.log(`      - Traditional Party only: ${guest3Data.length} guests (Guest3.json)`);
    console.log(`      - Common to both events: ${foundInGuest2.length} guests`);
    console.log(`      - Cocktail only: 0 guests (from previous analysis)`);
    console.log(`   📁 Files created:`);
    if (guest3Data.length > 0) {
      console.log(`      ✅ Guest3.json - ${guest3Data.length} guests (Traditional Party exclusive)`);
    }
    console.log(`   📱 Phone number coverage in Guest3.json: ${guest3WithPhone ? guest3WithPhone.length : 0}/${guest3Data.length}`);

  } catch (error) {
    console.error('❌ Error creating Guest3.json:', error.message);
  }
}

// Run the script
createGuest3();