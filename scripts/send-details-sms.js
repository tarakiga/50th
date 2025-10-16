/**
 * Send SMS details to all Attending guests
 *
 * Env required:
 *  - SUPABASE_URL
 *  - SUPABASE_ANON_KEY
 *  - TWILIO_ACCOUNT_SID
 *  - TWILIO_AUTH_TOKEN
 *  - TWILIO_FROM_NUMBER (SMS-capable)
 *  - EVENT_NAME, EVENT_DETAILS, MAPS_LINK (or per-event vars)
 *
 * Usage:
 *  node send-details-sms.js [--dry-run]
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY_ARG = process.argv.find(a => a.startsWith('--only='));
const ONLY_NUMBER = ONLY_ARG ? ONLY_ARG.split('=')[1] : undefined;

function assertEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SUPABASE_ANON_KEY');
  if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
  if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
  if (!TWILIO_FROM_NUMBER) missing.push('TWILIO_FROM_NUMBER');
  if (missing.length) {
    console.error('❌ Missing env:', missing.join(', '));
    process.exit(1);
  }
}

function buildMessage(guest) {
  const eventName = process.env.EVENT_NAME || 'Golden Hour';
  const eventDetails = (process.env.EVENT_DETAILS || 'Details to follow').replace(/\\n/g, '\n');
  const mapsLink = process.env.MAPS_LINK;

  let body = `Hi ${guest.name || guest.Name}! You're confirmed for ${eventName}.\n\n${eventDetails}`;
  if (mapsLink) body += `\n\nLocation: ${mapsLink}`;
  return body;
}

async function listAttendingGuests() {
  const url = `${SUPABASE_URL}/rest/v1/guests?select=name,phone_number,token,rsvp_status,whatsapp_delivery_status,updated_at&rsvp_status=eq.Attending`;
  const resp = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Supabase error: ${resp.status} ${t}`);
  }
  return resp.json();
}

async function sendOneSMS(to, body) {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams();
  form.append('From', TWILIO_FROM_NUMBER);
  form.append('To', to);
  form.append('Body', body);
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
  const resp = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Twilio error: ${resp.status} ${t}`);
  }
  return resp.json();
}

async function main() {
  assertEnv();
  let guests;
  if (ONLY_NUMBER) {
    console.log(`📋 Using single test number via --only: ${ONLY_NUMBER}`);
    guests = [{ name: 'Test Number', phone_number: ONLY_NUMBER }];
  } else {
    console.log('📋 Fetching Attending guests from Supabase...');
    guests = await listAttendingGuests();
    console.log(`✅ Found ${guests.length} Attending guests`);
  }

  const results = { sent: 0, failed: 0 };
  for (const guest of guests) {
    const to = guest.phone_number || guest.PhoneNumber;
    const body = buildMessage(guest);
    if (DRY_RUN) {
      console.log(`🧪 [DRY-RUN] Would send to ${guest.name} (${to})`);
    } else {
      try {
        const res = await sendOneSMS(to, body);
        results.sent += 1;
        console.log(`✅ Sent to ${guest.name} (${to}) SID=${res.sid}`);
      } catch (e) {
        results.failed += 1;
        console.error(`❌ Failed for ${guest.name} (${to}): ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  console.log('\n📊 Summary');
  console.log(`   Sent:   ${results.sent}`);
  console.log(`   Failed: ${results.failed}`);
}

main().catch(e => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});


