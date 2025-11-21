# 🔧 Configurar Variáveis de Ambiente no Vercel

**Data:** 2025-01-21  
**Projeto:** ndocs  
**Project ID:** `prj_0jXE3P0ZF36gIfNHsW0ac8RqPYpa`

---

## 📋 Variáveis Necessárias

### ✅ Obrigatórias (já devem estar configuradas)

Estas variáveis já devem estar configuradas. Verifique se estão presentes:

1. **Supabase**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **OpenAI** (se usar geração de documentos)
   - `OPENAI_API_KEY`

### ⚠️ Novas Variáveis (PRECISAM SER CONFIGURADAS)

#### 1. ENCRYPTION_KEY (OBRIGATÓRIA)

**Descrição:** Chave de criptografia para API keys (AES-256-GCM)  
**Formato:** String hexadecimal de 64 caracteres (32 bytes)  
**Valor gerado:**

```
e9c5a7ef0a55fb0c665ec8a25f51c93722ac32f2f0729f07c91499e4d55215e8
```

**⚠️ IMPORTANTE:** Esta chave foi gerada aleatoriamente. Guarde-a em local seguro. Se perdida, todas as API keys criptografadas precisarão ser reconfiguradas.

#### 2. UPSTASH_REDIS_REST_URL (se ainda não configurado)

**Descrição:** URL REST do Redis Upstash  
**Formato:** `https://seu-redis.upstash.io`  
**Onde encontrar:** https://console.upstash.com/

#### 3. UPSTASH_REDIS_REST_TOKEN (se ainda não configurado)

**Descrição:** Token de autenticação do Redis Upstash  
**Formato:** String alfanumérica  
**Onde encontrar:** https://console.upstash.com/

#### 4. UPSTASH_REDIS_TCP_URL (RECOMENDADO para BullMQ)

**Descrição:** URL TCP do Redis Upstash (para BullMQ)  
**Formato:** `redis://default:token@host:port`  
**Onde encontrar:** https://console.upstash.com/ → Seu Redis → Details → Redis CLI → TCP Endpoint

---

## 🚀 Como Configurar

### Método 1: Via Dashboard Vercel (Recomendado)

1. **Acesse o Dashboard:**
   - Vá para: https://vercel.com/dashboard
   - Selecione o projeto **ndocs**

2. **Navegue até Environment Variables:**
   - Clique em **Settings** (no menu superior)
   - Clique em **Environment Variables** (no menu lateral)

3. **Adicione cada variável:**
   
   Para **ENCRYPTION_KEY**:
   - Clique em **Add New**
   - **Key:** `ENCRYPTION_KEY`
   - **Value:** `e9c5a7ef0a55fb0c665ec8a25f51c93722ac32f2f0729f07c91499e4d55215e8`
   - **Environment:** Selecione:
     - ✅ **Production**
     - ✅ **Preview**
     - ✅ **Development** (opcional)
   - Clique em **Save**

   Repita para as outras variáveis se necessário.

4. **Verifique as variáveis existentes:**
   - Verifique se `NEXT_PUBLIC_SUPABASE_URL` está configurada
   - Verifique se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
   - Verifique se `SUPABASE_SERVICE_ROLE_KEY` está configurada
   - Verifique se `OPENAI_API_KEY` está configurada (se usar IA)

5. **Faça um novo deploy:**
   - Após adicionar as variáveis, faça um novo deploy
   - Vá para **Deployments** → Clique nos três pontos do último deployment → **Redeploy**

### Método 2: Via Vercel CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Linkar ao projeto (se necessário)
cd /home/resper/ndocs
vercel link

# Adicionar ENCRYPTION_KEY
vercel env add ENCRYPTION_KEY production
# Cole o valor: e9c5a7ef0a55fb0c665ec8a25f51c93722ac32f2f0729f07c91499e4d55215e8

# Adicionar para preview também
vercel env add ENCRYPTION_KEY preview
# Cole o mesmo valor

