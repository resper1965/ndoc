'use client';

import { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { detectDocumentType, isSupportedDocumentType, SUPPORTED_DOCUMENT_TYPES } from '@/lib/processing/document-types';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
  onUploadMultiple?: (files: File[]) => Promise<void>;
  maxSize?: number; // em bytes
  multiple?: boolean;
  acceptedTypes?: string[];
}

export function DocumentUpload({
  onUpload,
  onUploadMultiple,
  maxSize = 50 * 1024 * 1024, // 50MB padrão
  multiple = false,
  acceptedTypes,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
  }>>([]);

  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(0)}MB`;
    }

    // Verificar tipo
    const documentType = detectDocumentType(file.name, file.type);
    if (!documentType || !isSupportedDocumentType(documentType)) {
      return `Tipo de arquivo não suportado: ${file.name}`;
    }

    // Verificar tipos aceitos se especificado
    if (acceptedTypes && !acceptedTypes.includes(file.type)) {
      return `Tipo de arquivo não permitido: ${file.type}`;
    }

    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file);
      if (error) {
        setUploadedFiles((prev) => [
          ...prev,
          { file, status: 'error', error },
        ]);
        return;
      }

      setUploadedFiles((prev) => [...prev, { file, status: 'uploading' }]);
      setUploading(true);

      try {
        await onUpload(file);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file ? { ...f, status: 'success' } : f
          )
        );
      } catch (err) {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? {
                  ...f,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Erro ao fazer upload',
                }
              : f
          )
        );
      } finally {
        setUploading(false);
      }
    },
    [onUpload, maxSize, acceptedTypes]
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (!onUploadMultiple) {
        // Fallback para upload individual se onUploadMultiple não estiver disponível
        for (const file of files) {
          await handleFile(file);
        }
        return;
      }

      // Validar todos os arquivos primeiro
      const validFiles: File[] = [];
      const invalidFiles: Array<{ file: File; error: string }> = [];

      files.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          invalidFiles.push({ file, error });
          setUploadedFiles((prev) => [
            ...prev,
            { file, status: 'error', error },
          ]);
        } else {
          validFiles.push(file);
          setUploadedFiles((prev) => [...prev, { file, status: 'uploading' }]);
        }
      });

      if (validFiles.length === 0) {
        return;
      }

      setUploading(true);

      try {
        await onUploadMultiple(validFiles);
        // Atualizar status dos arquivos válidos
        setUploadedFiles((prev) =>
          prev.map((f) =>
            validFiles.includes(f.file) ? { ...f, status: 'success' } : f
          )
        );
      } catch (err) {
        // Atualizar status dos arquivos com erro
        setUploadedFiles((prev) =>
          prev.map((f) =>
            validFiles.includes(f.file)
              ? {
                  ...f,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Erro ao fazer upload',
                }
              : f
          )
        );
      } finally {
        setUploading(false);
      }
    },
    [onUploadMultiple, handleFile, maxSize, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (multiple && onUploadMultiple) {
        handleFiles(files);
      } else if (multiple) {
        files.forEach(handleFile);
      } else {
        handleFile(files[0]);
      }
    },
    [handleFile, handleFiles, multiple, onUploadMultiple]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (multiple && onUploadMultiple) {
        handleFiles(files);
      } else if (multiple) {
        files.forEach(handleFile);
      } else {
        handleFile(files[0]);
      }
      // Reset input
      e.target.value = '';
    },
    [handleFile, handleFiles, multiple, onUploadMultiple]
  );

  const removeFile = (file: File) => {
    setUploadedFiles((prev) => prev.filter((f) => f.file !== file));
  };

  // Obter extensões aceitas
  const acceptedExtensions = Object.values(SUPPORTED_DOCUMENT_TYPES)
    .flatMap((info) => info.extensions)
    .join(',');

  return (
    <div className="space-y-4">
      {/* Área de Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
              : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
          }
        `}
      >
        <Upload
          className={`h-12 w-12 mx-auto mb-4 ${
            isDragging ? 'text-primary-500' : 'text-gray-400'
          }`}
        />
        <p className="text-lg font-medium mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Formatos suportados: PDF, DOCX, DOC, RTF, ODT, TXT, MD, HTML, JSON,
          XML, CSV, XLSX, PPTX
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Tamanho máximo: {(maxSize / 1024 / 1024).toFixed(0)}MB
        </p>
        <input
          type="file"
          accept={acceptedExtensions}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            disabled={uploading}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('file-upload')?.click();
            }}
          >
            Selecionar Arquivos
          </Button>
        </label>
      </div>

      {/* Lista de arquivos */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Arquivos:</h3>
          {uploadedFiles.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(item.file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {item.status === 'success' && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                )}
                {item.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                )}
                {item.status === 'uploading' && (
                  <div className="h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                )}
              </div>
              {item.error && (
                <p className="text-xs text-red-500 mr-2">{item.error}</p>
              )}
              <Button
                variant="none"
                size="sm"
                onClick={() => removeFile(item.file)}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

