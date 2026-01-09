import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

/**
 * WhatsApp API endpoint to send messages
 * Supports multiple WhatsApp API providers:
 * 1. WhatsApp Cloud API (Meta)
 * 2. Twilio WhatsApp API
 * 3. Generic WhatsApp Business API
 */

interface WhatsAppMessageRequest {
  to: string; // Phone number in international format (e.g., 919876543210)
  message: string;
  productName?: string;
  type?: 'catalog' | 'deadstock';
}

async function postHandler(req: any) {
  try {
    if (!req.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: WhatsAppMessageRequest = await req.json();
    const { to, message, productName, type } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = to.replace(/\D/g, '');

    // Validate phone number
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Get WhatsApp API configuration from environment variables
    const whatsappApiType = process.env.WHATSAPP_API_TYPE || 'cloud'; // 'cloud', 'twilio', or 'generic'
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID;
    const whatsappAccessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g., whatsapp:+14155238886

    let result;

    switch (whatsappApiType) {
      case 'cloud':
        // WhatsApp Cloud API (Meta)
        if (!whatsappPhoneId || !whatsappAccessToken) {
          // Fallback to opening WhatsApp link if API not configured
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          return NextResponse.json({
            success: true,
            method: 'link',
            url: whatsappUrl,
            message: 'WhatsApp API not configured. Using link method.',
          });
        }

        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappAccessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: cleanPhone,
                type: 'text',
                text: {
                  body: message,
                },
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to send WhatsApp message');
          }

          result = {
            success: true,
            method: 'cloud_api',
            messageId: data.messages?.[0]?.id,
          };
        } catch (error: any) {
          console.error('WhatsApp Cloud API error:', error);
          // Fallback to link method
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          result = {
            success: true,
            method: 'link_fallback',
            url: whatsappUrl,
            error: error.message,
          };
        }
        break;

      case 'twilio':
        // Twilio WhatsApp API
        if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppFrom) {
          // Fallback to opening WhatsApp link
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          return NextResponse.json({
            success: true,
            method: 'link',
            url: whatsappUrl,
            message: 'Twilio WhatsApp API not configured. Using link method.',
          });
        }

        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

          const formData = new URLSearchParams();
          formData.append('From', twilioWhatsAppFrom);
          formData.append('To', `whatsapp:+${cleanPhone}`);
          formData.append('Body', message);

          const response = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to send WhatsApp message');
          }

          result = {
            success: true,
            method: 'twilio',
            messageId: data.sid,
          };
        } catch (error: any) {
          console.error('Twilio WhatsApp API error:', error);
          // Fallback to link method
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          result = {
            success: true,
            method: 'link_fallback',
            url: whatsappUrl,
            error: error.message,
          };
        }
        break;

      case 'generic':
        // Generic WhatsApp Business API
        if (!whatsappApiUrl) {
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          return NextResponse.json({
            success: true,
            method: 'link',
            url: whatsappUrl,
            message: 'Generic WhatsApp API not configured. Using link method.',
          });
        }

        try {
          const response = await fetch(whatsappApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(whatsappAccessToken && { 'Authorization': `Bearer ${whatsappAccessToken}` }),
            },
            body: JSON.stringify({
              to: cleanPhone,
              message,
              productName,
              type,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to send WhatsApp message');
          }

          result = {
            success: true,
            method: 'generic',
            data,
          };
        } catch (error: any) {
          console.error('Generic WhatsApp API error:', error);
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
          result = {
            success: true,
            method: 'link_fallback',
            url: whatsappUrl,
            error: error.message,
          };
        }
        break;

      default:
        // Default: Use WhatsApp link
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        result = {
          success: true,
          method: 'link',
          url: whatsappUrl,
        };
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('WhatsApp send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(postHandler);
