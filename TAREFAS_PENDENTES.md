# ⚠️ TAREFAS PENDENTES - AÇÕES MANUAIS NECESSÁRIAS

**Data:** 2025-01-20
**Branch:** `claude/code-review-schema-check-01ANtoZPFnSZpoGVe4Vxmu6u`
**Status:** Correções implementadas, aguardando ações manuais

---

## 🔴 CRÍTICO - FAZER ANTES DE DEPLOY EM PRODUÇÃO

### 1. Executar Migrations SQL no Supabase

**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 10-15 minutos
**Responsável:** DevOps/Backend Team

#### Passos:

1. **Acesse o Supabase Dashboard**
   - URL: https://app.supabase.com
   - Navegue até: SQL Editor

2. **Execute as migrations na ORDEM EXATA:**

```sql
-- Migration 1: Criar funções helper
-- Arquivo: supabase/migrations/20250120000000_add_missing_helper_functions.sql
-- Copie todo o conteúdo e execute no SQL Editor
-- ⚠️ IMPORTANTE: Estas funções são necessárias para as políticas RLS funcionarem!

-- Migration 2: Corrigir políticas RLS
-- Arquivo: supabase/migrations/20250120000001_fix_critical_rls_policies.sql
-- ⚠️ IMPORTANTE: Corrige vulnerabilidades de segurança críticas!

-- Migration 3: Adicionar índices
-- Arquivo: supabase/migrations/20250120000002_add_missing_indexes.sql
-- ⏱️ Esta migration pode demorar 1-2 minutos em tabelas grandes

-- Migration 4: Corrigir constraints de convites
-- Arquivo: supabase/migrations/20250120000003_fix_invites_constraint.sql

-- Migration 5: Limpar migrations antigas
-- Arquivo: supabase/migrations/20250120000004_deprecate_old_tables.sql
```

3. **Verificar execução:**
   - Após cada migration, verifique se não há erros
   - Confira logs no Supabase Dashboard

#### ✅ Checklist de Validação:

```sql
-- Verificar se funções foram criadas
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'is_superadmin',
    'is_orgadmin',
    'user_belongs_to_organization',
    'get_user_organizations',
    'get_user_role_in_organization'
  );
-- Deve retornar 5 funções

-- Verificar índices criados
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%';
-- Deve retornar 20+ índices

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
-- Verifique se políticas foram atualizadas
```

---

### 2. Testar Políticas RLS em Staging

**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 30-45 minutos
**Responsável:** QA/Backend Team

#### Cenários de Teste:

**Teste 1: Isolamento de Organizações**

```bash
# Como usuário da Org A, tentar acessar documento da Org B
# Deve retornar erro 403 Forbidden
curl -X GET https://staging-url/api/ingest?path=doc-org-b \
  -H "Authorization: Bearer $TOKEN_USER_ORG_A"
```

**Teste 2: Roles e Permissões**

```bash
# Como viewer, tentar editar documento
# Deve retornar erro 403
curl -X PUT https://staging-url/api/ingest \
  -H "Authorization: Bearer $TOKEN_VIEWER" \
  -d '{"path": "test", "content": "new content"}'
```

**Teste 3: Superadmin Access**

```bash
# Como superadmin, listar todas organizações
# Deve retornar todas
curl -X GET https://staging-url/api/admin \
  -H "Authorization: Bearer $TOKEN_SUPERADMIN"
```

**Teste 4: Audit Logs**

```bash
# Fazer uma ação qualquer e verificar se audit log foi criado
# Verificar no Supabase: SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;
```

---

### 3. Configurar Variáveis de Ambiente em Produção

**Prioridade:** 🔴 CRÍTICA
**Tempo estimado:** 5 minutos
**Responsável:** DevOps

#### Variáveis Obrigatórias:

```bash
# Vercel Dashboard > Settings > Environment Variables

# Supabase (já devem estar configuradas)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... # Apenas backend

# Upstash Redis (OBRIGATÓRIO em produção)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# OpenAI (se usar AI features)
OPENAI_API_KEY=sk-...

# App URL (para background jobs)
NEXT_PUBLIC_APP_URL=https://ndoc-production.vercel.app
```

