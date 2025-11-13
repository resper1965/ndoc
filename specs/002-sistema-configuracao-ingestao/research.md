# Research: Sistema de Configuração e Ingestão de Documentos

## Contexto

Após a implementação da customização do Pinexio para o design system ness, foi identificada a necessidade de:

1. Sistema de gestão de credenciais para proteger a API de ingestão
2. API REST para ingestão de documentos sem necessidade do ambiente de desenvolvimento
3. Interface web para gerenciar documentos e configurações
4. Aplicação totalmente em português brasileiro

## Decisões Técnicas

### Autenticação Simples

**Decisão**: Usar autenticação username/password simples com hash SHA-256

**Razão**: 
- Requisito explícito do usuário: "autenticação simples, sem complexidade"
- Não requer dependências externas (JWT, OAuth, etc.)
- Suficiente para uso interno/administrativo
- Hash SHA-256 é adequado para senhas em contexto não crítico

**Alternativas Consideradas**:
- JWT tokens: Complexidade desnecessária
- OAuth: Overhead para caso de uso simples
- Basic Auth HTTP: Menos flexível que JSON body

### Armazenamento de Credenciais

**Decisão**: Arquivo JSON local (`config/credentials.json`)

**Razão**:
- Simplicidade de implementação
- Não requer banco de dados
- Fácil de fazer backup
- Permite versionamento (se necessário)

**Estrutura**:
```json
{
  "username": "admin",
  "password": "hash-sha256",
  "updatedAt": "2025-11-13T..."
}
```

### API REST para Documentos

**Decisão**: Endpoints RESTful em `/api/ingest`

**Razão**:
- Padrão amplamente conhecido
- Fácil integração com sistemas externos
- Suporta CI/CD pipelines
- Permite automação

**Métodos**:
- POST: Criar ou atualizar (idempotente baseado em path)
- PUT: Atualizar (mesmo que POST)
- DELETE: Deletar
- GET: Listar, obter conteúdo, informações da API

### Interface de Configuração

**Decisão**: Página Next.js em `/config` com React

**Razão**:
- Consistente com o resto da aplicação
- Reutiliza componentes existentes
- Fácil de manter e estender
- Responsiva por padrão

### Idioma: Português Brasileiro

**Decisão**: Aplicação totalmente em pt-BR

**Razão**:
- Requisito explícito do usuário
- Melhora experiência para usuários brasileiros
- Facilita manutenção e documentação
- Consistência em toda aplicação

## Implementação

### Estrutura de Arquivos

```
src/
├── app/
│   ├── api/
│   │   ├── ingest/
│   │   │   ├── route.ts          # API de documentos
│   │   │   └── page.tsx          # Documentação da API
│   │   └── config/
│   │       └── credentials/
│   │           ├── route.ts      # API de credenciais
│   │           └── verify/
│   │               └── route.ts  # Verificação
│   └── config/
│       └── page.tsx              # Interface de configuração
├── lib/
│   └── auth.ts                   # Utilitários de autenticação
config/
└── credentials.json              # Armazenamento de credenciais
```

### Fluxo de Autenticação

1. Sistema inicia com credenciais padrão (admin/admin)
2. Primeira alteração cria `config/credentials.json`
3. Todas as requisições à API exigem username/password no body
4. Senha fornecida é hasheada e comparada com hash armazenado
5. Se válido, operação prossegue; caso contrário, retorna 401

### Fluxo de Ingestão de Documentos

1. Cliente faz requisição POST/PUT/DELETE com autenticação
2. API valida credenciais
3. API valida path (prevenir directory traversal)
4. API executa operação (criar/atualizar/deletar)
5. Resposta JSON indica sucesso ou erro

### Segurança

**Medidas Implementadas**:
- Hash SHA-256 para senhas (não armazenadas em texto plano)
- Validação de paths (rejeita `..` e paths absolutos)
- Proteção de `index.mdx` (não pode ser deletado)
- Autenticação obrigatória para todas as operações de escrita

**Considerações Futuras**:
- Rate limiting para prevenir abuso
- Logs de auditoria para operações
- Criptografia adicional do arquivo de credenciais
- Suporte a múltiplos usuários com permissões

## Referências

- Next.js 15 API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- Node.js crypto (SHA-256): https://nodejs.org/api/crypto.html
- Contentlayer: https://contentlayer.dev/

## Notas de Implementação

- A API detecta automaticamente se um documento existe (POST cria ou atualiza)
- Interface de configuração carrega credenciais automaticamente do sistema
- Editor de documentos permite edição completa do conteúdo MDX
- Todas as mensagens foram traduzidas para português brasileiro

