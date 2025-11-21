# 🚀 Guia de Deploy - ndocs

Este documento contém instruções para fazer deploy do ndocs em produção.

---

## 📋 Pré-requisitos

- Conta na Vercel (ou plataforma de sua escolha)
- Projeto Supabase configurado
- Chave da API OpenAI
- Repositório Git configurado

---

## 🔧 Configuração do Ambiente

### Variáveis de Ambiente Necessárias

Configure as seguintes variáveis no painel da Vercel (ou sua plataforma):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# OpenAI
OPENAI_API_KEY=sk-...

# Aplicação
NEXT_PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

---

## 🚀 Deploy na Vercel

### Opção 1: Deploy via Git (Recomendado)

1. **Conectar Repositório**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "Add New Project"
   - Conecte seu repositório GitHub/GitLab/Bitbucket

2. **Configurar Projeto**
   - Framework Preset: **Next.js**
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build` (automático)
   - Output Directory: `.next` (automático)

3. **Adicionar Variáveis de Ambiente**
   - Vá em Settings → Environment Variables
   - Adicione todas as variáveis listadas acima
   - Configure para Production, Preview e Development

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build completar
   - Acesse a URL fornecida

### Opção 2: Deploy via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy em produção
vercel --prod
```

---

## 🔄 Deploy Contínuo

### Configuração Automática

O Vercel detecta automaticamente pushes para:
- `main` → Deploy em produção
- `feat/*` → Deploy de preview

### Branch Atual

Você está na branch: `feat/nova-estrutura-app-dashboard`

**Para fazer deploy em produção:**
```bash
# Merge para main
git checkout main
git merge feat/nova-estrutura-app-dashboard
git push origin main
```

---

## ✅ Verificações Pós-Deploy

### 1. Verificar Build
- ✅ Build deve completar sem erros
- ✅ Todas as rotas devem estar acessíveis

### 2. Testar Funcionalidades
- ✅ Login/Signup funcionando
- ✅ Criação de documentos
- ✅ Upload de arquivos
- ✅ Busca semântica
- ✅ Chat RAG
- ✅ Dashboard carregando

### 3. Verificar Variáveis de Ambiente
- ✅ Supabase conectado
- ✅ OpenAI funcionando
- ✅ URLs corretas

---

## 🐛 Troubleshooting

### Build Falha

**Erro: Variável de ambiente não encontrada**
- Verifique se todas as variáveis estão configuradas no Vercel
- Certifique-se de que estão marcadas para o ambiente correto

**Erro: Supabase connection failed**
- Verifique `NEXT_PUBLIC_SUPABASE_URL`
- Verifique `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Teste a conexão localmente primeiro

**Erro: OpenAI API error**
- Verifique `OPENAI_API_KEY`
- Confirme que a chave tem créditos disponíveis

### Performance

**Build lento**
- Normal para primeira build (~2-3 minutos)
- Builds subsequentes são mais rápidos (~1 minuto)

**Página lenta**
- Verifique logs no Vercel
- Monitore uso de recursos
- Considere otimizações de imagens/assets

---

## 📊 Monitoramento

### Vercel Analytics
- Acesse o dashboard da Vercel
- Monitore performance, erros e uso

### Logs
- Acesse: Vercel Dashboard → Deployments → [Seu Deploy] → Functions → Logs
- Monitore erros em tempo real

---

## 🔐 Segurança

### Checklist de Segurança

- ✅ Variáveis sensíveis em Environment Variables (não no código)
- ✅ RLS (Row Level Security) habilitado no Supabase
- ✅ HTTPS habilitado (automático na Vercel)
- ✅ CORS configurado corretamente
- ✅ Rate limiting configurado (se necessário)

---

## 📝 Próximos Passos Após Deploy

1. **Configurar Domínio Customizado**
   - Vercel Dashboard → Settings → Domains
   - Adicionar seu domínio
   - Configurar DNS

2. **Configurar Analytics**
   - Integrar Google Analytics (opcional)
   - Configurar Vercel Analytics

3. **Monitorar Performance**
   - Configurar alertas
   - Monitorar métricas de uso

4. **Backup**
   - Configurar backup do Supabase
   - Documentar processo de restore

---

## 🆘 Suporte

Em caso de problemas:
1. Verifique os logs no Vercel
2. Consulte `docs/DEVELOPMENT.md` para detalhes técnicos
3. Verifique issues no repositório

---

**Última atualização**: 2025-01-20

