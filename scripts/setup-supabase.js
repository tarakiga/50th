/**
 * Complete Supabase Setup and Import
 * 
 * This script will:
 * 1. Create the guests table (if it doesn't exist)
 * 2. Import all your guest data
 * 3. Test the integration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🚀 Complete Supabase Setup for Golden Jubilee');
console.log('==============================================\n');

// Check credentials
if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_KEY === 'need_anon_key_here') {
    console.log('❌ Missing or incomplete Supabase credentials');
    process.exit(1);
}

console.log(`✅ Project URL: ${SUPABASE_URL}`);
console.log(`✅ API Key: ${SUPABASE_KEY.substring(0, 20)}...\n`);

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
 * Create the guests table using SQL
 */
async function createTable() {
    console.log('🔧 Creating guests table...');
    
    const createTableSQL = `
        CREATE TABLE IF NOT EXISTS guests (
            id BIGSERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            token TEXT NOT NULL UNIQUE,
            rsvp_status TEXT DEFAULT 'None',
            whatsapp_delivery_status TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Create index on token for fast lookups
        CREATE INDEX IF NOT EXISTS idx_guests_token ON guests(token);
    `;
    
    try {
        // Use SQL endpoint to create table
        const sqlUrl = `${SUPABASE_URL}/rest/v1/rpc/exec_sql`;
        
        const response = await fetch(sqlUrl, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql: createTableSQL }),
        });

        if (response.ok) {
            console.log('✅ Table created successfully');
        } else {
            // Table might already exist or we don't have SQL permissions
            console.log('ℹ️  Table creation via SQL not available - using manual approach');
            console.log('   Please create the table manually in Supabase dashboard');
            console.log('   We\'ll proceed with data import...\n');
        }
    } catch (error) {
        console.log('ℹ️  Table creation via API not available - proceeding with import');
        console.log('   If import fails, create table manually in dashboard\n');
    }
}

/**
 * Import guests to Supabase
 */
async function importGuests() {
    console.log('📊 Importing guest data...');
    
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
        }));
        
        allGuests.push(...cocktailGuests);
    }
    
    console.log(`📱 Total guests to import: ${allGuests.length}\n`);
    
    // Clear existing data first (optional)
    try {
        console.log('🧹 Clearing existing guest data...');
        await supabaseRequest('guests', { method: 'DELETE' });
        console.log('✅ Existing data cleared');
    } catch (error) {
        console.log('ℹ️  No existing data to clear (or table doesn\'t exist yet)');
    }
    
    // Import in batches of 50 (more conservative)
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < allGuests.length; i += batchSize) {
        const batch = allGuests.slice(i, i + batchSize);
        const batchNum = Math.floor(i/batchSize) + 1;
        const totalBatches = Math.ceil(allGuests.length/batchSize);
        
        console.log(`📤 Importing batch ${batchNum}/${totalBatches} (${batch.length} guests)...`);
        
        try {
            await supabaseRequest('guests', {
                method: 'POST',
                body: JSON.stringify(batch),
            });
            
            imported += batch.length;
            console.log(`✅ Batch ${batchNum} imported successfully`);
        } catch (error) {
            console.error(`❌ Error importing batch ${batchNum}:`, error.message);
            
            if (error.message.includes('relation "guests" does not exist')) {
                console.log('\n💡 The guests table doesn\'t exist yet. Let me help you create it:');
                console.log('   1. Go to: https://app.supabase.com/project/anyfetbiorxomwqtfept/editor');
                console.log('   2. Click "New table"');
                console.log('   3. Table name: guests');
                console.log('   4. Add columns: name (text), phone_number (text), token (text), rsvp_status (text)');
                console.log('   5. Run this script again');
                process.exit(1);
            }
        }
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n🎉 Import completed!`);
    console.log(`✅ Successfully imported: ${imported} guests`);
    console.log(`❌ Failed to import: ${allGuests.length - imported} guests`);
}

/**
 * Test the integration
 */
async function testIntegration() {
    console.log(`\n🧪 Testing Supabase integration...`);
    
    try {
        // Test finding a guest by token
        const testToken = 'a909f361f2ca4d8fbac37fcc531a8164';
        const testGuest = await supabaseRequest(`guests?token=eq.${testToken}&select=*`);
        
        if (testGuest && testGuest.length > 0) {
            console.log(`✅ Test successful! Found guest: ${testGuest[0].name}`);
            console.log(`📱 Phone: ${testGuest[0].phone_number}`);
            
            // Test updating RSVP
            console.log(`🔄 Testing RSVP update...`);
            await supabaseRequest(`guests?token=eq.${testToken}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    rsvp_status: 'Test_Update',
                    updated_at: new Date().toISOString()
                }),
            });
            console.log(`✅ RSVP update test successful!`);
            
            console.log(`\n🚀 Your Supabase integration is fully operational!`);
            console.log(`🎯 Test RSVP URL: https://denens50th.netlify.app/tradparty?token=${testToken}`);
            console.log(`📊 View data: https://app.supabase.com/project/anyfetbiorxomwqtfept/editor`);
            
        } else {
            console.log(`❌ Test failed - could not find test guest with token: ${testToken}`);
            console.log(`🔍 Let me check what data was imported...`);
            
            const allGuests = await supabaseRequest('guests?select=name,token&limit=5');
            if (allGuests.length > 0) {
                console.log('📋 Sample imported guests:');
                allGuests.forEach((guest, i) => {
                    console.log(`   ${i+1}. ${guest.name} (${guest.token})`);
                });
            } else {
                console.log('❌ No guests found in database');
            }
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

/**
 * Main setup function
 */
async function setupSupabase() {
    try {
        await createTable();
        await importGuests();
        await testIntegration();
        
        console.log(`\n🎊 Supabase setup complete!`);
        console.log(`🎯 Your Golden Jubilee RSVP system now has real-time database tracking!`);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        
        if (error.message.includes('JWT')) {
            console.log('\n💡 This usually means there\'s an issue with the API key');
            console.log('   - Make sure you copied the complete anon key');
            console.log('   - The key should start with "eyJ" and be very long');
        }
    }
}

// Run the setup
setupSupabase();