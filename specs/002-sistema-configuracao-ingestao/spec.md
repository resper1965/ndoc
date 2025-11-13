# Feature Specification: Sistema de Configuração e Ingestão de Documentos

**Feature Branch**: `002-sistema-configuracao-ingestao`  
**Created**: 2025-11-13  
**Status**: Completed  
**Input**: Implementação de sistema de gestão de credenciais, ingestão de documentos via API e interface de configuração

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestão de Credenciais (Priority: P1)

O administrador do sistema consegue alterar as credenciais padrão (admin/admin) através de uma interface web, garantindo segurança e controle de acesso.

**Why this priority**: Credenciais padrão são um risco de segurança; é essencial permitir alteração imediata após instalação.

**Independent Test**: Acessar `/config`, alterar credenciais, verificar que arquivo `config/credentials.json` é atualizado e que a API de ingestão passa a exigir as novas credenciais.

**Acceptance Scenarios**:

1. **Given** que o sistema está instalado com credenciais padrão (admin/admin), **When** o administrador acessa `/config` e altera a senha, **Then** as novas credenciais são salvas em `config/credentials.json` com hash SHA-256.
2. **Given** que as credenciais foram alteradas, **When** uma requisição à API usa as credenciais antigas, **Then** a API retorna erro 401 "Não autorizado: usuário ou senha inválidos".

---

### User Story 2 - Ingestão de Documentos via API (Priority: P1)

O desenvolvedor ou sistema automatizado consegue criar, atualizar, listar e deletar documentos MDX através de uma API REST, sem necessidade do ambiente de desenvolvimento.

**Why this priority**: Permite integração com sistemas externos, CI/CD pipelines e automação de documentação.

**Independent Test**: Fazer requisições POST, PUT, DELETE e GET para `/api/ingest` com autenticação válida; verificar que documentos são criados/atualizados/deletados corretamente em `docs/`.

**Acceptance Scenarios**:

1. **Given** que existe autenticação válida, **When** uma requisição POST é feita para `/api/ingest` com path e content, **Then** o arquivo MDX é criado em `docs/` e a resposta indica sucesso.
2. **Given** que um documento existe, **When** uma requisição POST é feita com o mesmo path, **Then** o documento é atualizado (não duplicado) e a resposta indica "Documento atualizado com sucesso".
3. **Given** que um documento existe, **When** uma requisição DELETE é feita, **Then** o arquivo é removido de `docs/` (exceto `index.mdx` que é protegido).
4. **Given** que documentos existem, **When** uma requisição GET é feita com `?list=true`, **Then** a resposta contém lista de todos os documentos MDX com seus paths e URLs.

---

### User Story 3 - Interface de Configuração (Priority: P1)

O administrador consegue gerenciar documentos através de uma interface web intuitiva, visualizando, editando e deletando documentos sem necessidade de acesso ao sistema de arquivos.

**Why this priority**: Facilita a gestão de documentação para usuários não técnicos e acelera operações comuns.

**Independent Test**: Acessar `/config`, listar documentos, visualizar conteúdo, editar e salvar; verificar que mudanças são refletidas imediatamente.

**Acceptance Scenarios**:

1. **Given** que o administrador acessa `/config`, **When** a página carrega, **Then** a lista de documentos é exibida com opções de visualizar, editar e deletar.
2. **Given** que um documento está selecionado, **When** o administrador clica em "Editar", **Then** um editor de texto aparece permitindo modificar o conteúdo MDX.
3. **Given** que alterações foram feitas, **When** o administrador clica em "Salvar", **Then** o documento é atualizado via API e a lista é atualizada.

---

### User Story 4 - Aplicação em Português Brasileiro (Priority: P1)

Todos os textos da aplicação (interface, mensagens de erro, documentação da API) estão em português brasileiro (pt-BR).

**Why this priority**: Consistência de idioma melhora experiência do usuário e facilita manutenção.

**Independent Test**: Navegar pela aplicação e verificar que todos os textos estão em pt-BR; testar mensagens de erro da API.

**Acceptance Scenarios**:

