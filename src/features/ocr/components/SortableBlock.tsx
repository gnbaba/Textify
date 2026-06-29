import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash, Copy, Check, List, DotsSixVertical } from '@phosphor-icons/react';

export interface SortableBlockProps {
  id: string;
  text: string;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
  isCopied: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({
  id,
  text,
  onCopy,
  onDelete,
  isCopied,
  isSelected,     
  onToggleSelect,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#FFF3D5] border-2 border-[#4D694E] overflow-hidden mb-6 font-mono-industrial transition-shadow duration-300 ${
        isSelected ? 'shadow-[6px_6px_0px_0px_#4D694E]' : 'shadow-none'
      }`}
    >
      <div className="flex">
        {/* Grab Handle */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center px-3 cursor-grab active:cursor-grabbing bg-[#FFF3D5] border-r-2 border-[#4D694E] hover:bg-[#4D694E]/10"
          title="Drag to reorder"
        >
          <DotsSixVertical className="w-5 h-5 text-[#4D694E]" weight="bold" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0"> 
          <div className="p-4 md:p-5">
            <textarea
              readOnly
              value={text}
              className="w-full h-40 md:h-48 p-4 resize-y focus:outline-none bg-[#FFF3D5]/20 border-2 border-[#4D694E] text-[#4D694E] font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words"
            />
          </div>

          <div className="px-4 md:px-5 py-3 bg-[#FFF3D5]/20 border-t-2 border-[#4D694E] flex flex-wrap justify-between items-center gap-3">

            {/* Selector Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer group select-none">
              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#4D694E] border-[#4D694E]' : 'bg-[#FFF3D5] border-[#4D694E] group-hover:bg-[#4D694E]/10'}`}>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#FFF3D5]" weight="bold" />}
              </div>
              <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="hidden" />
              <span className="text-[10px] font-extrabold text-[#4D694E] tracking-wider uppercase">SELECT BLOCK</span>
            </label>

            {/* Utility Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto font-bold text-[9px] tracking-wide uppercase">
              <button
                onClick={() => onDelete(id)}
                className="text-red-700 hover:text-white border-2 border-transparent hover:border-red-700 hover:bg-red-700 flex items-center justify-center gap-1 px-3 py-1.5 transition-colors"
                type="button"
              >
                <Trash className="w-3.5 h-3.5" weight="bold" />
                <span>DELETE</span>
              </button>

              <button
                onClick={() => onCopy(text, id)}
                className={`px-4 py-1.5 border-2 border-[#4D694E] transition-all flex items-center justify-center gap-1 ${
                  isCopied 
                    ? 'bg-[#4D694E] text-[#FFF3D5]' 
                    : 'bg-[#FFF3D5] text-[#4D694E] hover:bg-[#4D694E] hover:text-[#FFF3D5]'
                }`}
                type="button"
              >
                <Copy className="w-3.5 h-3.5" weight="bold" />
                <span>{isCopied ? 'COPIED!' : 'COPY BLOCK'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};