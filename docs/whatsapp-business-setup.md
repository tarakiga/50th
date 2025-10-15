# WhatsApp Business API Setup Guide 📱

This guide walks you through getting WhatsApp Business API access to send your Golden Jubilee invitations automatically.

## 🎯 **What You'll Get:**
- Send 300+ messages in **10-15 minutes**
- **2-second delays** between messages (safe rate limiting)
- **Real-time progress** tracking
- **Delivery confirmations** with message IDs
- **Error handling** and retry logic
- **Cost**: ~$1.50-3.00 for all invitations

## 🚀 **Provider Options (Choose One):**

---

## **Option 1: Twilio (Recommended - Easiest)**

### **Why Twilio?**
- ✅ **5-minute setup** - Fastest to get started
- ✅ **$20 free credit** - Covers your invitations
- ✅ **Excellent documentation**
- ✅ **Reliable delivery**

### **Setup Steps:**

1. **Create Account**: [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Sign up (free)
   - Get $20 credit automatically

2. **Enable WhatsApp**: 
   - Go to Console → Messaging → WhatsApp
   - Click "Get started with WhatsApp"
   - Complete the setup wizard

3. **Get Your Credentials**:
   ```
   Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Auth Token: your_auth_token_here
   WhatsApp Number: +1415XXXXXXX (provided by Twilio)
   ```

4. **Add to Your .env File**:
   ```bash
   # Use Twilio's WhatsApp service
   WHATSAPP_CLOUD_API_TOKEN=your_auth_token_here
   WHATSAPP_PHONE_NUMBER_ID=your_account_sid_here
   TWILIO_FROM_NUMBER=+1415XXXXXXX
   ```

5. **Test & Send**:
   ```bash
   cd scripts
   node send-invitations-whatsapp.js
   ```

**Cost**: ~$0.005 per message = $1.50 for 300 messages

---

## **Option 2: Meta Business (Official - More Setup)**

### **Why Meta Direct?**
- ✅ **Official Facebook/Meta** service
- ✅ **Cheapest rates** - $0.003 per message
- ✅ **Direct API access**
- ❌ **More complex setup**

### **Setup Steps:**

1. **Create Meta Developer Account**: [developers.facebook.com](https://developers.facebook.com)

2. **Create New App**:
   - Click "Create App"
   - Choose "Business" type
   - Fill in app details

3. **Add WhatsApp Product**:
   - Go to "Add a product"
   - Select "WhatsApp"
   - Click "Set up"

4. **Get Test Credentials**:
   ```
   Temporary Access Token: EAAxxxxxxxxxxxxxxxxxxxxx
   Phone Number ID: 1234567890123456
   ```

5. **Add to Your .env File**:
   ```bash
   WHATSAPP_CLOUD_API_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
   WHATSAPP_PHONE_NUMBER_ID=1234567890123456
   ```

6. **Test & Send**:
   ```bash
   cd scripts
   node send-invitations-whatsapp.js
   ```

**Note**: Test credentials work for 24-48 hours. For production, you need to complete business verification.

---

## **Option 3: 360Dialog (Business-Friendly)**

### **Why 360Dialog?**
- ✅ **Business-focused** - Made for companies
- ✅ **Quick approval** - Faster than Meta direct
- ✅ **Good support**
- ✅ **Competitive pricing**

### **Setup Steps:**

1. **Sign Up**: [360dialog.com](https://www.360dialog.com)
   - Create business account
   - Choose "WhatsApp Business API"

2. **Verify Business**:
   - Upload business documents
   - Wait for approval (usually 24-48 hours)

3. **Get Credentials**:
   ```
   API Key: D7xxxxxxxxxxxxxxxxxxxxx
   Phone Number ID: 234567890123456789
   ```

4. **Add to Your .env File**:
   ```bash
   WHATSAPP_CLOUD_API_TOKEN=D7xxxxxxxxxxxxxxxxxxxxx
   WHATSAPP_PHONE_NUMBER_ID=234567890123456789
   ```

**Cost**: ~$0.004 per message = $1.20 for 300 messages

---

## **Option 4: Infobip (Enterprise)**

### **Why Infobip?**
- ✅ **Global reach** - Works worldwide
- ✅ **High delivery rates**
- ✅ **Advanced features**
- ❌ **Higher minimum spend**

### **Setup Steps:**

1. **Contact Sales**: [infobip.com](https://www.infobip.com)
2. **Business Verification**: Required
3. **Get API credentials**
4. **Minimum $100 credit** required

---

## **🚀 Quick Start (Twilio - 5 Minutes):**

### **1. Sign Up & Get Credits**
```
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (free)
3. Get $20 free credit (covers 4,000 messages!)
```

### **2. Enable WhatsApp**
```
1. Go to Console → Messaging → WhatsApp
2. Click "Get started with WhatsApp"
3. Follow the setup wizard (2 minutes)
```

### **3. Copy Your Credentials**
```
Account SID: ACxxxxxxxxxxxxxxx  (your WHATSAPP_PHONE_NUMBER_ID)
Auth Token: your_auth_token     (your WHATSAPP_CLOUD_API_TOKEN)  
WhatsApp Number: +1415XXXXXXX   (Twilio provides this)
```

### **4. Update Your .env File**
```bash
# Copy your actual credentials here
WHATSAPP_CLOUD_API_TOKEN=your_real_auth_token
WHATSAPP_PHONE_NUMBER_ID=AC_your_real_account_sid
```

### **5. Send All Invitations**
```bash
cd scripts
node send-invitations-whatsapp.js
```

**Done!** Your script will send all invitations automatically! 🎉

---

## **📋 What The Script Does:**

1. **Loads your guest lists** (Guest1.json, Guest2.json)
2. **For each guest**:
   - Creates personalized message with their name
   - Includes their unique invitation link
   - Sends via WhatsApp Business API
   - Waits 2 seconds (rate limiting)
   - Logs success/failure

3. **Provides final report**:
   - Total sent: 287
   - Total failed: 13
   - Error details for failed sends

## **📱 Example Message Sent:**

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

---

## **🛡️ Safety Features:**

- **Rate Limiting**: 2-second delays prevent account suspension
- **Error Handling**: Invalid numbers are skipped, not crashed
- **Retry Logic**: Temporary failures are retried automatically  
- **Progress Tracking**: See each message being sent in real-time
- **Detailed Logs**: Know exactly what succeeded and what failed

---

## **💰 Cost Breakdown:**

### **Your Guest List:**
- Traditional Party: ~100 guests
- Cocktail Reception: ~200 guests  
- **Total**: ~300 messages

### **Provider Costs:**
- **Twilio**: $1.50 (with $20 free credit = FREE!)
- **Meta Direct**: $0.90 (cheapest)
- **360Dialog**: $1.20
- **Infobip**: $1.50

**All providers are very affordable for your use case!**

---

## **🚀 Recommendation:**

**Start with Twilio** because:
- ✅ **5-minute setup**
- ✅ **$20 free credit** (covers your invitations + extras)
- ✅ **Most reliable**
- ✅ **Best documentation**
- ✅ **Works immediately**

You can literally be sending invitations in **5 minutes**! 🎊

---

## **🆘 Troubleshooting:**

### **"API credentials missing"**
- Check your `.env` file has the correct tokens
- Make sure no extra spaces or quotes

### **"Phone number not verified"**  
- Some providers require phone number verification first
- Check your provider dashboard

### **"Rate limit exceeded"**
- Script has built-in delays, but if you hit limits:
- Increase `DELAY_BETWEEN_MESSAGES` in the script
- Contact your provider for higher limits

### **"Message template not approved"**
- Our script uses direct text messages (no templates needed)
- If your provider requires templates, they'll guide you

---

## **🎉 Ready to Set Up?**

1. **Choose Twilio** (recommended) or another provider above
2. **Follow their 5-minute setup**  
3. **Copy credentials to your .env file**
4. **Run the script**:
   ```bash
   cd scripts  
   node send-invitations-whatsapp.js
   ```

Your Golden Jubilee invitations will be sent automatically to all 300+ guests! 🎊👑

---

*Need help with setup? The provider support teams are very helpful and can guide you through any issues.*