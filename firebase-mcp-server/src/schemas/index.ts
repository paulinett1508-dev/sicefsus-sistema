// Schemas Zod para validação de inputs

import { z } from 'zod';
import { SICEFSUS_COLLECTIONS, MAX_QUERY_LIMIT } from '../constants.js';

export const EnvironmentSchema = z.enum(['dev', 'prod'])
  .describe('Ambiente Firebase: dev ou prod');

export const SwitchEnvironmentSchema = z.object({
  environment: EnvironmentSchema,
  confirm: z.boolean()
    .optional()
    .describe('Confirmação obrigatória para trocar para prod')
}).strict();

export const QuerySchema = z.object({
  collection: z.string()
    .min(1, 'Nome da coleção é obrigatório')
    .describe('Nome da coleção Firebase (ex: emendas, despesas, usuarios)'),
  limit: z.number()
    .int()
    .min(1)
    .max(MAX_QUERY_LIMIT)
    .default(50)
    .describe(`Limite de documentos (máx: ${MAX_QUERY_LIMIT})`),
  environment: EnvironmentSchema.optional()
    .describe('Ambiente a consultar (usa atual se não especificado)')
}).strict();

export const GetDocumentSchema = z.object({
  collection: z.string()
    .min(1, 'Nome da coleção é obrigatório')
    .describe('Nome da coleção Firebase'),
  documentId: z.string()
    .min(1, 'ID do documento é obrigatório')
    .describe('ID do documento a buscar'),
  environment: EnvironmentSchema.optional()
    .describe('Ambiente a consultar (usa atual se não especificado)')
}).strict();

export const CompareSchema = z.object({
  collection: z.string()
    .min(1, 'Nome da coleção é obrigatório')
    .describe('Nome da coleção a comparar entre dev e prod')
}).strict();

export const BackupSchema = z.object({
  collection: z.string()
    .min(1, 'Nome da coleção é obrigatório')
    .describe('Nome da coleção a exportar'),
  environment: EnvironmentSchema.optional()
    .describe('Ambiente de onde exportar (usa atual se não especificado)')
}).strict();

export const SearchSchema = z.object({
  collection: z.string()
    .min(1, 'Nome da coleção é obrigatório')
    .describe('Nome da coleção Firebase'),
  field: z.string()
    .min(1, 'Campo de busca é obrigatório')
    .describe('Campo a filtrar (ex: municipio, status)'),
  value: z.string()
    .min(1, 'Valor de busca é obrigatório')
    .describe('Valor a buscar'),
  limit: z.number()
    .int()
    .min(1)
    .max(MAX_QUERY_LIMIT)
    .default(50)
    .describe(`Limite de resultados (máx: ${MAX_QUERY_LIMIT})`),
  environment: EnvironmentSchema.optional()
    .describe('Ambiente a consultar (usa atual se não especificado)')
}).strict();

// Tipos inferidos dos schemas
export type SwitchEnvironmentInput = z.infer<typeof SwitchEnvironmentSchema>;
export type QueryInput = z.infer<typeof QuerySchema>;
export type GetDocumentInput = z.infer<typeof GetDocumentSchema>;
export type CompareInput = z.infer<typeof CompareSchema>;
export type BackupInput = z.infer<typeof BackupSchema>;
export type SearchInput = z.infer<typeof SearchSchema>;