#### Validação:

- [ ] Todas variáveis configuradas
- [ ] Redis testado (fazer uma requisição e verificar rate limit)
- [ ] Build de produção passou

---

### 4. Monitorar Logs Após Deploy

**Prioridade:** 🟡 ALTA
**Tempo estimado:** 30 minutos (pós-deploy)
**Responsável:** DevOps/Backend Team

#### O que monitorar:

1. **Logs de Segurança:**
   - Tentativas falhas de login
   - Rate limiting ativado
   - Erros de autorização (403)

2. **Logs de Performance:**
   - Queries lentas (verificar se índices estão sendo usados)
   - Timeouts
   - Uso de memória

3. **Logs de Aplicação:**
   - Erros 500
   - Warnings
   - Background jobs

#### Ferramentas:

- Vercel Dashboard > Logs
- Supabase Dashboard > Logs
- Sentry (se configurado)

---

## 🟡 ALTO - FAZER EM 1-2 SEMANAS

### 5. Resolver Vulnerabilidades de Dependências

**Prioridade:** 🟡 ALTA
**Tempo estimado:** 2-4 horas
**Responsável:** Backend Team

#### CVE-2021-23413: jszip (Prototype Pollution)

**Problema:**

```json
{
  "package": "jszip",
  "version": "2.6.1",
  "via": "pptx-parser",
  "severity": "CRITICAL",
  "cve": "CVE-2021-23413"
}
```

**Opções de solução:**

**Opção 1: Aguardar update do pptx-parser**

```bash
# Monitorar releases
npm view pptx-parser versions
# Se nova versão disponível:
pnpm update pptx-parser
```

**Opção 2: Trocar biblioteca (RECOMENDADO)**

```bash
# Opções alternativas para parsing PPTX:
pnpm remove pptx-parser
pnpm add pptxjs  # ou outro parser mais mantido
```

**Opção 3: Workaround temporário**

```typescript
// src/lib/processing/convert-document.ts
// Adicionar validação extra antes de processar PPTX:

if (
  mimeType ===
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
) {
  // Validar arquivo antes de processar
  const maxSizePPTX = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizePPTX) {
    throw new Error('Arquivo PPTX muito grande');
  }

  // TODO: Adicionar validação de ZIP structure
  // Para mitigar prototype pollution
}
```

#### Outras vulnerabilidades:

**xlsx (2 issues)**

```bash
# Verificar updates disponíveis
pnpm outdated xlsx
# Se disponível, atualizar
pnpm update xlsx
```

**prismjs (via react-syntax-highlighter)**

```bash
pnpm update react-syntax-highlighter
# Se não resolver, considerar alternativa:
# pnpm add shiki (alternativa moderna)
```

**next 15.2.4 (3 issues)**

```bash
# Monitorar releases do Next.js
pnpm outdated next
# Atualizar quando 15.2.5+ estiver disponível
pnpm update next
```

---

### 6. Implementar Criptografia de API Keys

**Prioridade:** 🟡 ALTA
**Tempo estimado:** 3-4 horas
**Responsável:** Backend Team

#### Problema Atual:

API keys (OpenAI, Anthropic) armazenadas em texto plano no banco de dados.

#### Solução: Supabase Vault

**Passo 1: Habilitar Vault no Supabase**

```sql
-- No Supabase Dashboard > SQL Editor
-- Verificar se Vault está disponível
SELECT * FROM vault.secrets LIMIT 1;
```

**Passo 2: Migrar API Keys para Vault**

