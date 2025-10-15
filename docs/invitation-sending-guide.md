# Golden Jubilee Invitation Sending Guide 🎊

This guide provides multiple automated and semi-automated ways to send your Golden Jubilee invitation links to all guests efficiently.

## 📊 Your Current Guest Lists

- **Traditional Party**: ~100+ guests (Guest1.json)
- **Cocktail Reception**: ~200+ guests (Guest2.json)  
- **Total Invitations**: ~300+ personalized links to send

## 🚀 Method 1: WhatsApp Business API (Recommended)

**Best for**: Professional, automated sending with high deliverability

### Prerequisites
1. WhatsApp Business Account
2. WhatsApp Business API access
3. Approved message templates (if required)

### Setup
```bash
# Add to your .env file
WHATSAPP_CLOUD_API_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
```

### Usage
```bash
cd scripts
node send-invitations-whatsapp.js
```

**Features:**
- ✅ Sends to all guests automatically
- ✅ Rate limiting (2-second delays)
- ✅ Error handling and retry logic
- ✅ Personalized messages with guest names
- ✅ Real-time progress tracking
- ✅ Final delivery report

**Estimated Time**: 10-15 minutes for all invitations

---

## 📱 Method 2: SMS Bulk Sending

**Best for**: Wide reach, works on all phones

### Supported Providers
- **Twilio** (Recommended)
- **Infobip** 
- **Custom SMS API**

### Setup
```bash
# For Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token  
TWILIO_FROM_NUMBER=+1234567890

# For Infobip
INFOBIP_API_KEY=your_api_key
INFOBIP_FROM_NUMBER=your_sender_id
```

### Usage
```bash
cd scripts

# Test first (no actual sending)
node send-invitations-sms.js --dry-run

# Send with Twilio
node send-invitations-sms.js --provider=twilio

# Send with Infobip
node send-invitations-sms.js --provider=infobip
```

**Estimated Time**: 8-12 minutes for all invitations

---

## ✍️ Method 3: Manual Copy-Paste (No API Required)

**Best for**: When you don't have API access or prefer manual control

### Generate Messages
```bash
cd scripts

# WhatsApp format
node generate-manual-messages.js --format=whatsapp

# SMS format  
node generate-manual-messages.js --format=sms

# Email format
node generate-manual-messages.js --format=email

# Formal format
node generate-manual-messages.js --format=formal
```

This creates text files with all messages ready to copy-paste:
- `tradparty-invitations-whatsapp-2025-01-15.txt`
- `cocktail-invitations-whatsapp-2025-01-15.txt`

### Manual Sending Process
1. Open the generated text files
2. Copy each message
3. Paste into WhatsApp/SMS app
4. Send to the corresponding phone number

**Estimated Time**: 2-4 hours (depending on your typing speed)

---

## 🎯 Method 4: WhatsApp Web Automation (Semi-Automated)

**Best for**: Using personal WhatsApp without Business API

### Tools Needed
- Chrome browser
- WhatsApp Web
- Browser automation (manual clicking)

### Process
1. Generate WhatsApp format messages using Method 3
2. Open WhatsApp Web
3. Use contact list from generated files
4. Copy-paste messages one by one

**Pro Tips:**
- Use WhatsApp's broadcast lists for groups
- Save frequently used phrases as shortcuts
- Use browser extensions for faster copying

---

## 📧 Method 5: Email Campaigns (If You Have Email Addresses)

**Best for**: Formal invitations with rich formatting

### Prerequisites
- Email addresses for guests
- Email service (Gmail, Outlook, or email API)

### Usage
```bash
# Generate email format
node generate-manual-messages.js --format=email
```

Then use:
- **Gmail** with mail merge extensions
- **Outlook** bulk email features  
- **Email services** like Mailchimp, SendGrid

---

## 🔄 Hybrid Approach (Recommended)

**For maximum efficiency, combine methods:**

1. **WhatsApp Business API** → Primary contacts (80%)
2. **SMS** → Guests without WhatsApp (15%)
3. **Manual WhatsApp** → VIP guests or failed sends (5%)

