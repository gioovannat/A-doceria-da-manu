import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = 'h-6 w-full' }) => {
  return (
    <div className={`animate-pulse bg-[#FCE1EB]/70 rounded-xl ${className}`} />
  );
};
