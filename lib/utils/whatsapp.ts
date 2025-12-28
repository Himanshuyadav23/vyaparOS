/**
 * Generate WhatsApp inquiry URL
 */
export function generateWhatsAppInquiry(
  phoneNumber: string,
  listing: {
    productName: string;
    category: string;
    price: number;
    quantity: number;
    sellerName?: string;
  }
): string {
  const message = encodeURIComponent(
    `Hello! I'm interested in your dead stock listing:\n\n` +
      `Product: ${listing.productName}\n` +
      `Category: ${listing.category}\n` +
      `Price: ₹${listing.price}\n` +
      `Quantity Available: ${listing.quantity}\n` +
      (listing.sellerName ? `Seller: ${listing.sellerName}\n` : ``) +
      `\nPlease let me know more details.`
  );

  // Remove any non-digit characters from phone number
  const cleanPhone = phoneNumber.replace(/\D/g, "");

  return `https://wa.me/${cleanPhone}?text=${message}`;
}

/**
 * Open WhatsApp inquiry in new tab
 */
export function openWhatsAppInquiry(
  phoneNumber: string,
  listing: {
    productName: string;
    category: string;
    price: number;
    quantity: number;
    sellerName?: string;
  }
): void {
  const url = generateWhatsAppInquiry(phoneNumber, listing);
  window.open(url, "_blank");
}



