import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#9E7381] pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white text-[#3D1E26] text-sm font-medium transition-all duration-200 placeholder-[#9E7381]/70 focus:outline-hidden ${
            icon ? 'pl-10 pr-4' : 'px-4'
          } py-2.5 ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
              : 'border-[#FAD0DE] focus:border-[#D81E5B] focus:ring-2 focus:ring-[#FAD0DE]/50'
          } ${className}`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#7A505D]">{helperText}</p>
      ) : null}
    </div>
  );
};
