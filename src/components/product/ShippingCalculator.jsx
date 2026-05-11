import React, { useState, useEffect } from 'react';
import { ShoppingCart, Phone, MapPin, ChevronDown, Check, Loader2 } from 'lucide-react';
import { SIZE_OPTIONS } from './SizeSelector';
import { isValidZipCode, calculateDeliveryFee } from '@/lib/zipUtils';
import { motion, AnimatePresence } from 'framer-motion';
import CheckoutModal from './CheckoutModal';

// Used → first 3 grades only. New → only IICL.
const USED_GRADES = [
  { key: 'AS_IS', label: 'AS IS',              adjust: -100, mod: '−$100', modType: 'save' },
  { key: 'WWT',   label: 'Wind & Water Tight',  adjust:    0, mod: 'Base',  modType: 'base' },
  { key: 'CW',    label: 'Cargo Worthy (CW)',   adjust:  200, mod: '+$200', modType: 'add'  },
];
const NEW_GRADES = [
  { key: 'IICL',  label: 'IICL',               adjust:    0, mod: 'Base',  modType: 'base' },
];

const CONDITION_IMAGES = {
  used: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=300&q=80',
  new:  'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=300&q=80',
};

const fmt = (n) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function ShippingCalculator({
  container,
  initialZip = '',
  selectedSizeIndex,
  onSizeChange,
  condition,
  onConditionChange,
}) {
  const [grade, setGrade] = useState('WWT');
  const [qty, setQty]     = useState(1);
  const [zip, setZip]       = useState(initialZip);
  const [zipOpen, setZipOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState(null);

  // Auto-calculate if initial zip is valid
  useEffect(() => {
    if (initialZip && isValidZipCode(initialZip)) runCalculate(initialZip);
  }, [initialZip]);

  // Reset grade to valid default when condition changes
  useEffect(() => {
    setGrade(condition === 'new' ? 'IICL' : 'WWT');
  }, [condition]);

  const runCalculate = (zipCode) => {
    if (!isValidZipCode(zipCode)) return;
    setIsCalculating(true);
    setTimeout(() => {
      const info = calculateDeliveryFee(zipCode, container?.size || '20');
      setDeliveryInfo(info);
      setIsCalculating(false);
      setZipOpen(false);
    }, 600);
  };

  const handleZipSubmit = (e) => { e.preventDefault(); runCalculate(zip); };

  const gradeOptions = condition === 'new' ? NEW_GRADES : USED_GRADES;
  const sizeOption   = SIZE_OPTIONS[selectedSizeIndex];
  const gradeAdjust  = gradeOptions.find(g => g.key === grade)?.adjust ?? 0;
  const basePrice    = (condition === 'new' ? sizeOption.newPrice : sizeOption.usedPrice) + gradeAdjust;
  const totalPrice   = basePrice * qty;

  const locationLabel = deliveryInfo
    ? `${deliveryInfo.city}`
    : zip && isValidZipCode(zip) ? zip : 'Enter ZIP code';

  const handleAddToCart = () => {
    const gradeLabel = gradeOptions.find(g => g.key === grade)?.label || grade;
    const condLabel = condition === 'new' ? 'New' : 'Used';
    setCheckoutItem({
      title: `${condLabel} ${sizeOption.label} Shipping Container`,
      sub: `${sizeOption.dims} · ${gradeLabel}`,
      img: sizeOption.image,
      unitPrice: basePrice,
      qty,
    });
    setCheckoutOpen(true);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="flex flex-col gap-[6px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>

      {/* ── STOCK BADGE ── */}
      <div className="flex items-center justify-between px-0.5 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase"
          style={{ background: 'rgba(48,209,88,.10)', border: '1px solid rgba(48,209,88,.22)', color: '#30d158' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#30d158' }} />
          In Stock
        </div>
        <div className="text-[12px]" style={{ color: '#6f7786' }}>4.9 ★★★★★</div>
      </div>

      {/* ── STEP 1: ZIP ── */}
      <div className="text-[10px] font-bold tracking-[0.12em] uppercase px-0.5 pb-1" style={{ color: '#6f7786' }}>
        Step 1 — Enter ZIP / Postal Code
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        <button
          onClick={() => setZipOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 transition-colors"
          style={{ color: '#a7adba' }}
        >
          <div className="flex items-center gap-2 text-[12px]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#6f7786' }} />
            <span>Delivering to</span>
            <span className="font-semibold" style={{ color: '#f7f8fb' }}>{locationLabel}</span>
          </div>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: '#30d158' }}>
            {zipOpen ? 'Close' : 'Change'}
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${zipOpen ? 'rotate-180' : ''}`} />
          </span>
        </button>
        <AnimatePresence initial={false}>
          {zipOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
              style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}
            >
              <form onSubmit={handleZipSubmit} className="flex gap-2 p-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="ZIP or postal code"
                  className="flex-1 text-sm px-3 py-2.5 rounded-xl outline-none"
                  style={{
                    background: 'rgba(0,0,0,.4)',
                    border: '1px solid rgba(255,255,255,.08)',
                    color: '#f7f8fb',
                  }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-opacity"
                  style={{ background: '#30d158', color: '#000' }}
                >
                  {isCalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── STEP 2: CONTAINER TYPE (New / Used) ── */}
      <div className="text-[10px] font-bold tracking-[0.12em] uppercase px-0.5 pb-1 mt-1.5" style={{ color: '#6f7786' }}>
        Step 2 — Select Container Type
      </div>
      <div className="grid grid-cols-2 rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        {['used', 'new'].map((cond) => {
            const active = condition === cond;
            return (
              <button
                key={cond}
                onClick={() => onConditionChange(cond)}
                className="flex flex-col items-center gap-1 py-4 px-3 transition-all"
              style={{
                background: active ? '#e63946' : 'transparent',
                color: active ? '#fff' : '#6f7786',
                borderRight: cond === 'used' ? '1px solid rgba(255,255,255,.07)' : 'none',
              }}
            >
              <span className="text-[13px] font-bold leading-tight text-center">
                {cond === 'new' ? 'NEW (One-Trip)' : 'USED (Wind/Water Tight)'}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wide" style={{ opacity: active ? 0.75 : 0.5 }}>
                Shipping Containers
              </span>
            </button>
          );
        })}
      </div>

      {/* ── SIZE TABS ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#6f7786' }}>Container Specifications</span>
          <span className="text-[12px] font-semibold" style={{ color: '#a7adba' }}>{sizeOption.label} Selected</span>
        </div>
        <div className="grid grid-cols-3">
          {SIZE_OPTIONS.map((opt, i) => {
            const active = selectedSizeIndex === i;
            const price = condition === 'new' ? opt.newPrice : opt.usedPrice;
            return (
              <button
                key={i}
                onClick={() => onSizeChange(i)}
                className="relative flex flex-col items-center gap-1 py-3.5 px-2 text-center transition-all"
                style={{
                  background: active ? 'rgba(48,209,88,.09)' : 'transparent',
                  color: active ? '#f7f8fb' : '#6f7786',
                  borderRight: i < 2 ? '1px solid rgba(255,255,255,.07)' : 'none',
                  borderTop: active ? '2px solid #30d158' : '2px solid transparent',
                }}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#30d158' }}>
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </div>
                )}
                <span className="text-[12px] font-bold leading-tight">{opt.label}</span>
                <span className="text-[10px]" style={{ color: '#6f7786', fontVariantNumeric: 'tabular-nums' }}>{opt.dims}</span>
                <span className="text-[13px] font-semibold mt-0.5" style={{ color: '#30d158', fontVariantNumeric: 'tabular-nums' }}>{fmt(price)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CONDITION CARDS ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#6f7786' }}>Condition</span>
          <span className="text-[12px] font-semibold" style={{ color: '#a7adba' }}>
            {condition === 'new' ? 'New' : 'Used'} — {sizeOption.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5 p-3">
          {['used', 'new'].map((cond) => {
            const active = condition === cond;
            const price = cond === 'new' ? sizeOption.newPrice : sizeOption.usedPrice;
            return (
              <button
                key={cond}
                onClick={() => onConditionChange(cond)}
                className="relative flex items-center gap-2.5 p-3 rounded-xl text-left transition-all"
                style={{
                  background: active ? 'rgba(48,209,88,.09)' : 'rgba(255,255,255,.025)',
                  border: `1.5px solid ${active ? '#30d158' : 'rgba(255,255,255,.08)'}`,
                }}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full flex items-center justify-center" style={{ background: '#30d158' }}>
                    <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />
                  </div>
                )}
                <img
                  src={CONDITION_IMAGES[cond]}
                  alt={cond}
                  className="w-[52px] h-[40px] object-cover rounded-lg flex-shrink-0"
                  style={{ border: '1px solid rgba(255,255,255,.1)' }}
                />
                <div>
                  <p className="text-[12px] font-bold leading-tight" style={{ color: '#f7f8fb' }}>
                    {cond === 'new' ? 'New' : 'Used'}
                  </p>
                  <p className="text-[13px] font-semibold mt-0.5" style={{ color: '#f7f8fb', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(price)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── GRADE ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span className="text-[10px] font-bold tracking-[0.12em] uppercase" style={{ color: '#6f7786' }}>Grade</span>
          <span className="text-[12px] font-semibold" style={{ color: '#a7adba' }}>
            {gradeOptions.find(g => g.key === grade)?.label}
          </span>
        </div>
        <div className={`grid gap-2 p-3 ${condition === 'new' ? 'grid-cols-1' : 'grid-cols-3'}`}>
          {gradeOptions.map((opt) => {
            const active = grade === opt.key;
            const modColor = opt.modType === 'save' ? '#30d158' : opt.modType === 'add' ? '#e63946' : '#6f7786';
            const modBg = opt.modType === 'save' ? 'rgba(48,209,88,.12)' : opt.modType === 'add' ? 'rgba(230,57,70,.10)' : 'rgba(153,153,170,.10)';
            return (
              <button
                key={opt.key}
                onClick={() => setGrade(opt.key)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl text-center transition-all"
                style={{
                  background: active ? 'rgba(48,209,88,.09)' : 'rgba(255,255,255,.025)',
                  border: `1.5px solid ${active ? '#30d158' : 'rgba(255,255,255,.08)'}`,
                  color: active ? '#f7f8fb' : '#6f7786',
                }}
              >
                <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: modColor, background: modBg }}>
                  {opt.mod}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── CHECKOUT ── */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,19,23,.9)', border: '1px solid rgba(255,255,255,.075)' }}>
        <div className="p-4 flex flex-col gap-3">
          {/* Tax note */}
          <div className="flex items-center gap-2 text-[11px]" style={{ color: '#6f7786' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Sales tax calculated at checkout
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }} />

          {/* Price breakdown */}
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between" style={{ color: '#a7adba' }}>
              <span>{sizeOption.label} · {condition === 'new' ? 'New' : 'Used'}</span>
              <span style={{ fontVariantNumeric: 'tabular-nums', color: '#f7f8fb' }}>
                {fmt(condition === 'new' ? sizeOption.newPrice : sizeOption.usedPrice)}
              </span>
            </div>
            {gradeAdjust !== 0 && (
              <div className="flex justify-between" style={{ color: '#a7adba' }}>
                <span>Grade adjustment</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: gradeAdjust > 0 ? '#e63946' : '#30d158' }}>
                  {gradeAdjust > 0 ? '+' : ''}{fmt(gradeAdjust)}
                </span>
              </div>
            )}
            {qty > 1 && (
              <div className="flex justify-between" style={{ color: '#a7adba' }}>
                <span>Quantity</span>
                <span style={{ color: '#f7f8fb' }}>× {qty}</span>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.07)' }} />

          {/* Total */}
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#6f7786' }}>Total</span>
            <span className="text-[28px] font-bold tracking-tight" style={{ color: '#e63946', fontVariantNumeric: 'tabular-nums' }}>
              {fmt(totalPrice)}
            </span>
          </div>

          {/* Qty + Add to Cart */}
          <div className="grid gap-2" style={{ gridTemplateColumns: '88px 1fr' }}>
            <div className="flex items-center rounded-full overflow-hidden h-12"
              style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.09)' }}>
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-9 h-full flex items-center justify-center text-lg transition-colors"
                style={{ color: '#a7adba', background: 'transparent' }}
              >−</button>
              <span className="flex-1 text-center text-[13px] font-bold select-none" style={{ color: '#f7f8fb' }}>{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-9 h-full flex items-center justify-center text-lg transition-colors"
                style={{ color: '#a7adba', background: 'transparent' }}
              >+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="h-12 rounded-full flex items-center justify-center gap-2 text-[14px] font-bold transition-all"
              style={{
                background: addedSuccess ? '#30d158' : '#e63946',
                color: '#fff',
                boxShadow: addedSuccess ? '0 12px 28px rgba(48,209,88,.25)' : '0 12px 28px rgba(230,57,70,.25)',
              }}
            >
              {addedSuccess ? (
                <><Check className="w-4 h-4" strokeWidth={2.5} /> Added!</>
              ) : (
                <><ShoppingCart className="w-4 h-4" /> Add to Cart</>
              )}
            </button>
          </div>

          {/* Phone CTA */}
          <a href="tel:+18889779085">
            <button
              className="w-full h-11 rounded-full flex items-center justify-center gap-2 text-[13px] font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,.028)',
                border: '1px solid rgba(255,255,255,.09)',
                color: '#a7adba',
              }}
            >
              <Phone className="w-4 h-4" />
              Call (888) 977-9085
            </button>
          </a>
        </div>
      </div>

      {/* ── LOCK PRICE BANNER ── */}
      <div className="rounded-xl p-4 text-[12.5px] leading-relaxed" style={{
        background: 'linear-gradient(145deg, rgba(230,57,70,.85), rgba(100,18,26,.88))',
        border: '1px solid rgba(255,255,255,.08)',
        color: '#fff',
      }}>
        <div className="text-[13.5px] font-bold mb-2" style={{ color: '#ffd60a' }}>🔒 Lock In Your Price — Don't Wait!</div>
        <p className="mb-1.5">Container prices fluctuate — <strong style={{ color: '#ffd60a' }}>Order Now</strong> to secure this low price.</p>
        <p>Delivery cost is additional. We'll negotiate with local carriers to get you the lowest rate.</p>
      </div>

      {/* ── WANT FASTER ── */}
      <div className="text-[12px] leading-relaxed px-1 py-2" style={{ color: '#9ca4b3' }}>
        Want faster service?{' '}
        <a href="tel:+18889779085" className="font-semibold" style={{ color: '#30d158', textDecoration: 'none' }}>
          Give us a ring!
        </a>{' '}
        Ask about specials in your area to save even more.
      </div>

      {/* ── CHECKOUT MODAL ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
            item={checkoutItem}
          />
        )}
      </AnimatePresence>

    </div>
  );
}