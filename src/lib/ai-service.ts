/**
 * AI Service
 * 
 * Serviço client-side para interagir com APIs de IA
 */

export interface GenerateDocumentParams {
  topic: string;
  theme_id: string;
  path: string;
}

export interface ImproveDocumentParams {
  content: string;
  theme_id?: string;
  instructions?: string;
}

export interface GenerateDocumentResponse {
  content: string;
  title: string;
  description: string;
}

export interface ImproveDocumentResponse {
  improved_content: string;
  changes: string[];
}

/**
 * Gera um novo documento usando IA
 */
export async function generateDocument(
  params: GenerateDocumentParams
): Promise<GenerateDocumentResponse> {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar documento');
  }

  return response.json();
}

/**
 * Melhora um documento existente usando IA
 */
export async function improveDocument(
  params: ImproveDocumentParams
): Promise<ImproveDocumentResponse> {
  const response = await fetch('/api/ai/improve', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao melhorar documento');
  }

  return response.json();
}

