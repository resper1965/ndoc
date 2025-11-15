/**
 * Validações com Zod
 * 
 * Schemas de validação para APIs e formulários
 */

import { z } from 'zod';

// Validação de documento MDX
export const documentSchema = z.object({
  path: z.string().min(1, 'Caminho é obrigatório').max(500, 'Caminho muito longo'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  organization_id: z.string().uuid().optional(),
});

// Validação de criação de usuário
export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  organizationId: z.string().uuid('ID de organização inválido'),
  role: z.enum(['orgadmin', 'admin', 'editor', 'viewer']),
});

// Validação de atualização de usuário
export const updateUserSchema = z.object({
  userId: z.string().uuid('ID de usuário inválido'),
  organizationId: z.string().uuid('ID de organização inválido').optional(),
  role: z.enum(['orgadmin', 'admin', 'editor', 'viewer']).optional(),
  name: z.string().min(1).max(200).optional(),
});

// Validação de criação de organização
export const createOrganizationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(200, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(100, 'Slug muito longo')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
});

// Validação de query params
export const listDocumentsQuerySchema = z.object({
  list: z.string().optional(),
  path: z.string().optional(),
  organization_id: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).min(1, 'Página deve ser no mínimo 1').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).min(1, 'Limite deve ser no mínimo 1').max(100, 'Limite máximo de 100 itens por página').optional(),
});

export const listUsersQuerySchema = z.object({
  organization_id: z.string().uuid().optional(),
  page: z.string().regex(/^\d+$/).transform(Number).min(1, 'Página deve ser no mínimo 1').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).min(1, 'Limite deve ser no mínimo 1').max(100, 'Limite máximo de 100 itens por página').optional(),
});

