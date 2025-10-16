/**
 * Send one SMS invitation to a specific number
 * Usage: node send-invite-sms-one.js --to=+E164 [--event=tradparty|cocktail]
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER; // SMS-capable
const BASE_URL = process.env.BASE_URL || 'https://denens50th.netlify.app';

const toArg = process.argv.find(a => a.startsWith('--to='));
const eventArg = process.argv.find(a => a.startsWith('--event='));
const TO = toArg ? toArg.split('=')[1] : '';
const EVENT = (eventArg ? eventArg.split('=')[1] : 'tradparty');

if (!accountSid || !authToken || !fromNumber) {
  console.error('❌ Missing Twilio SMS env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER');
  process.exit(1);
}
if (!TO) {
  console.error('❌ Missing --to=+E164');
  process.exit(1);
}

function loadGuests(file) {
  const p = path.join(__dirname, '..', 'contacts', file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const all = [...loadGuests('Guest1.json'), ...loadGuests('Guest2.json')];
const guest = all.find(g => (g.PhoneNumber || '').trim() === TO.trim());

const name = guest?.Name || 'Guest';
const token = guest?.Token || 'example-token';
const eventName = EVENT === 'cocktail' ? 'Cocktail Reception' : 'Traditional Party';
const inviteUrl = `${BASE_URL}/${EVENT}?token=${token}`;

let body = `🎊 GOLDEN JUBILEE INVITATION\n\nDear ${name},\n\nYou're invited to Denen Ikya's 50th Birthday ${eventName}!`;
if (EVENT === 'cocktail') {
  body += `\n\n🎩 STRICTLY BLACK TIE EVENT\nFormal evening attire required`;
}
body += `\n\nYour personal invitation: ${inviteUrl}\n\nPlease RSVP via the link. Full details shared after confirmation.\n\nLooking forward to celebrating! 👑`;

console.log('📤 Sending SMS invitation...');
console.log(`From: ${fromNumber}`);
console.log(`To:   ${TO}`);

const form = new URLSearchParams();
form.append('From', fromNumber);
form.append('To', TO);
form.append('Body', body);

const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

const resp = await fetch(url, {
  method: 'POST',
  headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
  body: form,
});

if (!resp.ok) {
  const t = await resp.text().catch(() => '');
  console.error(`❌ Send failed: HTTP ${resp.status} ${t}`);
  process.exit(1);
}

const result = await resp.json().catch(() => ({}));
console.log('✅ Sent!');
console.log(`   SID: ${result.sid}`);
console.log(`   Status: ${result.status}`);
console.log('📱 Check the phone for the SMS.');