```sql
-- Migration: 20250121000000_migrate_api_keys_to_vault.sql

-- Criar função para criptografar API keys
CREATE OR REPLACE FUNCTION encrypt_api_key(
  p_organization_id UUID,
  p_provider TEXT,
  p_api_key TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_secret_id UUID;
BEGIN
  -- Inserir no Vault
  INSERT INTO vault.secrets (secret, name)
  VALUES (
    p_api_key,
    format('api_key_%s_%s', p_organization_id, p_provider)
  )
  RETURNING id INTO v_secret_id;

  RETURN v_secret_id;
END;
$$;

-- Atualizar tabela ai_provider_config
ALTER TABLE ai_provider_config
ADD COLUMN vault_secret_id UUID REFERENCES vault.secrets(id);

-- Migrar dados existentes
-- ⚠️ FAZER EM JANELA DE MANUTENÇÃO
UPDATE ai_provider_config
SET vault_secret_id = encrypt_api_key(organization_id, provider, api_key);

-- Depois de validar, remover coluna api_key
-- ALTER TABLE ai_provider_config DROP COLUMN api_key;
```

**Passo 3: Atualizar código da aplicação**

```typescript
// src/app/api/ai/providers/route.ts

// ANTES:
const { data: provider } = await supabase
  .from('ai_provider_config')
  .select('id, provider, model, api_key') // ❌ api_key em texto plano
  .single();

// DEPOIS:
const { data: provider } = await supabase
  .from('ai_provider_config')
  .select('id, provider, model, vault_secret_id')
  .single();

// Buscar API key do Vault (apenas no backend)
const { data: secret } = await supabase.rpc('get_vault_secret', {
  secret_id: provider.vault_secret_id,
});

const apiKey = secret.decrypted_secret; // ✅ Descriptografado apenas em memória
```

---

### 7. Adicionar Testes E2E de Segurança

**Prioridade:** 🟡 ALTA
**Tempo estimado:** 4-6 horas
**Responsável:** QA Team

#### Criar suite de testes E2E:

```bash
# Instalar Playwright
pnpm add -D @playwright/test
npx playwright install
```

**Arquivo: `tests/e2e/security.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
  test('deve bloquear acesso sem autenticação', async ({ page }) => {
    await page.goto('/config');
    await expect(page).toHaveURL(/.*login/);
  });

  test('deve impedir mudança de senha sem senha atual', async ({
    page,
    request,
  }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'old-password');
    await page.click('button[type="submit"]');

    // Tentar mudar senha sem senha atual
    const response = await request.put('/api/config/credentials', {
      data: { newPassword: 'new-password' }, // Sem currentPassword
    });

    expect(response.status()).toBe(400);
  });

  test('deve aplicar rate limiting', async ({ request }) => {
    const requests = [];

    // Fazer 10 requisições rápidas
    for (let i = 0; i < 10; i++) {
      requests.push(request.post('/api/ingest', { data: { test: true } }));
    }

    const responses = await Promise.all(requests);
    const rateLimited = responses.some((r) => r.status() === 429);

    expect(rateLimited).toBeTruthy();
  });

  test('deve sanitizar HTML em uploads', async ({ page }) => {
    await page.goto('/config');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'malicious.html',
      mimeType: 'text/html',
      buffer: Buffer.from('<script>alert("XSS")</script><h1>Test</h1>'),
    });

    await page.click('button:has-text("Upload")');

    // Verificar que script foi removido
    const content = await page.textContent('.document-content');
    expect(content).not.toContain('<script>');
    expect(content).toContain('Test'); // H1 permitido
  });

  test('deve isolar dados entre organizações', async ({ page, context }) => {
    // Login como usuário da Org A
    await page.goto('/login');
    await page.fill('[name="email"]', 'user-org-a@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Tentar acessar documento da Org B via URL direta
    await page.goto('/docs/org-b-document');

    // Deve mostrar erro 403 ou redirecionar
    await expect(page.locator('text=Acesso negado')).toBeVisible();
  });
});
```

**Executar testes:**

```bash
pnpm test:e2e
```

---

## 🟢 MÉDIO - FAZER EM 1 MÊS

### 8. Implementar 2FA (Autenticação de Dois Fatores)

**Prioridade:** 🟢 MÉDIA
**Tempo estimado:** 8-12 horas
**Responsável:** Full Stack Team

