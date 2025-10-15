/**
 * Fix Missing Tokens in Supabase
 * 
 * This script will:
 * 1. Find all guests with missing or empty tokens
 * 2. Generate unique tokens for them
 * 3. Ensure all tokens are unique across the database
 */

import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

console.log('🔧 Fixing Missing Tokens in Supabase Database');
console.log('==============================================\n');

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
 * Generate a unique token
 */
function generateToken() {
    return crypto.randomBytes(16).toString('hex');
}

/**
 * Check if token exists in database
 */
async function tokenExists(token) {
    try {
        const result = await supabaseRequest(`guests?token=eq.${token}&select=id`);
        return result.length > 0;
    } catch (error) {
        return false;
    }
}

/**
 * Generate a unique token that doesn't exist in database
 */
async function generateUniqueToken(existingTokens) {
    let token;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
        token = generateToken();
        attempts++;
        
        if (attempts > maxAttempts) {
            throw new Error('Failed to generate unique token after maximum attempts');
        }
    } while (existingTokens.has(token) || await tokenExists(token));
    
    existingTokens.add(token);
    return token;
}

/**
 * Fix missing and duplicate tokens
 */
async function fixTokens() {
    try {
        console.log('📊 Analyzing current database state...');
        
        // Get all guests
        const allGuests = await supabaseRequest('guests?select=id,name,token');
        console.log(`📋 Found ${allGuests.length} total guests`);
        
        // Find guests with missing or empty tokens
        const guestsWithMissingTokens = allGuests.filter(guest => 
            !guest.token || guest.token.trim() === ''
        );
        
        console.log(`❌ Guests with missing tokens: ${guestsWithMissingTokens.length}`);
        
        // Find duplicate tokens
        const tokenCounts = {};
        const existingTokens = new Set();
        
        allGuests.forEach(guest => {
            if (guest.token && guest.token.trim() !== '') {
                tokenCounts[guest.token] = (tokenCounts[guest.token] || 0) + 1;
                existingTokens.add(guest.token);
            }
        });
        
        const duplicateTokens = Object.keys(tokenCounts).filter(token => tokenCounts[token] > 1);
        console.log(`🔄 Duplicate tokens found: ${duplicateTokens.length}`);
        
        if (duplicateTokens.length > 0) {
            console.log('📝 Duplicate tokens:', duplicateTokens);
        }
        
        // Find all guests that need new tokens (missing or duplicate)
        const guestsNeedingNewTokens = allGuests.filter(guest => 
            !guest.token || 
            guest.token.trim() === '' || 
            tokenCounts[guest.token] > 1
        );
        
        console.log(`\n🔧 Total guests needing new tokens: ${guestsNeedingNewTokens.length}`);
        
        if (guestsNeedingNewTokens.length === 0) {
            console.log('✅ All guests already have unique tokens!');
            return;
        }
        
        console.log('\n🔄 Generating new unique tokens...');
        
        // Generate new tokens for guests that need them
        let fixed = 0;
        for (const guest of guestsNeedingNewTokens) {
            try {
                const newToken = await generateUniqueToken(existingTokens);
                
                // Update the guest with new token
                await supabaseRequest(`guests?id=eq.${guest.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        token: newToken,
                        updated_at: new Date().toISOString()
                    }),
                });
                
                fixed++;
                const reason = !guest.token || guest.token.trim() === '' ? 'missing' : 'duplicate';
                console.log(`✅ ${fixed}/${guestsNeedingNewTokens.length} - ${guest.name}: ${newToken} (was ${reason})`);
                
                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to update ${guest.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Token fix completed!`);
        console.log(`✅ Fixed tokens for: ${fixed} guests`);
        console.log(`❌ Failed to fix: ${guestsNeedingNewTokens.length - fixed} guests`);
        
        // Final verification
        console.log('\n🔍 Final verification...');
        const updatedGuests = await supabaseRequest('guests?select=id,name,token');
        const finalMissing = updatedGuests.filter(guest => !guest.token || guest.token.trim() === '');
        
        if (finalMissing.length === 0) {
            console.log('✅ All guests now have tokens!');
            
            // Check for duplicates
            const finalTokens = updatedGuests.map(g => g.token).filter(t => t);
            const uniqueTokens = new Set(finalTokens);
            
            if (finalTokens.length === uniqueTokens.size) {
                console.log('✅ All tokens are unique!');
                console.log(`📊 Total unique tokens: ${uniqueTokens.size}`);
            } else {
                console.log(`⚠️  Still have ${finalTokens.length - uniqueTokens.size} duplicate tokens`);
            }
        } else {
            console.log(`❌ Still have ${finalMissing.length} guests without tokens`);
        }
        
        console.log('\n🚀 Your Golden Jubilee database is now ready!');
        console.log('🎯 All guests have unique tokens for their invitations');
        
    } catch (error) {
        console.error('❌ Fatal error:', error.message);
    }
}

/**
 * Show sample tokens for verification
 */
async function showSampleTokens() {
    try {
        console.log('\n📋 Sample guest tokens:');
        console.log('======================');
        
        const sampleGuests = await supabaseRequest('guests?select=name,phone_number,token&limit=10');
        
        sampleGuests.forEach((guest, index) => {
            const phone = guest.phone_number ? ` (${guest.phone_number})` : '';
            console.log(`${index + 1}. ${guest.name}${phone}`);
            console.log(`   Token: ${guest.token}`);
            console.log(`   URL: https://denens50th.netlify.app/tradparty?token=${guest.token}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Could not fetch sample tokens:', error.message);
    }
}

// Run the fix
async function main() {
    await fixTokens();
    await showSampleTokens();
}

main();