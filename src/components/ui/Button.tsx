import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-[#D81E5B] hover:bg-[#B8134B] text-white shadow-xs hover:shadow-md border border-transparent',
    secondary: 'bg-[#FFF0F4] hover:bg-[#FDE2EC] text-[#9A1747] border border-[#FAD0DE] hover:border-[#F8BFD2]',
    outline: 'bg-white hover:bg-[#FFF5F8] text-[#3D1E26] border border-[#E5CAD3] hover:border-[#D81E5B]',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    ghost: 'bg-transparent hover:bg-[#FFF0F4] text-[#6B4651] hover:text-[#D81E5B]',
    success: 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-xs hover:shadow-md',
  }[variant];

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
