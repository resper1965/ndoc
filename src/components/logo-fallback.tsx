/**
 * Logo Fallback Component
 * Componente React para substituir uso de innerHTML
 */

import React from 'react';

interface LogoFallbackProps {
  displayName: string;
  className?: string;
}

export function LogoFallback({ displayName, className = '' }: LogoFallbackProps) {
  const firstLetter = displayName.charAt(0).toUpperCase();
  
  return (
    <div className={`w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center ${className}`}>
      <span className="text-xl font-bold text-white">{firstLetter}</span>
    </div>
  );
}