#### Supabase tem suporte nativo para 2FA!

**Documentação:** https://supabase.com/docs/guides/auth/auth-mfa

**Implementação:**

```typescript
// src/app/api/auth/mfa/enroll/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: 'totp',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Retornar QR code para usuário escanear
  return NextResponse.json({
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
    factorId: data.id,
  });
}

// src/app/api/auth/mfa/verify/route.ts
export async function POST(request: NextRequest) {
  const { factorId, code } = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code,
  });

  if (error) {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

**UI Components:**

- Página de configuração de 2FA
- QR Code display
- Input para código TOTP
- Backup codes

---

### 9. Penetration Testing

**Prioridade:** 🟢 MÉDIA
**Tempo estimado:** 16-24 horas (contratar externo)
**Responsável:** Security Team / Consultor Externo

#### Contratar serviço de Pentest:

**Opções:**

- HackerOne
- Synack
- Cobalt.io
- Consultor de segurança local

**Escopo do teste:**

- [ ] Testes de autenticação e autorização
- [ ] SQL Injection (apesar de usar Supabase)
- [ ] XSS e CSRF
- [ ] Rate limiting bypass
- [ ] File upload vulnerabilities
- [ ] API security
- [ ] Session management
- [ ] Privilege escalation

**Deliverables:**

- Relatório completo de vulnerabilidades
- Proof of Concept (PoC) para cada issue
- Recomendações de correção
- Re-teste após correções

---

### 10. Security Training para Equipe

**Prioridade:** 🟢 MÉDIA
**Tempo estimado:** 4-8 horas (workshop)
**Responsável:** Tech Lead / Security Expert

#### Tópicos do treinamento:

1. **OWASP Top 10**
   - Entender cada vulnerabilidade
   - Como prevenir no código

2. **Secure Coding Practices**
   - Input validation
   - Output encoding
   - Authentication best practices
   - Authorization patterns

3. **Supabase Security**
   - RLS policies
   - Row Level Security
   - API keys management
   - Vault usage

4. **Code Review Security**
   - O que procurar em PRs
   - Security checklist
   - Red flags

5. **Incident Response**
   - O que fazer em caso de breach
   - Escalation procedures
   - Communication plan

**Material:**

- Slides de apresentação
- Exemplos de código
- Exercícios práticos
- Checklist de segurança

---

## 📋 CHECKLIST FINAL

### Antes de Deploy em Produção

- [ ] Migrations SQL executadas no Supabase
- [ ] Políticas RLS testadas em staging
- [ ] Rate limiting validado
- [ ] Variáveis de ambiente configuradas
- [ ] Build de produção passou
- [ ] Testes E2E de segurança passando
- [ ] Documentação atualizada
- [ ] Equipe treinada nas mudanças
- [ ] Plano de rollback definido
- [ ] Monitoramento configurado

### Após Deploy

- [ ] Monitorar logs por 48h
- [ ] Verificar métricas de performance
- [ ] Confirmar rate limiting funcionando
- [ ] Validar políticas RLS em produção
- [ ] Revisar alertas de segurança

### Curto Prazo (1-2 semanas)

- [ ] Resolver jszip vulnerability
- [ ] Atualizar outras dependências
- [ ] Implementar criptografia de API keys
- [ ] Adicionar testes E2E de segurança

### Médio Prazo (1 mês)

- [ ] Implementar 2FA
- [ ] Contratar Penetration Testing
- [ ] Realizar Security Training
- [ ] Configurar alertas avançados

---

## 📞 SUPORTE

**Em caso de dúvidas:**

- Revisar `SECURITY_FIXES.md` para detalhes técnicos
- Consultar migrations em `supabase/migrations/202501200000*`
- Verificar commit `cbeda8b` para código implementado

**Recursos úteis:**

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

**Última atualização:** 2025-01-20
**Branch:** `claude/code-review-schema-check-01ANtoZPFnSZpoGVe4Vxmu6u`
**Commit:** `cbeda8b`
