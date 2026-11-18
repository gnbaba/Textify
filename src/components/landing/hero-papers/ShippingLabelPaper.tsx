import React from 'react';

export const ShippingLabelPaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#FFFFFF] border-2 border-[#20251F] p-2.5 sm:p-3 flex flex-col justify-between select-none shadow-md relative overflow-hidden font-mono text-[7px] sm:text-[7.5px] text-[#20251F]">
      {/* Top Banner */}
      <div className="bg-[#20251F] text-[#FFFDF7] px-1 py-0.5 font-bold flex justify-between items-center text-[7px] sm:text-[8px]">
        <span>PRIORITY WAYBILL</span>
        <span className="text-[#E96C3F]">CLIENT COPY</span>
      </div>

      {/* Recipient & Routing Details */}
      <div className="border border-[#20251F]/40 p-1 my-1 space-y-0.5 text-[6.5px] sm:text-[7px]">
        <div className="font-bold">TO: TEXTIFY SYSTEMS LAB</div>
        <div className="text-[#20251F]/70">Sector 04 &bull; Client Memory Vault</div>
        <div className="text-[#20251F]/70">WASM DESKEW ROUTING: LOCAL</div>
      </div>

      {/* Barcode & 2D Matrix Symbol */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#20251F]/40">
        {/* QR Code Silhouette SVG */}
        <div className="w-9 h-9 border border-[#20251F] p-0.5 flex flex-wrap gap-0.5 bg-[#20251F]/5">
          <div className="w-3.5 h-3.5 border border-[#20251F] bg-[#20251F] flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white" />
          </div>
          <div className="w-2.5 h-2.5 border border-[#20251F] bg-[#20251F] ml-auto" />
          <div className="w-2 h-2 bg-[#20251F] mt-auto" />
          <div className="w-3 h-3 border border-[#20251F] bg-[#20251F] ml-auto mt-auto flex items-center justify-center">
            <div className="w-1 h-1 bg-white" />
          </div>
        </div>

        {/* Linear Barcode */}
        <div className="flex flex-col items-end">
          <svg className="w-16 h-5 text-[#20251F]" viewBox="0 0 80 20" fill="currentColor">
            <rect x="0" y="0" width="2" height="20" />
            <rect x="4" y="0" width="1" height="20" />
            <rect x="7" y="0" width="3" height="20" />
            <rect x="13" y="0" width="2" height="20" />
            <rect x="17" y="0" width="1" height="20" />
            <rect x="21" y="0" width="4" height="20" />
            <rect x="28" y="0" width="2" height="20" />
            <rect x="32" y="0" width="1" height="20" />
            <rect x="36" y="0" width="3" height="20" />
            <rect x="42" y="0" width="2" height="20" />
            <rect x="47" y="0" width="4" height="20" />
            <rect x="54" y="0" width="1" height="20" />
            <rect x="58" y="0" width="3" height="20" />
            <rect x="64" y="0" width="2" height="20" />
            <rect x="69" y="0" width="4" height="20" />
            <rect x="76" y="0" width="2" height="20" />
          </svg>
          <span className="text-[5.5px] tracking-widest text-[#20251F]/70">TRK-814234567</span>
        </div>
      </div>
    </div>
  );
};
