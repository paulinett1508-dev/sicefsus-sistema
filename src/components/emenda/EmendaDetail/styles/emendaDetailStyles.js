// components/emenda/EmendaDetail/styles/emendaDetailStyles.js
// ✅ ESTILOS CENTRALIZADOS E ORGANIZADOS

export const emendaDetailStyles = {
  // ==================== LOADING & ERROR ====================
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "40px",
  },

  loadingSpinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3B82F6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    color: "#6c757d",
  },

  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    padding: "40px",
    textAlign: "center",
  },

  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  errorTitle: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#EF4444",
    margin: "0 0 8px 0",
  },

  errorMessage: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  retryButton: {
    padding: "10px 20px",
    backgroundColor: "#3B82F6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },

  // ==================== CONTAINER ====================
  container: {
    width: "100%",
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
  },

  // ==================== HEADER ====================
  header: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: "16px",
  },

  headerInfo: {
    flex: "1",
    minWidth: "300px",
  },

  headerTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#2563EB",
    margin: "0 0 8px 0",
  },

  headerSubtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: "0 0 12px 0",
  },

  headerMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    alignItems: "center",
  },

  metaItem: {
    fontSize: "13px",
    color: "#495057",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },

  headerActions: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
  },

  // ==================== BUTTONS ====================
  btnPrimary: {
    padding: "10px 20px",
    backgroundColor: "#3B82F6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  btnSecondary: {
    padding: "10px 20px",
    backgroundColor: "white",
    color: "#495057",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  btnSuccess: {
    padding: "10px 20px",
    backgroundColor: "#10B981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },

  // ==================== KPI SECTION ====================
  kpiSection: {
    marginBottom: "20px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },

  kpiCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  kpiIcon: {
    fontSize: "32px",
    flexShrink: 0,
  },

  kpiContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  kpiValue: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#2563EB",
  },

  kpiLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },

  // ==================== TABS ====================
  tabsContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    overflow: "hidden",
  },

  tabsHeader: {
    display: "flex",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
    overflowX: "auto",
  },

  tab: {
    padding: "16px 24px",
    backgroundColor: "transparent",
    border: "none",
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c757d",
    cursor: "pointer",
    transition: "all 0.2s",
    borderBottom: "3px solid transparent",
  },

  tabActive: {
    color: "#3B82F6",
    backgroundColor: "white",
    borderBottomColor: "#3B82F6",
  },

  tabContent: {
    padding: "24px",
  },

  // ==================== CHARTS & GRIDS ====================
  visaoGeralContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
    gap: "20px",
  },

  chartCard: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  chartTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2563EB",
    margin: "0 0 16px 0",
    textAlign: "center",
  },

  // ==================== DETALHES ====================
  detalhesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  detalheCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e9ecef",
  },

  detalheTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563EB",
    margin: "0 0 12px 0",
  },

  detalheContent: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  detalheRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  detalheLabel: {
    fontSize: "13px",
    color: "#6c757d",
    fontWeight: "500",
  },

  detalheValue: {
    fontSize: "13px",
    color: "#495057",
    fontWeight: "600",
  },

  // ==================== AÇÕES RÁPIDAS ====================
  acoesRapidas: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #e9ecef",
  },

  acoesTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2563EB",
    margin: "0 0 12px 0",
  },

  acoesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  acaoButton: {
    backgroundColor: "white",
    border: "1px solid #dee2e6",
    padding: "12px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
    cursor: "pointer",
    transition: "all 0.2s",
    textAlign: "center",
  },

  // ==================== DESPESAS ====================
  despesasContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  despesasHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  despesasTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2563EB",
    margin: 0,
  },

  emptyDespesas: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 24px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    opacity: 0.5,
  },

  emptyText: {
    fontSize: "16px",
    color: "#6c757d",
    margin: "0 0 24px 0",
  },

  // ==================== FORM ====================
  formContainer: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    border: "1px solid #e9ecef",
  },

  formHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "1px solid #e9ecef",
  },

  formTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2563EB",
    margin: 0,
  },

  formActions: {
    display: "flex",
    gap: "12px",
  },

  formContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  formLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#495057",
  },

  formInput: {
    padding: "10px 12px",
    border: "1px solid #ced4da",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    transition: "border-color 0.15s ease-in-out",
  },

  saldoInfo: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px",
    backgroundColor: "#e8f5e8",
    borderRadius: "8px",
    border: "1px solid #d4edda",
  },

  saldoLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#155724",
  },

  saldoValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#28a745",
  },

  formNote: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    fontSize: "13px",
    color: "#6c757d",
    lineHeight: 1.4,
  },
};

// ==================== CORES DO TEMA ====================
export const THEME_COLORS = {
  PRIMARY: "#2563EB",
  ACCENT: "#3B82F6",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",
  CHART_COLORS: ["#3B82F6", "#10B981", "#F5A623", "#D0021B", "#9013FE"],
};

// ==================== CSS ANIMATIONS ====================
export const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Injetar animação no documento
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = spinnerCSS;
  document.head.appendChild(style);
}
