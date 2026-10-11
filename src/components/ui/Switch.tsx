import React from 'react';

export interface SwitchProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled = false,
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative inline-flex items-center mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-[#D81E5B]' : 'bg-[#E5CAD3]'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-left">
          {label && <span className="text-xs font-bold text-[#3D1E26]">{label}</span>}
          {description && <span className="text-[11px] text-[#7A505D]">{description}</span>}
        </div>
      )}
    </label>
  );
};
