import React from 'react';
import { useNavigate } from 'react-router-dom';

// Heirloom Logo Component - Clickable to homepage
export const HeirloomLogo = ({ size = 'md', showText = true, className = '' }) => {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <button
      onClick={() => navigate('/')}
      className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}
      data-testid="heirloom-logo"
    >
      <img 
        src="/images/heirloom-logo.png" 
        alt="Heirloom" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <span className={`font-serif ${textSizes[size]} text-charcoal`}>
          Heirloom
        </span>
      )}
    </button>
  );
};

// Light version for dark backgrounds
export const HeirloomLogoLight = ({ size = 'md', showText = true, className = '' }) => {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <button
      onClick={() => navigate('/')}
      className={`flex items-center gap-2 hover:opacity-90 transition-opacity ${className}`}
      data-testid="heirloom-logo-light"
    >
      <img 
        src="/images/heirloom-logo.png" 
        alt="Heirloom" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
      {showText && (
        <span className={`font-serif ${textSizes[size]} text-ivory`}>
          Heirloom
        </span>
      )}
    </button>
  );
};

export default HeirloomLogo;
