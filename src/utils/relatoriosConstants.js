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
