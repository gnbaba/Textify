import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Copy, GripVertical, Trash2 } from 'lucide-react';
import React from 'react';

export interface BlockCardProps {
  id: string;
  text: string;
  onCopy?: (text: string, id: string) => void;
  onDelete?: (id: string) => void;
  isCopied?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  isOverlay?: boolean;
  isDragging?: boolean;
  dragHandleProps?: {
    attributes?: Record<string, unknown>;
    listeners?: Record<string, unknown>;
  };
}

export const BlockCard: React.FC<BlockCardProps> = ({
  id,
  text,
  onCopy,
  onDelete,
  isCopied = false,
  isSelected = false,
  onToggleSelect,
  isOverlay = false,
  isDragging = false,
  dragHandleProps,
}) => {
  return (
    <div
      className={`bg-[#FFFDF7] border overflow-hidden mb-6 font-mono-industrial select-none ${
        isOverlay
          ? 'border-[#214C3A] shadow-drafting-lg rotate-[0.5deg] scale-[1.01] cursor-grabbing z-50'
          : isDragging
            ? 'opacity-30 border-dashed border-[#20251F]/40 shadow-none'
            : isSelected
              ? 'border-[#214C3A] shadow-drafting'
              : 'border-[#20251F]/20 shadow-drafting-sm hover:border-[#20251F]/40 transition-[border-color,box-shadow] duration-150'
      }`}
    >
      <div className="flex">
        {/* Grab Handle */}
        <div
          {...(dragHandleProps?.attributes || {})}
          {...(dragHandleProps?.listeners || {})}
          className={`flex items-center justify-center px-3 touch-none select-none ${
            isOverlay
              ? 'bg-[#214C3A]/10 text-[#214C3A] cursor-grabbing'
              : 'cursor-grab active:cursor-grabbing bg-[#F3EFE3]/50 border-r border-[#20251F]/15 hover:bg-[#F3EFE3] text-[#20251F]/60 hover:text-[#20251F] transition-colors'
          }`}
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4 pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 md:p-5">
            <div className="w-full min-h-[140px] p-4 bg-[#FFFDF7] border border-[#20251F]/15 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words select-text text-[#20251F]">
              {text}
            </div>
          </div>

          <div className="px-4 md:px-5 py-2.5 bg-[#F3EFE3]/30 border-t border-[#20251F]/15 flex flex-wrap justify-between items-center gap-3">
            {/* Selector Checkbox */}
            <label
              className={`flex items-center gap-2 select-none ${isOverlay ? 'pointer-events-none' : 'cursor-pointer group'}`}
            >
              <div
                className={`w-4 h-4 border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-[#214C3A] border-[#214C3A]'
                    : 'bg-[#FFFDF7] border-[#20251F]/40 group-hover:border-[#20251F]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-[#FFFDF7]" />}
              </div>
              {!isOverlay && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={onToggleSelect}
                  className="hidden"
                />
              )}
              <span className="text-[10px] font-extrabold text-[#20251F] tracking-wider uppercase">
                SELECT BLOCK
              </span>
            </label>

            {/* Utility Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-auto font-bold text-[9px] tracking-wide uppercase">
              <button
                onClick={() => onDelete?.(id)}
                disabled={isOverlay}
                className="text-[#E96C3F] hover:bg-[#E96C3F]/10 border border-transparent hover:border-[#E96C3F]/30 flex items-center justify-center gap-1.5 px-3 py-1.5 transition-colors cursor-pointer disabled:opacity-40"
                type="button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>DELETE</span>
              </button>

              <button
                onClick={() => onCopy?.(text, id)}
                disabled={isOverlay}
                className={`px-4 py-1.5 border border-[#20251F]/20 transition-all flex items-center justify-center gap-1.5 shadow-drafting-sm cursor-pointer disabled:opacity-40 ${
                  isCopied
                    ? 'bg-[#214C3A] text-[#FFFDF7] border-[#214C3A]'
                    : 'bg-[#FFFDF7] text-[#20251F] hover:bg-[#20251F] hover:text-[#FFFDF7]'
                }`}
                type="button"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'COPIED!' : 'COPY BLOCK'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export interface SortableBlockProps {
  id: string;
  text: string;
  onCopy: (text: string, id: string) => void;
  onDelete: (id: string) => void;
  isCopied: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export const SortableBlock: React.FC<SortableBlockProps> = React.memo(
  ({ id, text, onCopy, onDelete, isCopied, isSelected, onToggleSelect }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id,
    });

    const style: React.CSSProperties = {
      transform: CSS.Translate.toString(transform),
      transition: isDragging ? undefined : transition,
    };

    return (
      <div ref={setNodeRef} style={style}>
        <BlockCard
          id={id}
          text={text}
          onCopy={onCopy}
          onDelete={onDelete}
          isCopied={isCopied}
          isSelected={isSelected}
          onToggleSelect={onToggleSelect}
          isDragging={isDragging}
          dragHandleProps={{
            attributes: attributes as unknown as Record<string, unknown>,
            listeners: listeners as unknown as Record<string, unknown>,
          }}
        />
      </div>
    );
  }
);

SortableBlock.displayName = 'SortableBlock';
