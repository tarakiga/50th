// Script to generate unique tokens for Guest1.json and Guest2.json
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

function processGuestFile(filename, eventName) {
  const filePath = path.join('contacts', filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File ${filename} not found`);
    return 0;
  }

  // Read the file
  const guests = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📋 Processing ${filename} - Found ${guests.length} guests`);

  // Generate tokens for guests with blank tokens
  let tokensGenerated = 0;
  guests.forEach(guest => {
    if (!guest.Token || guest.Token.trim() === '') {
      guest.Token = generateToken();
      tokensGenerated++;
    }
  });

  // Save the updated file
  fs.writeFileSync(filePath, JSON.stringify(guests, null, 2));
  console.log(`✅ Generated ${tokensGenerated} tokens for ${eventName}`);
  
  // Show example links
  console.log(`📱 Example links for ${eventName}:`);
  guests.slice(0, 3).forEach((guest, i) => {
    const route = filename === 'Guest1.json' ? 'tradparty' : 'cocktail';
    console.log(`   ${i + 1}. ${guest.Name}: https://yourdomain.com/${route}?token=${guest.Token}`);
  });
  console.log('');

  return tokensGenerated;
}

function generateLinkFiles() {
  console.log('📝 Generating link files for easy sharing...\n');

  // Generate Traditional Party links
  const guest1Path = path.join('contacts', 'Guest1.json');
  if (fs.existsSync(guest1Path)) {
    const tradPartyGuests = JSON.parse(fs.readFileSync(guest1Path, 'utf8'));
    let tradPartyLinks = '# TRADITIONAL PARTY / DISCO TECH INVITATION LINKS\n';
    tradPartyLinks += '(Replace "yourdomain.com" with your actual deployed URL)\n\n';
    tradPartyGuests.forEach(guest => {
      tradPartyLinks += `${guest.Name}: https://yourdomain.com/tradparty?token=${guest.Token}\n`;
    });
    fs.writeFileSync('tradparty-links.txt', tradPartyLinks);
    console.log(`✅ Created tradparty-links.txt with ${tradPartyGuests.length} links`);
  }

  // Generate Cocktail links
  const guest2Path = path.join('contacts', 'Guest2.json');
  if (fs.existsSync(guest2Path)) {
    const cocktailGuests = JSON.parse(fs.readFileSync(guest2Path, 'utf8'));
    let cocktailLinks = '# COCKTAIL EVENT INVITATION LINKS\n';
    cocktailLinks += '(Replace "yourdomain.com" with your actual deployed URL)\n\n';
    cocktailGuests.forEach(guest => {
      cocktailLinks += `${guest.Name}: https://yourdomain.com/cocktail?token=${guest.Token}\n`;
    });
    fs.writeFileSync('cocktail-links.txt', cocktailLinks);
    console.log(`✅ Created cocktail-links.txt with ${cocktailGuests.length} links`);
  }
}

async function main() {
  console.log('🚀 Generating tokens for existing guest files...\n');

  try {
    // Process both guest files
    const tradPartyTokens = processGuestFile('Guest1.json', 'Traditional Party');
    const cocktailTokens = processGuestFile('Guest2.json', 'Cocktail');

    const totalTokens = tradPartyTokens + cocktailTokens;
    console.log(`🎯 Summary:`);
    console.log(`   Total tokens generated: ${totalTokens}`);
    console.log(`   Traditional Party: ${tradPartyTokens} tokens`);
    console.log(`   Cocktail: ${cocktailTokens} tokens\n`);

    // Generate link files
    generateLinkFiles();

    console.log(`\n🎉 All done! Next steps:`);
    console.log(`   1. Check your updated Guest1.json and Guest2.json files`);
    console.log(`   2. Use tradparty-links.txt and cocktail-links.txt for sharing`);
    console.log(`   3. Deploy your app to get real URLs`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();