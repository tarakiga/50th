import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

// Denen's details from the previous script
const DENEN = {
  name: 'Denen',
  phone: '+2348035665197',
  token: '26da9390c719122fceff8c89d5dd4b1b'
};

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
  console.error('❌ Missing Twilio credentials in .env file');
  process.exit(1);
}

async function sendInvitationMessage() {
  console.log('📨 Sending invitation message to Denen...');
  
  const invitationMessage = `🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear ${DENEN.name},

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*Golden Jubilee Traditional Party*

Click your personal invitation:
https://denens50th.netlify.app/tradparty?token=${DENEN.token}

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*`;

  const formData = new URLSearchParams();
  formData.append('From', `whatsapp:${TWILIO_FROM_NUMBER}`);
  formData.append('To', `whatsapp:${DENEN.phone}`);
  formData.append('Body', invitationMessage);

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Invitation sent successfully!');
    console.log(`📱 Message SID: ${result.sid}`);
    console.log(`📞 Sent to: ${DENEN.phone}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send invitation:', error.message);
    return false;
  }
}

async function simulateRSVP() {
  console.log('\n🔄 Simulating RSVP response...');
  console.log('(This is what happens when Denen clicks "I Will Attend")');
  
  try {
    const response = await fetch('https://denens50th.netlify.app/api/tradparty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: DENEN.token,
        action: 'attending'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ RSVP simulation successful!');
    console.log(`📊 Response:`, result);
    
    console.log('\n📱 Denen should now receive a detailed WhatsApp message with:');
    console.log('   - Personal greeting: "Hi Denen! 🎉"');
    console.log('   - Event name: "Traditional Party / Disco Tech"');
    console.log('   - Full event details with dates, times, and locations');
    console.log('   - Closing message: "Looking forward to seeing you there! ✨"');
    
    return true;
  } catch (error) {
    console.error('❌ RSVP simulation failed:', error.message);
    return false;
  }
}

async function testFullFlow() {
  console.log('🚀 Testing Full Invitation Flow for Denen');
  console.log('=' .repeat(50));
  
  console.log('\n📋 Test Details:');
  console.log(`   Name: ${DENEN.name}`);
  console.log(`   Phone: ${DENEN.phone}`);
  console.log(`   Token: ${DENEN.token}`);
  console.log(`   URL: https://denens50th.netlify.app/tradparty?token=${DENEN.token}`);
  
  // Step 1: Send invitation
  const invitationSent = await sendInvitationMessage();
  if (!invitationSent) {
    console.log('\n❌ Test failed at invitation step');
    return;
  }
  
  // Wait a moment
  console.log('\n⏳ Waiting 3 seconds before simulating RSVP...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Step 2: Simulate RSVP
  const rsvpSuccess = await simulateRSVP();
  
  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY:');
  console.log(`   ✅ Invitation sent: ${invitationSent ? 'SUCCESS' : 'FAILED'}`);
  console.log(`   ✅ RSVP processed: ${rsvpSuccess ? 'SUCCESS' : 'FAILED'}`);
  
  if (invitationSent && rsvpSuccess) {
    console.log('\n🎉 FULL FLOW TEST: SUCCESS!');
    console.log('\n📱 Denen should have received 2 WhatsApp messages:');
    console.log('   1. Initial invitation with RSVP link');
    console.log('   2. Detailed event confirmation after "attending"');
    console.log('\n🚀 Your system is ready for mass rollout!');
  } else {
    console.log('\n❌ FULL FLOW TEST: FAILED');
    console.log('Please check the errors above and fix before mass rollout.');
  }
}

// Run the test
testFullFlow();