'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/dialog';
import { Input } from '@/components/input';
import SearchButton from '@/components/search-button';
import { Search, FileText, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

export interface SemanticSearchDialogProps {
  onResultClick?: (documentPath: string, chunkId?: string) => void;
}

export interface SemanticSearchDialogHandle {
  close: () => void;
  open: () => void;
}

interface SearchResult {
  chunkId: string;
  documentId: string;
  content: string;
  similarity: number;
  documentTitle: string;
  documentType: string | null;
  chunkIndex: number;
  documentPath: string;
}

export const SemanticSearchDialog = React.forwardRef<
  SemanticSearchDialogHandle,
  SemanticSearchDialogProps
>(({ onResultClick }, ref) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useImperativeHandle(ref, () => ({
    close: () => setOpen(false),
    open: () => setOpen(true),
  }));

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          matchCount: 10,
          matchThreshold: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na busca');
      }

      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao realizar busca');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounce search
  const debouncedSearch = useMemo(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(searchQuery);
        }, 500);
      };
    },
    [performSearch]
  );

  React.useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setResults([]);
    }
  }, [query, debouncedSearch]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultClick) {
      onResultClick(result.documentPath, result.chunkId);
    }
    setOpen(false);
  };

  const getDocumentTypeLabel = (type: string | null) => {
    switch (type) {
      case 'policy':
        return 'Política';
      case 'procedure':
        return 'Procedimento';
      case 'manual':
        return 'Manual';
      default:
        return 'Documento';
    }
  };

  const getDocumentTypeColor = (type: string | null) => {
    switch (type) {
      case 'policy':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'procedure':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'manual':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={open} setOpen={setOpen}>
      <DialogTrigger>
        <SearchButton />
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="h-5 w-5 text-primary-500" />
          <h2 className="text-xl font-heading font-semibold">Busca Semântica</h2>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Busque por significado, não apenas palavras..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {searching && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
              <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                Buscando...
              </span>
            </div>
          )}

          {!searching && query && results.length === 0 && !error && (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhum resultado encontrado
              </p>
            </div>
          )}

          {!searching && results.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((result) => (
                <div
                  key={result.chunkId}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <Link
                          href={`/docs/${result.documentPath}`}
                          className="font-medium text-sm hover:text-primary-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResultClick(result);
                          }}
                        >
                          {result.documentTitle}
                        </Link>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${getDocumentTypeColor(
                            result.documentType
                          )}`}
                        >
                          {getDocumentTypeLabel(result.documentType)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Similaridade: {(result.similarity * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Digite sua busca para encontrar documentos por significado
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                A busca semântica entende o contexto, não apenas palavras-chave
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

SemanticSearchDialog.displayName = 'SemanticSearchDialog';

