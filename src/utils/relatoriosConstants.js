// src/utils/relatoriosConstants.js
// ✅ ATUALIZADO 04/11/2025: Adicionados filtros por emenda e parlamentar

export const COLORS = {
  PRIMARY: "#154360",
  ACCENT: "#4A90E2",
  SUCCESS: "#27AE60",
  WARNING: "#F39C12",
  ERROR: "#E74C3C",
  WHITE: "#fff",
  GRAY: "#f8f9fa",
};

export const TIPOS_RELATORIOS = [
  {
    id: "execucao-orcamentaria",
    titulo: "Relatório de Execução Orçamentária",
    descricao:
      "Demonstrativo completo da execução financeira das emendas parlamentares",
    icone: "📊",
    cor: COLORS.PRIMARY,
    campos: ["periodo", "parlamentar", "emenda", "status"], // ✅ Adicionado emenda
  },
  {
    id: "prestacao-contas",
    titulo: "Relatório de Prestação de Contas",
    descricao:
      "Documento oficial para prestação de contas aos órgãos fiscalizadores",
    icone: "📋",
    cor: COLORS.ACCENT,
    campos: ["periodo", "municipio", "emenda"], // ✅ Adicionado emenda
  },
  {
    id: "analitico-parlamentar",
    titulo: "Relatório Analítico por Parlamentar",
    descricao: "Análise detalhada das emendas por autor, com execução e saldos",
    icone: "👥",
    cor: COLORS.SUCCESS,
    campos: ["parlamentar", "periodo", "emenda"], // ✅ Adicionado emenda
  },
  {
    id: "despesas-detalhado",
    titulo: "Relatório de Despesas Detalhado",
    descricao:
      "Listagem completa de todas as despesas realizadas com filtros avançados",
    icone: "💰",
    cor: COLORS.WARNING,
    campos: ["periodo", "municipio", "parlamentar", "emenda", "fornecedor"], // ✅ Adicionados parlamentar e emenda
  },
  {
    id: "consolidado-mensal",
    titulo: "Relatório Consolidado Mensal",
    descricao: "Resumo executivo mensal com principais indicadores e gráficos",
    icone: "📈",
    cor: COLORS.ERROR,
    campos: ["mes", "ano", "parlamentar"], // ✅ Adicionado parlamentar
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
