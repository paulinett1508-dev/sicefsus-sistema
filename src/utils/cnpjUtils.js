// src/utils/cnpjUtils.js

/**
 * Formata CNPJ em tempo real
 * @param {string} value - Valor digitado
 * @returns {string} - CNPJ formatado
 */
export function formatarCNPJ(value) {
  // Remove tudo que não é número
  const apenasNumeros = value.replace(/\D/g, '');

  // Limita a 14 dígitos
  const cnpj = apenasNumeros.slice(0, 14);

  // Aplica a máscara XX.XXX.XXX/XXXX-XX
  if (cnpj.length <= 2) {
    return cnpj;
  } else if (cnpj.length <= 5) {
    return cnpj.replace(/(\d{2})(\d)/, '$1.$2');
  } else if (cnpj.length <= 8) {
    return cnpj.replace(/(\d{2})(\d{3})(\d)/, '$1.$2.$3');
  } else if (cnpj.length <= 12) {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d)/, '$1.$2.$3/$4');
  } else {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d)/, '$1.$2.$3/$4-$5');
  }
}

/**
 * Valida CNPJ completo
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se válido
 */
export function validarCNPJ(cnpj) {
  // Remove formatação
  cnpj = cnpj.replace(/[^\d]+/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Elimina CNPJs inválidos conhecidos
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Valida DVs
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) return false;

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(1)) return false;

  return true;
}

import { useState } from 'react';

/**
 * Hook para input de CNPJ com validação em tempo real
 */
export function useCNPJInput() {
  const [cnpj, setCNPJ] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    const formatted = formatarCNPJ(value);
    setCNPJ(formatted);

    // Valida apenas se tiver 14 dígitos
    if (formatted.replace(/\D/g, '').length === 14) {
      setIsValid(validarCNPJ(formatted));
    } else {
      setIsValid(false);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const hasError = touched && !isValid && cnpj.length > 0;

  return {
    cnpj,
    isValid,
    hasError,
    touched,
    handleChange,
    handleBlur,
    setCNPJ,
    setIsValid,
    setTouched
  };
}