/**
 * Testes para validação MDX
 */

import { describe, it, expect } from 'vitest';
import { validateMDX } from '@/lib/validate-mdx';

describe('validateMDX', () => {
  it('deve validar MDX válido', () => {
    const validMDX = `---
title: "Teste"
description: "Descrição"
---

# Conteúdo

Este é um documento válido.
`;

    const result = validateMDX(validMDX);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('deve rejeitar conteúdo vazio', () => {
    const result = validateMDX('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].field).toBe('content');
  });

  it('deve rejeitar MDX sem frontmatter', () => {
    const invalidMDX = `# Título

Conteúdo sem frontmatter.
`;

    const result = validateMDX(invalidMDX);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'frontmatter')).toBe(true);
  });

  it('deve rejeitar MDX sem título', () => {
    const invalidMDX = `---
description: "Sem título"
---

# Conteúdo
`;

    const result = validateMDX(invalidMDX);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('deve rejeitar MDX com título vazio', () => {
    const invalidMDX = `---
title: ""
---

# Conteúdo
`;

    const result = validateMDX(invalidMDX);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'title')).toBe(true);
  });

  it('deve rejeitar MDX com bloco de código não fechado', () => {
    const invalidMDX = `---
title: "Teste"
---

\`\`\`javascript
const x = 1;
`;

    const result = validateMDX(invalidMDX);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'syntax')).toBe(true);
  });

  it('deve aceitar título com aspas', () => {
    const validMDX = `---
title: "Título com Aspas"
---

# Conteúdo
`;

    const result = validateMDX(validMDX);
    expect(result.valid).toBe(true);
  });

  it('deve aceitar título sem aspas', () => {
    const validMDX = `---
title: Título sem Aspas
---

# Conteúdo
`;

    const result = validateMDX(validMDX);
    expect(result.valid).toBe(true);
  });
});

