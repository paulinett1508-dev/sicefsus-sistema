// src/utils/validators.js - VALIDAÇÕES CENTRALIZADAS DO SISTEMA
// ✅ Funções utilitárias para normalização e validação

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
 * ✅ VALIDAR role de usuário
 * @param {string} role - Role a ser validado
 * @returns {boolean} - true se válido
 */
export const validateUserRole = (role) => {
  const rolesValidos = ["admin", "user", "operador"];
  return rolesValidos.includes(role);
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
 * ✅ VALIDAR formulário de emenda completo
 * @param {Object} formData - Dados do formulário de emenda
 * @returns {Object} - Resultado da validação
 */
export const validarFormularioEmenda = (formData) => {
  const erros = {};

  // Validar campos obrigatórios básicos
  if (!formData.numero || formData.numero.trim() === "") {
    erros.numero = "Número da emenda é obrigatório";
  }

  if (!formData.autor || formData.autor.trim() === "") {
    erros.autor = "Autor é obrigatório";
  }

  if (!formData.municipio || formData.municipio.trim() === "") {
    erros.municipio = "Município é obrigatório";
  }

  if (!formData.uf || formData.uf.trim() === "") {
    erros.uf = "UF é obrigatória";
  }

  // Validar UF
  if (formData.uf && !validateUF(formData.uf)) {
    erros.uf = "UF inválida";
  }

  // Validar valor
  if (
    !formData.valor ||
    parseFloat(
      formData.valor
        .toString()
        .replace(/[^\d,.-]/g, "")
        .replace(",", "."),
    ) <= 0
  ) {
    erros.valor = "Valor deve ser maior que zero";
  }

  // Validar programa
  if (!formData.programa || formData.programa.trim() === "") {
    erros.programa = "Programa é obrigatório";
  }

  // Validar beneficiário
  if (!formData.beneficiario || formData.beneficiario.trim() === "") {
    erros.beneficiario = "Beneficiário é obrigatório";
  }

  // Validar CNPJ do beneficiário se fornecido
  if (formData.cnpjBeneficiario) {
    const cnpjValidacao = validarCNPJ(formData.cnpjBeneficiario);
    if (!cnpjValidacao.valido) {
      erros.cnpjBeneficiario = cnpjValidacao.erro;
    }
  }

  // Validar tipo
  const tiposValidos = ["Individual", "Coletiva", "Bancada"];
  if (!formData.tipo || !tiposValidos.includes(formData.tipo)) {
    erros.tipo = "Tipo de emenda inválido";
  }

  // Validar modalidade
  if (!formData.modalidade || formData.modalidade.trim() === "") {
    erros.modalidade = "Modalidade é obrigatória";
  }

  // Validar objeto
  if (!formData.objeto || formData.objeto.trim() === "") {
    erros.objeto = "Objeto é obrigatório";
  }

  // Validar dados bancários
  if (!formData.banco || formData.banco.trim() === "") {
    erros.banco = "Banco é obrigatório";
  }

  if (!formData.agencia || formData.agencia.trim() === "") {
    erros.agencia = "Agência é obrigatória";
  }

  if (!formData.conta || formData.conta.trim() === "") {
    erros.conta = "Conta é obrigatória";
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
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

// ✅ HOOK PARA USO NO DESPESAFORM
// ✅ CORREÇÃO: Import do React apenas aqui onde é necessário
import { useState } from "react";

export const useCNPJValidation = () => {
  const [cnpjError, setCnpjError] = useState("");

  const handleCNPJChange = async (valor, setFormData) => {
    // Import CNPJ functions from cnpjUtils using dynamic import
    const { formatarCNPJ, validarCNPJ } = await import("./cnpjUtils");

    // Formata o CNPJ
    const cnpjFormatado = formatarCNPJ(valor);

    // Atualiza o form
    setFormData((prev) => ({ ...prev, cnpjFornecedor: cnpjFormatado }));

    // Valida apenas se tem 14 dígitos
    if (cnpjFormatado.replace(/\D/g, "").length === 14) {
      if (validarCNPJ(cnpjFormatado)) {
        setCnpjError("");
      } else {
        setCnpjError("CNPJ inválido");
      }
    } else {
      setCnpjError("");
    }
  };

  return { cnpjError, handleCNPJChange };
};
// ADIÇÕES GRANULARES em src/utils/validators.js

// 🔧 ADICIONAR no final do arquivo (após linha ~600):

/**
 * ✅ VALIDAR datas da despesa em relação à emenda
 * @param {string} dataDespesa - Data da despesa
 * @param {Object} emenda - Dados da emenda
 * @returns {Object} - Resultado da validação
 */
export const validarDatasDespesaEmenda = (dataDespesa, emenda) => {
  const errors = [];

  if (!dataDespesa) {
    errors.push("Data da despesa é obrigatória");
    return { isValid: false, errors };
  }

  if (!emenda) {
    errors.push("Emenda não encontrada");
    return { isValid: false, errors };
  }

  // Buscar datas da emenda em diferentes campos possíveis
  const dataInicioEmenda =
    emenda.dataInicio || emenda.dataCriacao || emenda.dataAprovacao;
  const dataFimEmenda =
    emenda.dataFim || emenda.dataValidade || emenda.dataVencimento;

  // Converte strings para objetos Date
  const dataDespesaObj = new Date(dataDespesa);
  const dataInicioObj = dataInicioEmenda ? new Date(dataInicioEmenda) : null;
  const dataFimObj = dataFimEmenda ? new Date(dataFimEmenda) : null;

  // Validação: despesa deve ser >= data de criação da emenda
  if (dataInicioObj && dataDespesaObj < dataInicioObj) {
    const dataInicioFormatada = dataInicioObj.toLocaleDateString("pt-BR");
    errors.push(
      `Data da despesa deve ser posterior ou igual à data de criação da emenda (${dataInicioFormatada})`,
    );
  }

  // Validação: despesa deve ser <= data de validade da emenda
  if (dataFimObj && dataDespesaObj > dataFimObj) {
    const dataFimFormatada = dataFimObj.toLocaleDateString("pt-BR");
    errors.push(
      `Data da despesa deve ser anterior ou igual à data de validade da emenda (${dataFimFormatada})`,
    );
  }

  // Validação: data não pode ser futura
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999); // Permite até o final do dia atual

  if (dataDespesaObj > hoje) {
    errors.push("Data da despesa não pode ser futura");
  }

  return {
    isValid: errors.length === 0,
    errors,
    validacoes: {
      dentroVigenciaEmenda:
        dataInicioObj && dataFimObj
          ? dataDespesaObj >= dataInicioObj && dataDespesaObj <= dataFimObj
          : true,
      naoFutura: dataDespesaObj <= hoje,
      posDataCriacao: dataInicioObj ? dataDespesaObj >= dataInicioObj : true,
      anteDataValidade: dataFimObj ? dataDespesaObj <= dataFimObj : true,
    },
  };
};

/**
 * ✅ FORMATAR período de vigência da emenda
 * @param {Object} emenda - Dados da emenda
 * @returns {string} - Período formatado
 */
export const formatarPeriodoVigenciaEmenda = (emenda) => {
  const dataInicio =
    emenda.dataInicio || emenda.dataCriacao || emenda.dataAprovacao;
  const dataFim =
    emenda.dataFim || emenda.dataValidade || emenda.dataVencimento;

  if (!dataInicio && !dataFim) {
    return "Período não definido";
  }

  const formatarData = (data) => {
    if (!data) return null;
    return new Date(data).toLocaleDateString("pt-BR");
  };

  const inicioFormatado = formatarData(dataInicio);
  const fimFormatado = formatarData(dataFim);

  if (inicioFormatado && fimFormatado) {
    return `${inicioFormatado} até ${fimFormatado}`;
  } else if (inicioFormatado) {
    return `A partir de ${inicioFormatado}`;
  } else if (fimFormatado) {
    return `Até ${fimFormatado}`;
  }

  return "Período não definido";
};

/**
 * ✅ HOOK para usar validação de datas no formulário
 * @param {Object} emenda - Dados da emenda
 * @returns {Object} - Funções de validação
 */
export const useValidacaoDatasDespesa = (emenda) => {
  const validarData = (dataDespesa) => {
    return validarDatasDespesaEmenda(dataDespesa, emenda);
  };

  const obterLimitesData = () => {
    if (!emenda) return { min: null, max: null };

    const dataInicio =
      emenda.dataInicio || emenda.dataCriacao || emenda.dataAprovacao;
    const dataFim =
      emenda.dataFim || emenda.dataValidade || emenda.dataVencimento;
    const hoje = new Date().toISOString().split("T")[0];

    return {
      min: dataInicio ? new Date(dataInicio).toISOString().split("T")[0] : null,
      max: dataFim
        ? Math.min(new Date(dataFim), new Date(hoje)) ===
          new Date(hoje).getTime()
          ? hoje
          : new Date(dataFim).toISOString().split("T")[0]
        : hoje,
    };
  };

  return {
    validarData,
    obterLimitesData,
    formatarPeriodoVigencia: () => formatarPeriodoVigenciaEmenda(emenda),
  };
};

/**
 * ✅ NORMALIZAR entrada de data
 * @param {string|Date} dataInput - Data a ser normalizada
 * @returns {string|null} - Data normalizada no formato YYYY-MM-DD ou null
 */
export const normalizarDataInput = (dataInput) => {
  if (!dataInput) return null;

  let data;

  // Se já é Date
  if (dataInput instanceof Date) {
    data = dataInput;
  }
  // Se é string
  else if (typeof dataInput === "string") {
    // Limpar espaços
    const dataLimpa = dataInput.trim();
    if (!dataLimpa) return null;

    // Tentar converter
    data = new Date(dataLimpa);
  }
  else {
    return null;
  }

  // Verificar se é válida
  if (isNaN(data.getTime())) return null;

  // Retornar no formato padrão
  return data.toISOString().split('T')[0];
};

/**
 * ✅ VALIDAR cronograma completo da emenda
 * @param {Object} cronograma - Datas do cronograma
 * @returns {Object} - Resultado da validação
 */
export const validarCronogramaEmenda = (cronograma) => {
  const erros = {};
  const alertas = [];

  const {
    dataAprovacao,
    dataOb,
    inicioExecucao,
    finalExecucao,
    dataValidade
  } = cronograma || {};

  // ✅ CORREÇÃO: Usar função normalizarDataInput já exportada (evita duplicação)
  const datas = {
    dataAprovacao: normalizarDataInput(dataAprovacao),
    dataOb: normalizarDataInput(dataOb),
    inicioExecucao: normalizarDataInput(inicioExecucao),
    finalExecucao: normalizarDataInput(finalExecucao),
    dataValidade: normalizarDataInput(dataValidade)
  };

  // Data atual para comparações
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Validações de sequência temporal
  if (datas.dataAprovacao && datas.dataOb) {
    if (datas.dataOb < datas.dataAprovacao) {
      erros.dataOb = "Data do OB não pode ser anterior à data de aprovação";
    }
  }

  if (datas.dataOb && datas.inicioExecucao) {
    if (datas.inicioExecucao < datas.dataOb) {
      erros.inicioExecucao = "Início da execução não pode ser anterior à data do OB";
    }
  }

  if (datas.inicioExecucao && datas.finalExecucao) {
    if (datas.finalExecucao < datas.inicioExecucao) {
      erros.finalExecucao = "Final da execução não pode ser anterior ao início";
    }
  }

  if (datas.dataAprovacao && datas.dataValidade) {
    if (datas.dataValidade < datas.dataAprovacao) {
      erros.dataValidade = "Data de validade não pode ser anterior à aprovação";
    }
  }

  // Alertas para datas próximas ao vencimento
  if (datas.dataValidade) {
    const diasParaVencimento = Math.ceil((new Date(datas.dataValidade) - hoje) / (1000 * 60 * 60 * 24));

    if (diasParaVencimento < 0) {
      erros.dataValidade = "Emenda já vencida";
    } else if (diasParaVencimento <= 30) {
      alertas.push(`Emenda vence em ${diasParaVencimento} dias`);
    }
  }

  // Validar se final da execução não ultrapassa validade
  if (datas.finalExecucao && datas.dataValidade) {
    if (datas.finalExecucao > datas.dataValidade) {
      erros.finalExecucao = "Final da execução não pode ser após a data de validade";
    }
  }

  // Validações de obrigatoriedade das datas principais do cronograma
  if (!cronograma.dataAprovacao) {
    erros.dataAprovacao = "Data de aprovação é obrigatória";
  } else if (!datas.dataAprovacao) {
    erros.dataAprovacao = "Data de aprovação inválida";
  } else if (datas.dataAprovacao > hoje) {
    erros.dataAprovacao = "Data de aprovação não pode ser futura";
  }

  if (!cronograma.dataValidade) {
    erros.dataValidade = "Data de validade é obrigatória";
  } else if (!datas.dataValidade) {
    erros.dataValidade = "Data de validade inválida";
  }

  // OB (Ordem de Bloqueio) é opcional, mas se presente, deve ser válida
  if (cronograma.dataOb && !datas.dataOb) {
    erros.dataOb = "Data OB inválida";
  }

  // Início e Fim da Execução são opcionais, mas se presentes, devem ser válidos e sequenciais
  if (cronograma.inicioExecucao && !datas.inicioExecucao) {
    erros.inicioExecucao = "Início de execução inválido";
  }
  if (cronograma.finalExecucao && !datas.finalExecucao) {
    erros.finalExecucao = "Final de execução inválido";
  }

  return {
    valido: Object.keys(erros).length === 0,
    erros,
    alertas,
    datas // Retornar datas normalizadas
  };
};