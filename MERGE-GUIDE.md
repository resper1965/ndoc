# 🔀 Guia de Merge - GitHub

**Última atualização:** 2025-01-15

Este guia mostra como fazer merge da branch de desenvolvimento para a main após completar as features.

---

## 📖 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Método 1: Via GitHub UI](#método-1-via-github-ui-recomendado)
4. [Método 2: Via Git CLI](#método-2-via-git-cli)
5. [Pós-Merge](#pós-merge)
6. [Troubleshooting](#troubleshooting)

---

## 🔍 Visão Geral

### Branch Atual
```
claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF
```

### Branch de Destino
```
main (ou master)
```

### O que vai ser mergeado

**Commits:**
- feat: transformar aplicação em SaaS 100% funcional
- feat: completar transformação SaaS com enforcement, onboarding e melhorias
- docs: adicionar documentação de migrations, Redis e merge

**Arquivos principais:**
- ✅ 5 migrations SQL
- ✅ Sistema de limites e enforcement
- ✅ Wizard de onboarding
- ✅ Páginas legais (termos/privacidade)
- ✅ API de billing
- ✅ Documentação completa

---

## ✅ Pré-requisitos

Antes de fazer merge, certifique-se:

- [ ] Todos os commits foram feitos
- [ ] Push para a branch foi realizado
- [ ] Build local está passando (`pnpm build`)
- [ ] Linter está passando (`pnpm lint`)
- [ ] Testes estão passando (`pnpm test`)
- [ ] Migrations foram documentadas
- [ ] Redis foi configurado

### Verificação Rápida

```bash
# 1. Ver status
git status

# 2. Ver commits não mergeados
git log main..claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF --oneline

# 3. Verificar build
pnpm build

# 4. Verificar linter
pnpm lint
```

---

## 🌐 Método 1: Via GitHub UI (Recomendado)

### Passo 1: Acessar o Repositório

1. Acesse: https://github.com/resper1965/ndoc
2. Faça login se necessário

### Passo 2: Criar Pull Request

#### Opção A: Via Banner Automático

Se você acabou de fazer push, verá um banner amarelo:

```
"claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF had recent pushes"
[Compare & pull request]
```

1. Clique em **"Compare & pull request"**

#### Opção B: Via Menu

1. Clique em **"Pull requests"** no topo
2. Clique em **"New pull request"**
3. Em "compare", selecione: `claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF`
4. Em "base", certifique-se que está: `main`
5. Clique em **"Create pull request"**

### Passo 3: Preencher Informações do PR

**Título sugerido:**
```
feat: Transformar aplicação em SaaS 100% funcional
```

**Descrição sugerida:**
```markdown
## 🎯 Objetivo

Transformar n.doc de aplicação single-tenant em SaaS multi-tenant completo com sistema de planos, enforcement de limites, onboarding e features essenciais.

## ✅ Features Implementadas

### Backend/Database
- [x] Trigger automático de criação de organização no signup
- [x] Sistema completo de planos e assinaturas (4 planos)
- [x] Enforcement de limites por plano
- [x] Sistema de auditoria (audit logs)
- [x] Sistema de convites para equipe
- [x] Tracking automático de uso
- [x] 5 migrations SQL documentadas

### Frontend
- [x] Wizard de onboarding (4 etapas)
- [x] Páginas legais (termos e privacidade)
- [x] Redirecionamento signup → onboarding

### APIs
- [x] API de billing (consulta de planos e uso)
- [x] Enforcement integrado em /api/ingest
- [x] Enforcement integrado em /api/ai/*
- [x] Tracking de uso de IA

### Infraestrutura
- [x] Rate limiting obrigatório em produção
- [x] Validação de env vars
- [x] Logging e monitoramento

## 📚 Documentação

- [x] MIGRATIONS.md - Guia completo de migrations
- [x] REDIS-SETUP.md - Configuração do Upstash Redis
- [x] MERGE-GUIDE.md - Este guia
- [x] Atualização do README.md

## 🧪 Testes

- [x] Build local passando
- [x] Linter passando
- [x] Testes unitários passando

## 📋 Checklist Pós-Merge

- [ ] Executar migrations no Supabase
- [ ] Configurar Redis no Vercel
- [ ] Deploy para produção
- [ ] Testar fluxo completo de signup → onboarding

## 🔗 Links Relacionados

- Migrations: `MIGRATIONS.md`
- Setup Redis: `REDIS-SETUP.md`
- Issues fechadas: N/A
```

### Passo 4: Revisar Mudanças

1. Role para baixo até **"Files changed"**
2. Revise as mudanças linha por linha
3. Certifique-se que não há:
   - ❌ Arquivos `.env.local` commitados
   - ❌ Secrets expostos
   - ❌ `console.log()` esquecidos
   - ❌ Código comentado desnecessário
   - ❌ TODOs importantes não resolvidos

### Passo 5: Solicitar Reviewers (Opcional)

Se trabalha em equipe:
1. Clique em **"Reviewers"** no lado direito
2. Adicione membros da equipe
3. Aguarde aprovação

### Passo 6: Merge!

Quando tudo estiver OK:

1. Clique em **"Merge pull request"**
2. Escolha o tipo de merge:
   - ✅ **"Create a merge commit"** (recomendado - mantém histórico)
   - ⚠️ "Squash and merge" (se quiser comprimir commits)
   - ⚠️ "Rebase and merge" (apenas se souber o que está fazendo)

3. Clique em **"Confirm merge"**

### Passo 7: Deletar Branch (Opcional)

Após merge bem-sucedido, verá a opção:
```
[Delete branch]
```

- ✅ **Clique para deletar** se não precisar mais da branch
- ❌ **Mantenha** se quiser preservar para referência

---

## 💻 Método 2: Via Git CLI

### Passo 1: Atualizar Main Local

```bash
# Mudar para main
git checkout main

# Atualizar com remote
git pull origin main
```

### Passo 2: Merge da Branch

```bash
# Merge da branch de desenvolvimento
git merge claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF

# Se houver conflitos, resolva-os
# Depois:
git add .
git commit -m "Merge: transformação SaaS completa"
```

### Passo 3: Push para Main

```bash
# Push para origin/main
git push origin main
```

### Passo 4: Deletar Branch Local e Remota (Opcional)

```bash
# Deletar branch local
git branch -d claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF

# Deletar branch remota
git push origin --delete claude/analyze-saas-application-01Q63FH2PdqkKyo9bj5W65LF
```

---

## 🔄 Pós-Merge

### 1. Verificar Deploy Automático

Se tem CI/CD configurado (Vercel, etc.):

1. Acesse o dashboard de deploy
2. Verifique se deploy foi disparado
3. Acompanhe logs de build
4. Aguarde deploy concluir

**Vercel:**
```
https://vercel.com/resper1965/ndoc/deployments
```

### 2. Executar Migrations

**⚠️ IMPORTANTE:** Migrations devem ser executadas manualmente

```bash
# Via Supabase CLI
supabase login
supabase link --project-ref SEU_PROJECT_ID
supabase db push
```

Ou via Dashboard Supabase (veja `MIGRATIONS.md`)

### 3. Configurar Redis

Se ainda não configurou:

1. Siga o guia em `REDIS-SETUP.md`
2. Crie database no Upstash
3. Configure variáveis no Vercel
4. Faça redeploy

### 4. Testar em Produção

Após deploy:

1. **Teste Signup:**
   - Criar nova conta
   - Verificar se organização foi criada automaticamente
   - Verificar se onboarding aparece

2. **Teste Limites:**
   - Criar documentos até atingir limite (10 no Free)
   - Verificar mensagem de erro
   - Verificar sugestão de upgrade

3. **Teste IA:**
   - Configurar provedor de IA
   - Gerar documento
   - Verificar incremento de contador

4. **Teste Convites:**
   - Convidar membro para equipe
   - Aceitar convite
   - Verificar permissões

### 5. Monitorar Logs

Primeiros dias após merge:

- ✅ Monitorar erros no Vercel/Sentry
- ✅ Verificar logs do Supabase
- ✅ Acompanhar métricas do Upstash
- ✅ Observar comportamento de usuários

---

## 🐛 Troubleshooting

### Conflito de Merge

**Sintoma:**
```
CONFLICT (content): Merge conflict in src/...
Automatic merge failed; fix conflicts and then commit the result.
```

**Solução:**
```bash
# 1. Ver arquivos em conflito
git status

# 2. Abrir cada arquivo e resolver conflitos
# Procure por:
<<<<<<< HEAD
código da main
=======
código da sua branch
>>>>>>> branch-name

# 3. Remover marcadores e escolher código correto
# 4. Adicionar arquivos resolvidos
git add .

# 5. Completar merge
git commit
```

### Build Falha Após Merge

**Causa:** Dependências ou TypeScript errors

**Solução:**
```bash
# 1. Instalar dependências
pnpm install

# 2. Verificar erros TypeScript
pnpm build

# 3. Corrigir erros e commitar
git add .
git commit -m "fix: corrigir erros de build após merge"
git push origin main
```

### Migration Falha

**Causa:** Migrations executadas fora de ordem ou duplicadas

**Solução:**
Veja seção "Troubleshooting" em `MIGRATIONS.md`

### Redis Não Funciona

**Causa:** Variáveis não configuradas

**Solução:**
Veja `REDIS-SETUP.md` seção "Troubleshooting"

---

## ✅ Checklist Completa

### Antes do Merge
- [ ] Todos os commits feitos
- [ ] Push realizado
- [ ] Build passando
- [ ] Linter passando
- [ ] Testes passando
- [ ] Documentação criada

### Durante o Merge
- [ ] PR criado no GitHub
- [ ] Descrição completa
- [ ] Mudanças revisadas
- [ ] Aprovações recebidas (se necessário)
- [ ] Merge realizado

### Após o Merge
- [ ] Deploy verificado
- [ ] Migrations executadas
- [ ] Redis configurado
- [ ] Testes em produção
- [ ] Monitoramento ativo
- [ ] Branch deletada (opcional)

---

## 📊 Estatísticas do Merge

**Commits:** 3
**Arquivos Modificados:** 25+
**Linhas Adicionadas:** ~3,900
**Linhas Removidas:** ~30
**Migrations:** 5
**Documentação:** 3 arquivos novos

---

## 🔗 Links Úteis

- **Repositório:** https://github.com/resper1965/ndoc
- **Pull Requests:** https://github.com/resper1965/ndoc/pulls
- **Issues:** https://github.com/resper1965/ndoc/issues
- **Deployments (Vercel):** https://vercel.com/resper1965/ndoc
- **Supabase Dashboard:** https://supabase.com/dashboard

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique seções de **Troubleshooting** nos guias
2. Revise logs de erro
3. Consulte documentação oficial
4. Abra issue no GitHub

---

**Última atualização:** 2025-01-15
**Próximos Passos:** Executar migrations e configurar Redis
