// src/utils/validators.js - VALIDAÇÕES CENTRALIZADAS DO SISTEMA
// ✅ Funções utilitárias para normalização e validação
import { useState } from "react";

// Lista oficial de UFs brasileiras
const UFS_VALIDAS = [
  "ac",
  "al",
  "ap",
  "am",
  "ba",
  "ce",
  "df",
  "es",
  "go",
  "ma",
  "mt",
  "ms",
  "mg",
  "pa",
  "pb",
  "pr",
  "pe",
  "pi",
  "rj",
  "rn",
  "rs",
  "ro",
  "rr",
  "sc",
  "sp",
  "se",
  "to",
];

/**
 * ✅ NORMALIZAR UF para lowercase
 * @param {string} uf - UF a ser normalizada
 * @returns {string|null} - UF normalizada ou null
 */
export const normalizeUF = (uf) => {
  if (!uf || typeof uf !== "string") return null;
  const normalized = uf.toString().trim().toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

/**
 * ✅ VALIDAR UF brasileira
 * @param {string} uf - UF a ser validada
 * @returns {boolean} - true se válida
 */
export const validateUF = (uf) => {
  const normalized = normalizeUF(uf);
  if (!normalized || normalized.length !== 2) return false;
  return UFS_VALIDAS.includes(normalized);
};

/**
 * ✅ NORMALIZAR município
 * @param {string} municipio - Município a ser normalizado
 * @returns {string|null} - Município normalizado ou null
 */
export const normalizeMunicipio = (municipio) => {
  if (!municipio || typeof municipio !== "string") return null;
  const normalized = municipio.toString().trim();
  return normalized.length > 0 && normalized !== "undefined"
    ? normalized
    : null;
};

/**
 * ✅ VALIDAR município
 * @param {string} municipio - Município a ser validado
 * @returns {boolean} - true se válido
 */
export const validateMunicipio = (municipio) => {
  const normalized = normalizeMunicipio(municipio);
  return normalized !== null && normalized.length >= 2; // Mínimo 2 caracteres
};

/**
 * ✅ VALIDAR dados de localização completos
 * @param {string} municipio - Município
 * @param {string} uf - UF
 * @returns {Object} - Resultado da validação
 */
export const validateLocation = (municipio, uf) => {
  const erros = [];

  if (!municipio || typeof municipio !== "string" || municipio.trim() === "") {
    erros.push("Município é obrigatório e deve ser um texto válido");
  }

  if (!uf || typeof uf !== "string" || uf.trim() === "") {
    erros.push("UF é obrigatória e deve ser um texto válido");
  }

  // Validação de comprimento
  if (municipio && municipio.trim().length < 2) {
    erros.push("Município deve ter pelo menos 2 caracteres");
  }

  if (municipio && municipio.trim().length > 100) {
    erros.push("Município não pode ter mais de 100 caracteres");
  }

  const ufNormalizada = normalizeUF(uf);
  if (ufNormalizada && !UFS_VALIDAS.includes(ufNormalizada)) {
    erros.push(`UF inválida: ${uf}. UFs válidas: ${UFS_VALIDAS.join(", ")}`);
  }

  // Validação contra caracteres especiais maliciosos
  const regex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (municipio && !regex.test(municipio)) {
    erros.push("Município contém caracteres inválidos");
  }

  return {
    valido: erros.length === 0,
    erros,
    municipio: municipio ? normalizeMunicipio(municipio) : null,
    uf: ufNormalizada,
  };
};

/**
 * ✅ VALIDAR email
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * ✅ VALIDAR senha
 * @param {string} senha - Senha a ser validada
 * @returns {Object} - Resultado da validação
 */
export const validatePassword = (senha) => {
  if (!senha || typeof senha !== "string") {
    return { valida: false, erro: "Senha é obrigatória" };
  }

  if (senha.length < 6) {
    return { valida: false, erro: "Senha deve ter pelo menos 6 caracteres" };
  }

  if (senha.length > 50) {
    return { valida: false, erro: "Senha muito longa (máximo 50 caracteres)" };
  }

  return { valida: true, erro: null };
};

/**
 * ✅ VALIDAR tipo de usuário (PADRONIZADO)
 * @param {string} tipo - Tipo a ser validado
 * @returns {boolean} - true se válido
 */
export const validateUserTipo = (tipo) => {
  const tiposValidos = ["admin", "operador"]; // ✅ APENAS DOIS TIPOS VÁLIDOS
  return tiposValidos.includes(tipo);
};

/**
 * ✅ VALIDAR status de usuário
 * @param {string} status - Status a ser validado
 * @returns {boolean} - true se válido
 */
export const validateUserStatus = (status) => {
  const statusValidos = ["ativo", "inativo", "bloqueado"];
  return statusValidos.includes(status);
};

/**
 * ✅ SANITIZAR string removendo caracteres perigosos
 * @param {string} str - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== "string") return "";
  return str.trim().replace(/[<>\"'&]/g, "");
};

/**
 * ✅ VALIDAR nome completo
 * @param {string} nome - Nome a ser validado
 * @returns {Object} - Resultado da validação
 */
export const validateNome = (nome) => {
  if (!nome || typeof nome !== "string") {
    return { valido: false, erro: "Nome é obrigatório" };
  }

  const nomeNorm = nome.trim();

  if (nomeNorm.length < 2) {
    return { valido: false, erro: "Nome deve ter pelo menos 2 caracteres" };
  }

  if (nomeNorm.length > 100) {
    return { valido: false, erro: "Nome muito longo (máximo 100 caracteres)" };
  }

  // Verificar se tem pelo menos nome e sobrenome
  const palavras = nomeNorm.split(" ").filter((p) => p.length > 0);
  if (palavras.length < 2) {
    return { valido: false, erro: "Digite nome e sobrenome completos" };
  }

  return { valido: true, erro: null, nomeNormalizado: nomeNorm };
};

/**
 * ✅ VALIDAR telefone brasileiro
 * @param {string} telefone - Telefone a ser validado
 * @returns {Object} - Resultado da validação
 */
export const validateTelefone = (telefone) => {
  if (!telefone || typeof telefone !== "string") {
    return { valido: true, erro: null }; // Telefone é opcional
  }

  // Remover caracteres não numéricos
  const apenasNumeros = telefone.replace(/\D/g, "");

  // Verificar se tem entre 10 e 11 dígitos (com DDD)
  if (apenasNumeros.length < 10 || apenasNumeros.length > 11) {
    return {
      valido: false,
      erro: "Telefone deve ter 10 ou 11 dígitos (ex: 11987654321)",
    };
  }

  return { valido: true, erro: null, telefoneNormalizado: apenasNumeros };
};

/**
 * ✅ OBTER NOME ESTADO POR UF
 * @param {string} uf - UF (sigla)
 * @returns {string} - Nome do estado
 */
export const getEstadoNome = (uf) => {
  const estados = {
    ac: "Acre",
    al: "Alagoas",
    ap: "Amapá",
    am: "Amazonas",
    ba: "Bahia",
    ce: "Ceará",
    df: "Distrito Federal",
    es: "Espírito Santo",
    go: "Goiás",
    ma: "Maranhão",
    mt: "Mato Grosso",
    ms: "Mato Grosso do Sul",
    mg: "Minas Gerais",
    pa: "Pará",
    pb: "Paraíba",
    pr: "Paraná",
    pe: "Pernambuco",
    pi: "Piauí",
    rj: "Rio de Janeiro",
    rn: "Rio Grande do Norte",
    rs: "Rio Grande do Sul",
    ro: "Rondônia",
    rr: "Roraima",
    sc: "Santa Catarina",
    sp: "São Paulo",
    se: "Sergipe",
    to: "Tocantins",
  };

  const ufNorm = normalizeUF(uf);
  return estados[ufNorm] || "Estado não encontrado";
};

/**
 * ✅ VALIDAR dados completos de usuário para criação (CORRIGIDO)
 * @param {Object} userData - Dados do usuário
 * @returns {Object} - Resultado da validação completa
 */
export const validateUserData = (userData) => {
  const erros = {};
  let dadosNormalizados = {};

  // Validar email
  if (!validateEmail(userData.email)) {
    erros.email = "Email inválido";
  } else {
    dadosNormalizados.email = userData.email.trim().toLowerCase();
  }

  // Validar senha (apenas na criação)
  if (userData.senha !== undefined) {
    const senhaValidacao = validatePassword(userData.senha);
    if (!senhaValidacao.valida) {
      erros.senha = senhaValidacao.erro;
    }
  }

  // Validar nome
  const nomeValidacao = validateNome(userData.nome);
  if (!nomeValidacao.valido) {
    erros.nome = nomeValidacao.erro;
  } else {
    dadosNormalizados.nome = nomeValidacao.nomeNormalizado;
  }

  // ✅ VALIDAÇÃO DE LOCALIZAÇÃO CORRIGIDA
  // Para operadores, município/UF são obrigatórios
  if (userData.role === "user" || userData.role === "operador") {
    const localizacao = validateLocation(userData.municipio, userData.uf);
    if (!localizacao.valido) {
      localizacao.erros.forEach((erro) => {
        if (erro.includes("Município")) erros.municipio = erro;
        if (erro.includes("UF")) erros.uf = erro;
      });
    } else {
      dadosNormalizados.municipio = localizacao.municipio;
      dadosNormalizados.uf = localizacao.uf;
    }
  } else if (userData.role === "admin") {
    // Para admins, limpar localização
    dadosNormalizados.municipio = "";
    dadosNormalizados.uf = "";
  }

  // Validar role
  if (!validateUserRole(userData.role)) {
    erros.role = "Perfil inválido";
  } else {
    dadosNormalizados.role = userData.role;
  }

  // Validar status
  if (!validateUserStatus(userData.status)) {
    erros.status = "Status inválido";
  } else {
    dadosNormalizados.status = userData.status;
  }

  // Validar telefone (opcional)
  const telefoneValidacao = validateTelefone(userData.telefone);
  if (!telefoneValidacao.valido) {
    erros.telefone = telefoneValidacao.erro;
  } else if (telefoneValidacao.telefoneNormalizado) {
    dadosNormalizados.telefone = telefoneValidacao.telefoneNormalizado;
  }

  // Sanitizar departamento
  if (userData.departamento) {
    dadosNormalizados.departamento = sanitizeString(userData.departamento);
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    dadosNormalizados,
  };
};

/**
 * ✅ LOGS DE VALIDAÇÃO PARA DEBUG
 * @param {string} operacao - Nome da operação
 * @param {Object} dados - Dados sendo validados
 * @param {Object} resultado - Resultado da validação
 */
export const logValidation = (operacao, dados, resultado) => {
  if (import.meta.env.DEV) {
    console.group(`🔍 Validação: ${operacao}`);
    console.log("📥 Dados de entrada:", dados);
    console.log("✅ Resultado:", resultado);
    if (!resultado.valido) {
      console.warn("❌ Erros encontrados:", resultado.erros);
    }
    console.groupEnd();
  }
};

/**
 * ✅ NOVA: Criar relatório de erro detalhado para debugging
 * @param {string} context - Contexto onde ocorreu o erro
 * @param {Error} error - Objeto de erro
 * @param {Object} additionalData - Dados adicionais para contexto
 * @returns {Object} - Relatório estruturado do erro
 */
export const createErrorReport = (context, error, additionalData = {}) => {
  return {
    context,
    message: error.message || "Erro desconhecido",
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
    url: typeof window !== "undefined" ? window.location.href : "N/A",
    additionalData,
    errorName: error.name,
    fileName: error.fileName,
    lineNumber: error.lineNumber,
    columnNumber: error.columnNumber,
  };
};

// ✅ CNPJ Validators
export const formatarCNPJ = (valor) => {
  if (!valor) return "";

  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, "");

  // Aplica máscara XX.XXX.XXX/XXXX-XX
  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
};

