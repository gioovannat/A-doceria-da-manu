import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pink' | 'emerald' | 'amber' | 'blue' | 'gray' | 'purple' | 'rose';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pink',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }[size];

  const variantClasses = {
    pink: 'bg-[#FFF0F4] text-[#B8134B] border border-[#FAD0DE]',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-lg uppercase tracking-wider select-none ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
