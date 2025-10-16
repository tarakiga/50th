// Simple script to list available tables in Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://anyfetbiorxomwqtfept.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueWZldGJpb3J4b213cXRmZXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODAwNTIsImV4cCI6MjA3NjA1NjA1Mn0.EqA9spSGmGXhU-oil5fr29Q9Fb__7Q_aoPqMtyjcN6I'
);

async function listTables() {
  console.log('🔍 Listing tables...');
  
  try {
    // Try to query the information_schema to list tables
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
      
    if (error) throw error;
    
    if (!tables || tables.length === 0) {
      console.log('ℹ️  No tables found in the public schema');
      return;
    }
    
    console.log('\n📋 Available tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing tables:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    // Try a direct query to the guests table
    console.log('\n🔍 Trying direct query to guests table...');
    try {
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .limit(1);
        
      if (guestError) throw guestError;
      
      console.log('✅ Successfully connected to guests table!');
      console.log('First guest sample:', guests[0]);
      
    } catch (directError) {
      console.error('❌ Could not access guests table:');
      console.error('Message:', directError.message);
      console.error('Code:', directError.code);
      
      if (directError.code === '42P01') {
        console.log('\nℹ️  The guests table might not exist.');
        console.log('Please check your Supabase database for the correct table name.');
      }
    }
  }
}

listTables();
