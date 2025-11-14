/**
 * Testes para Logger
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  });

  it('deve sanitizar dados sensíveis', () => {
    logger.error('Test error', undefined, {
      password: 'secret123',
      token: 'abc123',
      email: 'test@example.com',
    });

    expect(console.error).toHaveBeenCalled();
    const call = vi.mocked(console.error).mock.calls[0][0] as string;
    expect(call).toContain('[REDACTED]');
    expect(call).not.toContain('secret123');
    expect(call).not.toContain('abc123');
    expect(call).toContain('test@example.com'); // Email não é sensível
  });

  it('deve logar erros', () => {
    const error = new Error('Test error');
    logger.error('Test message', error);

    expect(console.error).toHaveBeenCalled();
  });

  it('deve logar warnings', () => {
    logger.warn('Test warning');

    expect(console.warn).toHaveBeenCalled();
  });

  it('deve ter método info', () => {
    // Verifica que o método existe e não quebra
    expect(() => logger.info('Test info')).not.toThrow();
  });

  it('deve ter método debug', () => {
    // Verifica que o método existe e não quebra
    expect(() => logger.debug('Test debug')).not.toThrow();
  });
});

