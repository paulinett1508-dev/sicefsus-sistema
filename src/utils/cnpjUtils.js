// ✅ UTILITÁRIOS PARA CNPJ - VALIDAÇÃO CORRIGIDA
// Funções para formatação, validação e manipulação de CNPJ

/**
 * Formatar CNPJ com máscara XX.XXX.XXX/XXXX-XX
 * @param {string} valor - CNPJ a ser formatado
 * @returns {string} - CNPJ formatado
 */
export const formatarCNPJ = (valor) => {
  if (!valor) return "";

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
  return cnpj.replace(/\D/g, "");
};

/**
 * Validar CNPJ brasileiro - VERSÃO CORRIGIDA
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean} - true se válido, false se inválido
 */
export const validarCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remove caracteres especiais e converte para string
  const numero = String(cnpj).replace(/[^\d]/g, "");

  // Verifica se tem 14 dígitos
  if (numero.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CNPJs inválidos conhecidos)
  if (/^(\d)\1+$/.test(numero)) {
    return false;
  }

  // Array com os dígitos do CNPJ
  const digits = numero.split("").map(Number);

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

  // ✅ VERIFICAÇÃO FINAL CORRIGIDA
  const digitoVerificador1 = digits[12];
  const digitoVerificador2 = digits[13];

  // Retorna true se ambos os dígitos verificadores estão corretos
  return digito1 === digitoVerificador1 && digito2 === digitoVerificador2;
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
