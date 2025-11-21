# 🚀 Guia de Deploy no Vercel - n.docs

**Data**: 2025-01-21  
**Status**: Pronto para Deploy

---

## 📋 Pré-requisitos

1. ✅ Projeto configurado no Vercel
2. ✅ Repositório conectado ao GitHub
3. ✅ Build passando localmente

---

## 🔐 Variáveis de Ambiente Necessárias

### Obrigatórias

Configure estas variáveis no Vercel Dashboard:

```env
# Supabase - URLs e Chaves Públicas
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key

# Supabase - Service Role (Backend apenas)
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

### Opcionais (para funcionalidades de IA)

```env
# OpenAI API Key (para geração de documentos com IA)
OPENAI_API_KEY=sk-...
```

### Opcionais (para Rate Limiting)

```env
# Upstash Redis (para rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 📝 Como Configurar no Vercel

### Via Dashboard

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `ndocs`
3. Vá em **Settings** → **Environment Variables**
4. Adicione cada variável:
   - **Key**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione:
     - ✅ Production
     - ✅ Preview
     - ✅ Development (opcional)

### Via CLI

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Login
vercel login

# Adicionar variáveis
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
```

---

## 🚀 Deploy

### Deploy Automático (Recomendado)

O Vercel faz deploy automático quando você faz push para o repositório:

```bash
git add .
git commit -m "feat: correções de auditoria e melhorias"
git push origin main
```

### Deploy Manual via CLI

```bash
# Deploy para produção
vercel --prod

# Deploy para preview
vercel
```

### Deploy via MCP (se disponível)

O deploy pode ser feito via MCP do Vercel se configurado.

---

## 📊 Monitoramento

### 1. Logs em Tempo Real

**Via Dashboard**:
1. Acesse o projeto no Vercel
2. Vá em **Deployments**
3. Clique no deployment desejado
4. Aba **Logs** mostra logs em tempo real

**Via CLI**:
```bash
# Ver logs do último deployment
vercel logs

# Ver logs de um deployment específico
vercel logs [deployment-url]
```

### 2. Métricas e Analytics

- **Analytics**: Vercel Analytics (se habilitado)
- **Speed Insights**: Performance metrics
- **Web Vitals**: Core Web Vitals

### 3. Alertas e Notificações

Configure no Vercel Dashboard:
- **Settings** → **Notifications**
- Receba emails sobre:
  - Deployments falhados
  - Build errors
  - Performance issues

---

## 🔍 Verificação Pós-Deploy

### Checklist

- [ ] Build completou com sucesso
- [ ] Site está acessível
- [ ] Autenticação funciona
- [ ] Criação de organização funciona
- [ ] Upload de documentos funciona
- [ ] Geração com IA funciona (se configurado)
- [ ] Busca semântica funciona

### Testes Rápidos

1. **Homepage**: Acesse a URL do projeto
2. **Signup**: Crie uma conta
3. **Onboarding**: Complete o onboarding
4. **Dashboard**: Verifique se carrega corretamente
5. **Upload**: Faça upload de um documento
6. **IA**: Tente gerar um documento (se configurado)

---

## 🐛 Troubleshooting

### Build Falha

**Erro**: `Module not found`
- **Solução**: Verifique se todas as dependências estão no `package.json`

**Erro**: `Environment variable not found`
- **Solução**: Verifique se todas as variáveis estão configuradas no Vercel

**Erro**: `Type error`
- **Solução**: Execute `npm run build` localmente para ver erros

### Runtime Errors

**Erro**: `Supabase connection failed`
- **Solução**: Verifique `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Erro**: `OpenAI API error`
- **Solução**: Verifique `OPENAI_API_KEY` (se usando IA)

**Erro**: `RLS policy violation`
- **Solução**: Verifique se as migrations foram aplicadas no Supabase

### Logs Úteis

```bash
# Ver logs de erro
vercel logs --follow

# Filtrar por tipo
vercel logs --follow | grep ERROR
```

---

## 📈 Otimizações Recomendadas

### Performance

1. **Image Optimization**: Já configurado no `next.config.ts`
2. **Caching**: Headers de cache configurados
3. **Bundle Size**: Monitorar tamanho do bundle

### Segurança

1. **CSP Headers**: Já configurados
2. **HTTPS**: Automático no Vercel
3. **Environment Variables**: Nunca commitar no git

### Monitoramento

1. **Sentry**: Integrar para error tracking (opcional)
2. **LogRocket**: Para session replay (opcional)
3. **Vercel Analytics**: Habilitar para métricas

---

## 🔄 CI/CD

O Vercel já faz CI/CD automático:

1. **Push para `main`**: Deploy para produção
2. **Push para outras branches**: Deploy para preview
3. **Pull Requests**: Preview deployment automático

### Customizar Build

Edite `vercel.json` (se necessário):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build passa localmente (`npm run build`)
- [ ] Testes locais passam
- [ ] Migrations do Supabase aplicadas
- [ ] RLS policies configuradas
- [ ] Domínio customizado configurado (opcional)
- [ ] SSL/HTTPS funcionando (automático no Vercel)
- [ ] Monitoramento configurado

---

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs

---

**Status**: ✅ Pronto para Deploy

