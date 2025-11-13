'use client';

import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  className?: string;
}

export function Mermaid({ chart, className = '' }: MermaidProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';

  useEffect(() => {
    if (!mermaidRef.current) return;

    // Theme variables based on dark/light mode
    const themeVars = isDark
      ? {
          // Dark theme
          primaryColor: '#00ade8',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#00ade8',
          lineColor: '#64748b',
          secondaryColor: '#1e293b',
          tertiaryColor: '#334155',
          background: '#0f172a',
          mainBkgColor: '#1e293b',
          secondBkgColor: '#334155',
          textColor: '#f1f5f9',
          edgeLabelBackground: '#1e293b',
          clusterBkgColor: '#334155',
          clusterBorder: '#475569',
          defaultLinkColor: '#00ade8',
          titleColor: '#f1f5f9',
          actorBorder: '#00ade8',
          actorBkg: '#1e293b',
          actorTextColor: '#f1f5f9',
          actorLineColor: '#64748b',
          signalColor: '#f1f5f9',
          signalTextColor: '#f1f5f9',
          labelBoxBkgColor: '#1e293b',
          labelBoxBorderColor: '#00ade8',
          labelTextColor: '#f1f5f9',
          loopTextColor: '#f1f5f9',
          noteBorderColor: '#00ade8',
          noteBkgColor: '#334155',
          noteTextColor: '#f1f5f9',
          activationBorderColor: '#00ade8',
          activationBkgColor: '#1e3a5f',
          sequenceNumberColor: '#0f172a',
          sectionBkgColor: '#334155',
          altBkgColor: '#1e293b',
          altTextColor: '#f1f5f9',
          sectionBkgColor2: '#475569',
          excludeBkgColor: '#7f1d1d',
          taskBorderColor: '#00ade8',
          taskBkgColor: '#1e293b',
          taskTextLightColor: '#94a3b8',
          taskTextColor: '#f1f5f9',
          taskTextDarkColor: '#f1f5f9',
          taskTextOutsideColor: '#f1f5f9',
          taskTextClickableColor: '#00ade8',
          activeTaskBorderColor: '#00ade8',
          activeTaskBkgColor: '#1e3a5f',
          gridColor: '#475569',
          doneTaskBkgColor: '#064e3b',
          doneTaskBorderColor: '#10b981',
          critBorderColor: '#dc2626',
          critBkgColor: '#7f1d1d',
          taskTextLightColor2: '#94a3b8',
          todayLineColor: '#00ade8',
        }
      : {
          // Light theme (ness design system)
          primaryColor: '#00ade8',
          primaryTextColor: '#111827',
          primaryBorderColor: '#00ade8',
          lineColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#e2e8f0',
          background: '#ffffff',
          mainBkgColor: '#ffffff',
          secondBkgColor: '#f8fafc',
          textColor: '#111827',
          edgeLabelBackground: '#ffffff',
          clusterBkgColor: '#f1f5f9',
          clusterBorder: '#cbd5e1',
          defaultLinkColor: '#00ade8',
          titleColor: '#111827',
          actorBorder: '#00ade8',
          actorBkg: '#ffffff',
          actorTextColor: '#111827',
          actorLineColor: '#64748b',
          signalColor: '#111827',
          signalTextColor: '#111827',
          labelBoxBkgColor: '#ffffff',
          labelBoxBorderColor: '#00ade8',
          labelTextColor: '#111827',
          loopTextColor: '#111827',
          noteBorderColor: '#00ade8',
          noteBkgColor: '#f1f5f9',
          noteTextColor: '#111827',
          activationBorderColor: '#00ade8',
          activationBkgColor: '#e0f2fe',
          sequenceNumberColor: '#ffffff',
          sectionBkgColor: '#f8fafc',
          altBkgColor: '#f1f5f9',
          altTextColor: '#111827',
          sectionBkgColor2: '#e2e8f0',
          excludeBkgColor: '#fee2e2',
          taskBorderColor: '#00ade8',
          taskBkgColor: '#ffffff',
          taskTextLightColor: '#64748b',
          taskTextColor: '#111827',
          taskTextDarkColor: '#111827',
          taskTextOutsideColor: '#111827',
          taskTextClickableColor: '#00ade8',
          activeTaskBorderColor: '#00ade8',
          activeTaskBkgColor: '#e0f2fe',
          gridColor: '#cbd5e1',
          doneTaskBkgColor: '#d1fae5',
          doneTaskBorderColor: '#10b981',
          critBorderColor: '#ef4444',
          critBkgColor: '#fee2e2',
          taskTextLightColor2: '#64748b',
          todayLineColor: '#00ade8',
        };

    // Initialize Mermaid with theme
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: themeVars,
    });

    // Clear previous content
    mermaidRef.current.innerHTML = '';

    // Render the diagram
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    setIsLoading(true);
    setError(null);

    mermaid
      .render(id, chart)
      .then((result) => {
        if (mermaidRef.current) {
          mermaidRef.current.innerHTML = result.svg;
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Mermaid render error:', err);
        setError(err.message || 'Erro ao renderizar diagrama Mermaid');
        setIsLoading(false);
      });
  }, [chart, isDark]);

  if (error) {
    return (
      <div
        className={`my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}
      >
        <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
          Erro ao renderizar diagrama Mermaid:
        </p>
        <pre className="text-xs text-red-600 dark:text-red-300 overflow-x-auto">
          {error}
        </pre>
        <details className="mt-2">
          <summary className="text-xs text-red-600 dark:text-red-300 cursor-pointer">
            Ver código do diagrama
          </summary>
          <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/40 p-2 rounded overflow-x-auto">
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div className="text-sm text-slate-500">Carregando diagrama...</div>
        </div>
      )}
      <div
        ref={mermaidRef}
        className="mermaid-container flex justify-center overflow-x-auto"
      />
    </div>
  );
}

