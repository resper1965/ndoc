# Como Configurar Upstash Redis TCP para BullMQ

## ⚠️ Importante

O BullMQ precisa de conexão **TCP**, não REST. As variáveis `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` são apenas para a API REST do Upstash.

## 📋 Passo a Passo

### 1. Acessar o Dashboard do Upstash

1. Acesse: https://console.upstash.com
2. Faça login na sua conta
3. Selecione o banco Redis: **comic-raven-37828**

### 2. Obter Credenciais TCP

No dashboard do Upstash, você encontrará duas seções:

#### **REST API** (já configurado)

- ✅ `UPSTASH_REDIS_REST_URL`: `https://comic-raven-37828.upstash.io`
- ✅ `UPSTASH_REDIS_REST_TOKEN`: `AZPEAAIncDIwMjgyOWJiYzNjY2U0ZTQ0YjIzMDc2MDMwMWJhNzJjMnAyMzc4Mjg`

#### **Redis** (precisa configurar)

Procure por uma das seguintes opções:

**Opção A: Endpoint e Password separados**

- `Redis Endpoint`: `comic-raven-37828.upstash.io:6379` (ou apenas `comic-raven-37828.upstash.io`)
- `Password`: (senha diferente do REST token)

**Opção B: URL TCP completa**

- `Redis URL`: `redis://comic-raven-37828.upstash.io:6379` ou formato similar

### 3. Configurar na Vercel

Você pode usar uma das duas formas:

#### **Forma 1: Endpoint e Password separados** (Recomendado)

```bash
# Adicionar endpoint
vercel env add UPSTASH_REDIS_ENDPOINT production
# Cole: comic-raven-37828.upstash.io:6379

# Adicionar password
vercel env add UPSTASH_REDIS_PASSWORD production
# Cole a senha do Redis (não o REST token)
```

#### **Forma 2: URL TCP completa**

```bash
# Adicionar URL TCP completa
vercel env add UPSTASH_REDIS_TCP_URL production
# Cole: redis://comic-raven-37828.upstash.io:6379
# Ou: comic-raven-37828.upstash.io:6379
```

### 4. Verificar Configuração

Após adicionar as variáveis, verifique:

```bash
vercel env ls | grep UPSTASH
```

Você deve ver:

- ✅ `UPSTASH_REDIS_REST_URL` (Production)
- ✅ `UPSTASH_REDIS_REST_TOKEN` (Production)
- ✅ `UPSTASH_REDIS_ENDPOINT` (Production) **OU** `UPSTASH_REDIS_TCP_URL` (Production)
- ✅ `UPSTASH_REDIS_PASSWORD` (Production) - se usar endpoint separado

### 5. Fazer Redeploy

Após configurar as variáveis, faça um novo deploy:

```bash
vercel deploy --prod
```

Ou simplesmente faça push para o repositório (se tiver integração Git habilitada).

## 🔍 Onde Encontrar no Dashboard Upstash

1. **Acesse**: https://console.upstash.com/redis/comic-raven-37828
2. **Vá em**: "Details" ou "Connection" ou "Redis"
3. **Procure por**:
   - "Redis Endpoint" ou "Endpoint"
   - "Password" ou "Redis Password"
   - "TCP URL" ou "Redis URL"

## ⚠️ Notas Importantes

- A **senha do Redis** pode ser diferente do **REST token**
- O **endpoint** geralmente termina com `:6379` (porta padrão do Redis)
- O Upstash requer **TLS** para conexões TCP (já configurado no código)
- Se não encontrar essas informações, verifique se o banco está ativo

## 🧪 Teste Após Configuração

Após configurar e fazer deploy, teste:

1. Faça upload de um documento
2. Verifique se o processamento funciona
3. Verifique os logs: `vercel logs <deployment-url>`

Se houver erros de conexão Redis, verifique se as variáveis estão corretas.
