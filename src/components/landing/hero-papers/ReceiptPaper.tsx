import React from 'react';

export const ReceiptPaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#FAF8F2] border border-[#20251F]/30 p-2.5 sm:p-3 flex flex-col justify-between select-none shadow-md relative overflow-hidden font-mono text-[7px] sm:text-[7.5px] text-[#20251F]/90 leading-tight">
      {/* Top Perforated Sawtooth Edge */}
      <div className="absolute top-0 left-0 right-0 h-1 border-b border-dashed border-[#20251F]/30" />

      {/* Store Header */}
      <div className="text-center pb-1.5 border-b border-dashed border-[#20251F]/25 mt-0.5">
        <div className="font-bold tracking-wider text-[8px] sm:text-[9px] text-[#20251F]">
          RENEWAL FOOD MARKET
        </div>
        <div className="text-[6.5px] text-[#20251F]/60">1802 Eagle Street &bull; Store #408</div>
        <div className="text-[6.5px] text-[#20251F]/60">Tel: (555) 019-2834</div>
      </div>

      {/* Item List */}
      <div className="py-1 space-y-0.5">
        <div className="flex justify-between">
          <span>ORGANIC OAT MILK</span>
          <span>$4.50</span>
        </div>
        <div className="flex justify-between">
          <span>SOURDOUGH BREAD</span>
          <span>$5.20</span>
        </div>
        <div className="flex justify-between">
          <span>COLD PRESSED OIL</span>
          <span>$14.90</span>
        </div>
        <div className="flex justify-between">
          <span>ROAST COFFEE BEANS</span>
          <span>$18.50</span>
        </div>
        <div className="flex justify-between">
          <span>FRESH PRODUCE</span>
          <span>$13.78</span>
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-b border-dashed border-[#20251F]/30 py-1 space-y-0.5 font-bold">
        <div className="flex justify-between text-[6.5px] text-[#20251F]/70">
          <span>SUBTOTAL</span>
          <span>$56.88</span>
        </div>
        <div className="flex justify-between text-[6.5px] text-[#20251F]/70">
          <span>TAX (0.00%)</span>
          <span>$0.00</span>
        </div>
        <div className="flex justify-between text-[8px] sm:text-[9px] text-[#E96C3F] font-black pt-0.5">
          <span>TOTAL DUE</span>
          <span>$56.88</span>
        </div>
      </div>

      {/* Barcode Footer */}
      <div className="pt-1 flex flex-col items-center">
        <svg className="w-20 h-4 text-[#20251F]" viewBox="0 0 100 20" fill="currentColor">
          <rect x="0" y="0" width="2" height="20" />
          <rect x="4" y="0" width="1" height="20" />
          <rect x="7" y="0" width="3" height="20" />
          <rect x="13" y="0" width="1" height="20" />
          <rect x="16" y="0" width="2" height="20" />
          <rect x="21" y="0" width="4" height="20" />
          <rect x="27" y="0" width="1" height="20" />
          <rect x="31" y="0" width="3" height="20" />
          <rect x="36" y="0" width="2" height="20" />
          <rect x="40" y="0" width="4" height="20" />
          <rect x="47" y="0" width="1" height="20" />
          <rect x="51" y="0" width="2" height="20" />
          <rect x="56" y="0" width="3" height="20" />
          <rect x="61" y="0" width="1" height="20" />
          <rect x="65" y="0" width="4" height="20" />
          <rect x="72" y="0" width="2" height="20" />
          <rect x="76" y="0" width="1" height="20" />
          <rect x="80" y="0" width="3" height="20" />
          <rect x="85" y="0" width="2" height="20" />
          <rect x="90" y="0" width="4" height="20" />
          <rect x="96" y="0" width="2" height="20" />
        </svg>
        <span className="text-[5.5px] tracking-widest text-[#20251F]/60">INV-983421-REC</span>
      </div>

      {/* Bottom Perforated Edge */}
      <div className="absolute bottom-0 left-0 right-0 h-1 border-t border-dashed border-[#20251F]/30" />
    </div>
  );
};
