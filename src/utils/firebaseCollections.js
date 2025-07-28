// src/utils/firebaseCollections.js - ATUALIZADO CONFORME PRINTS
// ✅ Sincronizado com os campos mostrados nas imagens

export const COLLECTIONS = {
  USERS: "usuarios", // Corrigido para usar a coleção correta
  EMENDAS: "emendas",
  DESPESAS: "despesas",
  LOGS: "logs",
};

// ✅ SCHEMA ATUALIZADO - Baseado nos prints fornecidos
export const EMENDA_SCHEMA = {
  // Dados básicos obrigatórios (conforme print)
  municipio: "",
  uf: "",
  cnpj: "", // CNPJ do município
  beneficiario: "",
  objetoProposta: "",
  programa: "",
  parlamentar: "",
  numeroEmenda: "", // Nº DA EMENDA
  tipoEmenda: "Individual", // TIPO DE EMENDA
  numeroProposta: "", // Nº DA PROPOSTA
  funcional: "", // FUNCIONAL
  valorRecurso: 0, // VALOR DO RECURSO (R$)

  // Execução financeira
  valorExecutado: 0, // VALOR EXECUTADO DA EMENDA
  saldoDisponivel: 0, // SALDO DISPONÍVEL DA EMENDA (calculado)

  // Cronograma
  dataOb: "", // DATA DA OB
  inicioExecucao: "", // INÍCIO DA EXECUÇÃO
  finalExecucao: "", // FINAL DA EXECUÇÃO
  dataUltimaAtualizacao: "", // DATA DA ÚLTIMA ATUALIZAÇÃO

  // Dados bancários
  banco: "", // BANCO
  agencia: "", // AGÊNCIA
  conta: "", // CONTA

  // ✅ NOVA SEÇÃO: AÇÕES E SERVIÇOS - METAS QUANTITATIVAS
  acoesServicos: [
    {
      tipo: "Metas Quantitativas", // ou 'Metas'
      estrategia: "", // Ex: "ESTRATÉGIA DE RASTREAMENTO E CONTROLE DE CONDIÇÕES CRÔNICAS"
      descricao: "", // Ex: "Aquisição de Insumos e Materiais de Uso Contínuo..."
      valor: 0, // VALOR
    },
  ],

  // ✅ NOVA SEÇÃO: METAS
  metas: [
    {
      titulo: "", // Ex: "Oferta de medicamentos da Atenção Básica"
      detalhamento: "", // Ex: "Manutenção da oferta de medicamentos, insumos e materiais..."
    },
  ],

  // Campos técnicos complementares
  gnd: "",
  acaoOrcamentaria: "",
  dotacaoOrcamentaria: "",
  contrato: "",

  // Campos de sistema
  numero: "", // Número gerado automaticamente
  status: "ativa", // 'ativa', 'concluida', 'cancelada'
  createdAt: null,
  updatedAt: null,

  // Campos legados mantidos para compatibilidade
  area: "",
  tipo: "Individual",
  observacoes: "",
  dataCriacao: null,
  dataVencimento: null,
  dataModificacao: null,

  // Campos adicionais do formulário atual
  cnpjMunicipio: "",
  beneficiarioCnpj: "",
  outrosValores: 0,
  saldo: 0,
  dataValidada: "",
};

export const USER_SCHEMA = {
  uid: "",
  email: "",
  nome: "",
  displayName: "",
  role: "user", // 'admin', 'user'
  status: "ativo", // 'ativo', 'inativo'
  isActive: true,
  municipio: null,
  uf: null,
  departamento: "",
  telefone: "",
  createdAt: null,
  lastLogin: null,
};

export const DESPESA_SCHEMA = {
  emendaId: "",
  descricao: "",
  valor: 0,
  categoria: "",
  fornecedor: "",
  numeroNota: "",
  dataVencimento: null,
  dataPagamento: null,
  status: "pendente",
  observacoes: "",
  dataCriacao: null,
  dataModificacao: null,
};

// ✅ NOVA: Estrutura para Ações e Serviços
export const ACAO_SERVICO_SCHEMA = {
  tipo: "Metas Quantitativas", // 'Metas Quantitativas' ou 'Metas'
  estrategia: "", // Título/Estratégia principal
  descricao: "", // Descrição detalhada
  valor: 0, // Valor monetário (apenas para Metas Quantitativas)
};

// ✅ NOVA: Estrutura para Metas
export const META_SCHEMA = {
  titulo: "", // Título da meta
  detalhamento: "", // Detalhamento completo da meta
};