export const validarCNPJ = (cnpj) => {
  if (!cnpj) return { valido: false, erro: "CNPJ é obrigatório" };

  // Remove caracteres especiais
  const numero = cnpj.replace(/[^\d]/g, "");

  // Verifica se tem 14 dígitos
  if (numero.length !== 14) {
    return { valido: false, erro: "CNPJ deve ter 14 dígitos" };
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numero)) {
    return { valido: false, erro: "CNPJ inválido" };
  }

  // Calcula primeiro dígito verificador
  let soma = 0;
  let peso = 5;

  for (let i = 0; i < 12; i++) {
    soma += parseInt(numero[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }

  let digito1 = soma % 11;
  digito1 = digito1 < 2 ? 0 : 11 - digito1;

  // Calcula segundo dígito verificador
  soma = 0;
  peso = 6;

  for (let i = 0; i < 13; i++) {
    soma += parseInt(numero[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }

  let digito2 = soma % 11;
  digito2 = digito2 < 2 ? 0 : 11 - digito2;

  // Verifica se os dígitos calculados conferem
  if (parseInt(numero[12]) !== digito1 || parseInt(numero[13]) !== digito2) {
    return {
      valido: false,
      erro: "CNPJ inválido - dígitos verificadores incorretos",
    };
  }

  return { valido: true, erro: null };
};

// ✅ HOOK PARA USO NO DESPESAFORM
export const useCNPJValidation = () => {
  const [cnpjError, setCnpjError] = useState("");

  const handleCNPJChange = (valor, setFormData) => {
    // Formata o CNPJ
    const cnpjFormatado = formatarCNPJ(valor);

    // Atualiza o form
    setFormData((prev) => ({ ...prev, cnpjFornecedor: cnpjFormatado }));

    // Valida apenas se tem 14 dígitos
    if (cnpjFormatado.replace(/\D/g, "").length === 14) {
      const validacao = validarCNPJ(cnpjFormatado);
      setCnpjError(validacao.valido ? "" : validacao.erro);
    } else {
      setCnpjError("");
    }
  };

  return { cnpjError, handleCNPJChange };
};
