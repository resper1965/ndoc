# Contribuindo para n.doc

Obrigado por considerar contribuir para a plataforma n.doc! 🎉

## Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas [Issues](https://github.com/resper1965/ndoc/issues)
2. Crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs. atual
   - Ambiente (OS, Node.js, etc.)

### Sugerir Melhorias

1. Abra uma issue descrevendo a melhoria
2. Explique o caso de uso
3. Discuta antes de implementar (se for uma mudança grande)

### Enviar Pull Requests

1. **Fork o repositório**
2. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-feature
   ```
3. **Faça suas alterações**
   - Siga o padrão de código existente
   - Adicione testes se aplicável
   - Atualize documentação se necessário
4. **Commit suas mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
5. **Push para sua branch**
   ```bash
   git push origin feature/minha-feature
   ```
6. **Abra um Pull Request**

## Padrões de Código

### TypeScript

- Use TypeScript strict mode
- Evite `any` (use tipos apropriados)
- Documente funções públicas com JSDoc

### Estilo

- Use Prettier (já configurado)
- Siga as convenções do ESLint
- Mantenha componentes pequenos e focados

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## Desenvolvimento

### Setup Local

```bash
git clone https://github.com/resper1965/ndoc.git
cd ndoc
pnpm install
pnpm dev
```

### Testes

Execute antes de commitar:

```bash
pnpm lint
pnpm build
```

## Diretrizes

- Mantenha a aplicação simples e fácil de usar
- Documente mudanças significativas
- Considere impacto em usuários existentes
- Teste em diferentes ambientes

## Perguntas?

Abra uma issue para discussão!

---

**Obrigado por contribuir! 🙏**
