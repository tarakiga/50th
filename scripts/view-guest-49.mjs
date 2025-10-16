// Script to view guest details for ID 49
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  'https://anyfetbiorxomwqtfept.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFueWZldGJpb3J4b213cXRmZXB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODAwNTIsImV4cCI6MjA3NjA1NjA1Mn0.EqA9spSGmGXhU-oil5fr29Q9Fb__7Q_aoPqMtyjcN6I'
);

async function getGuestById(id) {
  try {
    const { data: guest, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return guest;
  } catch (error) {
    console.error('❌ Error fetching guest:', error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Fetching guest with ID: 49');
  const guest = await getGuestById(49);
  
  if (!guest) {
    console.log('❌ No guest found with ID 49');
    return;
  }
  
  console.log('\n📋 Guest Details:');
  console.log('-------------------');
  console.log(`ID: ${guest.id}`);
  console.log(`Name: ${guest.name}`);
  console.log(`Phone: ${guest.phone_number}`);
  console.log(`Token: ${guest.token}`);
  console.log(`RSVP Status: ${guest.rsvp_status}`);
  console.log(`Last Updated: ${guest.updated_at}`);
  console.log(`WhatsApp Status: ${guest.whatsapp_delivery_status || 'Not sent'}`);
  
  // Show the invitation that would be sent
  const eventType = guest.name.toLowerCase().includes('cocktail') ? 'cocktail' : 'tradparty';
  const eventName = eventType === 'cocktail' ? 'Cocktail Reception' : 'Traditional Party';
  const inviteUrl = `https://denens50th.netlify.app/${eventType}?token=${guest.token}`;
  
  console.log('\n📨 Invitation that would be sent:');
  console.log('----------------------------------------');
  console.log(`To: ${guest.phone_number}`);
  console.log(`Event: ${eventName}`);
  console.log('--- Message ---');
  console.log(`🎊 GOLDEN JUBILEE INVITATION\n\nDear ${guest.name},\n\nYou're invited to Denen Ikya's 50th Birthday ${eventName}!` + 
    (eventType === 'cocktail' ? '\n\n🎩 STRICTLY BLACK TIE EVENT\nFormal evening attire required' : '') +
    `\n\nYour personal invitation: ${inviteUrl}\n\nPlease RSVP via the link. Full details shared after confirmation.\n\nLooking forward to celebrating! 👑`);
  console.log('----------------------------------------');
}

main().catch(console.error);
