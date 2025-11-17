# 🚀 Próximos Passos - n.doc

**Última atualização:** 2025-01-15  
**Status Atual:** ✅ Migrations executadas | ✅ Criação automática de organização implementada

---

## ✅ O Que Já Está Pronto

- ✅ Todas as migrations executadas via MCP
- ✅ Função `handle_new_user()` criada e verificada
- ✅ API Route `/api/organization/create` implementada
- ✅ Integração no signup funcionando
- ✅ Planos SaaS criados (Free, Starter, Professional, Enterprise)
- ✅ Sistema de subscriptions com trial de 14 dias
- ✅ Tracking de uso implementado
- ✅ Sistema de auditoria (audit logs)
- ✅ Sistema de convites
- ✅ Deploy na Vercel configurado

---

## 🎯 Próximos Passos (Ordem de Prioridade)

### 1. ✅ TESTAR O FLUXO COMPLETO (URGENTE)

**Objetivo:** Verificar se tudo está funcionando end-to-end

```bash
# 1. Criar uma conta de teste
# Acesse: https://ndoc-eight.vercel.app/signup
# ou: http://localhost:3000/signup (se rodando localmente)

# 2. Preencher formulário:
# - Nome: "Teste Usuário"
# - Email: "teste@example.com"
# - Senha: "senha123"
# - Confirmar senha: "senha123"

# 3. Clicar em "Criar conta"

# 4. Verificar no Supabase Dashboard:
# - Table Editor > organizations
#   → Deve ter uma organização "Teste Usuário's Organization"
# - Table Editor > organization_members
#   → Deve ter o usuário como "owner"
# - Table Editor > subscriptions
#   → Deve ter subscription "free" com status "trialing"
```

**Critério de Sucesso:**
- ✅ Organização criada automaticamente
- ✅ Usuário adicionado como owner
- ✅ Subscription criada com trial de 14 dias
- ✅ Redirecionamento para `/onboarding` funcionando

---

### 2. 📝 TESTAR ONBOARDING

**Objetivo:** Verificar se o wizard de onboarding está funcionando

```bash
# Após criar conta, você deve ser redirecionado para /onboarding

# Verificar:
# - ✅ Wizard aparece corretamente
# - ✅ Etapas podem ser completadas
# - ✅ Primeiro documento pode ser criado
# - ✅ Organização é configurada corretamente
```

**Critério de Sucesso:**
- ✅ Usuário consegue completar todas as etapas
- ✅ Primeiro documento é criado com sucesso
- ✅ Redirecionamento para dashboard funciona

---

### 3. 🔐 VERIFICAR VARIÁVEIS DE AMBIENTE

**Objetivo:** Garantir que todas as variáveis estão configuradas

**Local (.env.local):**
```env
NEXT_PUBLIC_SUPABASE_URL=https://ajyvonzyoyxmiczflfiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
UPSTASH_REDIS_REST_URL=https://comic-raven-37828.upstash.io
UPSTASH_REDIS_REST_TOKEN=seu_token_aqui
```

**Vercel (Produção):**
```bash
# Verificar variáveis na Vercel
vercel env ls

# Ou via Dashboard:
# https://vercel.com/dashboard > ndoc > Settings > Environment Variables
```

**Variáveis Necessárias:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `UPSTASH_REDIS_REST_URL` (opcional, mas recomendado)
- ✅ `UPSTASH_REDIS_REST_TOKEN` (opcional, mas recomendado)

---

### 4. 🧪 TESTAR RECURSOS PRINCIPAIS

#### 4.1. Criação de Documentos

```bash
# 1. Acesse a aplicação logado
# 2. Vá para a seção de documentos
# 3. Crie um novo documento
# 4. Verifique se:
#    - ✅ Documento é salvo no banco
#    - ✅ Contador de documentos é atualizado
#    - ✅ Limites do plano são respeitados
```

#### 4.2. Geração de Documentos com IA

```bash
# 1. Configure um AI Provider (OpenAI ou Anthropic)
#    - Vá para /config
#    - Seção "AI Providers"
#    - Adicione API key

# 2. Configure um AI Theme
#    - Seção "AI Themes"
#    - Crie um tema

# 3. Teste geração de documento
#    - Use o botão "Gerar com IA" no editor
#    - Verifique se:
#      - ✅ Documento é gerado
#      - ✅ Contador de IA é incrementado
#      - ✅ Limites são respeitados
```

