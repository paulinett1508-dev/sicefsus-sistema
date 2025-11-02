// components/despesa/DespesaCard/despesaCardStyles.js
// ✅ ESTILOS PADRONIZADOS PARA CARDS DE DESPESAS

export const despesaCardStyles = {
  // ==================== SEÇÕES ====================
  despesasSection: {
    marginBottom: "24px",
  },

  despesasSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  despesasCardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },

  // ==================== CARD BASE ====================
  despesaCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "12px 16px",
    border: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    minHeight: "60px",
  },

  despesaCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },

  // ==================== HEADER DO CARD ====================
  despesaCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  despesaNumero: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c757d",
  },

  // ==================== STATUS BADGES ====================
  despesaStatusPlanejada: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#856404",
    backgroundColor: "#fff3cd",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  despesaStatusExecutada: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#155724",
    backgroundColor: "#d4edda",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  // ==================== CONTEÚDO ====================
  despesaDescricao: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#495057",
    lineHeight: "1.4",
  },

  despesaValor: {
    fontSize: "16px",
    color: "#154360",
  },

  // ==================== INFO EXTRA (SÓ EXECUTADAS) ====================
  despesaInfoExtra: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "2px",
    paddingTop: "6px",
    borderTop: "1px solid #e9ecef",
    lineHeight: "1.2",
  },
};
