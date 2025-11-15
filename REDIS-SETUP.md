# ⚡ Guia de Configuração do Redis (Upstash)

**Última atualização:** 2025-01-15

Este guia mostra como configurar o Upstash Redis para rate limiting em produção.

---

## 📖 Índice

1. [Por que Redis é Necessário](#por-que-redis-é-necessário)
2. [Criar Conta no Upstash](#criar-conta-no-upstash)
3. [Criar Database Redis](#criar-database-redis)
4. [Obter Credenciais](#obter-credenciais)
5. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
6. [Verificar Conexão](#verificar-conexão)
7. [Troubleshooting](#troubleshooting)

---

## 🔍 Por que Redis é Necessário

### Desenvolvimento
- ✅ **Opcional** - Usa fallback em memória
- ⚠️ Não é distribuído (apenas uma instância)
- ⚠️ Perde dados ao reiniciar

### Produção
- ✅ **OBRIGATÓRIO** - Aplicação não inicia sem Redis
- ✅ Rate limiting distribuído entre múltiplas instâncias
- ✅ Dados persistentes
- ✅ Analytics de uso

**Sem Redis em produção:**
```
❌ FATAL: Redis (Upstash) é obrigatório em produção.
Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
```

---

## 🚀 Criar Conta no Upstash

### Passo 1: Acessar o Site

1. Acesse: https://console.upstash.com/
2. Clique em **"Sign Up"** ou **"Get Started"**

### Passo 2: Escolher Método de Login

Você pode se registrar via:
- ✅ **GitHub** (Recomendado - mais rápido)
- ✅ **Google**
- ✅ **Email**

### Passo 3: Verificar Email

Se registrou via email:
1. Verifique sua caixa de entrada
2. Clique no link de verificação
3. Complete seu perfil

---

## 🗄️ Criar Database Redis

### Passo 1: Acessar Dashboard

Após login, você verá o dashboard principal:
```
https://console.upstash.com/
```

### Passo 2: Criar Novo Database

1. Clique em **"Create Database"**
2. Preencha os campos:

   **Nome do Database:**
   ```
   ndoc-production
   ```
   (ou qualquer nome que preferir)

   **Região:**
   - ✅ Escolha a região **mais próxima dos seus usuários**
   - Para Brasil: `us-east-1` (Norte da Virgínia) ou `sa-east-1` (São Paulo)
   - Para Europa: `eu-west-1` (Irlanda)

   **Tipo:**
   - ✅ Selecione **"Regional"** (grátis)
   - ❌ Evite "Global" (pago, desnecessário para início)

   **TLS:**
   - ✅ Manter **habilitado** (recomendado para segurança)

3. Clique em **"Create"**

### Passo 3: Aguardar Criação

O database será criado em ~30 segundos.

---

## 🔑 Obter Credenciais

### Passo 1: Acessar Database

1. No dashboard, clique no database criado
2. Você verá a página de detalhes

### Passo 2: Copiar REST API Credentials

Na seção **"REST API"**, você verá:

```
UPSTASH_REDIS_REST_URL
https://your-database-name.upstash.io

UPSTASH_REDIS_REST_TOKEN
AaXbYcZdEeFfGg...
```

**⚠️ IMPORTANTE:**
- NÃO compartilhe essas credenciais
- NÃO commite no Git
- NUNCA exponha no frontend

### Passo 3: Copiar Valores

Clique no ícone de **copiar** (📋) ao lado de cada valor:
- ✅ Copie `UPSTASH_REDIS_REST_URL`
- ✅ Copie `UPSTASH_REDIS_REST_TOKEN`

---

## ⚙️ Configurar Variáveis de Ambiente

### Desenvolvimento (Local)

1. Abra o arquivo `.env.local` na raiz do projeto
2. Adicione as variáveis:

```bash
# Redis (Upstash)
UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=AaXbYcZdEeFfGg...
```

3. Salve o arquivo
4. Reinicie o servidor de desenvolvimento:

```bash
pnpm dev
```

### Produção (Vercel)

#### Via Dashboard Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto **n.doc**
3. Vá para **Settings** → **Environment Variables**
4. Adicione as variáveis:

   **Variável 1:**
   - Name: `UPSTASH_REDIS_REST_URL`
   - Value: `https://your-database-name.upstash.io`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

   **Variável 2:**
   - Name: `UPSTASH_REDIS_REST_TOKEN`
   - Value: `AaXbYcZdEeFfGg...`
   - Environment: ✅ Production, ✅ Preview, ✅ Development

5. Clique em **"Save"**

#### Via Vercel CLI

```bash
# Definir variável de produção
vercel env add UPSTASH_REDIS_REST_URL production
# Cole o valor quando solicitado

vercel env add UPSTASH_REDIS_REST_TOKEN production
# Cole o valor quando solicitado
```

### Produção (Outras Plataformas)

**Railway:**
```bash
# No dashboard do Railway
Variables → Add Variable
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = AaXb...
```

**Render:**
```bash
# No dashboard do Render
Environment → Add Environment Variable
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = AaXb...
```

**Netlify:**
```bash
# No dashboard do Netlify
Site settings → Environment variables → Add a variable
UPSTASH_REDIS_REST_URL = https://...
UPSTASH_REDIS_REST_TOKEN = AaXb...
```

---

## ✅ Verificar Conexão

### Método 1: Logs da Aplicação

Ao iniciar a aplicação, verifique os logs:

**✅ Sucesso:**
```
✅ Variáveis de ambiente validadas com sucesso
   - Ambiente: production
   - Supabase URL: https://your-project.supabase.co
   - Redis configurado: Sim
```

**❌ Erro (produção sem Redis):**
```
❌ FATAL: Redis (Upstash) é obrigatório em produção.
Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN
```

**⚠️ Aviso (desenvolvimento sem Redis):**
```
⚠️  Rate limiting: Redis não configurado, usando fallback em memória (apenas desenvolvimento)
```

### Método 2: Teste de Rate Limiting

Faça várias requisições rápidas para uma API:

```bash
# Fazer 10 requisições rápidas
for i in {1..10}; do
  curl https://seu-app.vercel.app/api/ingest?list=true
done
```

Se Redis estiver funcionando, você verá:
```json
{
  "error": "Muitas requisições. Tente novamente mais tarde.",
  "retryAfter": 45
}
```

### Método 3: Dashboard do Upstash

1. Acesse o dashboard do Upstash
2. Clique no seu database
3. Vá para **"Metrics"** ou **"Analytics"**
4. Verifique se há requisições sendo registradas

---

## 🐛 Troubleshooting

### Erro: "Failed to connect to Redis"

**Causa:** URL ou token incorretos

**Solução:**
1. Verifique se copiou corretamente do dashboard Upstash
2. Certifique-se que não há espaços extras
3. Verifique se o database está ativo no Upstash

```bash
# Testar conexão manualmente
curl https://your-database-name.upstash.io/ping \
  -H "Authorization: Bearer YOUR_TOKEN"

# Resposta esperada:
# {"result":"PONG"}
```

### Erro: "UPSTASH_REDIS_REST_URL is not defined"

**Causa:** Variável de ambiente não configurada

**Solução:**
1. Verifique se adicionou em `.env.local` (dev)
2. Verifique se adicionou no Vercel (prod)
3. Reinicie a aplicação

### Erro: "Redis connection timeout"

**Causa:** Firewall ou região muito distante

**Solução:**
1. Verifique firewall da sua rede
2. Tente criar database em outra região
3. Aguarde alguns minutos e tente novamente

### Rate limiting não está funcionando

**Sintomas:** Consegue fazer infinitas requisições

**Causa:** Redis não conectado ou fallback ativo

**Verificação:**
```bash
# Verificar logs da aplicação
# Procurar por:
"Redis não configurado, usando fallback em memória"
```

**Solução:**
1. Verifique se as variáveis estão definidas
2. Reinicie a aplicação
3. Verifique logs de startup

### Database Upstash pausado

**Causa:** Inatividade prolongada (plano gratuito)

**Solução:**
1. Acesse dashboard Upstash
2. Reative o database
3. Aguarde alguns minutos

---

## 📊 Monitoramento

### Métricas no Upstash

O Upstash fornece métricas gratuitas:

1. **Commands/sec** - Requisições por segundo
2. **Memory Usage** - Uso de memória
3. **Connections** - Conexões ativas
4. **Latency** - Tempo de resposta

**Alertas recomendados:**
- ⚠️ Uso de memória > 80%
- ⚠️ Latência > 100ms
- ⚠️ Erro de conexão

### Logs da Aplicação

Monitore logs para:
```
"Rate limiting: Redis não disponível, usando fallback"
"Error calling Redis"
"Redis connection failed"
```

---

## 💰 Custos

### Plano Free (Upstash)

**Incluído:**
- ✅ 10,000 comandos/dia
- ✅ 256 MB de RAM
- ✅ 1 database regional
- ✅ TLS habilitado
- ✅ Sem limite de tempo

**Limitações:**
- ❌ Apenas 1 database
- ❌ Sem replicação global
- ❌ Pausa após 30 dias de inatividade

### Quando Fazer Upgrade

Considere upgrade para **Pay as You Go** quando:
- ✅ > 10,000 requisições/dia
- ✅ Precisa de múltiplos databases
- ✅ Precisa de replicação global
- ✅ Precisa de SLA garantido

**Preço Pay as You Go:**
- $0.20 por 100,000 comandos
- $0.20 por GB-hora de armazenamento

---

## 🔗 Links Úteis

- **Dashboard Upstash:** https://console.upstash.com/
- **Documentação Upstash:** https://docs.upstash.com/redis
- **Status do Serviço:** https://status.upstash.com/
- **Pricing:** https://upstash.com/pricing
- **Support:** support@upstash.com

---

## ✅ Checklist Final

Antes de ir para produção, verifique:

- [ ] Conta Upstash criada
- [ ] Database Redis criado
- [ ] Região próxima aos usuários
- [ ] Credenciais copiadas
- [ ] Variáveis configuradas no Vercel
- [ ] Aplicação reiniciada
- [ ] Logs mostram "Redis configurado: Sim"
- [ ] Rate limiting testado e funcionando
- [ ] Métricas do Upstash mostrando atividade

---

**Última atualização:** 2025-01-15
**Suporte:** Veja documentação ou abra issue no GitHub
