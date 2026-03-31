import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
      // Highlight the card with a green border if selected
      className={`bg-white rounded-xl border-2 shadow-sm overflow-hidden mb-6 transition-colors ${
        isSelected ? 'border-[#4D694E]' : 'border-transparent ring-1 ring-[#4D694E]/20'
      }`}
    >
      <div className="flex">
        {/* Drag Handle (LEFT GRIP ONLY) */}
        <div
          {...attributes}
          {...listeners}
          className="flex items-center justify-center px-3 cursor-grab active:cursor-grabbing bg-[#FFF3D5] border-r border-[#4D694E]/20"
        >
          <svg className="w-4 h-4 text-[#4D694E]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h.01M8 15h.01M12 9h.01M12 15h.01M16 9h.01M16 15h.01" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="p-4 md:p-5">
            <textarea
              readOnly
              value={text}
              className="w-full h-40 md:h-48 p-3 md:p-4 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#4D694E] bg-[#FFF3D5]/30 border border-[#4D694E]/20 text-gray-800 font-mono text-xs md:text-sm leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="px-4 md:px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center gap-2">
            
            {/* --- NEW CHECKBOX --- */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-[#4D694E] border-[#4D694E]' : 'bg-white border-[#4D694E]/40 group-hover:border-[#4D694E]'}`}>
                {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
              </div>
              <input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="hidden" />
              <span className="text-sm font-bold text-[#4D694E] select-none">Select</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(id)}
                className="text-red-500 hover:text-red-600 flex items-center justify-center gap-2 px-4 py-3 md:py-2 rounded-lg hover:bg-red-50 transition-colors font-semibold text-sm min-w-[44px]"
                type="button"
              >
                <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden md:inline">Delete</span>
              </button>

              <button
                onClick={() => onCopy(text, id)}
                className={`px-6 py-3 md:py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center space-x-2 shadow-sm min-w-[120px] ${
                  isCopied ? 'bg-[#4D694E] text-[#FFF3D5]' : 'bg-white border border-[#4D694E]/20 text-[#4D694E] hover:bg-[#4D694E]/5'
                }`}
                type="button"
              >
                <span>{isCopied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};