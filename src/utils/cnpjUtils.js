
// ✅ UTILITÁRIOS PARA CNPJ
// Funções para formatação, validação e manipulação de CNPJ

/**
 * Formatar CNPJ com máscara
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} CNPJ formatado (XX.XXX.XXX/XXXX-XX)
 */
export const formatarCNPJ = (cnpj) => {
  if (!cnpj) return '';
  
  // Remove tudo que não for número
  const somenteNumeros = cnpj.replace(/\D/g, '');
  
  // Aplica a máscara
  return somenteNumeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18); // Limita a 18 caracteres
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
 * Validar CNPJ (algoritmo oficial)
 * @param {string} cnpj - CNPJ para validar
 * @returns {boolean} true se válido
 */
export const validarCNPJ = (cnpj) => {
  if (!cnpj) return false;
  
  const somenteNumeros = limparCNPJ(cnpj);
  
  // Verifica se tem 14 dígitos
  if (somenteNumeros.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(somenteNumeros)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  let peso = 5;
  
  for (let i = 0; i < 12; i++) {
    soma += parseInt(somenteNumeros[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  let resto = soma % 11;
  const dv1 = resto < 2 ? 0 : 11 - resto;
  
  if (parseInt(somenteNumeros[12]) !== dv1) return false;
  
  // Calcula segundo dígito verificador
  soma = 0;
  peso = 6;
  
  for (let i = 0; i < 13; i++) {
    soma += parseInt(somenteNumeros[i]) * peso;
    peso = peso === 2 ? 9 : peso - 1;
  }
  
  resto = soma % 11;
  const dv2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(somenteNumeros[13]) === dv2;
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
