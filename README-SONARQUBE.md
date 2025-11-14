# 🔍 SonarCloud - Análise de Qualidade de Código

## 📋 Visão Geral

Este projeto usa **SonarCloud** para análise automática de qualidade de código via **GitHub Actions**. A análise é executada automaticamente em cada push e pull request.

---

## 🚀 Como Funciona

A análise do SonarCloud é executada automaticamente através do GitHub Actions quando:

- ✅ Push para `main` ou `develop`
- ✅ Pull Request para `main` ou `develop`
- ✅ Execução manual via "Run workflow" no GitHub Actions

---

## ⚙️ Configuração Inicial

### 1. Criar Conta no SonarCloud

1. Acesse: https://sonarcloud.io
2. Faça login com sua conta GitHub
3. Autorize o SonarCloud a acessar seus repositórios

### 2. Adicionar Projeto

1. No SonarCloud, vá em **"Add Project"**
2. Selecione o repositório `resper1965/ndoc`
3. O SonarCloud criará automaticamente o `projectKey` e `organization`

### 3. Obter Token

1. No SonarCloud, vá em: **Account > Security > Generate Token**
2. Dê um nome ao token (ex: "GitHub Actions")
3. Copie o token gerado

### 4. Configurar GitHub Secret

1. No repositório GitHub, vá em: **Settings > Secrets and variables > Actions**
2. Clique em **"New repository secret"**
3. Nome: `SONAR_TOKEN`
4. Valor: Cole o token copiado do SonarCloud
5. Clique em **"Add secret"**

### 5. Pronto!

A próxima vez que você fizer push ou abrir um PR, a análise será executada automaticamente.

---

## 📊 Ver Resultados

Após a análise, você pode ver os resultados:

- **No GitHub**: Badge de status na página do repositório
- **No SonarCloud**: https://sonarcloud.io/project/overview?id=n.doc
- **No PR**: Comentários automáticos com os resultados da análise

---

## 🔍 O que é Analisado

- ✅ **Bugs**: Erros no código que podem causar comportamento incorreto
- ✅ **Vulnerabilidades**: Problemas de segurança
- ✅ **Code Smells**: Problemas de manutenibilidade
- ✅ **Cobertura**: Cobertura de testes (atualmente ~44%)
- ✅ **Duplicação**: Código duplicado
- ✅ **Complexidade**: Complexidade ciclomática

---

## 📈 Quality Gate

O projeto usa o **Quality Gate padrão** do SonarCloud, que verifica:

- ✅ Nenhum bug novo
- ✅ Nenhuma vulnerabilidade nova
- ✅ Cobertura de testes >= 80% (configurável)
- ✅ Duplicação < 3%
- ✅ Débito técnico < 5%

Você pode personalizar o Quality Gate no SonarCloud conforme necessário.

---

## 🛠️ Workflow do GitHub Actions

O workflow (`.github/workflows/sonarcloud.yml`) executa:

1. **Checkout** do código
2. **Setup** do Node.js e pnpm
3. **Instalação** de dependências
4. **Execução** de testes com cobertura
5. **Build** do projeto
6. **Análise** SonarCloud

---

## ⚠️ Troubleshooting

### Análise não está sendo executada

- Verifique se o `SONAR_TOKEN` está configurado no GitHub Secrets
- Verifique se o workflow está habilitado em `.github/workflows/sonarcloud.yml`
- Verifique os logs do GitHub Actions

### Erro: "Project key not found"

- Verifique se o projeto foi criado no SonarCloud
- Verifique se o `projectKey` está correto no workflow

### Cobertura não aparece

- Verifique se os testes estão passando
- Verifique se o relatório `coverage/lcov.info` está sendo gerado
- Verifique os logs do GitHub Actions

---

## 📝 Notas

- A análise é executada apenas no GitHub Actions (não há necessidade de configuração local)
- O relatório de cobertura é gerado automaticamente durante os testes
- Os resultados ficam disponíveis no dashboard do SonarCloud
- Badges de status podem ser adicionados ao README

---

## 🔗 Links Úteis

- [SonarCloud Dashboard](https://sonarcloud.io/project/overview?id=n.doc)
- [Documentação SonarCloud](https://docs.sonarcloud.io/)
- [GitHub Actions Workflow](.github/workflows/sonarcloud.yml)

---

**Última atualização**: 2025-01-14
