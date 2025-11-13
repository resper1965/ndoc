'use client';

import React from 'react';
import { useTheme } from 'next-themes';

interface NessLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
};

export function NessLogo({ className = '', size = 'md' }: NessLogoProps) {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-white' : 'text-black';

  return (
    <div
      className={`font-montserrat font-medium ${sizeClasses[size]} ${className}`}
      style={{ fontFamily: 'var(--font-montserrat)' }}
    >
      <span className={textColor}>ness</span>
      <span style={{ color: '#00ade8' }}>.</span>
    </div>
  );
}
