/**
 * Supabase Edge Function: Generate Document
 * 
 * Gera um novo documento MDX usando IA
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface RequestBody {
  topic: string;
  system_prompt: string;
  provider: 'openai' | 'anthropic';
  api_key: string;
  model: string;
}

serve(async (req) => {
  try {
    const { topic, system_prompt, provider, api_key, model }: RequestBody = await req.json();

    if (!topic || !system_prompt || !provider || !api_key || !model) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios faltando' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let content = '';
    let title = topic;
    let description = '';

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
              content: `${system_prompt}\n\nGere um documento MDX completo sobre "${topic}". O documento deve ter frontmatter YAML válido com campos: title, description, date (formato YYYY-MM-DD), e order. O conteúdo deve ser em Markdown formatado.`,
            },
            {
              role: 'user',
              content: `Gere um documento completo sobre: ${topic}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
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
      content = data.choices[0]?.message?.content || '';

      // Extrair título e descrição do frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
        const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
        if (titleMatch) title = titleMatch[1].trim();
        if (descMatch) description = descMatch[1].trim();
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
          max_tokens: 2000,
          system: `${system_prompt}\n\nGere um documento MDX completo sobre "${topic}". O documento deve ter frontmatter YAML válido com campos: title, description, date (formato YYYY-MM-DD), e order. O conteúdo deve ser em Markdown formatado.`,
          messages: [
            {
              role: 'user',
              content: `Gere um documento completo sobre: ${topic}`,
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
      content = data.content[0]?.text || '';

      // Extrair título e descrição do frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
        const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
        if (titleMatch) title = titleMatch[1].trim();
        if (descMatch) description = descMatch[1].trim();
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Provedor não suportado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        content,
        title,
        description,
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

