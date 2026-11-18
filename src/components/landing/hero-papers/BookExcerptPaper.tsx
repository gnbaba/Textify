import React from 'react';

export const BookExcerptPaper: React.FC = () => {
  return (
    <div className="w-full h-full bg-[#F5EEDC] border border-[#20251F]/40 p-3 sm:p-4 flex flex-col justify-between select-none shadow-md relative overflow-hidden font-serif text-[7.5px] sm:text-[8px] text-[#20251F]/90 leading-relaxed">
      {/* Top Page Header */}
      <div className="flex items-center justify-between border-b border-[#20251F]/20 pb-1 text-[7px] text-[#20251F]/60 uppercase tracking-widest font-mono">
        <span>37</span>
        <span>POETRY BOOK PAGE</span>
        <span>&bull;</span>
      </div>

      {/* Literary Typography Prose */}
      <div className="space-y-1.5 my-auto text-justify">
        <p className="indent-2">
          Between the quiet margins of the paper floor, every glyph awaits the beam of sight. Neither stone nor marble resists the digital archive; words whispered long ago find memory inside the machine.
        </p>
        <p className="indent-2 text-[#20251F]/75">
          In darkness and in sunlight, character by character assembled, the engine translates ink into boundless thought.
        </p>
      </div>

      {/* Book Bottom Page Rule */}
      <div className="pt-1 border-t border-[#20251F]/15 flex items-center justify-center text-[6.5px] text-[#20251F]/50 font-mono tracking-widest">
        &sect; CHAPTER III &bull; FOLIO ED.
      </div>
    </div>
  );
};
