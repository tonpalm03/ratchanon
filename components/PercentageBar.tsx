import React from 'react';

interface PercentageBarProps {
  percentage: number;
  height?: 'sm' | 'md';
}

const PercentageBar = ({ percentage, height = 'md' }: PercentageBarProps) => {
  const p = Math.round(percentage);
  let colorClass = 'bg-red-500';
  if (p >= 80) colorClass = 'bg-green-500';
  else if (p >= 50) colorClass = 'bg-yellow-500';

  const heightClass = height === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full bg-gray-700 rounded-full ${heightClass}`} title={`${p}%`}>
      <div className={`${colorClass} ${heightClass} rounded-full transition-all duration-500`} style={{ width: `${p}%` }}></div>
    </div>
  );
};

export default PercentageBar;
