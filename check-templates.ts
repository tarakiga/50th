// Script to check existing WhatsApp templates
async function checkTemplates() {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
  const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || 'YOUR_BUSINESS_ACCOUNT_ID';
  
  if (!WHATSAPP_TOKEN) {
    console.error('WHATSAPP_CLOUD_API_TOKEN not found in environment');
    return;
  }

  console.log('Checking existing WhatsApp message templates...\n');

  try {
    // Get all message templates
    const url = `https://graph.facebook.com/v20.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch templates:', response.status, errorText);
      return;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      console.log('Available templates:');
      data.data.forEach((template: any, index: number) => {
        console.log(`${index + 1}. Name: ${template.name}`);
        console.log(`   Status: ${template.status}`);
        console.log(`   Language: ${template.language}`);
        console.log(`   Category: ${template.category}`);
        if (template.components) {
          template.components.forEach((component: any) => {
            if (component.type === 'BODY') {
              console.log(`   Body: ${component.text}`);
            }
          });
        }
        console.log('   ---');
      });
    } else {
      console.log('No templates found. You need to create a template first.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Load environment variables
import { config } from 'dotenv';
config();

checkTemplates();