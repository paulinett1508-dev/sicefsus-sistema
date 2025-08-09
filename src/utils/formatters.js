// ✅ FORMATADORES MONETÁRIOS PRECISOS - src/utils/formatters.js - VERSÃO COMPLETA
import { useState } from "react";

/**
 * Formata valor para moeda brasileira
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} - Valor formatado em moeda
 */
export function formatarMoeda(valor) {
  const numero = parseFloat(valor) || 0;
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}

/**
 * Formata valor monetário para exibição
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} - Valor formatado como moeda brasileira
 */
export const formatarMoedaDisplay = (valor) => {
  if (!valor && valor !== 0) return "R$ 0,00";

  const numero =
    typeof valor === "string"
      ? parseFloat(valor.replace(/[^\d,.-]/g, "").replace(",", "."))
      : valor;

  if (isNaN(numero)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
};

// ✅ EXPERIÊNCIA NATURAL DE DIGITAÇÃO MONETÁRIA
export const formatarMoedaInput = (valor) => {
  if (!valor) return "";

  // Remove tudo que não é número
  let numero = valor.replace(/\D/g, "");

  if (numero.length === 0) return "";

  // ✅ EXPERIÊNCIA NATURAL: sem zeros desnecessários no início
  if (numero.length === 1) return `${numero}`;
  if (numero.length === 2) return `${numero}`;
  if (numero.length === 3) return `${numero.slice(0, 1)},${numero.slice(1)}`;

  // ✅ FORMATAÇÃO COM 2 CASAS DECIMAIS (a partir de 4 dígitos)
  // Insere vírgula para centavos (últimos 2 dígitos)
  numero = numero.replace(/^(\d+)(\d{2})$/, "$1,$2");

  // ✅ SEPARADOR DE MILHARES: Insere pontos para valores acima de 1000
  numero = numero.replace(/(\d)(?=(\d{3})+(?=,))/g, "$1.");

  return numero;
};

export const parseValorMonetario = (valorFormatado) => {
  if (!valorFormatado) return 0;

  const numero = valorFormatado
    .toString()
    .replace(/[^\d,]/g, "") // Remove tudo exceto números e vírgula
    .replace(",", "."); // Troca vírgula por ponto

  return parseFloat(numero) || 0;
};

export const calcularSaldoEmenda = (valorTotal, valorExecutado) => {
  const total =
    typeof valorTotal === "number"
      ? valorTotal
      : parseValorMonetario(valorTotal);
  const executado =
    typeof valorExecutado === "number"
      ? valorExecutado
      : parseValorMonetario(valorExecutado);

  return Math.max(0, total - executado);
};

// ✅ HOOK PARA FORMATAÇÃO MONETÁRIA NO DESPESAFORM
export const useMoedaFormatting = () => {
  const [valorError, setValorError] = useState("");

  const handleValorChange = (valor, emendaInfo, setFormData) => {
    // Formatar o valor conforme o usuário digita
    const valorFormatado = formatarMoedaInput(valor);

    // Atualizar o form
    setFormData((prev) => ({ ...prev, valor: valorFormatado }));

    // Validação de saldo se a emenda estiver selecionada
    if (emendaInfo && valorFormatado) {
      const valorNumerico = parseValorMonetario(valorFormatado);
      const saldoDisponivel = emendaInfo.saldoDisponivel || 0;

      if (valorNumerico > saldoDisponivel) {
        setValorError(
          `Valor excede saldo disponível: ${formatarMoedaDisplay(saldoDisponivel)}`,
        );
      } else if (valorNumerico <= 0) {
        setValorError("Valor deve ser maior que zero");
      } else {
        setValorError("");
      }
    } else {
      setValorError("");
    }
  };

  return { valorError, handleValorChange };
};

// ✅ FORMATADORES PARA NÚMEROS E PERCENTUAIS
export const formatarNumero = (numero, decimais = 0) => {
  if (!numero && numero !== 0) return "0";

  return Number(numero).toLocaleString("pt-BR", {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  });
};

export const formatarPercentual = (valor, decimais = 1) => {
  if (!valor && valor !== 0) return "0%";

  return `${Number(valor).toFixed(decimais)}%`;
};

// ✅ FORMATADOR PARA CNPJ (integração com validators.js)
export const formatarCNPJDisplay = (cnpj) => {
  if (!cnpj) return "";

  const numeros = cnpj.replace(/\D/g, "");

  if (numeros.length !== 14) return cnpj;

  return numeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
};

// ✅ FORMATADOR PARA TELEFONE
export const formatarTelefone = (telefone) => {
  if (!telefone) return "";

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 10) {
    return numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  } else if (numeros.length === 11) {
    return numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  return telefone;
};

// ✅ FORMATADOR PARA DATA
export const formatarData = (data) => {
  if (!data) return '';

  // Se já está no formato brasileiro
  if (data.includes('/')) return data;

  // Se está no formato ISO (YYYY-MM-DD)
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

/**
 * Formatar valor em moeda brasileira
 * @param {string|number} valor - Valor a ser formatado
 * @returns {string} Valor formatado em R$
 */
export const formatarMoeda = (valor) => {
  if (!valor) return 'R$ 0,00';

  // Remove tudo que não é número
  const numero = valor.toString().replace(/\D/g, '');

  if (!numero) return 'R$ 0,00';

  // Converte para centavos e depois para reais
  const centavos = parseInt(numero, 10);
  const reais = centavos / 100;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
};

// Export default para compatibilidade
export default {
  formatarMoeda,
  formatarData,
};
/**
 * Utilitários para formatação de dados
 */

/**
 * Formatar valor como moeda brasileira
 * @param {number|string} valor - Valor a ser formatado
 * @returns {string} - Valor formatado como moeda
 */
export const formatarMoeda = (valor) => {
  if (!valor && valor !== 0) return "R$ 0,00";
  
  const numero = typeof valor === 'string' ? 
    parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.')) : valor;
  
  if (isNaN(numero)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
};

/**
 * Formatar data brasileira
 * @param {Date|string} data - Data a ser formatada
 * @returns {string} - Data formatada DD/MM/AAAA
 */
export const formatarData = (data) => {
  if (!data) return "";
  
  const dataObj = data instanceof Date ? data : new Date(data);
  
  if (isNaN(dataObj.getTime())) return "";
  
  return dataObj.toLocaleDateString("pt-BR");
};

/**
 * Formatar telefone brasileiro
 * @param {string} telefone - Telefone a ser formatado
 * @returns {string} - Telefone formatado
 */
export const formatarTelefone = (telefone) => {
  if (!telefone) return "";
  
  const numeros = telefone.replace(/\D/g, "");
  
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  
  return telefone;
};

/**
 * Formatar CPF
 * @param {string} cpf - CPF a ser formatado
 * @returns {string} - CPF formatado XXX.XXX.XXX-XX
 */
export const formatarCPF = (cpf) => {
  if (!cpf) return "";
  
  const numeros = cpf.replace(/\D/g, "");
  
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
