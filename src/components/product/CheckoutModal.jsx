import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ArrowRight, ArrowLeft, Shield, MapPin, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

export default function CheckoutModal({ isOpen, onClose, item }) {
  const [step, setStep] = useState('cart'); // 'cart' | 'details' | 'success'
  const [qty, setQty] = useState(item?.qty || 1);
  const [form, setForm] = useState({ fname:'', lname:'', email:'', phone:'', street:'', city:'', state:'', zip:'' });
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    if (isOpen) { setStep('cart'); setQty(item?.qty || 1); }
  }, [isOpen, item]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const unitPrice = item.unitPrice;
  const subtotal = unitPrice * qty;
  const tax = subtotal * 0.09;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      const id = 'CE-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      setOrderId(id);
      setStep('success');
      setPlacing(false);
    }, 1200);
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel — slides in from right */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.32 }}
        className="relative z-10 flex flex-col w-full max-w-lg h-full overflow-y-auto"
        style={{ background: 'linear-gradient(180deg,#0e0f13 0%,#08090b 100%)', borderLeft: '1px solid rgba(255,255,255,.08)' }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── TOP BAR ── */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-4"
          style={{ background: 'rgba(8,9,11,.92)', borderBottom: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center gap-3">
            {step !== 'cart' && step !== 'success' && (
              <button onClick={() => setStep('cart')} className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors"
                style={{ color: '#9aa1ad', background: 'none', border: 'none', cursor: 'pointer' }}>
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <span className="text-[16px] font-bold" style={{ color: '#fff', letterSpacing: '-.025em' }}>
              Containers<span style={{ color: '#30d158' }}>Exchange</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#9aa1ad' }}>
              <Shield className="w-3 h-3" style={{ color: '#30d158' }} /> Secure Checkout
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.09)', color: '#a7adba', cursor: 'pointer' }}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── STEP INDICATOR ── */}
        {step !== 'success' && (
          <div className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {[['cart','Cart'],['details','Shipping']].map(([s, label], i, arr) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all"
                    style={{
                      background: step === s ? '#30d158' : (step === 'details' && s === 'cart') ? 'rgba(48,209,88,.15)' : 'rgba(255,255,255,.06)',
                      border: step === s ? 'none' : '1px solid rgba(255,255,255,.1)',
                      color: step === s ? '#000' : (step === 'details' && s === 'cart') ? '#30d158' : '#6f7786',
                    }}>
                    {step === 'details' && s === 'cart' ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className="text-[12px] font-semibold" style={{ color: step === s ? '#f7f8fb' : '#6f7786' }}>{label}</span>
                </div>
                {i < arr.length - 1 && <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,.08)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="flex-1 flex flex-col">

          {/* ══ CART STEP ══ */}
          {step === 'cart' && (
            <div className="flex flex-col gap-0 flex-1">
              {/* Cart item */}
              <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color: '#6f7786' }}>My Cart</p>
                <div className="flex gap-4 items-start">
                  <img src={item.img} alt={item.title}
                    className="w-[80px] h-[62px] object-cover rounded-xl flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,.12)', background: '#fff' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold leading-snug mb-1" style={{ color: '#f7f8fb' }}>{item.title}</p>
                    <p className="text-[11px] mb-3" style={{ color: '#9ca4b3' }}>{item.sub}</p>
                    <div className="flex items-center gap-3">
                      {/* Qty stepper */}
                      <div className="flex items-center h-8 rounded-full px-1"
                        style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.09)' }}>
                        <button onClick={() => setQty(q => Math.max(1, q - 1))}
                          className="w-7 h-7 flex items-center justify-center text-lg rounded-full transition-colors"
                          style={{ color: '#a7adba', background: 'transparent', border: 'none', cursor: 'pointer' }}>−</button>
                        <span className="w-7 text-center text-[13px] font-bold" style={{ color: '#fff' }}>{qty}</span>
                        <button onClick={() => setQty(q => q + 1)}
                          className="w-7 h-7 flex items-center justify-center text-lg rounded-full transition-colors"
                          style={{ color: '#a7adba', background: 'transparent', border: 'none', cursor: 'pointer' }}>+</button>
                      </div>
                      <span className="text-[15px] font-bold" style={{ color: '#f7f8fb' }}>{fmt(unitPrice * qty)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtotals */}
              <div className="p-5 flex flex-col gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <div className="flex justify-between text-[13px]" style={{ color: '#a7adba' }}>
                  <span>Subtotal</span><span style={{ color: '#f7f8fb' }}>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[12px]" style={{ color: '#6f7786' }}>
                  <span>Sales tax</span><span style={{ fontStyle: 'italic' }}>Calculated at checkout</span>
                </div>
                <div className="h-px" style={{ background: 'rgba(255,255,255,.07)' }} />
                <div className="flex justify-between text-[16px] font-bold" style={{ color: '#fff' }}>
                  <span>Total</span><span style={{ color: '#f7f8fb' }}>{fmt(subtotal)}</span>
                </div>
              </div>

              {/* Lock-price banner */}
              <div className="mx-5 mt-5 p-4 rounded-2xl text-[12.5px] leading-relaxed"
                style={{ background: 'linear-gradient(145deg,rgba(230,57,70,.85),rgba(100,18,26,.88))', border: '1px solid rgba(255,255,255,.08)', color: '#fff' }}>
                <div className="text-[13px] font-bold mb-1.5" style={{ color: '#ffd60a' }}>🔒 Lock In Your Price — Don't Wait!</div>
                <p>Container prices fluctuate. <strong style={{ color: '#ffd60a' }}>Order Now</strong> to secure this low price.</p>
              </div>

              <div className="p-5 mt-auto">
                <button onClick={() => setStep('details')}
                  className="w-full h-13 rounded-full flex items-center justify-center gap-2 text-[15px] font-bold transition-all"
                  style={{ background: 'linear-gradient(180deg,#ff5a52,#ff3b30)', color: '#fff', height: '52px',
                    boxShadow: '0 14px 32px rgba(255,69,58,.24)', border: 'none', cursor: 'pointer' }}>
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center text-[11px] mt-3" style={{ color: '#6f7786' }}>
                  Want faster service?{' '}
                  <a href="tel:+18889779085" style={{ color: '#30d158', textDecoration: 'none', fontWeight: 600 }}>Call (888) 977-9085</a>
                </p>
              </div>
            </div>
          )}

          {/* ══ DETAILS STEP ══ */}
          {step === 'details' && (
            <div className="flex flex-col gap-0 flex-1">
              {/* Order summary mini */}
              <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color: '#6f7786' }}>Order Summary</p>
                <div className="flex items-center gap-3">
                  <img src={item.img} alt={item.title} className="w-[54px] h-[42px] object-cover rounded-xl flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,.12)', background: '#fff' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold leading-snug truncate" style={{ color: '#f7f8fb' }}>{item.title}</p>
                    <p className="text-[11px] truncate" style={{ color: '#9ca4b3' }}>{item.sub}</p>
                  </div>
                  <span className="text-[14px] font-bold flex-shrink-0" style={{ color: '#fff' }}>×{qty}</span>
                </div>
                <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                  <div className="flex justify-between text-[13px]" style={{ color: '#a7adba' }}>
                    <span>Subtotal</span><span style={{ color: '#f7f8fb' }}>{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px]" style={{ color: '#a7adba' }}>
                    <span>Est. Tax (9%)</span><span style={{ color: '#30d158' }}>{fmt(tax)}</span>
                  </div>
                  <div className="flex justify-between text-[17px] font-bold" style={{ color: '#fff' }}>
                    <span>Total</span><span style={{ color: '#ff453a' }}>{fmt(total)}</span>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="mx-5 mt-4 p-4 rounded-2xl text-[12px] leading-relaxed"
                style={{ background: 'rgba(255,69,58,.10)', border: '1px solid rgba(255,69,58,.22)', color: '#f7f8fb' }}>
                <strong>Disclaimer:</strong> By reserving your container, you are not committing to a purchase. We will contact you to confirm all the details and finalize pricing.
              </div>

              {/* Shipping Form */}
              <div className="p-5 flex flex-col gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] pb-2" style={{ color: '#30d158', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                  Shipping Address
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name *" value={form.fname} onChange={v => setF('fname', v)} placeholder="First name" />
                  <FormField label="Last Name *" value={form.lname} onChange={v => setF('lname', v)} placeholder="Last name" />
                </div>
                <FormField label="Email *" value={form.email} onChange={v => setF('email', v)} placeholder="Email address" type="email" />
                <FormField label="Phone *" value={form.phone} onChange={v => setF('phone', v)} placeholder="Phone number" type="tel" />
                <FormField label="Street Address *" value={form.street} onChange={v => setF('street', v)} placeholder="House number and street name" />
                <FormField label="City *" value={form.city} onChange={v => setF('city', v)} placeholder="City" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-[0.09em]" style={{ color: '#6f7786' }}>State *</label>
                    <select value={form.state} onChange={e => setF('state', e.target.value)}
                      className="px-3 py-2.5 text-[13px] rounded-xl outline-none appearance-none"
                      style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.08)', color: form.state ? '#f7f8fb' : '#6f7786' }}>
                      <option value="">Select state…</option>
                      {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <FormField label="ZIP Code *" value={form.zip} onChange={v => setF('zip', v)} placeholder="ZIP code" />
                </div>
              </div>

              {/* Place Order */}
              <div className="p-5 mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full rounded-full flex items-center justify-center gap-2 text-[15px] font-bold transition-all"
                  style={{ height: '52px', background: 'linear-gradient(180deg,#30d158,#28a745)', color: '#000',
                    boxShadow: '0 14px 32px rgba(48,209,88,.28)', border: 'none',
                    cursor: placing ? 'not-allowed' : 'pointer', opacity: placing ? 0.8 : 1 }}>
                  {placing ? 'Placing Order…' : <>Reserve My Container Now! <ArrowRight className="w-4 h-4" /></>}
                </button>
                <div className="flex items-center justify-center gap-2 mt-3 text-[11px]" style={{ color: '#6f7786' }}>
                  <Shield className="w-3 h-3" style={{ color: '#30d158' }} /> Your order is protected by SSL encryption
                </div>
              </div>
            </div>
          )}

          {/* ══ SUCCESS STEP ══ */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center flex-1 px-8 py-12 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-7"
                style={{ background: '#30d158', boxShadow: '0 0 40px rgba(48,209,88,.3)' }}>
                <Check className="w-10 h-10 text-black" strokeWidth={2.5} />
              </div>
              <h2 className="text-[26px] font-bold mb-3 tracking-tight" style={{ color: '#fff', letterSpacing: '-.03em' }}>
                Reservation Confirmed!
              </h2>
              <p className="text-[14px] leading-relaxed mb-6 max-w-xs" style={{ color: '#a7adba' }}>
                Thank you! Our logistics team will contact you within 24 hours to confirm your details and finalize pricing.
              </p>
              <div className="px-7 py-3 rounded-xl mb-2 text-[15px] font-bold"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#30d158' }}>
                {orderId}
              </div>
              <p className="text-[12px] mb-8" style={{ color: '#6f7786' }}>
                {form.email ? `Confirmation sent to ${form.email}` : 'We will follow up shortly.'}
              </p>
              <button onClick={onClose}
                className="w-full h-12 rounded-full text-[14px] font-bold"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#f7f8fb', cursor: 'pointer' }}>
                Back to Store
              </button>
              <div className="mt-5 text-[12px]" style={{ color: '#6f7786' }}>
                Need help?{' '}
                <a href="tel:+18889779085" style={{ color: '#30d158', textDecoration: 'none', fontWeight: 600 }}>Call (888) 977-9085</a>
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-[0.09em]" style={{ color: '#6f7786' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2.5 text-[13px] rounded-xl outline-none"
        style={{ background: 'rgba(255,255,255,.035)', border: '1px solid rgba(255,255,255,.08)', color: '#f7f8fb' }}
      />
    </div>
  );
}