# 🚀 Planejamento: Transformação em SaaS

**Data**: 2025-01-14  
**Status**: 📋 Planejamento  
**Versão**: 1.0.0

---

## 🎯 Objetivo

Transformar o **n.doc** de uma aplicação single-tenant em uma plataforma SaaS multi-tenant completa, permitindo que múltiplas organizações utilizem a plataforma de forma isolada e independente.

---

## 📊 Análise da Situação Atual

### ✅ O que já temos:
- ✅ Autenticação com Supabase
- ✅ Sistema de usuários e roles (RBAC)
- ✅ Multi-tenancy básico (organizações)
- ✅ Editor MDX avançado
- ✅ Gerenciamento de documentos
- ✅ Integração com IA
- ✅ Interface moderna e responsiva

### ❌ O que falta para SaaS:
- ❌ Onboarding completo para novos usuários
- ❌ Sistema de planos e assinaturas
- ❌ Billing e pagamentos
- ❌ Dashboard administrativo para organizações
- ❌ Limites por plano (documentos, usuários, storage)
- ❌ Página de landing/marketing
- ❌ Sistema de convites para equipes
- ❌ Analytics e métricas por organização
- ❌ Suporte a customização por organização (branding)

---

## 🏗️ Arquitetura SaaS

### 1. Multi-Tenancy Completo

#### 1.1 Isolamento de Dados
```
┌─────────────────────────────────────┐
│  Organization (Tenant)              │
├─────────────────────────────────────┤
│  - id (uuid)                        │
│  - name                             │
│  - slug (unique)                    │
│  - plan_id                          │
│  - subscription_status              │
│  - custom_branding (JSON)           │
│  - settings (JSON)                  │
│  - created_at                       │
│  - updated_at                       │
└─────────────────────────────────────┘
```

#### 1.2 Estrutura de Dados
- **Organizations**: Isolamento completo por tenant
- **Users**: Vinculados a organizações (múltiplas orgs possível)
- **Documents**: Sempre vinculados a uma organização
- **AI Config**: Por organização
- **Analytics**: Por organização

### 2. Sistema de Planos

#### 2.1 Planos Propostos

| Plano | Preço | Documentos | Usuários | Storage | IA | Suporte |
|-------|-------|------------|----------|---------|----|---------| 
| **Free** | R$ 0 | 10 | 1 | 100MB | ❌ | Comunidade |
| **Starter** | R$ 49/mês | 100 | 5 | 1GB | ✅ (limitado) | Email |
| **Professional** | R$ 149/mês | Ilimitado | 20 | 10GB | ✅ | Email + Chat |
| **Enterprise** | Custom | Ilimitado | Ilimitado | Ilimitado | ✅ | Dedicado |

#### 2.2 Limites por Plano
- **Documentos**: Quantidade máxima
- **Usuários**: Membros da equipe
- **Storage**: Espaço para arquivos/imagens
- **IA**: Requisições por mês
- **Customização**: Branding personalizado
- **API**: Rate limits

### 3. Fluxo de Onboarding

```
1. Landing Page
   ↓
2. Sign Up (criar conta)
   ↓
3. Criar Organização
   ↓
4. Escolher Plano (Free por padrão)
   ↓
5. Onboarding Wizard
   - Configurar branding
   - Convidar equipe
   - Criar primeiro documento
   ↓
6. Dashboard Principal
```

---

## 📋 Fases de Implementação

### **FASE 1: Fundação SaaS** (Semana 1-2)

#### 1.1 Correções Críticas
- [x] Corrigir tela branca (logo/branding)
- [ ] Adicionar fallback para logo ausente
- [ ] Melhorar tratamento de erros
- [ ] Adicionar loading states

#### 1.2 Multi-Tenancy Completo
- [ ] Migração de schema: adicionar `organization_id` em todas as tabelas
- [ ] Middleware: detectar organização via subdomain ou header
- [ ] RLS (Row Level Security): políticas por organização
- [ ] Context de organização no frontend

#### 1.3 Sistema de Organizações
- [ ] CRUD de organizações
- [ ] Seleção de organização (se usuário tem múltiplas)
- [ ] Convites para organizações
- [ ] Roles por organização

### **FASE 2: Onboarding e UX** (Semana 3-4)

#### 2.1 Landing Page
- [ ] Página de marketing/landing
- [ ] Features e benefícios
- [ ] Pricing table
- [ ] Testimonials
- [ ] CTA para sign up

#### 2.2 Onboarding Wizard
- [ ] Fluxo guiado para novos usuários
- [ ] Criação de organização
- [ ] Configuração inicial
- [ ] Tour da aplicação
- [ ] Primeiro documento

#### 2.3 Dashboard
- [ ] Dashboard principal por organização
- [ ] Métricas e estatísticas
- [ ] Atividades recentes
- [ ] Quick actions
- [ ] Notificações

### **FASE 3: Planos e Billing** (Semana 5-6)

#### 3.1 Sistema de Planos
- [ ] Tabela de planos no banco
- [ ] Seleção de plano no onboarding
- [ ] Upgrade/downgrade de plano
- [ ] Verificação de limites

#### 3.2 Integração de Pagamento
- [ ] Integração com Stripe/PagSeguro
- [ ] Checkout de assinatura
- [ ] Webhooks de pagamento
- [ ] Gerenciamento de assinatura
- [ ] Faturas e histórico

