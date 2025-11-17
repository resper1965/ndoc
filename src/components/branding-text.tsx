'use client';

import { getDisplayName, producerBranding } from '../../config/branding';

interface BrandingTextProps {
  name?: string;
  className?: string;
  variant?: 'app' | 'producer';
}

/**
 * Componente para exibir branding seguindo o padrão ness.
 * - Palavra: cor preta ou branca dependendo do fundo
 * - Fonte: Montserrat medium
 * - Ponto ".": cor #00ade8
 */
export function BrandingText({ 
  name, 
  className = '', 
  variant = 'app' 
}: BrandingTextProps) {
  const displayName = name || (variant === 'producer' ? producerBranding.name : getDisplayName());
  
  // Separar o nome do ponto
  const parts = displayName.split('.');
  const baseName = parts[0];
  const hasDot = parts.length > 1;

  return (
    <span className={`font-heading font-medium text-gray-900 dark:text-white ${className}`}>
      {baseName}
      {hasDot && (
        <span style={{ color: '#00ade8' }}>.</span>
      )}
    </span>
  );
}

