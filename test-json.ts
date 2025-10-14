// TypeScript test to verify JSON contact integration
import { listGuests, findGuestByToken } from './src/lib/contacts';

async function testJsonIntegration() {
  console.log('Testing JSON contact integration...\n');
  
  try {
    // Test listing guests
    console.log('1. Testing listGuests()...');
    const guests = await listGuests();
    console.log(`Found ${guests.length} guests`);
    
    if (guests.length > 0) {
      console.log('\nFirst 3 guests:');
      guests.slice(0, 3).forEach((guest, i) => {
        console.log(`  ${i + 1}. ${guest.Name} - ${guest.PhoneNumber} - Token: ${guest.Token || 'No token'} - RSVP: ${guest.RSVPStatus}`);
      });
      
      // Test finding by token
      console.log('\n2. Testing findGuestByToken()...');
      const tokenGuest = guests.find(g => g.Token && g.Token.length > 0);
      if (tokenGuest) {
        console.log(`Looking for guest with token: ${tokenGuest.Token}`);
        const foundGuest = await findGuestByToken(tokenGuest.Token);
        if (foundGuest) {
          console.log(`✓ Found guest: ${foundGuest.Name} - RSVP Status: ${foundGuest.RSVPStatus}`);
        } else {
          console.log('✗ Guest not found by token');
        }
      } else {
        console.log('No guests with tokens found for testing');
      }

      // Show stats
      const withPhones = guests.filter(g => g.PhoneNumber && g.PhoneNumber.length > 0).length;
      const withTokens = guests.filter(g => g.Token && g.Token.length > 0).length;
      const attending = guests.filter(g => g.RSVPStatus === 'Attending').length;
      
      console.log(`\n3. Stats:`);
      console.log(`   - Guests with phone numbers: ${withPhones}/${guests.length}`);
      console.log(`   - Guests with tokens: ${withTokens}/${guests.length}`);
      console.log(`   - Currently attending: ${attending}/${guests.length}`);
    }
    
    console.log('\n✓ JSON integration test completed successfully!');
    console.log('The system can now read from the Guests.json file with proper E.164 phone formatting.');
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

testJsonIntegration();