import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, Lock, RefreshCw, Truck, Phone, MapPin, Mail } from 'lucide-react';

export type PolicyTab = 'terms' | 'privacy' | 'refund' | 'shipping' | 'contact';

export interface PolicyModalProps {
  initialTab?: PolicyTab;
  onClose: () => void;
}

export const PolicyModal: FC<PolicyModalProps> = ({ initialTab = 'terms', onClose }) => {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in my-auto">
        
        {/* Modal Header */}
        <div className="bg-[#1F080A] text-[#FAF7F2] p-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B1A1A] text-[var(--gold)] flex items-center justify-center border border-[var(--gold)]/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-display font-bold text-xl text-white">
                Legal & Business Policies
              </h2>
              <span className="font-mono text-xs text-[#E5A93B]">
                Razorpay Verified Compliance · Annapoorna Mithai Madurai
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 py-2">
          {[
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock },
            { id: 'refund', label: 'Refund & Cancellation', icon: RefreshCw },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'contact', label: 'Contact Us & Legal Info', icon: Phone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as PolicyTab)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer shrink-0
                  ${
                    isActive
                      ? 'bg-[var(--crimson)] text-white shadow-2xs'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body Content Area */}
        <div className="p-6 overflow-y-auto flex-1 font-sans text-gray-800 text-sm leading-relaxed flex flex-col gap-6">
          
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Terms and Conditions
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  Last updated: August 20, 2026
                </span>
              </div>

              <p>
                Welcome to <strong>Annapoorna Mithai Local Delivery</strong> ("Website", "We", "Us", or "Our"), operated by <strong>Annapoorna Mithai Local Delivery Pvt. Ltd.</strong> By accessing or placing an order through our platform, you ("Customer", "User") agree to be bound by the following terms and conditions.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">1. Service Overview</h4>
              <p>
                We provide online ordering and same-day hyperlocal delivery of fresh traditional sweets, savouries, Karupatti specialties, and snack items across Madurai city pincodes (625001 – 625020).
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">2. Pricing and Taxes</h4>
              <p>
                All prices listed on the website are displayed in Indian Rupees (INR ₹) and are inclusive of all applicable local goods and services taxes (GST). Prices are subject to change without prior notice, but price changes will not affect orders already confirmed and paid.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">3. Online Payments & Security</h4>
              <p>
                Online payments are processed securely via <strong>Razorpay Payment Gateway</strong> using 256-bit SSL encryption. We accept UPI (GPay, PhonePe, Paytm, BHIM), Credit Cards, Debit Cards, Net Banking, and Cash on Delivery (COD). We do not store or process raw credit/debit card numbers or bank credentials on our servers.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">4. User Obligations</h4>
              <p>
                You agree to provide accurate and complete contact details, recipient name, phone number, and full delivery address with postal code. Failure to provide correct details may result in delivery delays or order non-fulfillment without refund eligibility.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">5. Governing Law and Jurisdiction</h4>
              <p>
                These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Madurai, Tamil Nadu, India.
              </p>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Privacy Policy
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  Razorpay Merchant Compliance Approved
                </span>
              </div>

              <p>
                At <strong>Annapoorna Mithai</strong>, we respect your privacy and are committed to protecting the personal information you share with us. This policy outlines how we collect, use, and safeguard your data.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">1. Information We Collect</h4>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
                <li><strong>Contact Details:</strong> Customer name, delivery address, pincode, mobile phone number, email address.</li>
                <li><strong>Order Information:</strong> Items ordered, payment mode selected, slot preference, order timestamps.</li>
                <li><strong>Technical Data:</strong> Browser type, IP address, device type for session and cart state management.</li>
              </ul>

              <h4 className="font-bold text-base text-gray-900 mt-2">2. How We Use Your Information</h4>
              <p>
                Your information is used solely for processing orders, scheduling deliveries, sending WhatsApp order status updates, providing customer support, and fulfilling legal/tax obligations. We do not sell or rent customer personal data to third parties.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">3. Payment Gateway Data Processing</h4>
              <p>
                All online transactions are handled directly by Razorpay Payment Gateway. Razorpay collects transaction details in compliance with PCI-DSS standards. You can view Razorpay's privacy policy directly on their website.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">4. Data Security</h4>
              <p>
                We implement industry-standard administrative, physical, and electronic security measures to protect your personal information against unauthorized access, loss, or misuse.
              </p>
            </div>
          )}

          {/* TAB 3: REFUND AND CANCELLATION POLICY */}
          {activeTab === 'refund' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Refund & Cancellation Policy
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  Clear 3–5 Day Refund Guarantee
                </span>
              </div>

              <p>
                We strive to deliver fresh, high-quality sweets and savouries. Please read our refund and cancellation terms below.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">1. Order Cancellation</h4>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
                <li><strong>Before Dispatch:</strong> You may cancel your order free of charge before the order status is updated to <em>"Out for Delivery"</em> by contacting our helpline at <strong>+91 98765 43210</strong>. A 100% refund will be initiated immediately.</li>
                <li><strong>After Dispatch:</strong> Once an order is handed over to our delivery partner and is out for delivery, cancellations are not permitted due to the perishable nature of fresh sweets.</li>
              </ul>

              <h4 className="font-bold text-base text-gray-900 mt-2">2. Refunds Eligibility</h4>
              <p>
                A full refund or immediate replacement will be provided under the following circumstances:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
                <li>If the delivered items are physically damaged, spoiled, or spilled upon delivery.</li>
                <li>If an incorrect item was delivered compared to your order confirmation.</li>
                <li>If an order is cancelled by the kitchen due to stock unavailability or unserviceable address.</li>
              </ul>

              <h4 className="font-bold text-base text-gray-900 mt-2">3. Refund Processing Timeline</h4>
              <p>
                Approved refunds are credited back to the customer's original payment method (Bank Account / Credit Card / UPI) via Razorpay within <strong>3 to 5 business days</strong> from the date of refund approval.
              </p>
            </div>
          )}

          {/* TAB 4: SHIPPING AND DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Shipping & Delivery Policy
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  Madurai Local Express Same-Day Delivery
                </span>
              </div>

              <p>
                Annapoorna Mithai provides dedicated same-day local delivery service within Madurai city limits.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">1. Delivery Coverage Area</h4>
              <p>
                We service all postal pincodes in Madurai city, including <strong>625001, 625002, 625003, 625016, 625017, 625018, 625020</strong> covering West Masi Street, TVS Nagar, KK Nagar, Anna Nagar, Periyar, and surrounding localities.
              </p>

              <h4 className="font-bold text-base text-gray-900 mt-2">2. Delivery Time Slots</h4>
              <p>
                Customers can select their preferred delivery window during checkout:
              </p>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
                <li>Morning Window: 10:00 AM – 1:00 PM IST</li>
                <li>Afternoon Window: 1:00 PM – 4:00 PM IST</li>
                <li>Evening Window: 4:00 PM – 6:00 PM IST</li>
                <li>Night Window: 7:00 PM – 9:00 PM IST</li>
              </ul>

              <h4 className="font-bold text-base text-gray-900 mt-2">3. Shipping Fees</h4>
              <ul className="list-disc pl-5 flex flex-col gap-1 text-xs">
                <li><strong>FREE Delivery:</strong> Available on all orders with a subtotal of ₹300 or above.</li>
                <li><strong>Standard Charge:</strong> A flat delivery fee of ₹40 applies to orders below ₹300.</li>
              </ul>
            </div>
          )}

          {/* TAB 5: CONTACT US & LEGAL MERCHANT INFO */}
          {activeTab === 'contact' && (
            <div className="flex flex-col gap-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="font-display font-bold text-2xl text-gray-900">
                  Contact Us & Legal Merchant Info
                </h3>
                <span className="font-mono text-xs text-gray-500">
                  Razorpay Required Registered Business Details
                </span>
              </div>

              <p>
                If you have questions regarding your order, payments, refunds, or general queries, please reach out to our customer support team:
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 font-sans text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[var(--crimson)] shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">Registered Legal Entity Name</span>
                    <span className="text-gray-800 font-semibold">Annapoorna Mithai Local Delivery Pvt. Ltd.</span>
                    <span className="text-gray-600">72, West Masi Street, Near Meenakshi Amman Temple, Madurai - 625001, Tamil Nadu, India</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-200 pt-3">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Helpline / WhatsApp Support</span>
                    <a href="tel:+919876543210" className="text-emerald-700 font-bold hover:underline">
                      +91 98765 43210 / 0452-2345678
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-gray-200 pt-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">Customer Support Email</span>
                    <a href="mailto:support@annapoornamithai.com" className="text-blue-700 font-bold hover:underline">
                      support@annapoornamithai.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="font-mono text-xs text-gray-500 hidden sm:inline">
            🔒 Razorpay Gateway Compliance Compliant Page
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--crimson)] text-white text-xs font-sans font-bold hover:bg-[var(--crimson-dark)] transition-all cursor-pointer shadow-sm ml-auto"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
};