#### 4.3. Sistema de Convites

```bash
# 1. Como admin/owner, convide um novo membro
# 2. Verifique se:
#    - ✅ Convite é criado
#    - ✅ Email é enviado (se configurado)
#    - ✅ Token é gerado
#    - ✅ Convite pode ser aceito
```

---

### 5. 📊 MONITORAR LOGS E MÉTRICAS

**Vercel:**
```bash
# Ver logs em tempo real
vercel logs --follow

# Ou via Dashboard:
# https://vercel.com/dashboard > ndoc > Deployments > [último] > Functions
```

**Supabase:**
```bash
# Dashboard > Logs > API Logs
# Verificar queries e erros
```

**Browser:**
```bash
# DevTools (F12) > Console
# Verificar erros do frontend
```

---

### 6. 🚀 DEPLOY EM PRODUÇÃO

**Se ainda não fez deploy:**

```bash
# 1. Fazer deploy
vercel --prod

# 2. Verificar build
vercel logs --follow

# 3. Testar em produção
# https://ndoc-eight.vercel.app
```

**Se já fez deploy:**

```bash
# 1. Verificar se está na branch correta
git branch

# 2. Fazer merge se necessário
git checkout main
git merge sua-branch

# 3. Push e deploy
git push origin main
vercel --prod
```

---

### 7. 🔒 CONFIGURAR SEGURANÇA

#### 7.1. Habilitar Leaked Password Protection

```bash
# Supabase Dashboard > Settings > Auth > Passwords
# ✅ Habilitar "Leaked password protection"
```

#### 7.2. Verificar RLS Policies

```sql
-- Verificar se RLS está habilitado em todas as tabelas
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Todas devem ter rowsecurity = true
```

#### 7.3. Verificar Rate Limiting

```bash
# Verificar se Redis está configurado
# Se não estiver, rate limiting usará fallback em memória
# (funciona, mas não é distribuído)
```

---

### 8. 📚 DOCUMENTAÇÃO

#### 8.1. Atualizar README

- [ ] Adicionar screenshots
- [ ] Adicionar exemplos de uso
- [ ] Documentar APIs principais

#### 8.2. Criar Guias de Uso

- [ ] Guia de onboarding para usuários
- [ ] Guia de administração
- [ ] Guia de integração com Stripe (quando implementar)

---

### 9. 🎨 MELHORIAS DE UX

- [ ] Adicionar loading states
- [ ] Melhorar mensagens de erro
- [ ] Adicionar tooltips
- [ ] Melhorar responsividade mobile

---

### 10. 💰 INTEGRAÇÃO COM STRIPE (Futuro)

**Quando estiver pronto para monetizar:**

1. Criar conta Stripe
2. Configurar produtos e preços
3. Implementar webhooks do Stripe
4. Integrar checkout
5. Testar fluxo completo de pagamento

**Documentação:** Ver `PLANEJAMENTO-SAAS.md` para roadmap completo

---

## 📋 Checklist Rápido

Use este checklist para acompanhar o progresso:

### Setup Inicial
- [x] Migrations executadas
- [x] Função `handle_new_user()` criada
- [x] API Route implementada
- [x] Planos criados
- [ ] **Teste de signup** ⬅️ **FAZER AGORA**
- [ ] Teste de onboarding
- [ ] Variáveis de ambiente verificadas

### Funcionalidades Core
- [ ] Criação de documentos
- [ ] Geração com IA
- [ ] Sistema de convites
- [ ] Tracking de uso
- [ ] Limites de plano

### Produção
- [ ] Deploy na Vercel
- [ ] Logs monitorados
- [ ] Segurança configurada
- [ ] Documentação atualizada

---

## 🆘 Precisa de Ajuda?

- **Erros no signup?** → Ver [WEBHOOK-SETUP.md](WEBHOOK-SETUP.md) seção Troubleshooting
- **Erros nas migrations?** → Ver [MIGRATIONS.md](MIGRATIONS.md) seção Troubleshooting
- **Problemas no deploy?** → Ver [VERCEL-SETUP.md](VERCEL-SETUP.md)
- **Dúvidas sobre o projeto?** → Ver [README.md](README.md)

---

**Próximo passo imediato:** 🎯 **TESTAR O FLUXO DE SIGNUP**
