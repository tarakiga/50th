// Script to investigate duplicate phone numbers in detail
const fs = require('fs');
const path = require('path');

function investigateDuplicates() {
  console.log('🔎 DETAILED INVESTIGATION OF DUPLICATE PHONE NUMBERS...\n');

  try {
    // Read both guest files
    const guest1Path = path.join('contacts', 'Guest1.json');
    const guest2Path = path.join('contacts', 'Guest2.json');

    const guest1Data = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
    const guest2Data = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));

    // Function to analyze duplicates in a single file
    function analyzeFileDuplicates(data, fileName) {
      console.log(`\n📋 ANALYZING ${fileName.toUpperCase()}:`);
      console.log(`Total guests: ${data.length}`);
      
      const phoneMap = new Map();
      const duplicates = [];
      
      data.forEach((guest, index) => {
        if (!guest.PhoneNumber || !guest.PhoneNumber.trim()) {
          return;
        }
        
        const phone = guest.PhoneNumber.trim();
        const guestInfo = {
          name: guest.Name,
          phone: phone,
          position: index + 1,
          token: guest.Token,
          rsvp: guest.RSVPStatus || 'None'
        };
        
        if (phoneMap.has(phone)) {
          // This is a duplicate
          const existing = phoneMap.get(phone);
          if (Array.isArray(existing)) {
            existing.push(guestInfo);
          } else {
            phoneMap.set(phone, [existing, guestInfo]);
          }
        } else {
          phoneMap.set(phone, guestInfo);
        }
      });
      
      // Find all duplicates
      phoneMap.forEach((value, phone) => {
        if (Array.isArray(value)) {
          duplicates.push({ phone, guests: value });
        }
      });
      
      if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} phone numbers with duplicates:`);
        duplicates.forEach((dup, index) => {
          console.log(`\n   ${index + 1}. 📞 ${dup.phone} (${dup.guests.length} guests):`);
          dup.guests.forEach(guest => {
            console.log(`      - "${guest.name}" (pos ${guest.position}) [Token: ${guest.token?.substring(0,8)}...] [RSVP: ${guest.rsvp}]`);
          });
        });
      } else {
        console.log('✅ No duplicate phone numbers found');
      }
      
      return duplicates;
    }

    // Analyze both files
    const guest1Duplicates = analyzeFileDuplicates(guest1Data, 'Guest1.json (Traditional Party)');
    const guest2Duplicates = analyzeFileDuplicates(guest2Data, 'Guest2.json (Cocktail)');

    // Cross-reference the duplicates
    console.log(`\n\n🔍 CROSS-REFERENCE ANALYSIS:`);
    
    // Check if the same phone numbers are duplicated in both files
    const guest1DuplicatePhones = new Set(guest1Duplicates.map(d => d.phone));
    const guest2DuplicatePhones = new Set(guest2Duplicates.map(d => d.phone));
    
    const commonDuplicates = [...guest1DuplicatePhones].filter(phone => guest2DuplicatePhones.has(phone));
    
    if (commonDuplicates.length > 0) {
      console.log(`⚠️  Phone numbers that are duplicated in BOTH files:`);
      commonDuplicates.forEach((phone, index) => {
        console.log(`\n   ${index + 1}. 📞 ${phone}:`);
        
        const guest1Dup = guest1Duplicates.find(d => d.phone === phone);
        const guest2Dup = guest2Duplicates.find(d => d.phone === phone);
        
        console.log(`      Traditional Party:`);
        guest1Dup.guests.forEach(g => {
          console.log(`         - "${g.name}" (pos ${g.position})`);
        });
        
        console.log(`      Cocktail:`);
        guest2Dup.guests.forEach(g => {
          console.log(`         - "${g.name}" (pos ${g.position})`);
        });
      });
    } else {
      console.log('✅ No phone numbers are duplicated in both files');
    }

    // Look for potential data entry errors
    console.log(`\n\n🔍 POTENTIAL DATA ENTRY ERRORS:`);
    
    // Check for very similar names that might be the same person
    function findSimilarNames() {
      const allNames = new Set();
      const similarGroups = [];
      
      [...guest1Data, ...guest2Data].forEach(guest => {
        if (guest.PhoneNumber && guest.PhoneNumber.trim()) {
          allNames.add({
            name: guest.Name,
            phone: guest.PhoneNumber.trim(),
            normalized: guest.Name.toUpperCase().replace(/[^A-Z]/g, '')
          });
        }
      });
      
      const nameArray = Array.from(allNames);
      
      // Check for names that are very similar
      for (let i = 0; i < nameArray.length; i++) {
        for (let j = i + 1; j < nameArray.length; j++) {
          const name1 = nameArray[i];
          const name2 = nameArray[j];
          
          // Check if names are similar but phones are the same
          if (name1.phone === name2.phone && name1.normalized !== name2.normalized) {
            const similarity = calculateSimilarity(name1.normalized, name2.normalized);
            if (similarity > 0.7) { // 70% similarity threshold
              similarGroups.push({
                phone: name1.phone,
                names: [name1.name, name2.name],
                similarity: Math.round(similarity * 100)
              });
            }
          }
        }
      }
      
      if (similarGroups.length > 0) {
        console.log(`Found ${similarGroups.length} cases of similar names with same phone:`);
        similarGroups.forEach((group, index) => {
          console.log(`   ${index + 1}. 📞 ${group.phone} (${group.similarity}% similar):`);
          group.names.forEach(name => {
            console.log(`      - "${name}"`);
          });
        });
      } else {
        console.log('✅ No obvious similar name variations found');
      }
    }
    
    // Simple similarity calculator
    function calculateSimilarity(str1, str2) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      
      if (longer.length === 0) return 1.0;
      
      const distance = levenshteinDistance(longer, shorter);
      return (longer.length - distance) / longer.length;
    }
    
    function levenshteinDistance(str1, str2) {
      const matrix = [];
      
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      
      return matrix[str2.length][str1.length];
    }
    
    findSimilarNames();

    // Summary and recommendations
    console.log(`\n\n🎯 SUMMARY AND RECOMMENDATIONS:`);
    console.log(`📊 Total duplicate phone issues found:`);
    console.log(`   - Traditional Party: ${guest1Duplicates.length} phone numbers affected`);
    console.log(`   - Cocktail: ${guest2Duplicates.length} phone numbers affected`);
    console.log(`   - Common duplicates: ${commonDuplicates.length} phone numbers`);
    
    if (guest1Duplicates.length > 0 || guest2Duplicates.length > 0) {
      console.log(`\n💡 RECOMMENDED ACTIONS:`);
      console.log(`   1. Verify if duplicate names are the same person or different people`);
      console.log(`   2. If same person: Remove duplicate entries`);
      console.log(`   3. If different people: One person needs a corrected phone number`);
      console.log(`   4. Check original source data to resolve conflicts`);
      console.log(`   5. Update guest lists after verification`);
    }

  } catch (error) {
    console.error('❌ Error investigating duplicates:', error.message);
  }
}

// Run the investigation
investigateDuplicates();