import React from "react";
import { MapPin, Phone, Mail, X } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003527] px-8 py-6 flex items-start justify-between">
          <div>
            <h2
              className="text-2xl font-black text-white"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Contact Us
            </h2>
            <p className="text-white/60 text-sm mt-1">
              Let's structure your carbon assets together.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-none bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Contact Items */}
        <div className="p-8 space-y-6">
          {[
            {
              icon: <MapPin className="w-5 h-5" />,
              label: "Head Office",
              value: "358 Saraswatinagar, Azad Society Rd, Ambawadi, Ahmedabad 380015, India",
              href: null,
            },
            {
              icon: <Phone className="w-5 h-5" />,
              label: "Call Us Directly",
              value: "+91 9824025431",
              href: "tel:+919824025431",
            },
            {
              icon: <Mail className="w-5 h-5" />,
              label: "Email Support",
              value: "support@earthcarbonfoundation.org",
              href: "mailto:support@earthcarbonfoundation.org",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#b0f0d6] text-[#003527] rounded-none flex items-center justify-center flex-shrink-0 mt-1">
                {item.icon}
              </div>
              <div className="pt-1">
                <p className="text-[10px] font-black text-[#003527]/50 uppercase tracking-widest mb-1">
                  {item.label}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm font-bold text-[#003527] hover:underline"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm font-bold text-gray-800">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-8 pb-8">
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#003527] text-white font-black rounded-none hover:bg-[#002219] transition-all uppercase tracking-widest text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
