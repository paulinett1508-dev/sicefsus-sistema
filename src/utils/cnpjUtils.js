// ✅ UTILITÁRIOS PARA CNPJ
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
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

/**
 * Remove formatação do CNPJ
 * @param {string} cnpj - CNPJ formatado
 * @returns {string} CNPJ apenas com números
 */
export const limparCNPJ = (cnpj) => {
  if (!cnpj) return '';
  return cnpj.replace(/\D/g, '');
};

/**
 * Validar CNPJ brasileiro
 * @param {string} cnpj - CNPJ a ser validado
 * @returns {boolean|Object} - true se válido, ou objeto com erro se inválido
 */
export const validarCNPJ = (cnpj) => {
  if (!cnpj) return false;

  // Remove caracteres especiais
  const numero = cnpj.replace(/[^\d]/g, "");

  // Verifica se tem 14 dígitos
  if (numero.length !== 14) {
    return false;
  }

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numero)) {
    return false;
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
    return false;
  }

  return true;
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