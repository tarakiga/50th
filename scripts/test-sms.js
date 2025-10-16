import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

const TEST_TO = '+2348035665197'; // Denen's number

async function testSMS() {
  console.log('📱 Testing SMS with new Twilio number...');
  console.log(`From: ${TWILIO_FROM_NUMBER}`);
  console.log(`To: ${TEST_TO}\n`);

  const formData = new URLSearchParams();
  formData.append('From', TWILIO_FROM_NUMBER);
  formData.append('To', TEST_TO);
  formData.append('Body', '🎉 Test message from your new Twilio number! If you receive this, SMS is working.');

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
    console.log('✅ SMS sent successfully!');
    console.log(`📱 Message SID: ${result.sid}`);
    console.log('📞 Your Twilio number is working!');
    console.log('\n🔄 Next: Enable WhatsApp on this number in Twilio Console');
    
  } catch (error) {
    console.error('❌ SMS test failed:', error.message);
  }
}

testSMS();