### Sample Workflow
```bash
# Step 1: Automated WhatsApp sending
node send-invitations-whatsapp.js

# Step 2: SMS for any WhatsApp failures  
node send-invitations-sms.js --dry-run
node send-invitations-sms.js --provider=twilio

# Step 3: Manual copy-paste for VIPs or final few
node generate-manual-messages.js --format=whatsapp
```

---

## 📊 Monitoring and Tracking

### Built-in Features
- **Real-time Progress**: See each message being sent
- **Error Reporting**: Failed sends with reasons
- **Delivery Confirmation**: Message IDs for tracking
- **Final Summary**: Complete success/failure report

### Admin Dashboard
Monitor RSVPs in real-time:
- `https://denens50th.netlify.app/tradparty/admin`
- `https://denens50th.netlify.app/cocktail/admin`

---

## ⚡ Quick Start (5 Minutes)

**Fastest way to send all invitations:**

1. **Setup WhatsApp Business API** (if available):
   ```bash
   # Add credentials to .env
   WHATSAPP_CLOUD_API_TOKEN=your_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_id
   
   # Send all invitations
   cd scripts
   node send-invitations-whatsapp.js
   ```

2. **Or generate for manual sending**:
   ```bash
   cd scripts
   node generate-manual-messages.js --format=whatsapp
   # Opens text files with all messages ready to copy-paste
   ```

---

## 🎭 Message Examples

### WhatsApp Message Preview
```
🎉 *GOLDEN JUBILEE INVITATION* 🎉

Dear TERFA +1,

You are cordially invited to celebrate Denen Ikya's 50th Birthday!

*Golden Jubilee Traditional Party*

Click your personal invitation:
https://denens50th.netlify.app/tradparty?token=0c743ea9088453a65a33343e9ff4c0ee

Please RSVP by clicking the link above. Full event details will be shared after confirmation.

Looking forward to celebrating with you! 👑

*Invitation expires after event date*
```

### SMS Message Preview  
```
🎊 GOLDEN JUBILEE INVITATION

Dear TERFA +1,

You're invited to Denen Ikya's 50th Birthday Traditional Party!

Your personal invitation: https://denens50th.netlify.app/tradparty?token=0c743ea9088453a65a33343e9ff4c0ee

Please RSVP via the link. Full details shared after confirmation.

Looking forward to celebrating! 👑
```

---

## 🛡️ Security & Best Practices

### Rate Limiting
- **WhatsApp**: 2-second delays between messages
- **SMS**: 1.5-second delays between messages
- **Prevents**: Account suspension and failed sends

### Error Handling
- **Automatic Retries**: For temporary failures
- **Invalid Numbers**: Skipped with warnings
- **Network Issues**: Proper error reporting

### Privacy
- **Personal Tokens**: Each guest has unique access
- **No Address Sharing**: Venue details sent after RSVP
- **Secure Links**: Token-based authentication

---

## 🆘 Troubleshooting

### Common Issues

**"WhatsApp API credentials missing"**
```bash
# Check your .env file has:
WHATSAPP_CLOUD_API_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
```

**"Contact file not found"**
```bash
# Ensure files exist:
ls contacts/Guest1.json
ls contacts/Guest2.json
```

**"Message sending failed"**
- Check internet connection
- Verify API credentials
- Review phone number formats (+234...)

### Getting Help
- Check the console output for specific error messages
- Review the generated error reports
- Test with `--dry-run` flags first

---

## 💰 Cost Estimates

### WhatsApp Business API
- **Cost**: ~$0.005-0.01 per message
- **300 messages**: $1.50-3.00 total
- **Delivery Rate**: 95%+

### SMS (Twilio)
- **Cost**: ~$0.0075 per SMS
- **300 messages**: ~$2.25 total  
- **Delivery Rate**: 95%+

### Manual (WhatsApp Personal)
- **Cost**: Free
- **Time Investment**: 2-4 hours
- **Delivery Rate**: 99%

---

## 🎉 Ready to Send?

Choose your preferred method above and start sending those Golden Jubilee invitations! 

Your guests are waiting to celebrate this milestone with you! 👑🎊

---

*Need help? Check the troubleshooting section or review the generated error logs for specific issues.*