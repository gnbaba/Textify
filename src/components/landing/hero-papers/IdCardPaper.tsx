import React from 'react';

export const IdCardPaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#FAFAFA] border border-[#20251F]/40 p-2 sm:p-2.5 rounded-sm flex flex-col justify-between select-none shadow-md relative overflow-hidden font-mono text-[6.5px] sm:text-[7px]">
      {/* Security Guilloche Pattern Watermark */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#20251F_1px,transparent_1px)] [background-size:6px_6px] pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#20251F]/20 pb-1">
        <span className="font-bold text-[#20251F] text-[7.5px]">SECURITY ACCESS</span>
        <span className="text-[#E96C3F] font-bold">LEVEL-01</span>
      </div>

      {/* Chip & Photo */}
      <div className="flex items-center gap-2 my-1">
        {/* Gold Smart Chip */}
        <div className="w-6 h-5 rounded-xs bg-[#D4AF37]/30 border border-[#D4AF37] flex flex-col justify-around p-0.5">
          <div className="w-full h-px bg-[#D4AF37]" />
          <div className="w-full h-px bg-[#D4AF37]" />
        </div>

        {/* User Details */}
        <div className="leading-tight text-[#20251F]">
          <div className="font-black text-[7.5px]">DOC-ID: #4892-A</div>
          <div className="text-[6px] text-[#20251F]/60">LOCAL WASM OPERATOR</div>
        </div>
      </div>

      {/* Bottom Barcode Strip */}
      <div className="pt-0.5 border-t border-[#20251F]/20 flex justify-between items-center text-[5.5px] text-[#20251F]/60">
        <span>ENCRYPTED BIO-LEDGER</span>
        <span>AUTH: VALID</span>
      </div>
    </div>
  );
};
