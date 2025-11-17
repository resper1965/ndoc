'use client';

import { DocumentEditor } from './document-editor';

interface DocumentActionsProps {
  documentPath: string;
  documentContent: string;
  documentTitle?: string;
}

export function DocumentActions({
  documentPath,
  documentContent,
  documentTitle,
}: DocumentActionsProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <DocumentEditor
        documentPath={documentPath}
        documentContent={documentContent}
        documentTitle={documentTitle}
      />
    </div>
  );
}

