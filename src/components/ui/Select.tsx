import React from 'react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  options,
  children,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider">
          {label}
        </label>
      )}

      <select
        id={selectId}
        className={`w-full rounded-xl border bg-white text-[#3D1E26] text-sm font-medium transition-all duration-200 px-4 py-2.5 focus:outline-hidden cursor-pointer ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-[#FAD0DE] focus:border-[#D81E5B] focus:ring-2 focus:ring-[#FAD0DE]/50'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#7A505D]">{helperText}</p>
      ) : null}
    </div>
  );
};
