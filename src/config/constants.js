// src/config/constants.js
// 🎯 Constantes centralizadas do SICEFSUS
// ✅ Atualizado em: 04/11/2025 - Separação de status

// ========================================
// 📋 PROGRAMAS DE SAÚDE (EMENDAS)
// ========================================
export const PROGRAMAS_SAUDE = [
  "INCREMENTO AO CUSTEIO DE SERVIÇOS DA ATENÇÃO PRIMÁRIA À SAÚDE",
  "CUSTEIO DE SERVIÇOS DA ATENÇÃO PRIMÁRIA À SAÚDE",
  "CUSTEIO DE SERVIÇOS DA ATENÇÃO ESPECIALIZADA À SAÚDE",
  "INCREMENTO AO CUSTEIO DE SERVIÇOS DA ATENÇÃO ESPECIALIZADA À SAÚDE",
];

// ========================================
// 💰 NATUREZA DE DESPESAS (EMENDAS E DESPESAS)
// ========================================
export const NATUREZAS_DESPESA = [
  "339004 - CONTRATACAO POR TEMPO DETERMINADO - PES.CIVIL",
  "339092 - DESPESAS DE EXERCICIOS ANTERIORES",
  "339037 - LOCACAO DE MAO-DE-OBRA",
  "339030 - MATERIAL DE CONSUMO",
  "339039 - OUTROS SERVICOS DE TERCEIROS-PESSOA JURIDICA",
  "339033 - PASSAGENS E DESPESAS COM LOCOMOCAO",
  "339040 - SERVICOS DE TECNOLOGIA DA INFORMACAO E COMUNICACAO - PESSOA JURIDICA",
  "339018 - AUXÍLIO FINANCEIRO A ESTUDANTES",
  "337200 - EXECUÇÃO ORÇAMENTÁRIA DELEGADA A CONSÓRCIOS PÚBLICOS",
  "339032 - MATERIAL DE DISTRIBUICAO GRATUITA",
  "339034 - OUTRAS DESPESAS DE PESSOAL - CONTRATOS DE TERCEIRIZACAO",
  "339048 - OUTROS AUXILIOS FINANCEIROS A PESSOA FISICA",
  "339036 - OUTROS SERVICOS DE TERCEIROS - PESSOA FISICA",
  "339031 - PREMIACOES CULT., ART., CIENT., DESP. E OUTR.",
  "337170 - RATEIO PELA PARTICIPAÇÃO EM CONSÓRCIO PÚBLICO",
  "339035 - SERVICOS DE CONSULTORIA",
  "335085 - TRANSFERENCIAS POR MEIO DE CONTRATO DE GESTAO",
  "337100 - TRANSFERÊNCIAS A CONSÓRCIOS PÚBLICOS MEDIANTE CONTRATO DE RATEIO",
];

// ========================================
// 🏛️ OBJETOS DA EMENDA
// ========================================
export const OBJETOS_EMENDA = [
  "Custeio PAP",
  "Custeio MAC",
  "Investimento PAP",
  "Investimento MAC",
  "Custeio PAP – Estadual",
  "Custeio MAC – Estadual",
];

// ========================================
// 🎯 AÇÕES ORÇAMENTÁRIAS (DESPESAS)
// ========================================
export const ACOES_ORCAMENTARIAS = [
  {
    codigo: "8535",
    descricao: "Estruturação de Unidades de Atenção Especializada em Saúde",
  },
  {
    codigo: "8536",
    descricao: "Estruturação da Rede de Serviços de Atenção Básica de Saúde",
  },
  {
    codigo: "8585",
    descricao:
      "Atenção à Saúde da População para Procedimentos em Média e Alta Complexidade",
  },
  {
    codigo: "8730",
    descricao:
      "Atenção à Saúde da População para Procedimentos de Média e Alta Complexidade",
  },
  { codigo: "20AD", descricao: "Atenção Primária à Saúde" },
  {
    codigo: "21C0",
    descricao:
      "Recursos para estruturação da rede de serviços de atenção básica",
  },
];

// ========================================
// 📊 CATEGORIAS DE DESPESAS
// ========================================
export const CATEGORIAS_DESPESAS = [
  "equipamentos",
  "reformas",
  "construcao",
  "servicos",
  "medicamentos",
  "materiais",
  "outros",
];

// ========================================
// 📈 STATUS DE EXECUÇÃO ORÇAMENTÁRIA
// ========================================
// ✅ NOVO: Status que indica a fase da execução orçamentária
export const STATUS_EXECUCAO_DESPESA = [
  { value: "PLANEJADA", label: "Planejada" },
  { value: "EXECUTADA", label: "Executada" },
];

// ========================================
// 💰 STATUS DE PAGAMENTO
// ========================================
// ✅ NOVO: Status que indica o andamento do pagamento
export const STATUS_PAGAMENTO_DESPESA = [
  { value: "pendente", label: "Pendente" },
  { value: "empenhado", label: "Empenhado" },
  { value: "liquidado", label: "Liquidado" },
  { value: "pago", label: "Pago" },
  { value: "cancelado", label: "Cancelado" },
];

// ========================================
// 🗂️ ELEMENTOS DE DESPESA (para DespesaForm)
// ========================================
export const ELEMENTOS_DESPESA = [
  "3.3.90.30.99 - Outros Materiais de Consumo",
  "3.3.90.30.01 - Material de Consumo",
  "3.3.90.39.01 - Serviços de Terceiros - Pessoa Jurídica",
  "4.4.90.51.00 - Obras e Instalações",
  "4.4.90.52.00 - Equipamentos e Material Permanente",
];

// ========================================
// 👤 TIPOS DE USUÁRIO
// ========================================
export const USER_TYPES = {
  ADMIN: "admin",
  GESTOR: "gestor",
  OPERADOR: "user",
};

// ========================================
// 📊 STATUS DE DESPESAS
// ========================================
export const DESPESA_STATUS = {
  PLANEJADA: "PLANEJADA",
  EXECUTADA: "EXECUTADA",
};

// ========================================
// 💰 CAMPOS DE VALOR (ORDEM DE FALLBACK)
// ========================================
// Usar sempre nesta ordem ao buscar valor de uma emenda:
// emenda[VALOR_FIELDS[0]] || emenda[VALOR_FIELDS[1]] || emenda[VALOR_FIELDS[2]] || 0
export const VALOR_FIELDS = ["valor", "valorRecurso", "valorTotal"];

/**
 * Retorna o valor numerico de uma emenda usando a ordem padrao de fallback
 * @param {object} emenda - Documento da emenda
 * @param {function} parse - Funcao de parsing (parseValorMonetario)
 * @returns {number} Valor numerico
 */
export const getValorEmenda = (emenda, parse) => {
  if (!emenda) return 0;
  for (const field of VALOR_FIELDS) {
    if (emenda[field]) return parse ? parse(emenda[field]) : emenda[field];
  }
  return 0;
};

// ========================================
// 👤 ROLES DE USUÁRIO (lista simples)
// ========================================
export const USER_ROLES = ["admin", "gestor", "operador"];

// ========================================
// 📏 LIMITES DE VALIDAÇÃO
// ========================================
export const VALIDATION_LIMITS = {
  MUNICIPIO_MIN: 2,
  MUNICIPIO_MAX: 100,
  NOME_MIN: 2,
  NOME_MAX: 100,
  SENHA_MAX: 50,
  VENCIMENTO_WARNING_DAYS: 30,
};