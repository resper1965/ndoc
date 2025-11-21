'use client';

import { getDisplayName, producerBranding, appBranding } from '../../config/branding';

interface BrandingTextProps {
  name?: string;
  className?: string;
  variant?: 'app' | 'producer' | 'client';
}

/**
 * Componente para exibir branding seguindo o padrão ness.
 * - Palavra: cor preta ou branca dependendo do fundo
 * - Fonte: Montserrat medium (font-montserrat font-medium)
 * - Ponto ".": cor #00ade8
 */
export function BrandingText({ 
  name, 
  className = '', 
  variant = 'app' 
}: BrandingTextProps) {
  let displayName: string;
  
  if (name) {
    displayName = name;
  } else if (variant === 'producer') {
    displayName = producerBranding.name;
  } else if (variant === 'client') {
    displayName = getDisplayName();
  } else {
    // Variant 'app' - usar ndocs
    displayName = appBranding.name;
  }
  
  // Separar o nome do ponto para "n.docs"
  // Exemplo: "n.docs" -> "n" + "." (azul) + "docs"
  const parts = displayName.split('.');
  const beforeDot = parts[0];
  const afterDot = parts.slice(1).join('.');

  return (
    <span 
      className={`font-medium text-gray-900 dark:text-white ${className}`}
      style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
    >
      {beforeDot}
      {afterDot && (
        <>
          <span style={{ color: '#00ade8' }}>.</span>
          {afterDot}
        </>
      )}
    </span>
  );
}

