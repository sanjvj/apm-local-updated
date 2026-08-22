import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Smartphone, Building2, CheckCircle2, Lock } from 'lucide-react';

export interface RazorpayCheckoutModalProps {
  amount: number;
  orderId: string;
  customerName: string;
  customerPhone: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export const RazorpayCheckoutModal: FC<RazorpayCheckoutModalProps> = ({
  amount,
  orderId,
  customerName,
  customerPhone,
  onSuccess,
  onClose,
}) => {
  const [razorpayKey, setRazorpayKey] = useState<string>(() => {
    return localStorage.getItem('apm_razorpay_key') || 'rzp_test_APMMadurai2026';
  });
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('qr');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(false);

  // Load Razorpay SDK script dynamically if key is provided
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleLaunchOfficialRazorpaySDK = () => {
    if ((window as any).Razorpay && razorpayKey.trim()) {
      try {
        const options = {
          key: razorpayKey.trim(),
          amount: amount * 100, // in paise
          currency: 'INR',
          name: 'Annapoorna Mithai',
          description: `Order ${orderId}`,
          image: 'https://annapoornamithai.com/logo.png',
          handler: function (response: any) {
            onSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: 'customer@annapoornamithai.com',
          },
          theme: {
            color: '#8B1A1A',
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Official Razorpay SDK initialization error:', err);
      }
    }

    // Fallback to interactive Razorpay simulation modal
    handleCompleteSimulatedPayment();
  };

  const handleCompleteSimulatedPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const mockPaymentId = `pay_rzp_${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccess(mockPaymentId);
    }, 1200);
  };

  const saveKey = (val: string) => {
    setRazorpayKey(val);
    localStorage.setItem('apm_razorpay_key', val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#0F172A] text-white rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-scale-in my-auto">
        
        {/* Razorpay Standard Brand Header */}
        <div className="bg-[#1E293B] p-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--crimson)] text-[var(--gold)] flex items-center justify-center font-serif font-bold text-lg border border-[var(--gold)]/30 shrink-0">
              AM
            </div>
            <div className="flex flex-col">
              <h3 className="font-sans font-bold text-sm text-white">Annapoorna Mithai</h3>
              <span className="font-mono text-[10px] text-slate-400">Order ID: {orderId}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="font-mono text-[10px] uppercase text-slate-400">Amount to Pay</span>
              <span className="font-mono font-bold text-lg text-emerald-400">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Razorpay Secured Badge */}
        <div className="bg-[#0B132B] px-4 py-2 flex items-center justify-between border-b border-slate-800 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Razorpay Secure Gateway</span>
          </div>
          <button
            type="button"
            onClick={() => setShowKeyConfig(!showKeyConfig)}
            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            {showKeyConfig ? 'Hide API Key Config' : 'Configure Razorpay Key'}
          </button>
        </div>

        {/* Optional Razorpay Key Configuration Bar for merchant testing */}
        {showKeyConfig && (
          <div className="bg-slate-900 p-3 border-b border-slate-800 flex flex-col gap-1.5 text-xs">
            <label className="text-[11px] font-mono text-slate-300 font-bold">Razorpay Key ID (Optional for Live SDK):</label>
            <input
              type="text"
              value={razorpayKey}
              onChange={(e) => saveKey(e.target.value)}
              placeholder="rzp_test_xxxxxxxxxxxxxx"
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-[10px] text-slate-400">
              Enter your live/test Razorpay API key to launch official Razorpay popup SDK!
            </span>
          </div>
        )}

        {/* Payment Methods Body */}
        <div className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Cards', icon: CreditCard },
              { id: 'netbanking', label: 'NetBanking', icon: Building2 },
              { id: 'cod', label: 'Cash', icon: CheckCircle2 },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = method === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id as any)}
                  className={`
                    py-2.5 px-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-sans font-semibold transition-all cursor-pointer
                    ${
                      isActive
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* UPI Options */}
          {method === 'upi' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Select UPI App / Scan QR
              </span>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'qr', label: 'Scan UPI QR Code', icon: QrCode },
                  { id: 'gpay', label: 'Google Pay', icon: Smartphone },
                  { id: 'phonepe', label: 'PhonePe', icon: Smartphone },
                  { id: 'paytm', label: 'Paytm UPI', icon: Smartphone },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUpiOption(u.id as any)}
                    className={`
                      p-2.5 rounded-lg border text-xs font-sans font-semibold flex items-center gap-2 transition-all cursor-pointer
                      ${
                        upiOption === u.id
                          ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }
                    `}
                  >
                    <u.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{u.label}</span>
                  </button>
                ))}
              </div>

              {upiOption === 'qr' && (
                <div className="flex flex-col items-center justify-center p-3 bg-white text-slate-900 rounded-xl gap-2 mt-1">
                  <div className="w-32 h-32 bg-slate-100 rounded-lg p-2 flex items-center justify-center border border-slate-300">
                    {/* Simulated Razorpay QR Code SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      <path fill="currentColor" d="M10,10 h30 v30 h-30 z M50,10 h40 v10 h-40 z M60,30 h30 v10 h-30 z M10,50 h10 v40 h-10 z M30,50 h20 v20 h-20 z M60,50 h30 v40 h-30 z M10,70 h30 v20 h-30 z M20,20 h10 v10 h-10 z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 font-bold">
                    Scan with GPay / PhonePe / Paytm to Pay ₹{amount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cards Option */}
          {method === 'card' && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[11px] text-slate-300">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 2222 3333 4444"
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="MM / YY"
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
                <input
                  type="password"
                  maxLength={3}
                  placeholder="CVV"
                  className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* NetBanking & COD */}
          {(method === 'netbanking' || method === 'cod') && (
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans">
              {method === 'netbanking' ? (
                <p>Select your bank (SBI, HDFC, ICICI, Axis, Canara) to proceed to secure NetBanking login.</p>
              ) : (
                <p>Pay cash directly to delivery partner upon order arrival at your doorstep.</p>
              )}
            </div>
          )}

          {/* Pay Button */}
          <button
            type="button"
            disabled={isProcessing}
            onClick={handleLaunchOfficialRazorpaySDK}
            className="
              w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-sans font-bold text-sm
              transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-blue-400/30
            "
          >
            <Lock className="w-4 h-4" />
            <span>{isProcessing ? 'Processing Payment...' : `Pay ₹${amount.toLocaleString('en-IN')} via Razorpay`}</span>
          </button>
        </div>

        {/* Modal Footer Bar */}
        <div className="bg-[#1E293B] p-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="font-mono text-[10px] text-slate-400">Pvt Ltd Registered Entity</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            Cancel Payment
          </button>
        </div>

      </div>
    </div>
  );
};
