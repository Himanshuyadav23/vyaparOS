# WhatsApp API Integration Setup

This application supports multiple WhatsApp API providers for sending messages programmatically. The system will automatically fall back to WhatsApp link method if API is not configured.

## Supported Providers

1. **WhatsApp Cloud API (Meta)** - Recommended
2. **Twilio WhatsApp API**
3. **Generic WhatsApp Business API**
4. **Link Method** (Fallback) - Opens WhatsApp Web/App with pre-filled message

## Configuration

Add the following environment variables to your `.env.local` file:

### Option 1: WhatsApp Cloud API (Meta) - Recommended

```env
WHATSAPP_API_TYPE=cloud
WHATSAPP_PHONE_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
```

**How to get these:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add WhatsApp product to your app
4. Get Phone Number ID from WhatsApp > API Setup
5. Generate Access Token with `whatsapp_business_messaging` permission

### Option 2: Twilio WhatsApp API

```env
WHATSAPP_API_TYPE=twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**How to get these:**
1. Sign up for [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from Twilio Console
3. Enable WhatsApp Sandbox or use approved WhatsApp Business number
4. Set `TWILIO_WHATSAPP_FROM` to your Twilio WhatsApp number

### Option 3: Generic WhatsApp Business API

```env
WHATSAPP_API_TYPE=generic
WHATSAPP_API_URL=https://your-api-endpoint.com/whatsapp/send
WHATSAPP_ACCESS_TOKEN=your_api_token (optional)
```

### Option 4: Link Method (Default - No Configuration Needed)

If no API is configured, the system will automatically use WhatsApp link method (`wa.me`) which opens WhatsApp Web/App with a pre-filled message.

## How It Works

1. **User clicks "Inquire"** on a catalog item or dead stock listing
2. **System fetches seller/supplier phone number** from user profile
3. **Creates formatted message** with product details and buyer information
4. **Sends via WhatsApp API** (if configured) or opens WhatsApp link
5. **Increments inquiry count** for analytics

## API Endpoint

The WhatsApp API endpoint is available at:
```
POST /api/whatsapp/send
```

**Request Body:**
```json
{
  "to": "919876543210",
  "message": "Hello! I'm interested in...",
  "productName": "Product Name",
  "type": "catalog" // or "deadstock"
}
```

**Response:**
```json
{
  "success": true,
  "method": "cloud_api", // or "twilio", "generic", "link"
  "messageId": "wamid.xxx" // if sent via API
}
```

## Message Format

The system automatically formats messages with:
- Product name and category
- Price information
- Quantity/min order details
- Seller/supplier name
- Buyer contact information (if logged in)

## Testing

1. **Without API Configuration:**
   - System will use WhatsApp link method
   - Opens WhatsApp Web/App with pre-filled message
   - Works immediately without any setup

2. **With API Configuration:**
   - Messages are sent programmatically
   - No need for user to open WhatsApp manually
   - Better tracking and analytics

## Troubleshooting

- **"Phone number not available"**: Ensure sellers/suppliers have phone numbers in their user profiles
- **API errors**: Check environment variables are set correctly
- **Fallback to link**: If API fails, system automatically falls back to link method
- **Phone number format**: System automatically cleans phone numbers (removes non-digits)

## Security Notes

- WhatsApp API credentials should be kept secure
- Never commit `.env.local` file to version control
- Use environment variables for all sensitive data
- API endpoint requires authentication (user must be logged in)
