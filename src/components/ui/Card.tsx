import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#FAD6E2] shadow-xs overflow-hidden transition-all duration-200 ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-[#FEE7EF] flex items-center justify-between gap-4 bg-[#FFFDFC]">
          <div className="text-left">
            {title && (
              <h3 className="text-base font-bold text-[#3D1E26] leading-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#7A505D] mt-0.5">{subtitle}</p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
