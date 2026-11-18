import React from 'react';

interface RollTextProps {
  text: string;
  className?: string;
  isSubmenu?: boolean;
  hoverColorClass?: string;
  baseColorClass?: string;
}

export const RollText: React.FC<RollTextProps> = ({
  text,
  className = '',
  isSubmenu = false,
  hoverColorClass = 'text-[#F3EFE3]',
  baseColorClass = 'text-[#20251F]/75',
}) => {
  const topAnimClass = isSubmenu
    ? 'group-hover/sub:-translate-y-full group-hover/sub:' + hoverColorClass
    : 'group-hover:-translate-y-full group-hover:' + hoverColorClass;

  const botAnimClass = isSubmenu
    ? 'group-hover/sub:translate-y-0 group-hover/sub:' + hoverColorClass
    : 'group-hover:translate-y-0 group-hover:' + hoverColorClass;

  return (
    <span className={`relative inline-grid overflow-hidden leading-tight select-none ${className}`}>
      {/* 1. Top resting label: rolls up and out of view */}
      <span
        className={`transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] ${baseColorClass} ${topAnimClass}`}
      >
        {text}
      </span>

      {/* 2. Bottom active label: rolls up into view */}
      <span
        className={`absolute inset-0 translate-y-full transition-all duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] ${baseColorClass} ${botAnimClass}`}
        aria-hidden="true"
      >
        {text}
      </span>
    </span>
  );
};
