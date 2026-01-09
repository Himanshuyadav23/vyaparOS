/**
 * WhatsApp utility functions for opening WhatsApp with pre-filled messages
 */

export interface WhatsAppInquiryData {
  productName: string;
  category?: string;
  price?: number;
  quantity?: number;
  minOrderQuantity?: number;
  unit?: string;
  supplierName?: string;
  sellerName?: string;
  type: "catalog" | "deadstock";
  phoneNumber?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

/**
 * Sends WhatsApp message via API or opens WhatsApp link
 */
export async function sendWhatsAppInquiry(data: WhatsAppInquiryData): Promise<void> {
  try {
    // If no phone number provided, throw error
    if (!data.phoneNumber) {
      throw new Error("Phone number not available. Please contact the seller directly.");
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = data.phoneNumber.replace(/\D/g, "");

    // Validate phone number format (should be at least 10 digits)
    if (cleanPhone.length < 10) {
      throw new Error("Invalid phone number format.");
    }

    // Build message
    let message = `Hello! I'm interested in your ${data.type === "catalog" ? "product" : "dead stock listing"}:\n\n`;
    message += `Product: ${data.productName}\n`;
    
    if (data.category) {
      message += `Category: ${data.category}\n`;
    }
    
    if (data.price) {
      message += `Price: ₹${data.price}\n`;
    }
    
    if (data.type === "catalog" && data.minOrderQuantity) {
      message += `Min Order: ${data.minOrderQuantity} ${data.unit || "units"}\n`;
    } else if (data.type === "deadstock" && data.quantity) {
      message += `Quantity Available: ${data.quantity}\n`;
    }
    
    if (data.supplierName) {
      message += `Supplier: ${data.supplierName}\n`;
    } else if (data.sellerName) {
      message += `Seller: ${data.sellerName}\n`;
    }
    
    if (data.buyerName) {
      message += `\nMy Details:\n`;
      message += `Name: ${data.buyerName}\n`;
      if (data.buyerEmail) {
        message += `Email: ${data.buyerEmail}\n`;
      }
      if (data.buyerPhone) {
        message += `Phone: ${data.buyerPhone}\n`;
      }
    }
    
    message += `\nPlease let me know more details.`;

    // Try to send via WhatsApp API first
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          to: cleanPhone,
          message,
          productName: data.productName,
          type: data.type,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // If API returned a URL (fallback to link method), open it
        if (result.url) {
          window.open(result.url, "_blank");
        }
        // If message was sent via API, show success
        if (result.method && result.method !== 'link' && result.method !== 'link_fallback') {
          return; // Message sent successfully via API
        }
      }
    } catch (apiError) {
      console.error("WhatsApp API error, falling back to link method:", apiError);
    }

    // Fallback: Open WhatsApp link if API fails or not configured
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}

/**
 * Opens WhatsApp with a pre-filled inquiry message (legacy method - kept for compatibility)
 * @deprecated Use sendWhatsAppInquiry instead
 */
export async function openWhatsAppInquiry(data: WhatsAppInquiryData): Promise<void> {
  return sendWhatsAppInquiry(data);
}

/**
 * Get phone number from user ID
 */
export async function getUserPhoneNumber(userId: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/user/${userId}`);
    if (response.ok) {
      const userData = await response.json();
      return userData.phone || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user phone:", error);
    return null;
  }
}
