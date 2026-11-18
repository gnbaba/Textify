import React from 'react';

interface TriangleFlipBackgroundProps {
  color?: string; // Hex color for the flow fill, default '#214C3A'
  fillColorClass?: string; // Tailwind background color class, default 'bg-[#214C3A]'
}

export const TriangleFlipBackground: React.FC<TriangleFlipBackgroundProps> = ({
  color = '#214C3A',
  fillColorClass = 'bg-[#214C3A]',
}) => {
  return (
    <div
      className={`nav-flow-fill z-10 ${fillColorClass}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
};
