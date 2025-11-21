# Variáveis de Ambiente Requeridas para Produção

## Obrigatórias (Críticas)

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL` - URL do projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Chave anônima do Supabase (pública)
- `SUPABASE_SERVICE_ROLE_KEY` - Chave de serviço do Supabase (privada, para operações admin)

### Redis/Upstash (Obrigatório em Produção)

- `UPSTASH_REDIS_REST_URL` - URL REST do Upstash Redis
- `UPSTASH_REDIS_REST_TOKEN` - Token do Upstash Redis
- `UPSTASH_REDIS_TCP_URL` - URL TCP do Upstash Redis (para BullMQ)

### Aplicação

- `NEXT_PUBLIC_APP_URL` - URL da aplicação em produção (ex: https://ndocs.vercel.app)

## Opcionais (Mas Recomendadas)

### OpenAI (Para funcionalidades de IA)

- `OPENAI_API_KEY` - Chave da API OpenAI (pode ser configurada por organização também)

### Criptografia (Para criptografar API keys)

- `ENCRYPTION_KEY` - Chave de criptografia (32 bytes, base64 ou hex)

### Redis Local (Apenas desenvolvimento)

- `REDIS_HOST` - Host do Redis local (padrão: localhost)
- `REDIS_PORT` - Porta do Redis local (padrão: 6379)

## Verificação

Execute este comando para verificar se todas as variáveis estão configuradas:

```bash
# Verificar variáveis obrigatórias
echo "Verificando variáveis de ambiente..."
echo "NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL:+✅ Configurado}"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:+✅ Configurado}"
echo "SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_SERVICE_ROLE_KEY:+✅ Configurado}"
echo "UPSTASH_REDIS_REST_URL: ${UPSTASH_REDIS_REST_URL:+✅ Configurado}"
echo "UPSTASH_REDIS_REST_TOKEN: ${UPSTASH_REDIS_REST_TOKEN:+✅ Configurado}"
echo "UPSTASH_REDIS_TCP_URL: ${UPSTASH_REDIS_TCP_URL:+✅ Configurado}"
echo "NEXT_PUBLIC_APP_URL: ${NEXT_PUBLIC_APP_URL:+✅ Configurado}"
```

## Configuração na Vercel

1. Acesse o projeto na Vercel
2. Vá em Settings > Environment Variables
3. Configure todas as variáveis obrigatórias para Production, Preview e Development
4. Certifique-se de que `NEXT_PUBLIC_*` estão marcadas como "Expose to Browser"
