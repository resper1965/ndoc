# Implementation Plan: Sistema de Configuração e Ingestão de Documentos

**Branch**: `002-sistema-configuracao-ingestao` | **Date**: 2025-11-13

## Summary

Implementar sistema completo de gestão de credenciais, ingestão de documentos via API REST e interface de configuração, com aplicação totalmente em português brasileiro.

## Technical Context

- **Language/Version**: TypeScript (Next.js 15, Node.js ≥ 18)
- **Primary Dependencies**: Next.js 15, Contentlayer, MDX
- **Storage**: Arquivo JSON local (`config/credentials.json`)
- **Authentication**: Hash SHA-256 para senhas

## Implementation Phases

### Phase 1: Sistema de Autenticação ✅

**Status**: Completed

- [x] Criar utilitário de autenticação (`src/lib/auth.ts`)
- [x] Implementar hash SHA-256 para senhas
- [x] Criar estrutura de armazenamento de credenciais (`config/credentials.json`)
- [x] Implementar funções de leitura/escrita de credenciais
- [x] Implementar verificação de credenciais

**Arquivos**:
- `src/lib/auth.ts`
- `config/credentials.json` (criado automaticamente)

### Phase 2: API de Ingestão de Documentos ✅

**Status**: Completed

- [x] Implementar POST `/api/ingest` (criar/atualizar)
- [x] Implementar PUT `/api/ingest` (atualizar)
- [x] Implementar DELETE `/api/ingest` (deletar)
- [x] Implementar GET `/api/ingest` (info, listar, obter)
- [x] Integrar autenticação em todas as rotas
- [x] Validar paths (prevenir directory traversal)
- [x] Proteger `index.mdx` contra deleção
- [x] Traduzir todas as mensagens para pt-BR

**Arquivos**:
- `src/app/api/ingest/route.ts`

### Phase 3: API de Gestão de Credenciais ✅

**Status**: Completed

- [x] Implementar GET `/api/config/credentials` (obter info)
- [x] Implementar POST `/api/config/credentials` (atualizar)
- [x] Implementar POST `/api/config/credentials/verify` (verificar)
- [x] Validar senha atual antes de atualizar
- [x] Traduzir todas as mensagens para pt-BR

**Arquivos**:
- `src/app/api/config/credentials/route.ts`
- `src/app/api/config/credentials/verify/route.ts`

### Phase 4: Interface de Configuração ✅

**Status**: Completed

- [x] Criar página `/config`
- [x] Implementar formulário de alteração de credenciais
- [x] Implementar lista de documentos
- [x] Implementar visualizador de documentos
- [x] Implementar editor de documentos
- [x] Implementar funcionalidade de deletar documentos
- [x] Integrar com APIs criadas
- [x] Traduzir interface para pt-BR

**Arquivos**:
- `src/app/config/page.tsx`

### Phase 5: Tradução Completa para pt-BR ✅

**Status**: Completed

- [x] Traduzir mensagens da API de ingestão
- [x] Traduzir mensagens da API de credenciais
- [x] Traduzir interface de configuração
- [x] Traduzir documentação da API (`/api/ingest` page)
- [x] Atualizar metadados e títulos

**Arquivos**:
- Todos os arquivos de API
- `src/app/config/page.tsx`
- `src/app/api/ingest/page.tsx`

## Testing Checklist

- [x] Testar criação de documento via API
- [x] Testar atualização de documento via API
- [x] Testar deleção de documento via API
- [x] Testar listagem de documentos via API
- [x] Testar obtenção de conteúdo de documento via API
- [x] Testar alteração de credenciais via interface
- [x] Testar autenticação com credenciais inválidas
- [x] Testar proteção contra directory traversal
- [x] Testar proteção de `index.mdx`
- [x] Verificar que todas as mensagens estão em pt-BR

## Deployment Notes

- Credenciais padrão são `admin/admin` - **IMPORTANTE**: Alterar imediatamente após instalação
- Arquivo `config/credentials.json` deve ser criado automaticamente na primeira alteração
- Em produção, considerar adicionar rate limiting na API de ingestão
- Considerar backup automático de `config/credentials.json`

## Future Enhancements

- Adicionar suporte a múltiplos usuários
- Implementar logs de auditoria para operações de documentos
- Adicionar validação de formato MDX antes de salvar
- Implementar preview de documentos antes de salvar
- Adicionar suporte a upload de arquivos via interface