#### 3.3 Limites e Quotas
- [ ] Middleware de verificação de limites
- [ ] UI de avisos de limite
- [ ] Bloqueio de ações quando excedido
- [ ] Upgrade prompts

### **FASE 4: Features Avançadas** (Semana 7-8)

#### 4.1 Customização por Organização
- [ ] Branding personalizado (logo, cores)
- [ ] Domínio customizado
- [ ] Configurações por organização
- [ ] Templates personalizados

#### 4.2 Analytics e Métricas
- [ ] Dashboard de analytics
- [ ] Métricas de uso
- [ ] Relatórios por período
- [ ] Exportação de dados

#### 4.3 Colaboração
- [ ] Convites por email
- [ ] Notificações em tempo real
- [ ] Comentários em documentos
- [ ] Histórico de versões

### **FASE 5: Polimento e Lançamento** (Semana 9-10)

#### 5.1 Testes e QA
- [ ] Testes end-to-end
- [ ] Testes de carga
- [ ] Testes de segurança
- [ ] Correção de bugs

#### 5.2 Documentação
- [ ] Documentação de API
- [ ] Guias de uso
- [ ] FAQ
- [ ] Vídeos tutoriais

#### 5.3 Marketing e Lançamento
- [ ] Preparação para lançamento
- [ ] Estratégia de marketing
- [ ] Beta testing
- [ ] Lançamento público

---

## 🗄️ Schema do Banco de Dados

### Tabelas Principais

```sql
-- Organizações (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id),
  subscription_status VARCHAR(50) DEFAULT 'trial',
  custom_branding JSONB,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Planos
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  limits JSONB NOT NULL, -- {documents: 100, users: 5, storage: 1073741824}
  features JSONB, -- ["ai", "custom_branding", "api"]
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  plan_id UUID REFERENCES plans(id),
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membros da Organização
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL, -- owner, admin, editor, viewer
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Convites
CREATE TABLE organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar organization_id em documentos
ALTER TABLE documents ADD COLUMN organization_id UUID REFERENCES organizations(id);
CREATE INDEX idx_documents_organization ON documents(organization_id);

-- Adicionar organization_id em outras tabelas relevantes
ALTER TABLE ai_themes ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE ai_providers ADD COLUMN organization_id UUID REFERENCES organizations(id);
```

---

## 🔐 Segurança e Isolamento

### Row Level Security (RLS)

```sql
-- Política: Usuários só veem documentos da sua organização
CREATE POLICY "Users can only see documents from their organization"
ON documents FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid()
  )
);

-- Política: Apenas admins podem criar documentos
CREATE POLICY "Only admins can create documents"
ON documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = documents.organization_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin', 'editor')
  )
);
```

### Middleware de Organização

```typescript
// Detectar organização via subdomain ou header
// Exemplo: acme.ndoc.com → organização "acme"
// Ou: Header X-Organization-Id
```

---

## 💰 Modelo de Negócio

### Receita
- **Assinaturas mensais/anuais**: Principal fonte
- **Upsells**: Features premium
- **Enterprise**: Contratos customizados

### Custos
- **Infraestrutura**: Vercel, Supabase
- **IA**: OpenAI/Anthropic API
- **Pagamentos**: Taxa Stripe (~3%)
- **Suporte**: Time de atendimento

### Projeção (6 meses)
- **Mês 1-2**: 50 usuários (Free)
- **Mês 3-4**: 200 usuários (10% pagantes = 20)
- **Mês 5-6**: 500 usuários (15% pagantes = 75)
- **MRR estimado**: R$ 7.500 - R$ 11.250

---

## 🎨 Interface e UX

### Landing Page
- Hero section com CTA
- Features destacadas
- Pricing table
- Testimonials
- FAQ
- Footer com links

### Dashboard
- Visão geral da organização
- Métricas de uso
- Atividades recentes
- Quick actions
- Notificações

### Onboarding
- Wizard em 3-4 passos
- Configuração inicial
- Tour interativo
- Primeiro documento

---

## 📈 Métricas e Analytics

### KPIs Principais
- **MRR** (Monthly Recurring Revenue)
- **Churn Rate**
- **CAC** (Customer Acquisition Cost)
- **LTV** (Lifetime Value)
- **Conversion Rate** (Free → Paid)
- **DAU/MAU** (Daily/Monthly Active Users)

### Métricas por Organização
- Documentos criados
- Usuários ativos
- Uso de IA
- Storage utilizado
- Acessos à documentação

---

## 🚀 Próximos Passos Imediatos

1. **Corrigir tela branca** (URGENTE)
   - Adicionar fallback para logo
   - Verificar erros no console
   - Testar em produção

2. **Implementar Fase 1**
   - Multi-tenancy completo
   - Sistema de organizações
   - Onboarding básico

3. **Criar Landing Page**
   - Design moderno
   - CTA claro
   - Pricing table

4. **Integrar Pagamentos**
   - Stripe setup
   - Checkout flow
   - Webhooks

---

## 📚 Referências

- [Stripe Billing](https://stripe.com/docs/billing)
- [Supabase Multi-tenancy](https://supabase.com/docs/guides/auth/row-level-security)
- [SaaS Metrics](https://www.saastr.com/saas-metrics/)
- [Next.js Multi-tenancy](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Última atualização**: 2025-01-14

