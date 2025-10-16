/**
 * Dry-run: build SMS invitation for a single number
 * Usage: node test-invite-sms-one.js --to=+234... [--event=tradparty|cocktail]
 */

import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const toArg = process.argv.find(a => a.startsWith('--to='));
const eventArg = process.argv.find(a => a.startsWith('--event='));
const TO = toArg ? toArg.split('=')[1] : '';
const EVENT = (eventArg ? eventArg.split('=')[1] : 'tradparty');

if (!TO) {
  console.error('❌ Missing --to=+E164');
  process.exit(1);
}

const BASE_URL = process.env.BASE_URL || 'https://denens50th.netlify.app';

// Simple token lookup from contacts files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadGuests(file) {
  const p = path.join(__dirname, '..', 'contacts', file);
  if (!fs.existsSync(p)) return [];
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const all = [...loadGuests('Guest1.json'), ...loadGuests('Guest2.json')];
const guest = all.find(g => (g.PhoneNumber || '').trim() === TO.trim());

if (!guest) {
  console.log(`ℹ️  No guest found with number ${TO}. Building generic example message.`);
}

const name = guest?.Name || 'Guest';
const token = guest?.Token || 'example-token';
const eventName = EVENT === 'cocktail' ? 'Cocktail Reception' : 'Traditional Party';
const inviteUrl = `${BASE_URL}/${EVENT}?token=${token}`;

let message = `🎊 GOLDEN JUBILEE INVITATION\n\nDear ${name},\n\nYou're invited to Denen Ikya's 50th Birthday ${eventName}!`;
if (EVENT === 'cocktail') {
  message += `\n\n🎩 STRICTLY BLACK TIE EVENT\nFormal evening attire required`;
}
message += `\n\nYour personal invitation: ${inviteUrl}\n\nPlease RSVP via the link. Full details shared after confirmation.\n\nLooking forward to celebrating! 👑`;

console.log('🧪 DRY RUN - Single Invite SMS');
console.log('================================');
console.log(`To: ${TO}`);
console.log(`Event: ${EVENT}`);
console.log('--- Message ---');
console.log(message);
console.log('----------------');