1. **Given** que o usuário acessa qualquer página da aplicação, **When** a página carrega, **Then** todos os textos estão em português brasileiro.
2. **Given** que uma requisição à API falha, **When** a resposta é recebida, **Then** as mensagens de erro estão em português brasileiro.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST ter credenciais padrão `admin/admin` armazenadas em `config/credentials.json` com senha em hash SHA-256.
- **FR-002**: A interface `/config` MUST permitir alterar usuário e senha, exigindo senha atual para validação.
- **FR-003**: A API `/api/ingest` MUST aceitar métodos POST (criar/atualizar), PUT (atualizar), DELETE (deletar) e GET (listar/obter).
- **FR-004**: Todas as requisições à API `/api/ingest` MUST exigir autenticação via username/password no body.
- **FR-005**: A API MUST validar paths para prevenir directory traversal (rejeitar `..` e paths absolutos).
- **FR-006**: A API MUST proteger `index.mdx` contra deleção (retornar erro 400 se tentar deletar).
- **FR-007**: A interface `/config` MUST exibir lista de documentos com opções de visualizar, editar e deletar.
- **FR-008**: O editor de documentos MUST permitir edição do conteúdo MDX completo (frontmatter + conteúdo).
- **FR-009**: Todas as mensagens da aplicação (interface, API, erros) MUST estar em português brasileiro.
- **FR-010**: A API GET `/api/ingest?list=true` MUST retornar lista de todos os arquivos `.mdx` e `.md` em `docs/` recursivamente.
- **FR-011**: A API GET `/api/ingest?path=xxx` MUST retornar o conteúdo completo do documento especificado.

### Key Entities *(include if feature involves data)*

- **Credentials**: Armazenadas em `config/credentials.json` com campos `username` (string), `password` (string hash SHA-256), `updatedAt` (ISO string ou null).
- **Document**: Arquivo MDX em `docs/` com frontmatter YAML e conteúdo Markdown/MDX; atributos principais `path` (relativo a docs/), `content` (string completa), `url` (path para acesso via web).

### Non-Functional Requirements

- **NFR-001**: Autenticação deve ser simples (username/password) sem dependências externas.
- **NFR-002**: Credenciais devem ser armazenadas localmente em arquivo JSON (não em banco de dados).
- **NFR-003**: Interface de configuração deve ser responsiva e funcionar em dispositivos móveis.
- **NFR-004**: API deve retornar respostas em JSON com mensagens de erro descritivas em pt-BR.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das mensagens da aplicação estão em português brasileiro (auditoria manual).
- **SC-002**: API de ingestão aceita e processa corretamente requisições POST, PUT, DELETE e GET (testes automatizados).
- **SC-003**: Interface `/config` permite alterar credenciais e gerenciar documentos sem erros (testes manuais).
- **SC-004**: Credenciais padrão podem ser alteradas imediatamente após instalação (teste de instalação limpa).
- **SC-005**: API rejeita requisições não autenticadas com erro 401 (testes de segurança).

## Technical Implementation

### Arquivos Criados/Modificados

- `src/app/api/ingest/route.ts` - API REST para gestão de documentos
- `src/app/api/config/credentials/route.ts` - API para gestão de credenciais
- `src/app/api/config/credentials/verify/route.ts` - API para verificação de credenciais
- `src/app/config/page.tsx` - Interface de configuração do sistema
- `src/lib/auth.ts` - Utilitários de autenticação (hash, verificação)
- `config/credentials.json` - Arquivo de armazenamento de credenciais

### Endpoints da API

- `POST /api/ingest` - Criar ou atualizar documento
- `PUT /api/ingest` - Atualizar documento (mesmo que POST)
- `DELETE /api/ingest` - Deletar documento
- `GET /api/ingest` - Informações da API
- `GET /api/ingest?list=true` - Listar todos os documentos
- `GET /api/ingest?path=xxx` - Obter conteúdo de documento específico
- `GET /api/config/credentials` - Obter informações de credenciais (sem senha)
- `POST /api/config/credentials` - Atualizar credenciais
- `POST /api/config/credentials/verify` - Verificar credenciais

### Segurança

- Senhas são armazenadas com hash SHA-256 (não em texto plano)
- Paths são validados para prevenir directory traversal
- `index.mdx` é protegido contra deleção
- Todas as operações de escrita exigem autenticação

## Edge Cases

- O que acontece se `config/credentials.json` não existir? Sistema usa credenciais padrão (admin/admin) e cria arquivo na primeira alteração.
- Como lidar com documentos muito grandes? Editor de texto aceita conteúdo de qualquer tamanho; considerar limitação de memória em produção.
- E se múltiplas requisições simultâneas tentarem atualizar o mesmo documento? Sistema de arquivos do Node.js lida com isso; última escrita vence.

