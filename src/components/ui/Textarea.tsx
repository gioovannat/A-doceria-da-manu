import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  className = '',
  id,
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="text-xs font-bold text-[#3D1E26] uppercase tracking-wider">
          {label}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full rounded-xl border bg-white text-[#3D1E26] text-sm font-medium transition-all duration-200 placeholder-[#9E7381]/70 px-4 py-2.5 focus:outline-hidden ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-[#FAD0DE] focus:border-[#D81E5B] focus:ring-2 focus:ring-[#FAD0DE]/50'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#7A505D]">{helperText}</p>
      ) : null}
    </div>
  );
};
