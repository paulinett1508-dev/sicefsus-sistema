// src/config/permissions.js - SISTEMA DE PERMISSOES GRANULARES
// Single source of truth para permissoes por perfil

// Roles disponiveis no sistema
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  GESTOR: 'gestor',
  OPERADOR: 'operador'
};

// Tipos validos para validacao
export const TIPOS_USUARIO_VALIDOS = ['admin', 'gestor', 'operador'];

// Matriz de permissoes por role
export const PERMISSIONS = {
  superAdmin: {
    acessoTotal: true,
    acessoFerramentasDev: true,
    podeGerenciarUsuarios: true,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    podeExecutarDespesas: true,
    filtroLocalizacao: false
  },
  admin: {
    acessoTotal: true,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: true,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    podeExecutarDespesas: true,
    filtroLocalizacao: false
  },
  gestor: {
    acessoTotal: false,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: false,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    podeExecutarDespesas: true,
    filtroLocalizacao: true
  },
  operador: {
    acessoTotal: false,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: false,
    podeCriarEmendas: false,      // BLOQUEADO
    podeEditarEmendas: false,     // BLOQUEADO - apenas visualiza
    podeDeletarEmendas: false,    // BLOQUEADO
    podeCriarNaturezas: false,    // BLOQUEADO
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: false,   // BLOQUEADO
    podeExecutarDespesas: true,
    filtroLocalizacao: true
  }
};

/**
 * Retorna as permissoes de um role especifico
 * @param {string} role - Role do usuario (admin, gestor, operador)
 * @returns {Object} - Objeto com permissoes do role
 */
export const getPermissionsByRole = (role) => {
  return PERMISSIONS[role] || PERMISSIONS.operador;
};

/**
 * Verifica se um role tem uma permissao especifica
 * @param {string} role - Role do usuario
 * @param {string} permission - Nome da permissao
 * @returns {boolean} - true se tem permissao
 */
export const hasPermission = (role, permission) => {
  const permissions = getPermissionsByRole(role);
  return permissions[permission] === true;
};

export default { ROLES, PERMISSIONS, TIPOS_USUARIO_VALIDOS, getPermissionsByRole, hasPermission };
