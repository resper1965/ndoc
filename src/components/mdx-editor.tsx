'use client';

/**
 * MDX Editor Component
 * 
 * Editor avançado usando CodeMirror 6 com syntax highlighting
 * para YAML (frontmatter) e Markdown
 */

import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, placeholder as placeholderExtension } from '@codemirror/view';
import { useTheme } from 'next-themes';

interface MDXEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
  readOnly?: boolean;
}

export function MDXEditor({
  value,
  onChange,
  placeholder = 'Digite seu conteúdo MDX aqui...',
  height = '400px',
  className = '',
  readOnly = false,
}: MDXEditorProps) {
  const { theme, systemTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Extensões do CodeMirror
  const extensions = [
    markdown(),
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
      },
      '.cm-content': {
        padding: '12px',
        minHeight: height,
      },
      '.cm-editor': {
        borderRadius: '8px',
        border: '1px solid hsl(var(--border))',
      },
      '.cm-focused': {
        outline: '2px solid hsl(var(--ring))',
        outlineOffset: '2px',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
    }),
    EditorView.lineWrapping,
    placeholderExtension(placeholder),
  ];

  // Adicionar tema dark se necessário
  if (isDark) {
    extensions.push(oneDark);
  }

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        theme={isDark ? oneDark : undefined}
        extensions={extensions}
        onChange={onChange}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          highlightSelectionMatches: true,
          searchKeymap: true,
        }}
      />
    </div>
  );
}

