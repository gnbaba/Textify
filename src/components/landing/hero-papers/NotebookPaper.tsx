import React from 'react';

export const NotebookPaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#FFFDF7] border border-[#20251F]/40 p-3 sm:p-4 flex flex-col select-none shadow-md relative overflow-hidden font-sans">
      {/* 3 Binder Punch Holes along left edge */}
      <div className="absolute left-1.5 top-5 w-2.5 h-2.5 rounded-full bg-[#20251F]/20 border border-[#20251F]/30" />
      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#20251F]/20 border border-[#20251F]/30" />
      <div className="absolute left-1.5 bottom-5 w-2.5 h-2.5 rounded-full bg-[#20251F]/20 border border-[#20251F]/30" />

      {/* Red Margin Vertical Rule */}
      <div className="absolute left-7 sm:left-8 top-0 bottom-0 w-px border-l border-[#E07A5F]/60" />

      {/* Content Area with Blue Ruled Lines */}
      <div className="pl-6 sm:pl-7 h-full flex flex-col justify-between py-1">
        {/* Title */}
        <div className="border-b border-[#7B9EC6]/40 pb-1 text-[#20251F]">
          <h4 className="font-serif italic text-xs sm:text-sm font-bold tracking-tight text-[#20251F]">
            Quick Household
          </h4>
          <span className="text-[7px] text-[#20251F]/50 font-mono">PRIORITY CHECKLIST</span>
        </div>

        {/* Ruled Checklist Lines */}
        <div className="space-y-2 text-[7.5px] sm:text-[8.5px] text-[#20251F]/85 font-mono">
          <div className="border-b border-[#7B9EC6]/40 pb-0.5 flex items-center gap-1.5">
            <span className="text-[#E96C3F] font-bold">☑</span>
            <span className="line-through text-[#20251F]/50 font-serif italic">Donation inquiry</span>
          </div>
          <div className="border-b border-[#7B9EC6]/40 pb-0.5 flex items-center gap-1.5">
            <span className="text-[#E96C3F] font-bold">☑</span>
            <span className="font-serif italic text-[#20251F]">Check book about bait</span>
          </div>
          <div className="border-b border-[#7B9EC6]/40 pb-0.5 flex items-center gap-1.5">
            <span className="text-[#20251F]/40">☐</span>
            <span className="font-serif italic">Chestnut supply ordering</span>
          </div>
          <div className="border-b border-[#7B9EC6]/40 pb-0.5 flex items-center gap-1.5">
            <span className="text-[#20251F]/40">☐</span>
            <span className="font-serif italic">Test for eng l.b filed</span>
          </div>
          <div className="border-b border-[#7B9EC6]/40 pb-0.5 flex items-center gap-1.5">
            <span className="text-[#20251F]/40">☐</span>
            <span className="font-serif italic">Run & actuate motor</span>
          </div>
        </div>

        {/* Hand note scribble footer */}
        <div className="border-b border-[#7B9EC6]/40 pb-0.5 text-[7px] sm:text-[7.5px] font-serif italic text-[#20251F]/60">
          Connect page &bull; Community notes &bull; Session sync
        </div>
      </div>
    </div>
  );
};
