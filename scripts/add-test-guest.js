import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Generate a unique token for Denen
function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function addTestGuest() {
  console.log('🔧 Adding test guest: Denen');
  
  const token = generateToken();
  
  const newGuest = {
    name: 'Denen',
    phone_number: '+2348035665197',
    token: token,
    rsvp_status: 'None',
    whatsapp_delivery_status: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/guests`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(newGuest)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Successfully added test guest!');
    console.log(`📋 Guest Details:`);
    console.log(`   Name: ${newGuest.name}`);
    console.log(`   Phone: ${newGuest.phone_number}`);
    console.log(`   Token: ${token}`);
    console.log('');
    console.log('🔗 Test URLs:');
    console.log(`   Cocktail: https://denens50th.netlify.app/cocktail?token=${token}`);
    console.log(`   Traditional: https://denens50th.netlify.app/tradparty?token=${token}`);
    console.log('');
    console.log('📱 You can now test with this token!');
    
  } catch (error) {
    console.error('❌ Failed to add guest:', error.message);
    process.exit(1);
  }
}

addTestGuest();