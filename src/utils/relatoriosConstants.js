// src/utils/relatoriosConstants.js
// ✅ ATUALIZADO 04/11/2025: Adicionados filtros por emenda e parlamentar

export const COLORS = {
  PRIMARY: "#2563EB",
  ACCENT: "#3B82F6",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  WHITE: "#fff",
  GRAY: "#f8f9fa",
};

// Cores RGB para uso em PDF (jsPDF)
export const PDF_COLORS = {
  // Cores de cabeçalho
  HEADER_BG: [21, 67, 96],        // Azul escuro
  HEADER_TEXT: [255, 255, 255],   // Branco

  // Cores de tabela
  TABLE_HEADER: [243, 156, 18],   // Laranja
  TABLE_HEADER_BLUE: [74, 144, 226], // Azul para tabelas alternativas
  TABLE_HEADER_RED: [231, 76, 60],   // Vermelho para destaques
  TABLE_ROW_EVEN: [240, 240, 240], // Cinza claro
  TABLE_ROW_ODD: [255, 255, 255],  // Branco
  TABLE_BORDER: [200, 200, 200],   // Cinza

  // Cores de texto
  TEXT_PRIMARY: [0, 0, 0],         // Preto
  TEXT_SECONDARY: [80, 80, 80],    // Cinza escuro
  TEXT_MUTED: [100, 100, 100],     // Cinza médio

  // Cores de fundo
  CARD_BG: [245, 247, 250],        // Fundo de cards
  BOX_BG: [248, 249, 250],         // Fundo de boxes

  // Cores de status/indicadores
  STATUS_ALTO: [39, 174, 96],      // Verde
  STATUS_MEDIO: [243, 156, 18],    // Laranja
  STATUS_BAIXO: [231, 76, 60],     // Vermelho
};

export const TIPOS_RELATORIOS = [
  {
    id: "execucao-orcamentaria",
    titulo: "Execução Orçamentária",
    descricao: "Demonstrativo da execução financeira das emendas",
    icone: "analytics",
    cor: COLORS.PRIMARY,
    campos: ["periodo", "parlamentar", "emenda", "status"],
  },
  {
    id: "prestacao-contas",
    titulo: "Prestação de Contas",
    descricao: "Documento para prestação de contas aos órgãos fiscalizadores",
    icone: "assignment",
    cor: COLORS.ACCENT,
    campos: ["periodo", "municipio", "emenda"],
  },
  {
    id: "analitico-parlamentar",
    titulo: "Analítico por Parlamentar",
    descricao: "Análise das emendas por autor, com execução e saldos",
    icone: "groups",
    cor: COLORS.SUCCESS,
    campos: ["parlamentar", "periodo", "emenda"],
  },
  {
    id: "despesas-detalhado",
    titulo: "Despesas Detalhado",
    descricao: "Listagem de despesas realizadas com filtros avançados",
    icone: "payments",
    cor: COLORS.WARNING,
    campos: ["periodo", "municipio", "parlamentar", "emenda", "fornecedor"],
  },
  {
    id: "consolidado-mensal",
    titulo: "Consolidado Mensal",
    descricao: "Resumo mensal com principais indicadores",
    icone: "trending_up",
    cor: COLORS.ERROR,
    campos: ["mes", "ano", "parlamentar"],
  },
];

export const FILTROS_INICIAIS = {
  dataInicio: "",
  dataFim: "",
  parlamentar: "",
  emenda: "", // ✅ NOVO: Filtro por emenda
  municipio: "",
  uf: "",
  fornecedor: "", // ✅ Adicionado fornecedor
  status: "todos",
};
