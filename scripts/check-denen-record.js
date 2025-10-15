import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const DENEN_TOKEN = '26da9390c719122fceff8c89d5dd4b1b';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

async function checkDenenRecord() {
  console.log('🔍 Checking Denen\'s database record...\n');
  
  try {
    // Check if Denen exists in database
    const response = await fetch(`${SUPABASE_URL}/rest/v1/guests?token=eq.${DENEN_TOKEN}`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const guests = await response.json();
    
    if (guests.length === 0) {
      console.log('❌ No record found for Denen\'s token!');
      return;
    }

    const denen = guests[0];
    console.log('📋 DENEN\'S DATABASE RECORD:');
    console.log('=' .repeat(40));
    console.log(`Name: ${denen.name}`);
    console.log(`Phone: ${denen.phone_number}`);
    console.log(`Token: ${denen.token}`);
    console.log(`RSVP Status: ${denen.rsvp_status}`);
    console.log(`Created: ${denen.created_at}`);
    console.log('=' .repeat(40));
    
    // Test both URLs
    console.log('\n🧪 TESTING BOTH URLS:');
    
    // Test traditional party URL
    console.log('\n1️⃣ Testing Traditional Party URL...');
    await testURL('tradparty', DENEN_TOKEN);
    
    // Test cocktail party URL  
    console.log('\n2️⃣ Testing Cocktail Party URL...');
    await testURL('cocktail', DENEN_TOKEN);

  } catch (error) {
    console.error('❌ Error checking record:', error.message);
  }
}

async function testURL(eventType, token) {
  try {
    const url = `https://denens50th.netlify.app/${eventType}?token=${token}`;
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url);
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      console.log('   ✅ URL works - guest record found!');
    } else {
      console.log('   ❌ URL failed - guest not found for this event type');
    }
    
  } catch (error) {
    console.log(`   ❌ Error testing URL: ${error.message}`);
  }
}

checkDenenRecord();