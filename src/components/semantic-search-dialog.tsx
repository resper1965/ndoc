'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '@/components/dialog';
import { Input } from '@/components/input';
import { Button } from '@/components/button';
import { Label } from '@/components/label';
import SearchButton from '@/components/search-button';
import { Search, FileText, Sparkles, Loader2, Filter, X } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/select';

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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    documentType: '' as '' | 'policy' | 'procedure' | 'manual' | 'other',
    matchThreshold: 0.7,
    matchCount: 10,
  });

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
      const requestBody: any = {
        query: searchQuery,
        matchCount: filters.matchCount,
        matchThreshold: filters.matchThreshold,
      };

      if (filters.documentType) {
        requestBody.documentType = filters.documentType;
      }

      const response = await fetch('/api/search/semantic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
  }, [filters]);

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

  const highlightSnippet = (text: string, query: string, maxLength: number = 200) => {
    if (!query.trim()) return text.substring(0, maxLength);
    
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);
    
    if (index === -1) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 50);
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    // Destacar termos da busca
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    snippet = snippet.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-900">$1</mark>');
    
    return snippet;
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
            className="pl-10 pr-10"
            autoFocus
          />
          <Button
            variant="none"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            title="Filtros"
          >
            <Filter className={`h-4 w-4 ${showFilters ? 'text-primary' : 'text-slate-400'}`} />
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Filtros de Busca</Label>
              <Button
                variant="none"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="filter-type" className="text-xs">Tipo de Documento</Label>
                <Select
                  value={filters.documentType}
                  onSelect={(value) =>
                    setFilters({ ...filters, documentType: value as any || '' })
                  }
                >
                  <SelectValue placeholder="Todos" />
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="policy">Política</SelectItem>
                    <SelectItem value="procedure">Procedimento</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-threshold" className="text-xs">
                  Similaridade Mínima: {(filters.matchThreshold * 100).toFixed(0)}%
                </Label>
                <input
                  id="filter-threshold"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={filters.matchThreshold}
                  onChange={(e) =>
                    setFilters({ ...filters, matchThreshold: parseFloat(e.target.value) })
                  }
                  className="w-full mt-1"
                />
              </div>

              <div>
                <Label htmlFor="filter-count" className="text-xs">Máximo de Resultados</Label>
                <Select
                  value={filters.matchCount.toString()}
                  onSelect={(value) => {
                    const val = Array.isArray(value) ? value[0] : value;
                    setFilters({ ...filters, matchCount: parseInt(val || '10', 10) });
                  }}
                >
                  <SelectValue />
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

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
                  <p
                    className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: highlightSnippet(result.content, query),
                    }}
                  />
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

