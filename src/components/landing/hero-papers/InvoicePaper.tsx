import React from 'react';

export const InvoicePaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#FFFDF7] border border-[#20251F]/80 p-3 sm:p-4 md:p-5 flex flex-col justify-between select-none shadow-md relative overflow-hidden font-mono-industrial">
      {/* Central Fold Mark */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px border-l border-dashed border-[#20251F]/20 pointer-events-none" />

      {/* Top Header Grid */}
      <div className="grid grid-cols-2 gap-2 text-[7px] sm:text-[8px] md:text-[9px] border-b border-[#20251F]/40 pb-2">
        <div className="space-y-0.5">
          <div className="font-bold text-[#20251F] uppercase tracking-wider">
            CLIENT: ARKHITECTURA LTD.
          </div>
          <div className="text-[#20251F]/70">Project: Grin Slase Management</div>
          <div className="text-[#20251F]/70">Project: ProKenn Bumm</div>
        </div>
        <div className="space-y-0.5 text-right">
          <div className="font-bold text-[#20251F] uppercase tracking-wider">
            INVOICE NO: INV-2023-0814
          </div>
          <div className="text-[#20251F]/70">DATE: 14 OCT 2023</div>
          <div className="text-[#20251F]/70">Current: 805 &bull; ARCH-SPEC</div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="my-2 border border-[#20251F]/30 text-[7px] sm:text-[7.5px] md:text-[8.5px]">
        <div className="grid grid-cols-12 bg-[#20251F]/5 font-bold border-b border-[#20251F]/30 py-0.5 px-1 text-[#20251F] text-center">
          <span className="col-span-1">#</span>
          <span className="col-span-5 text-left">DESCRIPTION</span>
          <span className="col-span-2">QTY</span>
          <span className="col-span-2">UNIT</span>
          <span className="col-span-2 text-right">TOTAL</span>
        </div>
        <div className="divide-y divide-[#20251F]/15">
          <div className="grid grid-cols-12 py-0.5 px-1 text-center text-[#20251F]/85">
            <span className="col-span-1">1</span>
            <span className="col-span-5 text-left font-semibold">Arch. Services</span>
            <span className="col-span-2">1</span>
            <span className="col-span-2">€1,250.00</span>
            <span className="col-span-2 text-right font-bold">€1,250.00</span>
          </div>
          <div className="grid grid-cols-12 py-0.5 px-1 text-center text-[#20251F]/85">
            <span className="col-span-1">2</span>
            <span className="col-span-5 text-left font-semibold">Drafting Materials</span>
            <span className="col-span-2">1</span>
            <span className="col-span-2">€450.00</span>
            <span className="col-span-2 text-right font-bold">€450.00</span>
          </div>
          <div className="grid grid-cols-12 py-0.5 px-1 text-center text-[#20251F]/85">
            <span className="col-span-1">3</span>
            <span className="col-span-5 text-left font-semibold">Blueprint Prints</span>
            <span className="col-span-2">2</span>
            <span className="col-span-2">€315.00</span>
            <span className="col-span-2 text-right font-bold">€315.00</span>
          </div>
          <div className="grid grid-cols-12 py-0.5 px-1 text-center text-[#20251F]/85">
            <span className="col-span-1">4</span>
            <span className="col-span-5 text-left font-semibold">Consulting Hours</span>
            <span className="col-span-2">100</span>
            <span className="col-span-2">€2,800.00</span>
            <span className="col-span-2 text-right font-bold">€2,800.00</span>
          </div>
          <div className="grid grid-cols-12 py-0.5 px-1 text-center text-[#20251F]/85">
            <span className="col-span-1">5</span>
            <span className="col-span-5 text-left font-semibold">Project Management</span>
            <span className="col-span-2">1</span>
            <span className="col-span-2">€750.00</span>
            <span className="col-span-2 text-right font-bold">€750.00</span>
          </div>
          <div className="grid grid-cols-12 py-0.5 px-1 bg-[#20251F]/5 font-black text-[#20251F]">
            <span className="col-span-8 text-right pr-2">TOTAL AMOUNT:</span>
            <span className="col-span-4 text-right text-[#E96C3F] font-bold">€5,565.00</span>
          </div>
        </div>
      </div>

      {/* Footer Area with Verified Seal and Barcode */}
      <div className="flex items-center justify-between pt-1 border-t border-[#20251F]/30 text-[7px] sm:text-[8px]">
        {/* Certified Seal Stamp */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-dashed border-[#20251F]/60 flex items-center justify-center p-0.5">
            <div className="w-full h-full rounded-full border border-[#20251F]/40 flex flex-col items-center justify-center text-[5px] text-center leading-none text-[#20251F]/70 font-bold">
              <span>CERT</span>
              <span className="text-[7px] text-[#E96C3F]">★</span>
              <span>AUTH</span>
            </div>
          </div>
          <div className="leading-tight text-[6.5px] sm:text-[7.5px] text-[#20251F]/70">
            <div className="font-bold text-[#20251F]">CRYPTORABIC SEAL</div>
            <div>VERIFIED 100% PRIVATE</div>
          </div>
        </div>

        {/* Vector Barcode */}
        <div className="flex flex-col items-end">
          <svg className="w-24 sm:w-28 h-5 text-[#20251F]" viewBox="0 0 100 20" fill="currentColor">
            <rect x="0" y="0" width="2" height="20" />
            <rect x="4" y="0" width="1" height="20" />
            <rect x="7" y="0" width="3" height="20" />
            <rect x="12" y="0" width="1" height="20" />
            <rect x="15" y="0" width="2" height="20" />
            <rect x="19" y="0" width="4" height="20" />
            <rect x="25" y="0" width="1" height="20" />
            <rect x="28" y="0" width="2" height="20" />
            <rect x="32" y="0" width="3" height="20" />
            <rect x="37" y="0" width="1" height="20" />
            <rect x="40" y="0" width="4" height="20" />
            <rect x="46" y="0" width="2" height="20" />
            <rect x="50" y="0" width="1" height="20" />
            <rect x="53" y="0" width="3" height="20" />
            <rect x="58" y="0" width="2" height="20" />
            <rect x="62" y="0" width="4" height="20" />
            <rect x="68" y="0" width="1" height="20" />
            <rect x="71" y="0" width="3" height="20" />
            <rect x="76" y="0" width="1" height="20" />
            <rect x="79" y="0" width="2" height="20" />
            <rect x="83" y="0" width="4" height="20" />
            <rect x="89" y="0" width="2" height="20" />
            <rect x="93" y="0" width="1" height="20" />
            <rect x="96" y="0" width="3" height="20" />
          </svg>
          <span className="text-[6px] tracking-widest text-[#20251F]/60">
            8142345678901 20230814001
          </span>
        </div>
      </div>
    </div>
  );
};
