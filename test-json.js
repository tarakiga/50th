// Simple test script to verify the JSON contact integration
const { listGuests, findGuestByToken } = require('./src/lib/contacts');

async function testJsonIntegration() {
  console.log('Testing JSON contact integration...\n');
  
  try {
    // Test listing guests
    console.log('1. Testing listGuests()...');
    const guests = await listGuests();
    console.log(`Found ${guests.length} guests`);
    
    if (guests.length > 0) {
      console.log('First 3 guests:');
      guests.slice(0, 3).forEach((guest, i) => {
        console.log(`  ${i + 1}. ${guest.Name} - ${guest.PhoneNumber} - Token: ${guest.Token || 'No token'}`);
      });
      
      // Test finding by token
      console.log('\n2. Testing findGuestByToken()...');
      const tokenGuest = guests.find(g => g.Token && g.Token.length > 0);
      if (tokenGuest) {
        console.log(`Looking for guest with token: ${tokenGuest.Token}`);
        const foundGuest = await findGuestByToken(tokenGuest.Token);
        if (foundGuest) {
          console.log(`✓ Found guest: ${foundGuest.Name}`);
        } else {
          console.log('✗ Guest not found by token');
        }
      } else {
        console.log('No guests with tokens found for testing');
      }
    }
    
    console.log('\n✓ JSON integration test completed successfully!');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error.stack);
  }
}

testJsonIntegration();