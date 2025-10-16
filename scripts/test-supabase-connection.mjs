// Test script to check Supabase connection and list guests
import { createClient } from '@supabase/supabase-js';

// Configuration
const config = {
  supabaseUrl: 'https://anyfetbiorxomwqtfept.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueWZldGJpb3J4b213cXRmZXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODAwNTIsImV4cCI6MjA3NjA1NjA1Mn0.EqA9spSGmGXhU-oil5fr29Q9Fb__7Q_aoPqMtyjcN6I',
  testPhoneNumber: '+96894398548'
};

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  auth: { persistSession: false }
});

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test connection by listing tables
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_schemas');
      
    if (tablesError) throw tablesError;
    
    console.log('✅ Connected to Supabase');
    console.log('Available schemas:', tables);
    
    // Try to list guests
    console.log('\n🔍 Fetching guest data...');
    const { data: guests, error: guestsError } = await supabase
      .from('guests')
      .select('*')
      .limit(5);
      
    if (guestsError) throw guestsError;
    
    if (!guests || guests.length === 0) {
      console.log('ℹ️  No guests found in the database');
      return;
    }
    
    console.log('\n📋 Sample of guests in database:');
    guests.forEach((guest, index) => {
      console.log(`\nGuest #${index + 1}:`);
      console.log('Name:', guest.name || 'N/A');
      console.log('Phone:', guest.phone_number || 'N/A');
      console.log('Token:', guest.token || 'N/A');
      console.log('---');
    });
    
    // Check if test phone number exists
    console.log(`\n🔍 Looking for test phone number: ${config.testPhoneNumber}`);
    const { data: testGuest, error: testGuestError } = await supabase
      .from('guests')
      .select('*')
      .eq('phone_number', config.testPhoneNumber)
      .single();
      
    if (testGuestError || !testGuest) {
      console.log(`❌ No guest found with phone number: ${config.testPhoneNumber}`);
    } else {
      console.log('✅ Found matching guest:');
      console.log('Name:', testGuest.name);
      console.log('Token:', testGuest.token);
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Details:', error.details || error.hint || 'No additional details');
    
    if (error.code === 'PGRST301') {
      console.log('\nℹ️  The table might not exist or have a different name');
      console.log('Please check if your Supabase tables are set up correctly');
    }
  }
}

testConnection();
