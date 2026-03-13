// ✅ UTILITÁRIOS PARA CNPJ/CPF - VALIDAÇÃO CORRIGIDA
// Funções para formatação, validação e manipulação de CNPJ e CPF

/**
 * Formatar CNPJ com máscara XX.XXX.XXX/XXXX-XX
 * @param {string} valor - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
export const formatarCNPJ = (valor) => {
  if (!valor || typeof valor !== "string") return "";

  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, "");

  // Limita a 14 dígitos
  const limitado = numeros.slice(0, 14);

  // Aplica máscara XX.XXX.XXX/XXXX-XX
  return limitado
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Remove formatação do CNPJ
 * @param {string} cnpj - CNPJ formatado
 * @returns {string} CNPJ apenas com números
 */
export const limparCNPJ = (cnpj) => {
  if (!cnpj) return "";
  return String(cnpj).replace(/\D/g, "");
};

/**
 * Validar CNPJ brasileiro - VERSÃO CORRIGIDA DEFINITIVA
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export const validarCNPJ = (cnpj) => {
  console.log("🔧 DEBUG validarCNPJ - Input:", cnpj);

  if (!cnpj) {
    console.log("❌ CNPJ vazio");
    return false;
  }

  // Remove caracteres especiais e converte para string
  const numero = String(cnpj).replace(/[^\d]/g, "");
  console.log("🔧 DEBUG validarCNPJ - Numero limpo:", numero);

  // Verifica se tem 14 dígitos
  if (numero.length !== 14) {
    console.log("❌ Não tem 14 dígitos:", numero.length);
    return false;
  }

  // Verifica se todos os dígitos são iguais (CNPJs inválidos conhecidos)
  if (/^(\d)\1+$/.test(numero)) {
    console.log("❌ Todos dígitos iguais");
    return false;
  }

  // Array com os dígitos do CNPJ
  const digits = numero.split("").map(Number);
  console.log("🔧 DEBUG validarCNPJ - Digits array:", digits);

  // ✅ CÁLCULO PRIMEIRO DÍGITO VERIFICADOR CORRIGIDO
  let soma = 0;
  let peso = 5;

  // Multiplica os 12 primeiros dígitos pelos pesos decrescentes
  for (let i = 0; i < 12; i++) {
    soma += digits[i] * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }

  // Calcula o primeiro dígito verificador
  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;
  console.log(
    "🔧 DEBUG validarCNPJ - Primeiro dígito calculado:",
    digito1,
    "vs esperado:",
    digits[12],
  );

  // ✅ CÁLCULO SEGUNDO DÍGITO VERIFICADOR CORRIGIDO
  soma = 0;
  peso = 6;

  // Multiplica os 13 primeiros dígitos (incluindo o primeiro DV) pelos pesos
  for (let i = 0; i < 13; i++) {
    soma += digits[i] * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }

  // Calcula o segundo dígito verificador
  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;
  console.log(
    "🔧 DEBUG validarCNPJ - Segundo dígito calculado:",
    digito2,
    "vs esperado:",
    digits[13],
  );

  // ✅ VERIFICAÇÃO FINAL CORRIGIDA
  const digitoVerificador1 = digits[12];
  const digitoVerificador2 = digits[13];

  const resultado =
    digito1 === digitoVerificador1 && digito2 === digitoVerificador2;
  console.log("🔧 DEBUG validarCNPJ - Resultado final:", resultado);

  // Retorna true se ambos os dígitos verificadores estão corretos
  return resultado;
};

/**
 * Verificar se CNPJ está completo (14 dígitos)
 * @param {string} cnpj - CNPJ para verificar
 * @returns {boolean} true se completo
 */
export const cnpjCompleto = (cnpj) => {
  const numeros = limparCNPJ(cnpj);
  return numeros.length === 14;
};

/**
 * Aplicar máscara de CNPJ durante digitação
 * @param {string} valor - Valor atual do input
 * @returns {string} Valor com máscara aplicada
 */
export const aplicarMascaraCNPJ = (valor) => {
  return formatarCNPJ(valor);
};

/**
 * Verificar se string parece um CNPJ
 * @param {string} valor - Valor para verificar
 * @returns {boolean} true se parece com CNPJ
 */
export const pareceCNPJ = (valor) => {
  if (!valor) return false;
  const numeros = limparCNPJ(valor);
  return numeros.length >= 8; // Pelo menos 8 dígitos para parecer CNPJ
};

