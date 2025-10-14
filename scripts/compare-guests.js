// Script to compare guest lists between Guest1.json and Guest2.json using phone numbers
const fs = require('fs');
const path = require('path');

function compareGuestLists() {
  console.log('🔍 Comparing guest lists between Guest1.json and Guest2.json using PHONE NUMBERS...\n');

  try {
    // Read both guest files
    const guest1Path = path.join('contacts', 'Guest1.json');
    const guest2Path = path.join('contacts', 'Guest2.json');

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

    console.log(`📊 Guest Lists Summary:`);
    console.log(`   Traditional Party (Guest1.json): ${guest1Data.length} guests`);
    console.log(`   Cocktail (Guest2.json): ${guest2Data.length} guests\n`);

    // Filter out guests without phone numbers first
    const guest1WithPhone = guest1Data.filter(g => g.PhoneNumber && g.PhoneNumber.trim());
    const guest2WithPhone = guest2Data.filter(g => g.PhoneNumber && g.PhoneNumber.trim());
    
    console.log(`📱 Guests with phone numbers:`);
    console.log(`   Traditional Party: ${guest1WithPhone.length}/${guest1Data.length}`);
    console.log(`   Cocktail: ${guest2WithPhone.length}/${guest2Data.length}\n`);

    // Create phone number sets for comparison
    const guest1Phones = new Set(guest1WithPhone.map(guest => guest.PhoneNumber.trim()));
    const guest2Phones = new Set(guest2WithPhone.map(guest => guest.PhoneNumber.trim()));

    // Create lookup maps for detailed info
    const guest1PhoneMap = new Map();
    const guest2PhoneMap = new Map();
    
    guest1WithPhone.forEach((guest, index) => {
      guest1PhoneMap.set(guest.PhoneNumber.trim(), { ...guest, index: index + 1 });
    });
    
    guest2WithPhone.forEach((guest, index) => {
      guest2PhoneMap.set(guest.PhoneNumber.trim(), { ...guest, index: index + 1 });
    });

    // Check if every phone number in Guest2 is in Guest1
    const missingPhones = [];
    const foundPhones = [];
    const duplicatePhones = [];

    guest2WithPhone.forEach((guest, index) => {
      const phone = guest.PhoneNumber.trim();
      if (guest1Phones.has(phone)) {
        const guest1Match = guest1PhoneMap.get(phone);
        foundPhones.push({
          phone,
          cocktailGuest: guest.Name,
          cocktailIndex: index + 1,
          tradPartyGuest: guest1Match.Name,
          tradPartyIndex: guest1Match.index
        });
      } else {
        missingPhones.push({
          phone,
          name: guest.Name,
          cocktailIndex: index + 1
        });
      }
    });

    // Check for duplicate phone numbers within each list
    const checkDuplicates = (data, listName) => {
      const phoneMap = new Map();
      const duplicates = [];
      
      data.forEach((guest, index) => {
        if (!guest.PhoneNumber || !guest.PhoneNumber.trim()) return;
        
        const phone = guest.PhoneNumber.trim();
        if (phoneMap.has(phone)) {
          duplicates.push({
            phone,
            guests: [phoneMap.get(phone), { name: guest.Name, index: index + 1 }]
          });
        } else {
          phoneMap.set(phone, { name: guest.Name, index: index + 1 });
        }
      });
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Duplicate phone numbers in ${listName}:`);
        duplicates.forEach(dup => {
          console.log(`   📞 ${dup.phone}:`);
          dup.guests.forEach(g => console.log(`      - ${g.name} (position ${g.index})`));
        });
        console.log('');
      }
      
      return duplicates;
    };

    // Check for duplicates in both lists
    checkDuplicates(guest1Data, 'Traditional Party');
    checkDuplicates(guest2Data, 'Cocktail');

    // Results
    console.log(`🎯 PHONE NUMBER COMPARISON RESULTS:`);
    console.log(`✅ Phone numbers found in both lists: ${foundPhones.length}/${guest2WithPhone.length}`);
    console.log(`❌ Phone numbers in Cocktail but NOT in Traditional Party: ${missingPhones.length}\n`);

    if (missingPhones.length > 0) {
      console.log('🚨 Guests in Cocktail list with phone numbers NOT found in Traditional Party:');
      missingPhones.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - ${item.phone} (Cocktail position: ${item.cocktailIndex})`);
      });
      console.log('');
    }

    if (foundPhones.length > 0) {
      console.log('✅ Phone number matches (showing first 10):');
      foundPhones.slice(0, 10).forEach((match, index) => {
        const nameMatch = match.cocktailGuest.trim().toUpperCase() === match.tradPartyGuest.trim().toUpperCase();
        console.log(`   ${index + 1}. ${match.phone}`);
        console.log(`      Cocktail: ${match.cocktailGuest} (pos ${match.cocktailIndex})`);
        console.log(`      TradParty: ${match.tradPartyGuest} (pos ${match.tradPartyIndex}) ${nameMatch ? '✅' : '⚠️ NAME DIFF'}`);
      });
      if (foundPhones.length > 10) {
        console.log(`      ... and ${foundPhones.length - 10} more matches`);
      }
      console.log('');
    }

    // Check for guests without phone numbers
    const guest1NoPhone = guest1Data.filter(g => !g.PhoneNumber || !g.PhoneNumber.trim());
    const guest2NoPhone = guest2Data.filter(g => !g.PhoneNumber || !g.PhoneNumber.trim());
    
    if (guest1NoPhone.length > 0 || guest2NoPhone.length > 0) {
      console.log('📵 Guests without phone numbers:');
      if (guest1NoPhone.length > 0) {
        console.log(`   Traditional Party: ${guest1NoPhone.length} guests`);
        guest1NoPhone.forEach((guest, index) => {
          console.log(`      ${index + 1}. ${guest.Name}`);
        });
      }
      if (guest2NoPhone.length > 0) {
        console.log(`   Cocktail: ${guest2NoPhone.length} guests`);
        guest2NoPhone.forEach((guest, index) => {
          console.log(`      ${index + 1}. ${guest.Name}`);
        });
      }
      console.log('');
    }

    // Summary
    console.log(`\n🎯 FINAL SUMMARY:`);
    if (missingPhones.length === 0) {
      console.log('✅ PERFECT: Every guest with a phone number in the Cocktail list is also in the Traditional Party list!');
    } else {
      console.log(`⚠️  WARNING: ${missingPhones.length} guests with phone numbers in Cocktail list are missing from Traditional Party list`);
    }

    console.log(`\n📊 Detailed Distribution:`);
    console.log(`   - Cocktail guests with phones: ${guest2WithPhone.length}`);
    console.log(`   - Found in both lists: ${foundPhones.length}`);
    console.log(`   - Missing from Traditional Party: ${missingPhones.length}`);
    console.log(`   - Cocktail guests without phones: ${guest2NoPhone.length}`);
    console.log(`   - Traditional Party guests with phones: ${guest1WithPhone.length}`);
    console.log(`   - Traditional Party guests without phones: ${guest1NoPhone.length}`);

  } catch (error) {
    console.error('❌ Error comparing guest lists:', error.message);
  }
}

// Run the comparison
compareGuestLists();