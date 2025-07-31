// ✅ FORMATADORES MONETÁRIOS PRECISOS - src/utils/formatters.js - VERSÃO COMPLETA
import { useState } from "react";

export const formatarMoedaDisplay = (valor) => {
  if (!valor && valor !== 0) return "R$ 0,00";

  const numero =
    typeof valor === "string"
      ? parseFloat(valor.replace(/[^\d,]/g, "").replace(",", "."))
      : valor;

  if (isNaN(numero)) return "R$ 0,00";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// ✅ FIX: Formatação monetária inteligente com 2 casas decimais
export const formatarMoedaInput = (valor) => {
  if (!valor) return "";

  // Remove tudo que não é número
  let numero = valor.replace(/\D/g, "");

  if (numero.length === 0) return "";

  // ✅ PREENCHIMENTO INTELIGENTE: sempre 2 casas decimais
  if (numero.length === 1) return `0,0${numero}`;
  if (numero.length === 2) return `0,${numero}`;

  // ✅ FORMATAÇÃO COM 2 CASAS DECIMAIS GARANTIDAS
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
  if (!data) return "";

  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString("pt-BR");
  } catch (error) {
    return data;
  }
};

// ✅ FORMATADOR PARA DATA E HORA
export const formatarDataHora = (data) => {
  if (!data) return "";

  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleString("pt-BR");
  } catch (error) {
    return data;
  }
};

// ✅ UTILITÁRIOS PARA VALIDAÇÃO DE VALORES
export const validarValorMonetario = (valor, saldoMaximo = null) => {
  const valorNumerico = parseValorMonetario(valor);

  if (valorNumerico <= 0) {
    return { valido: false, erro: "Valor deve ser maior que zero" };
  }

  if (saldoMaximo && valorNumerico > saldoMaximo) {
    return {
      valido: false,
      erro: `Valor excede saldo disponível: ${formatarMoedaDisplay(saldoMaximo)}`,
    };
  }

  return { valido: true, erro: null };
};

// ✅ CALCULADORA DE ESTATÍSTICAS FINANCEIRAS
export const calcularEstatisticas = (despesas, emendas) => {
  const totalDespesas = despesas.reduce((acc, despesa) => {
    return acc + parseValorMonetario(despesa.valor);
  }, 0);

  const totalEmendas = emendas.reduce((acc, emenda) => {
    return acc + (emenda.valorRecurso || 0);
  }, 0);

  const saldoTotal = totalEmendas - totalDespesas;
  const percentualExecutado =
    totalEmendas > 0 ? (totalDespesas / totalEmendas) * 100 : 0;

  return {
    totalDespesas,
    totalEmendas,
    saldoTotal,
    percentualExecutado,
    totalDespesasFormatado: formatarMoedaDisplay(totalDespesas),
    totalEmendasFormatado: formatarMoedaDisplay(totalEmendas),
    saldoTotalFormatado: formatarMoedaDisplay(saldoTotal),
    percentualExecutadoFormatado: formatarPercentual(percentualExecutado),
  };
};
