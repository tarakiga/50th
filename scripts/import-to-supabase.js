/**
 * Import Guest Data to Supabase
 * 
 * This script imports your JSON guest data to Supabase database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

console.log('📊 Importing Guest Data to Supabase');
console.log('===================================\n');

// Check credentials
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('❌ Missing Supabase credentials in .env file:');
    console.log('   SUPABASE_URL=https://your-project.supabase.co');
    console.log('   SUPABASE_ANON_KEY=eyJ...');
    console.log('\n📖 Get these from: app.supabase.com → Your Project → Settings → API');
    process.exit(1);
}

if (SUPABASE_URL === 'your_project_url_here' || SUPABASE_KEY === 'your_anon_key_here') {
    console.log('❌ Please update your Supabase credentials in .env file');
    console.log('   Replace the placeholder values with your actual credentials');
    process.exit(1);
}

/**
 * Make Supabase API request
 */
async function supabaseRequest(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    
    const response = await fetch(url, {
        ...options,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase API error: ${response.status} ${response.statusText}\n${errorText}`);
    }

    return response.json();
}

/**
 * Import guests to Supabase
 */
async function importGuests() {
    try {
        // Load guest files
        const guest1Path = path.join(__dirname, '..', 'contacts', 'Guest1.json');
        const guest2Path = path.join(__dirname, '..', 'contacts', 'Guest2.json');
        
        let allGuests = [];
        
        // Load Traditional Party guests
        if (fs.existsSync(guest1Path)) {
            const guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
            console.log(`📋 Loaded ${guest1Data.length} Traditional Party guests`);
            
            const tradGuests = guest1Data.map(guest => ({
                name: guest.Name + ' (Traditional)',
                phone_number: guest.PhoneNumber,
                token: guest.Token,
                rsvp_status: guest.RSVPStatus || 'None',
                whatsapp_delivery_status: guest.WhatsAppDeliveryStatus || null,
                updated_at: guest.UpdatedAt || new Date().toISOString()
            }));
            
            allGuests.push(...tradGuests);
        }
        
        // Load Cocktail guests
        if (fs.existsSync(guest2Path)) {
            const guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));
            console.log(`🍸 Loaded ${guest2Data.length} Cocktail Reception guests`);
            
            const cocktailGuests = guest2Data.map(guest => ({
                name: guest.Name + ' (Cocktail)',
                phone_number: guest.PhoneNumber,
                token: guest.Token,
                rsvp_status: guest.RSVPStatus || 'None',
                whatsapp_delivery_status: guest.WhatsAppDeliveryStatus || null,
                updated_at: guest.UpdatedAt || new Date().toISOString()
            }));
            
            allGuests.push(...cocktailGuests);
        }
        
        console.log(`📱 Total guests to import: ${allGuests.length}\n`);
        
        // Import in batches of 100 (Supabase limit)
        const batchSize = 100;
        let imported = 0;
        
        for (let i = 0; i < allGuests.length; i += batchSize) {
            const batch = allGuests.slice(i, i + batchSize);
            console.log(`📤 Importing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(allGuests.length/batchSize)} (${batch.length} guests)...`);
            
            try {
                await supabaseRequest('guests', {
                    method: 'POST',
                    body: JSON.stringify(batch),
                });
                
                imported += batch.length;
                console.log(`✅ Batch imported successfully`);
            } catch (error) {
                console.error(`❌ Error importing batch:`, error.message);
                // Continue with next batch
            }
        }
        
        console.log(`\n🎉 Import completed!`);
        console.log(`✅ Successfully imported: ${imported} guests`);
        console.log(`❌ Failed to import: ${allGuests.length - imported} guests`);
        
        // Test the integration
        console.log(`\n🧪 Testing Supabase integration...`);
        const testGuest = await supabaseRequest('guests?token=eq.a909f361f2ca4d8fbac37fcc531a8164&select=*');
        
        if (testGuest && testGuest.length > 0) {
            console.log(`✅ Test successful! Found guest: ${testGuest[0].name}`);
            console.log(`\n🚀 Your Supabase integration is ready!`);
            console.log(`🎯 Test RSVP URL: https://denens50th.netlify.app/tradparty?token=a909f361f2ca4d8fbac37fcc531a8164`);
        } else {
            console.log(`❌ Test failed - could not find test guest`);
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        
        if (error.message.includes('404')) {
            console.log('\n💡 This usually means:');
            console.log('   - The "guests" table does not exist in your Supabase database');
            console.log('   - Create the table in Supabase Dashboard → Table Editor');
        } else if (error.message.includes('401') || error.message.includes('403')) {
            console.log('\n💡 This usually means:');
            console.log('   - Invalid API key or URL');
            console.log('   - Check your SUPABASE_URL and SUPABASE_ANON_KEY in .env');
        }
    }
}

// Run the import
importGuests();