// Função para validar estrutura de documento
export function validateDocumentStructure(doc, schema) {
  if (!doc || typeof doc !== "object") return false;

  // Verificar campos obrigatórios baseados no schema
  const requiredFields = Object.keys(schema).filter(
    (key) =>
      schema[key] !== null && schema[key] !== "" && !Array.isArray(schema[key]),
  );

  return requiredFields.every((field) => doc.hasOwnProperty(field));
}

// Função para normalizar documento baseado no schema
export function normalizeDocument(doc, schema) {
  const normalized = { ...schema };

  Object.keys(doc).forEach((key) => {
    if (schema.hasOwnProperty(key)) {
      normalized[key] = doc[key];
    }
  });

  return normalized;
}

// ✅ NOVA: Função para validar Ação/Serviço
export function validateAcaoServico(acao) {
  if (!acao || typeof acao !== "object") return false;

  // Validações específicas
  if (!acao.tipo || !["Metas Quantitativas", "Metas"].includes(acao.tipo)) {
    return false;
  }

  if (!acao.estrategia || acao.estrategia.trim() === "") {
    return false;
  }

  if (!acao.descricao || acao.descricao.trim() === "") {
    return false;
  }

  // Para Metas Quantitativas, valor é obrigatório
  if (acao.tipo === "Metas Quantitativas") {
    if (!acao.valor || acao.valor <= 0) {
      return false;
    }
  }

  return true;
}

// ✅ NOVA: Função para validar Meta
export function validateMeta(meta) {
  if (!meta || typeof meta !== "object") return false;

  if (!meta.titulo || meta.titulo.trim() === "") {
    return false;
  }

  if (!meta.detalhamento || meta.detalhamento.trim() === "") {
    return false;
  }

  return true;
}

// ✅ NOVA: Função para calcular valor total das ações/serviços
export function calcularValorTotalAcoesServicos(acoesServicos) {
  if (!Array.isArray(acoesServicos)) return 0;

  return acoesServicos
    .filter((acao) => acao.tipo === "Metas Quantitativas" && acao.valor)
    .reduce((total, acao) => total + (parseFloat(acao.valor) || 0), 0);
}

// ✅ NOVA: Função para validar emenda completa conforme prints
export function validateEmendaCompleta(emenda) {
  const erros = [];

  // Campos obrigatórios conforme prints
  const camposObrigatorios = [
    "municipio",
    "uf",
    "cnpj",
    "beneficiario",
    "objetoProposta",
    "programa",
    "parlamentar",
    "numeroEmenda",
    "numeroProposta",
    "funcional",
    "valorRecurso",
    "banco",
    "agencia",
    "conta",
  ];

  camposObrigatorios.forEach((campo) => {
    if (!emenda[campo] || emenda[campo].toString().trim() === "") {
      erros.push(`Campo obrigatório não preenchido: ${campo}`);
    }
  });

  // Validar CNPJ
  if (emenda.cnpj && !validarCNPJ(emenda.cnpj)) {
    erros.push("CNPJ inválido");
  }

  // Validar UF
  const ufsValidas = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];
  if (emenda.uf && !ufsValidas.includes(emenda.uf.toUpperCase())) {
    erros.push("UF inválida");
  }

  // Validar valor do recurso
  if (emenda.valorRecurso && emenda.valorRecurso <= 0) {
    erros.push("Valor do recurso deve ser maior que zero");
  }

  // Validar ações/serviços se houver
  if (emenda.acoesServicos && Array.isArray(emenda.acoesServicos)) {
    emenda.acoesServicos.forEach((acao, index) => {
      if (!validateAcaoServico(acao)) {
        erros.push(`Ação/Serviço ${index + 1} inválida`);
      }
    });
  }

  // Validar metas se houver
  if (emenda.metas && Array.isArray(emenda.metas)) {
    emenda.metas.forEach((meta, index) => {
      if (!validateMeta(meta)) {
        erros.push(`Meta ${index + 1} inválida`);
      }
    });
  }

  return {
    valida: erros.length === 0,
    erros,
  };
}

// Função auxiliar para validar CNPJ
function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/[^\d]/g, "");
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  let soma = 0;
  let peso = 2;

  for (let i = 11; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  let digito1 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (parseInt(cnpj.charAt(12)) !== digito1) return false;

  soma = 0;
  peso = 2;

  for (let i = 12; i >= 0; i--) {
    soma += parseInt(cnpj.charAt(i)) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }

  let digito2 = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return parseInt(cnpj.charAt(13)) === digito2;
}
