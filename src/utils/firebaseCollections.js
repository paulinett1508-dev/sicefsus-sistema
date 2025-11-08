// src/utils/firebaseCollections.js - CORRIGIDO
// ✅ BUG CORRIGIDO: parseValorMonetario para strings formatadas "200.000,00"
// ✅ Sincronizado com os campos mostrados nas imagens
// ✅ ATUALIZADO 08/11/2025: Correção crítica na função calcularValorTotalAcoesServicos

export const COLLECTIONS = {
  USERS: "usuarios",
  EMENDAS: "emendas",
  DESPESAS: "despesas",
  LOGS: "logs",
};

// ✅ SCHEMA ATUALIZADO - Baseado nos prints fornecidos
export const EMENDA_SCHEMA = {
  // Dados básicos obrigatórios
  municipio: "",
  uf: "",
  cnpj: "",
  beneficiario: "",
  objetoProposta: "",
  programa: "",
  parlamentar: "",
  numeroEmenda: "",
  tipoEmenda: "Custeio PAP",
  numeroProposta: "",
  funcional: "",
  valorRecurso: 0,

  // Execução financeira
  valorExecutado: 0,
  saldoDisponivel: 0,

  // Cronograma
  dataOb: "",
  inicioExecucao: "",
  finalExecucao: "",
  dataUltimaAtualizacao: "",

  // Dados bancários
  banco: "",
  agencia: "",
  conta: "",

  // ✅ SEÇÃO: AÇÕES E SERVIÇOS - METAS QUANTITATIVAS
  acoesServicos: [
    {
      tipo: "Metas Quantitativas",
      estrategia: "",
      descricao: "",
      valor: 0,
      valorAcao: "", // Campo real no Firebase (string formatada)
    },
  ],

  // ✅ SEÇÃO: METAS
  metas: [
    {
      titulo: "",
      detalhamento: "",
    },
  ],

  // Campos técnicos complementares
  gnd: "",
  acaoOrcamentaria: "",
  dotacaoOrcamentaria: "",
  contrato: "",

  // Campos de sistema
  numero: "",
  status: "ativa",
  createdAt: null,
  updatedAt: null,

  // Campos legados
  area: "",
  tipo: "Individual",
  observacoes: "",
  dataCriacao: null,
  dataVencimento: null,
  dataModificacao: null,

  // Campos adicionais
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
  role: "user",
  status: "ativo",
  isActive: true,
  municipio: null,
  uf: null,
  departamento: "",
  telefone: "",
  createdAt: null,
  lastLogin: null,
};

// ✅ ATUALIZADO: Separação de status
export const DESPESA_SCHEMA = {
  emendaId: "",
  descricao: "",
  valor: 0,
  categoria: "",
  fornecedor: "",
  numeroNota: "",
  dataVencimento: null,
  dataPagamento: null,

  // ✅ DOIS CAMPOS SEPARADOS:
  status: "PLANEJADA", // PLANEJADA | EXECUTADA
  statusPagamento: "pendente", // pendente | empenhado | liquidado | pago | cancelado

  observacoes: "",
  dataCriacao: null,
  dataModificacao: null,
};

export const ACAO_SERVICO_SCHEMA = {
  tipo: "Metas Quantitativas",
  estrategia: "",
  descricao: "",
  valor: 0,
  valorAcao: "", // String formatada
};

export const META_SCHEMA = {
  titulo: "",
  detalhamento: "",
};

// ✅ FUNÇÃO AUXILIAR: Parse de valores monetários (strings formatadas)
function parseValorMonetario(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;

  // Remove R$, espaços, pontos (milhar) e troca vírgula por ponto
  const valorLimpo = String(valor)
    .replace(/R\$/g, "")
    .replace(/\s/g, "")
    .replace(/\./g, "") // Remove pontos (separador de milhar)
    .replace(",", "."); // Troca vírgula por ponto (decimal)

  const numero = parseFloat(valorLimpo);
  return isNaN(numero) ? 0 : numero;
}

// Função para validar estrutura de documento
export function validateDocumentStructure(doc, schema) {
  if (!doc || typeof doc !== "object") return false;

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

// ✅ Função para validar Ação/Serviço
export function validateAcaoServico(acao) {
  if (!acao || typeof acao !== "object") return false;

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
    const valor = parseValorMonetario(acao.valorAcao || acao.valor);
    if (valor <= 0) {
      return false;
    }
  }

  return true;
}

// ✅ Função para validar Meta
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

// ✅ CORRIGIDO: Função para calcular valor total das ações/serviços
export function calcularValorTotalAcoesServicos(acoesServicos) {
  if (!Array.isArray(acoesServicos)) return 0;

  return acoesServicos
    .filter((acao) => {
      // Aceita qualquer ação que tenha valor
      const temValor = acao.valorAcao || acao.valor;
      return temValor;
    })
    .reduce((total, acao) => {
      // Usa valorAcao (campo real do Firebase) ou valor (legado)
      const valorString = acao.valorAcao || acao.valor;

      // ✅ CORREÇÃO CRÍTICA: Usa parseValorMonetario para strings formatadas
      // Isso corrige o bug de "200.000,00" → 20.000.000
      const valor = parseValorMonetario(valorString);

      return total + valor;
    }, 0);
}

// ✅ Função para validar emenda completa
export function validateEmendaCompleta(emenda) {
  const erros = [];

  // Campos obrigatórios
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
