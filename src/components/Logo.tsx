import React from 'react';
import horizontalLogo from '../assets/images/doceria_da_manu_horizontal_logo_1790120305939.jpg';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customLogoUrl?: string;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md',
  customLogoUrl,
}) => {
  const sizeClasses = {
    sm: 'h-10 sm:h-12 w-auto max-w-[210px]',
    md: 'h-14 sm:h-16 md:h-20 w-auto max-w-[280px] sm:max-w-[340px] md:max-w-[400px]',
    lg: 'h-18 sm:h-22 md:h-26 w-auto max-w-[340px] sm:max-w-[420px] md:max-w-[480px]',
    xl: 'h-24 sm:h-30 md:h-36 w-auto max-w-[440px] sm:max-w-[540px]',
  }[size || 'md'];

  const logoSrc = customLogoUrl || horizontalLogo;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        src={logoSrc}
        alt="A Doceria da Manu - Confeitaria"
        className={`${sizeClasses} object-contain mix-blend-multiply hover:opacity-95 hover:scale-[1.02] transition-all duration-200 filter drop-shadow-[0_1px_2px_rgba(216,30,91,0.06)]`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.src = horizontalLogo;
        }}
      />
    </div>
  );
};