# Adicionar para development (opcional)
vercel env add ENCRYPTION_KEY development
# Cole o mesmo valor

# Verificar variáveis configuradas
vercel env ls
```

---

## ✅ Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] `ENCRYPTION_KEY` configurada (NOVA - obrigatória)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `OPENAI_API_KEY` configurada (se usar IA)
- [ ] `UPSTASH_REDIS_REST_URL` configurada (se usar Redis)
- [ ] `UPSTASH_REDIS_REST_TOKEN` configurada (se usar Redis)
- [ ] `UPSTASH_REDIS_TCP_URL` configurada (recomendado para BullMQ)
- [ ] Todas as variáveis estão em **Production** e **Preview**
- [ ] Valores estão corretos (sem espaços extras, sem aspas)

---

## 🔍 Verificar Configuração

### Via Dashboard

1. Vercel Dashboard → Projeto → Settings → Environment Variables
2. Verifique se todas as variáveis estão listadas
3. Verifique os ambientes (Production, Preview, Development)

### Via CLI

```bash
# Listar todas as variáveis
vercel env ls

# Ver variáveis de produção
vercel env ls production

# Ver variáveis de preview
vercel env ls preview
```

---

## 🧪 Testar Após Configuração

Após configurar as variáveis e fazer deploy:

1. **Teste de Criptografia:**
   - Acesse a aplicação
   - Vá em Configurações → AI Providers
   - Adicione uma API key
   - Verifique que a API key é salva (criptografada no banco)

2. **Teste de Processamento:**
   - Faça upload de um documento
   - Verifique que o processamento funciona
   - Verifique os logs no Vercel

3. **Teste de Métricas:**
   - Acesse `/api/metrics/ingestion`
   - Verifique que as métricas são retornadas

---

## ⚠️ Importante

1. **ENCRYPTION_KEY:**
   - ⚠️ **NUNCA** compartilhe esta chave publicamente
   - ⚠️ Se perdida, todas as API keys criptografadas precisarão ser reconfiguradas
   - ⚠️ Use a mesma chave em todos os ambientes (Production, Preview, Development)

2. **Variáveis Sensíveis:**
   - `SUPABASE_SERVICE_ROLE_KEY` - nunca exponha no frontend
   - `ENCRYPTION_KEY` - nunca exponha no frontend
   - `OPENAI_API_KEY` - nunca exponha no frontend

3. **Deploy Necessário:**
   - Após adicionar variáveis, **sempre faça um novo deploy**
   - Variáveis não são aplicadas em deployments existentes

---

## 🐛 Troubleshooting

### Erro: "ENCRYPTION_KEY não configurada"

**Solução:**
1. Verifique se a variável está configurada no Vercel
2. Verifique se está no ambiente correto (Production/Preview)
3. Faça um novo deploy após adicionar a variável

### Erro: "Falha ao descriptografar API key"

**Solução:**
1. Verifique se `ENCRYPTION_KEY` está correta
2. Se mudou a chave, todas as API keys antigas precisam ser reconfiguradas
3. Verifique os logs no Vercel para mais detalhes

### Erro: "Redis não configurado"

**Solução:**
1. Configure `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`
2. Para BullMQ, configure também `UPSTASH_REDIS_TCP_URL`
3. Faça um novo deploy

---

## 📝 Notas

- Variáveis são **case-sensitive**
- Não use aspas nos valores no Vercel Dashboard
- Variáveis `NEXT_PUBLIC_*` são acessíveis no browser
- Variáveis sem `NEXT_PUBLIC_` são apenas no servidor
- Após adicionar variáveis, sempre faça um novo deploy

---

## 🔗 Links Úteis

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Projeto ndocs:** https://vercel.com/nessbr/ndocs
- **Upstash Console:** https://console.upstash.com/
- **Supabase Dashboard:** https://supabase.com/dashboard

---

**Status:** ✅ Documentação completa  
**Próximo passo:** Configurar variáveis no Vercel Dashboard e fazer deploy

