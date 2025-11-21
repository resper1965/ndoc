/**
 * Criptografia e descriptografia de API Keys
 * Usa AES-256-GCM para criptografia simétrica
 */

import crypto from 'crypto';
import { logger } from '@/lib/logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes para AES
const KEY_LENGTH = 32; // 32 bytes para AES-256
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Obtém a chave de criptografia a partir da variável de ambiente
 */
function getEncryptionKey(): Buffer {
  const encryptionKey = process.env.ENCRYPTION_KEY;
  
  if (!encryptionKey) {
    // Em desenvolvimento, usar uma chave padrão (NÃO SEGURO para produção)
    if (process.env.NODE_ENV === 'development') {
      logger.warn('ENCRYPTION_KEY não configurada, usando chave padrão (NÃO SEGURO)');
      // Gerar uma chave derivada de uma string fixa (apenas para desenvolvimento)
      return crypto.pbkdf2Sync('dev-key-ndocs', 'dev-salt', 1000, KEY_LENGTH, 'sha256');
    }
    
    throw new Error(
      'ENCRYPTION_KEY não configurada. Configure a variável de ambiente ENCRYPTION_KEY em produção.'
    );
  }

  // Se a chave for uma string hex, converter para buffer
  if (encryptionKey.length === 64) {
    try {
      return Buffer.from(encryptionKey, 'hex');
    } catch {
      // Se não for hex válido, usar como está
    }
  }

  // Derivar chave de 32 bytes usando PBKDF2
  return crypto.pbkdf2Sync(encryptionKey, 'ndocs-salt', ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Criptografa uma API key
 */
export function encryptApiKey(apiKey: string): string {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('API key não pode ser vazia');
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Formato: iv:tag:encrypted (todos em hex)
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Erro ao criptografar API key', error);
    throw new Error('Falha ao criptografar API key');
  }
}

/**
 * Descriptografa uma API key
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey || encryptedKey.trim().length === 0) {
    throw new Error('Chave criptografada não pode ser vazia');
  }

  try {
    // Verificar se está no formato esperado (iv:tag:encrypted)
    const parts = encryptedKey.split(':');
    if (parts.length !== 3) {
      // Se não estiver no formato esperado, pode ser texto plano (legado)
      // Tentar usar diretamente (com aviso)
      logger.warn('API key não está criptografada, usando como texto plano (legado)');
      return encryptedKey;
    }

    const [ivHex, tagHex, encrypted] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    logger.error('Erro ao descriptografar API key', error);
    // Se falhar, pode ser que a chave esteja em texto plano (legado)
    // Tentar retornar como está com aviso
    logger.warn('Falha ao descriptografar, tentando usar como texto plano (legado)');
    return encryptedKey;
  }
}

/**
 * Verifica se uma string está criptografada
 */
export function isEncrypted(encryptedKey: string): boolean {
  if (!encryptedKey) return false;
  // Formato criptografado: iv:tag:encrypted (3 partes separadas por :)
  const parts = encryptedKey.split(':');
  return parts.length === 3 && parts.every(part => /^[0-9a-f]+$/i.test(part));
}

/**
 * Valida se uma API key tem formato válido (antes de criptografar)
 */
export function validateApiKeyFormat(apiKey: string, provider: 'openai' | 'anthropic'): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false;
  }

  // OpenAI keys geralmente começam com "sk-"
  if (provider === 'openai') {
    return apiKey.startsWith('sk-') && apiKey.length > 20;
  }

  // Anthropic keys geralmente começam com "sk-ant-"
  if (provider === 'anthropic') {
    return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
  }

  // Validação genérica: pelo menos 20 caracteres
  return apiKey.length >= 20;
}

