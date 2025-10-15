/**
 * Export Guest Data to CSV for Airtable Import
 * 
 * This script converts your JSON guest files to CSV format
 * that can be easily imported into Airtable.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function convertToCSV(guests) {
    // CSV headers that match your Airtable columns
    const headers = ['Name', 'PhoneNumber', 'Token', 'RSVPStatus', 'WhatsAppDeliveryStatus', 'UpdatedAt'];
    
    // Create CSV content
    let csv = headers.join(',') + '\n';
    
    guests.forEach(guest => {
        const row = [
            `"${guest.Name || ''}"`,
            `"${guest.PhoneNumber || ''}"`,
            `"${guest.Token || ''}"`,
            `"${guest.RSVPStatus || 'None'}"`,
            `"${guest.WhatsAppDeliveryStatus || ''}"`,
            `"${guest.UpdatedAt || ''}"`
        ];
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

function exportGuestsToCSV() {
    try {
        console.log('📊 Converting Guest Data to CSV for Airtable Import');
        console.log('================================================\n');
        
        // Load Guest1.json (Traditional Party)
        const guest1Path = path.join(__dirname, '..', 'contacts', 'Guest1.json');
        const guest2Path = path.join(__dirname, '..', 'contacts', 'Guest2.json');
        
        let allGuests = [];
        
        // Load Traditional Party guests
        if (fs.existsSync(guest1Path)) {
            const guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
            console.log(`📋 Loaded ${guest1Data.length} Traditional Party guests`);
            
            // Add event type to each guest for identification
            const tradGuests = guest1Data.map(guest => ({
                ...guest,
                Name: guest.Name + ' (Trad)'  // Add identifier
            }));
            
            allGuests.push(...tradGuests);
        }
        
        // Load Cocktail guests
        if (fs.existsSync(guest2Path)) {
            const guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));
            console.log(`🍸 Loaded ${guest2Data.length} Cocktail Reception guests`);
            
            // Add event type to each guest for identification
            const cocktailGuests = guest2Data.map(guest => ({
                ...guest,
                Name: guest.Name + ' (Cocktail)'  // Add identifier
            }));
            
            allGuests.push(...cocktailGuests);
        }
        
        console.log(`📱 Total guests: ${allGuests.length}`);
        
        // Convert to CSV
        const csvContent = convertToCSV(allGuests);
        
        // Save CSV file
        const outputPath = path.join(__dirname, 'golden-jubilee-guests.csv');
        fs.writeFileSync(outputPath, csvContent, 'utf8');
        
        console.log(`\n✅ CSV file created: ${outputPath}`);
        console.log('\n📋 NEXT STEPS:');
        console.log('=============');
        console.log('1. Open Airtable in your browser');
        console.log('2. Go to your "Golden Jubilee RSVPs" base');
        console.log('3. Click the "Guests" table');
        console.log('4. Click the "..." menu → "Import data" → "CSV file"');
        console.log(`5. Upload: ${outputPath}`);
        console.log('6. Map the columns correctly');
        console.log('7. Click "Import"');
        console.log('\n🎯 After import, your RSVP system will use live Airtable data!');
        
        // Show sample of what was exported
        console.log('\n📄 Sample of exported data:');
        console.log('===========================');
        const lines = csvContent.split('\n');
        lines.slice(0, 5).forEach(line => console.log(line));
        console.log('...');
        
    } catch (error) {
        console.error('❌ Error exporting to CSV:', error);
    }
}

// Run the export
exportGuestsToCSV();