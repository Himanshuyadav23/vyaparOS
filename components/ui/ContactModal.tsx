"use client";

import { X, Phone, Mail, MessageCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerName: string;
  sellerEmail?: string;
  sellerPhone?: string;
  productName: string;
  onWhatsApp?: () => void;
  onEmail?: () => void;
}

export default function ContactModal({
  isOpen,
  onClose,
  sellerName,
  sellerEmail,
  sellerPhone,
  productName,
  onWhatsApp,
  onEmail,
}: ContactModalProps) {
  if (!isOpen) return null;

  const handleEmailClick = () => {
    if (sellerEmail) {
      const subject = encodeURIComponent(`Inquiry about ${productName}`);
      const body = encodeURIComponent(
        `Hello ${sellerName},\n\nI'm interested in ${productName}. Please contact me with more details.\n\nThank you!`
      );
      window.location.href = `mailto:${sellerEmail}?subject=${subject}&body=${body}`;
    }
    if (onEmail) onEmail();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Contact {sellerName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Get in touch about: <span className="font-semibold">{productName}</span>
          </p>
        </div>

        <div className="space-y-3">
          {sellerPhone && onWhatsApp && (
            <button
              onClick={() => {
                onWhatsApp();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              Contact via WhatsApp
            </button>
          )}

          {sellerPhone && (
            <a
              href={`tel:${sellerPhone}`}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Phone className="h-5 w-5" />
              Call {sellerPhone}
            </a>
          )}

          {sellerEmail && (
            <button
              onClick={handleEmailClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <Mail className="h-5 w-5" />
              Email {sellerEmail}
            </button>
          )}

          {!sellerPhone && !sellerEmail && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">
                No contact information available. Please try contacting them through the platform.
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