/**
 * Obter apenas os números do CNPJ
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {string} CNPJ apenas com números
 */
export const obterNumerosCNPJ = (cnpj) => {
  return limparCNPJ(cnpj);
};

/**
 * Formatar CPF com máscara XXX.XXX.XXX-XX
 * @param {string} valor - CPF a ser formatado
 * @returns {string} - CPF formatado
 */
export const formatarCPF = (valor) => {
  if (!valor || typeof valor !== "string") return "";
  const numeros = valor.replace(/\D/g, "");
  const limitado = numeros.slice(0, 11);
  return limitado
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

/**
 * Validar CPF brasileiro
 * @param {string} cpf - CPF a ser validado
 * @returns {boolean} - true se válido
 */
export const validarCPF = (cpf) => {
  if (!cpf) return false;
  const numero = String(cpf).replace(/[^\d]/g, "");
  if (numero.length !== 11) return false;
  if (/^(\d)\1+$/.test(numero)) return false;

  const digits = numero.split("").map(Number);

  // Primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += digits[i] * (10 - i);
  }
  let resto = (soma * 10) % 11;
  const digito1 = resto === 10 ? 0 : resto;
  if (digito1 !== digits[9]) return false;

  // Segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += digits[i] * (11 - i);
  }
  resto = (soma * 10) % 11;
  const digito2 = resto === 10 ? 0 : resto;
  return digito2 === digits[10];
};

/**
 * Verificar se CPF está completo (11 dígitos)
 * @param {string} cpf - CPF para verificar
 * @returns {boolean} true se completo
 */
export const cpfCompleto = (cpf) => {
  const numeros = limparCNPJ(cpf);
  return numeros.length === 11;
};

/**
 * Detectar tipo de documento pela quantidade de dígitos
 * @param {string} documento - CPF ou CNPJ (com ou sem formatação)
 * @returns {"PF"|"PJ"|null} Tipo de pessoa ou null se indeterminado
 */
export const detectarTipoDocumento = (documento) => {
  if (!documento) return null;
  const numeros = String(documento).replace(/\D/g, "");
  if (numeros.length === 11) return "PF";
  if (numeros.length === 14) return "PJ";
  return null;
};

/**
 * Formatar documento (CPF ou CNPJ) automaticamente
 * @param {string} documento - Documento a formatar
 * @param {string} tipoPessoa - "PF" ou "PJ" (opcional, auto-detecta)
 * @returns {string} Documento formatado
 */
export const formatarDocumento = (documento, tipoPessoa = null) => {
  if (!documento) return "";
  const numeros = String(documento).replace(/\D/g, "");
  const tipo = tipoPessoa || detectarTipoDocumento(documento);
  if (tipo === "PF" || numeros.length <= 11) return formatarCPF(documento);
  return formatarCNPJ(documento);
};

/**
 * Validar documento (CPF ou CNPJ)
 * @param {string} documento - Documento a validar
 * @param {string} tipoPessoa - "PF" ou "PJ"
 * @returns {boolean} true se válido
 */
export const validarDocumento = (documento, tipoPessoa) => {
  if (tipoPessoa === "PF") return validarCPF(documento);
  return validarCNPJ(documento);
};

/**
 * Aplicar máscara de documento durante digitação
 * @param {string} valor - Valor atual do input
 * @param {string} tipoPessoa - "PF" ou "PJ"
 * @returns {string} Valor com máscara aplicada
 */
export const aplicarMascaraDocumento = (valor, tipoPessoa) => {
  if (tipoPessoa === "PF") return formatarCPF(valor);
  return formatarCNPJ(valor);
};

/**
 * Validar lista de CNPJs para testes
 * @param {Array} cnpjs - Array de CNPJs para testar
 * @returns {Object} Resultado dos testes
 */
export const testarCNPJs = (cnpjs = []) => {
  const resultados = {};

  // CNPJs de teste conhecidos
  const cnpjsTeste = [
    "11.222.333/0001-81", // Válido
    "06.597.801/0001-62", // Válido
    "11.111.111/1111-11", // Inválido (todos iguais)
    "12.345.678/0001-95", // Válido
    ...cnpjs,
  ];

  cnpjsTeste.forEach((cnpj) => {
    resultados[cnpj] = {
      valido: validarCNPJ(cnpj),
      limpo: limparCNPJ(cnpj),
      formatado: formatarCNPJ(cnpj),
    };
  });

  return resultados;
};
