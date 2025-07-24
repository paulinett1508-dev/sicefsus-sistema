// src/config/constants.js
// ✅ Este arquivo centraliza constantes de configuração para o projeto.
// Ele lê valores de variáveis de ambiente (via Vite) quando disponíveis
// e define valores padrão quando não houver configuração externa.

/**
 * Lista de emails de administradores com permissões especiais.
 *
 * Se a variável de ambiente `VITE_ADMIN_EMAILS` estiver definida, ela deve
 * conter uma lista separada por vírgulas de emails que terão acesso ao
 * painel administrativo. Por exemplo:
 *
 * ```env
 * VITE_ADMIN_EMAILS="admin@example.com, user@example.com"
 * ```
 *
 * Caso não seja fornecido, o array será vazio e apenas usuários com
 * `role === 'admin'` terão acesso.
 */
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * Número padrão de itens por página nas listagens paginadas. Caso deseje
 * alterar o valor global, defina `VITE_DEFAULT_PAGE_SIZE` no arquivo `.env`.
 */
export const DEFAULT_PAGE_SIZE = Number(
  import.meta.env.VITE_DEFAULT_PAGE_SIZE || 10,
);
