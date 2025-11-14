# 🔍 Configuração do SonarCloud (GitHub Actions)

**Data**: 2025-01-14  
**Status**: ✅ Configurado para GitHub Actions

---

## 📋 Visão Geral

O projeto está configurado para usar **SonarCloud** exclusivamente via **GitHub Actions**. Não é necessária configuração local - tudo é executado automaticamente no CI/CD.

---

## 🚀 Setup Inicial (Uma Vez)

### 1. Criar Conta no SonarCloud

1. Acesse: https://sonarcloud.io
2. Faça login com sua conta GitHub
3. Autorize o SonarCloud a acessar seus repositórios

### 2. Adicionar Projeto

1. No SonarCloud, vá em **"Add Project"**
2. Selecione o repositório `resper1965/ndoc`
3. O SonarCloud criará automaticamente:
   - `projectKey`: `resper1965_ndoc` (ou similar)
   - `organization`: Sua organização do SonarCloud

### 3. Obter Token

1. No SonarCloud, vá em: **Account > Security > Generate Token**
2. Dê um nome ao token (ex: "GitHub Actions - ndoc")
3. Copie o token gerado (você só verá uma vez!)

### 4. Configurar GitHub Secret

1. No repositório GitHub, vá em: **Settings > Secrets and variables > Actions**
2. Clique em **"New repository secret"**
3. Configure:
   - **Name**: `SONAR_TOKEN`
   - **Secret**: Cole o token copiado do SonarCloud
4. Clique em **"Add secret"**

### 5. Pronto! ✅

A próxima vez que você fizer push ou abrir um PR, a análise será executada automaticamente.

---

## 🔄 Como Funciona

### Execução Automática

A análise é executada automaticamente quando:

- ✅ **Push** para `main` ou `develop`
- ✅ **Pull Request** para `main` ou `develop`
- ✅ **Execução manual** via "Run workflow" no GitHub Actions

### Processo

1. GitHub Actions executa o workflow `.github/workflows/sonarcloud.yml`
2. Instala dependências e executa testes com cobertura
3. Gera relatório de cobertura (`coverage/lcov.info`)
4. Executa build do projeto
5. Envia dados para SonarCloud
6. SonarCloud analisa o código e gera relatório

---

## 📊 Ver Resultados

### No GitHub

- **Badge de Status**: Aparece na página do repositório
- **PR Comments**: Comentários automáticos com resultados
- **Actions Tab**: Logs completos da execução

### No SonarCloud

- **Dashboard**: https://sonarcloud.io/project/overview?id=n.doc
- **Métricas**: Bugs, vulnerabilidades, code smells, cobertura
- **Quality Gate**: Status de aprovação/reprovação

---

## 📈 O que é Analisado

### Qualidade de Código

- ✅ **Bugs**: Erros no código que podem causar comportamento incorreto
- ✅ **Vulnerabilidades**: Problemas de segurança
- ✅ **Code Smells**: Problemas de manutenibilidade
- ✅ **Duplicação**: Código duplicado
- ✅ **Complexidade**: Complexidade ciclomática

### Cobertura de Testes

- ✅ **Statements**: Porcentagem de linhas executadas
- ✅ **Branches**: Porcentagem de branches testadas
- ✅ **Functions**: Porcentagem de funções testadas
- ✅ **Lines**: Porcentagem de linhas cobertas

**Cobertura Atual**: ~44% (objetivo: 80%+)

---

## 🎯 Quality Gate

O projeto usa o **Quality Gate padrão** do SonarCloud:

- ✅ Nenhum bug novo
- ✅ Nenhuma vulnerabilidade nova
- ✅ Cobertura de testes >= 80% (configurável)
- ✅ Duplicação < 3%
- ✅ Débito técnico < 5%

### Personalizar Quality Gate

1. Acesse o SonarCloud
2. Vá em: **Project Settings > Quality Gates**
3. Personalize os critérios conforme necessário

---

## 🔧 Configuração do Workflow

O workflow está em `.github/workflows/sonarcloud.yml` e executa:

```yaml
1. Checkout do código
2. Setup Node.js 20 + pnpm
3. Instalação de dependências
4. Execução de testes com cobertura
5. Build do projeto
6. Análise SonarCloud
```

### Exclusões Configuradas

O SonarCloud está configurado para **ignorar**:
- `node_modules/`
- `.next/`, `out/`, `dist/`, `build/`
- Arquivos de configuração (`*.config.*`)
- Arquivos de teste (para análise de duplicação)
- `public/`, `docs/`, `specs/`, `bmad_backup/`
- Arquivos Markdown
- Migrações do Supabase

### Inclusões

O SonarCloud analisa apenas:
- `src/**/*.ts`
- `src/**/*.tsx`
- `src/**/*.js`
- `src/**/*.jsx`

---

## ⚠️ Troubleshooting

### Análise não está sendo executada

**Verificar:**
1. `SONAR_TOKEN` está configurado no GitHub Secrets?
2. Workflow está habilitado em `.github/workflows/sonarcloud.yml`?
3. Branch está em `main` ou `develop`?

**Solução:**
- Verifique os logs do GitHub Actions
- Verifique se o secret está configurado corretamente

### Erro: "Project key not found"

**Verificar:**
1. Projeto foi criado no SonarCloud?
2. `projectKey` está correto no workflow?

**Solução:**
- Crie o projeto no SonarCloud primeiro
- Verifique o `projectKey` no dashboard do SonarCloud

### Cobertura não aparece

**Verificar:**
1. Testes estão passando?
2. Relatório `coverage/lcov.info` está sendo gerado?

**Solução:**
- Verifique os logs do GitHub Actions
- Execute `pnpm test:coverage` localmente para testar

### Erro: "SONAR_TOKEN not found"

**Verificar:**
1. Secret está configurado no GitHub?
2. Nome do secret está correto (`SONAR_TOKEN`)?

**Solução:**
- Configure o secret no GitHub: Settings > Secrets > Actions

---

## 📝 Notas Importantes

- ✅ **Não é necessária configuração local** - tudo roda no GitHub Actions
- ✅ **Análise automática** em cada push/PR
- ✅ **Cobertura integrada** - relatório gerado automaticamente
- ✅ **Badges de status** podem ser adicionados ao README
- ✅ **Comentários automáticos** em PRs com resultados

---

## 🔗 Links Úteis

- [SonarCloud Dashboard](https://sonarcloud.io/project/overview?id=n.doc)
- [Documentação SonarCloud](https://docs.sonarcloud.io/)
- [GitHub Actions Workflow](.github/workflows/sonarcloud.yml)
- [SonarCloud GitHub Action](https://github.com/SonarSource/sonarcloud-github-action)

---

## ✅ Checklist de Setup

- [ ] Conta criada no SonarCloud
- [ ] Projeto adicionado no SonarCloud
- [ ] Token gerado
- [ ] Token adicionado ao GitHub Secrets (`SONAR_TOKEN`)
- [ ] Workflow do GitHub Actions funcionando
- [ ] Análise executada com sucesso

---

**Última atualização**: 2025-01-14
