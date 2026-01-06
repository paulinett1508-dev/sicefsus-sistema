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

// Cores RGB para uso em PDF (jsPDF) - Design System Moderno
export const PDF_COLORS = {
  // Base - Slate (tons neutros sofisticados)
  SLATE_900: [15, 23, 42],         // Títulos principais
  SLATE_700: [51, 65, 85],         // Subtítulos, texto importante
  SLATE_500: [100, 116, 139],      // Texto secundário
  SLATE_400: [148, 163, 184],      // Texto muted
  SLATE_300: [203, 213, 225],      // Bordas, linhas
  SLATE_200: [226, 232, 240],      // Bordas sutis
  SLATE_100: [241, 245, 249],      // Background alternado
  SLATE_50: [248, 250, 252],       // Background cards

  // Accent - Emerald (destaque elegante)
  EMERALD_500: [16, 185, 129],     // Valores positivos, sucesso
  EMERALD_100: [209, 250, 229],    // Background sucesso

  // Warning - Amber
  AMBER_500: [245, 158, 11],       // Alertas, pendências

  // Danger - Red
  RED_500: [239, 68, 68],          // Valores negativos, crítico

  // Aliases para compatibilidade
  HEADER_BG: [15, 23, 42],         // Slate 900
  HEADER_TEXT: [255, 255, 255],    // Branco
  TABLE_HEADER: [241, 245, 249],   // Slate 100 (fundo claro!)
  TABLE_HEADER_TEXT: [51, 65, 85], // Slate 700
  TABLE_ROW_EVEN: [248, 250, 252], // Slate 50
  TABLE_ROW_ODD: [255, 255, 255],  // Branco
  TABLE_BORDER: [226, 232, 240],   // Slate 200
  TEXT_PRIMARY: [15, 23, 42],      // Slate 900
  TEXT_SECONDARY: [100, 116, 139], // Slate 500
  TEXT_MUTED: [148, 163, 184],     // Slate 400
  CARD_BG: [248, 250, 252],        // Slate 50
  BOX_BG: [241, 245, 249],         // Slate 100
  STATUS_ALTO: [16, 185, 129],     // Emerald 500
  STATUS_MEDIO: [245, 158, 11],    // Amber 500
  STATUS_BAIXO: [239, 68, 68],     // Red 500
  ACCENT: [16, 185, 129],          // Emerald 500
  WHITE: [255, 255, 255],
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
