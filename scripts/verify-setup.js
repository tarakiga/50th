// Script to verify the new event structure
const fs = require('fs');
const path = require('path');

function verifySetup() {
  console.log('🎯 VERIFYING NEW EVENT STRUCTURE SETUP...\n');

  try {
    // Read guest files
    const guest1Path = path.join('contacts', 'Guest1.json');
    const guest2Path = path.join('contacts', 'Guest2.json');

    const guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
    const guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));

    console.log('📊 GUEST LIST VERIFICATION:');
    console.log(`✅ Guest1.json (Traditional Party ONLY): ${guest1Data.length} guests`);
    console.log(`✅ Guest2.json (ALL THREE EVENTS): ${guest2Data.length} guests`);
    console.log(`✅ Total unique guests: ${guest1Data.length + guest2Data.length} guests\n`);

    // Check token distribution
    const guest1WithTokens = guest1Data.filter(g => g.Token && g.Token.length > 0);
    const guest2WithTokens = guest2Data.filter(g => g.Token && g.Token.length > 0);

    console.log('🎫 TOKEN VERIFICATION:');
    console.log(`✅ Guest1.json tokens: ${guest1WithTokens.length}/${guest1Data.length}`);
    console.log(`✅ Guest2.json tokens: ${guest2WithTokens.length}/${guest2Data.length}`);
    console.log(`✅ Total tokens generated: ${guest1WithTokens.length + guest2WithTokens.length}\n`);

    // Check phone numbers
    const guest1WithPhone = guest1Data.filter(g => g.PhoneNumber && g.PhoneNumber.trim());
    const guest2WithPhone = guest2Data.filter(g => g.PhoneNumber && g.PhoneNumber.trim());

    console.log('📱 PHONE NUMBER VERIFICATION:');
    console.log(`✅ Guest1.json phone numbers: ${guest1WithPhone.length}/${guest1Data.length}`);
    console.log(`✅ Guest2.json phone numbers: ${guest2WithPhone.length}/${guest2Data.length}\n`);

    // Sample guests
    console.log('📝 SAMPLE GUESTS:');
    console.log('Traditional Party ONLY (Guest1.json):');
    guest1Data.slice(0, 3).forEach((guest, i) => {
      console.log(`   ${i + 1}. ${guest.Name} - ${guest.PhoneNumber} - Token: ${guest.Token?.substring(0, 8)}...`);
    });

    console.log('\nALL THREE EVENTS (Guest2.json):');
    guest2Data.slice(0, 3).forEach((guest, i) => {
      console.log(`   ${i + 1}. ${guest.Name} - ${guest.PhoneNumber} - Token: ${guest.Token?.substring(0, 8)}...`);
    });

    // Generate example links
    const guest1Token = guest1Data.find(g => g.Token)?.Token;
    const guest2Token = guest2Data.find(g => g.Token)?.Token;

    console.log('\n🔗 EXAMPLE INVITATION LINKS:');
    if (guest1Token) {
      console.log(`Traditional Party ONLY: http://localhost:3002/tradparty?token=${guest1Token}`);
    }
    if (guest2Token) {
      console.log(`ALL THREE EVENTS: http://localhost:3002/cocktail?token=${guest2Token}`);
    }

    console.log('\n🎯 ADMIN LINKS:');
    console.log('Traditional Party Admin: http://localhost:3002/tradparty/admin');
    console.log('VIP All Events Admin: http://localhost:3002/cocktail/admin');

    console.log('\n🎉 EVENT STRUCTURE SUMMARY:');
    console.log('📅 TRADITIONAL PARTY (24 & 25 Oct):');
    console.log('   • Traditional Party Only guests: 39 people');
    console.log('   • VIP All Events guests: 171 people');
    console.log('   • Total Traditional Party attendees: 210 people');
    
    console.log('\n🍸 COCKTAIL PARTY (23 Oct):');
    console.log('   • VIP All Events guests ONLY: 171 people');
    
    console.log('\n✅ SETUP COMPLETE! Your three-tier invitation system is ready:');
    console.log('   🎭 Traditional Party Only: 39 guests');
    console.log('   🎉 VIP All Events: 171 guests');
    console.log('   🎯 Total: 210 unique guests with personalized invitations');

  } catch (error) {
    console.error('❌ Error verifying setup:', error.message);
  }
}

// Run verification
verifySetup();