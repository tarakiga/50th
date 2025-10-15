# 🗃️ Airtable Setup for Golden Jubilee RSVP Tracking

## Quick Setup (5 minutes)

### Step 1: Create Airtable Account
1. Go to [airtable.com](https://airtable.com)
2. Sign up for free account
3. Click "Create a base" → "Start from scratch"

### Step 2: Create Base Structure
1. **Base Name:** "Golden Jubilee RSVPs"
2. **Table Name:** "Guests" 
3. **Add these columns:**
   - `Name` (Single line text)
   - `PhoneNumber` (Single line text)
   - `Token` (Single line text)
   - `RSVPStatus` (Single select: None, Attending, Declined)
   - `WhatsAppDeliveryStatus` (Single line text)
   - `UpdatedAt` (Date & time)

### Step 3: Get API Credentials
1. Go to [airtable.com/developers/web/api/introduction](https://airtable.com/developers/web/api/introduction)
2. Click "Create token"
3. **Scopes:** Select `data.records:read` and `data.records:write`
4. **Access:** Choose your Golden Jubilee base
5. Copy the generated token (starts with `pat...`)

### Step 4: Get Base ID
1. Go to [airtable.com/api](https://airtable.com/api)
2. Select your "Golden Jubilee RSVPs" base
3. Copy the Base ID from the URL (starts with `app...`)

### Step 5: Update Environment Variables
Add to your `.env` file:
```bash
AIRTABLE_API_KEY=patxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AIRTABLE_BASE_ID=appxxxxxxxxxxxxxxx
AIRTABLE_TABLE_NAME=Guests
```

## Step 6: Import Guest Data (Optional)

You can either:

### Option A: Manual Entry
Add a few test records directly in Airtable with your test tokens:
- Name: Tar Akiga
- PhoneNumber: +96894398548  
- Token: a909f361f2ca4d8fbac37fcc531a8164
- RSVPStatus: None

### Option B: CSV Import
1. Export your guest data to CSV
2. Use Airtable's CSV import feature
3. Map columns correctly

### Option C: Keep Fallback (Recommended for testing)
The system will use fallback data if Airtable isn't configured, so you can test immediately.

## How It Works

### Development Mode:
- ✅ Uses your JSON files (as before)
- ✅ Falls back to embedded data if files unavailable

### Production Mode:
- 🎯 **Primary:** Uses Airtable for real-time RSVP tracking
- 🛡️ **Fallback:** Uses embedded data if Airtable unavailable
- 📝 **Logging:** Console logs for backup tracking

### Benefits:
- ✅ **Real-time RSVP tracking**
- ✅ **No file system dependencies** 
- ✅ **Works in any deployment environment**
- ✅ **WhatsApp confirmations always work**
- ✅ **Admin panels show live data**
- ✅ **Multiple fallback layers**

## Testing

1. **Test without Airtable:** Works immediately with fallback data
2. **Add Airtable credentials:** Enhanced with real-time tracking
3. **RSVP Flow:** 
   - Guest clicks invitation → WhatsApp sent → Airtable updated
   - Admin can see live RSVPs in Airtable and admin panels

## Cost
- **Airtable Free Plan:** Up to 1,200 records (perfect for your 300 guests)
- **If you need more:** $10/month for Pro plan

## Ready to Test!

The system is now production-ready and will work with or without Airtable configured. You can:

1. **Test immediately:** System uses fallback data
2. **Add Airtable later:** For enhanced tracking
3. **Deploy confidently:** No file system dependencies