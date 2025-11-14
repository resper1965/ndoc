/**
 * Supabase Edge Function: Improve Document
 * 
 * Melhora um documento MDX existente usando IA
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface RequestBody {
  content: string;
  system_prompt: string;
  provider: 'openai' | 'anthropic';
  api_key: string;
  model: string;
}

serve(async (req) => {
  try {
    const { content, system_prompt, provider, api_key, model }: RequestBody = await req.json();

    if (!content || !system_prompt || !provider || !api_key || !model) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios faltando' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let improved_content = '';
    const changes: string[] = [];

    if (provider === 'openai') {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: system_prompt,
            },
            {
              role: 'user',
              content: `Melhore o seguinte documento MDX mantendo o formato e estrutura:\n\n${content}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return new Response(
          JSON.stringify({ error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      improved_content = data.choices[0]?.message?.content || '';

      // Detectar mudanças básicas
      if (improved_content !== content) {
        changes.push('Conteúdo melhorado pela IA');
      }
    } else if (provider === 'anthropic') {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': api_key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 3000,
          system: system_prompt,
          messages: [
            {
              role: 'user',
              content: `Melhore o seguinte documento MDX mantendo o formato e estrutura:\n\n${content}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return new Response(
          JSON.stringify({ error: `Anthropic API error: ${error.error?.message || 'Unknown error'}` }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      improved_content = data.content[0]?.text || '';

      // Detectar mudanças básicas
      if (improved_content !== content) {
        changes.push('Conteúdo melhorado pela IA');
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Provedor não suportado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        improved_content,
        changes,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

