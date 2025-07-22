// ContextPanel.jsx - Painel de Contexto da Emenda
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const ContextPanel = ({
  emenda = null,
  isVisible = false,
  onClose = () => {},
  onNavigateToLancamentos = () => {},
  onNavigateToRelatorios = () => {},
}) => {
  const [contextData, setContextData] = useState({
    lancamentos: [],
    resumoFinanceiro: {
      totalLancamentos: 0,
      valorExecutado: 0,
      saldoRestante: 0,
      percentualExecutado: 0,
    },
    atividades: [],
    loading: true,
  });

  const [activeTab, setActiveTab] = useState("resumo");

  // Carregar dados de contexto
  useEffect(() => {
    if (emenda?.id) {
      loadContextData();
    }
  }, [emenda]);

  const loadContextData = async () => {
    if (!emenda?.id) return;

    try {
      setContextData((prev) => ({ ...prev, loading: true }));

      // Carregar lançamentos da emenda
      const lancamentosQuery = query(
        collection(db, "lancamentos"),
        where("emendaId", "==", emenda.id),
        orderBy("data", "desc"),
        limit(5),
      );

      const lancamentosSnapshot = await getDocs(lancamentosQuery);
      const lancamentos = lancamentosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Calcular resumo financeiro
      const totalLancamentos = lancamentos.length;
      const valorExecutado = lancamentos.reduce(
        (sum, l) => sum + (l.valor || 0),
        0,
      );
      const saldoRestante = emenda.saldo || 0;
      const valorTotal = valorExecutado + saldoRestante;
      const percentualExecutado =
        valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

      // Atividades recentes
      const atividades = [
        {
          id: 1,
          tipo: "lancamento",
          descricao: `Último lançamento: ${lancamentos[0]?.descricao || "Nenhum"}`,
          data: lancamentos[0]?.data || emenda.updatedAt,
          valor: lancamentos[0]?.valor || 0,
        },
        {
          id: 2,
          tipo: "emenda",
          descricao: "Emenda atualizada",
          data: emenda.updatedAt,
          usuario: emenda.updatedBy,
        },
      ];

      setContextData({
        lancamentos,
        resumoFinanceiro: {
          totalLancamentos,
          valorExecutado,
          saldoRestante,
          percentualExecutado: Math.round(percentualExecutado * 100) / 100,
        },
        atividades,
        loading: false,
      });
    } catch (error) {
      console.error("Erro ao carregar dados de contexto:", error);
      setContextData((prev) => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (!isVisible) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h3 style={styles.title}>🔍 Contexto da Emenda {emenda?.numero}</h3>
            <p style={styles.subtitle}>{emenda?.parlamentar}</p>
          </div>

          <button onClick={onClose} style={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("resumo")}
            style={{
              ...styles.tab,
              ...(activeTab === "resumo" ? styles.activeTab : {}),
            }}
          >
            📊 Resumo
          </button>

          <button
            onClick={() => setActiveTab("lancamentos")}
            style={{
              ...styles.tab,
              ...(activeTab === "lancamentos" ? styles.activeTab : {}),
            }}
          >
            💰 Despesas
          </button>

          <button
            onClick={() => setActiveTab("atividades")}
            style={{
              ...styles.tab,
              ...(activeTab === "atividades" ? styles.activeTab : {}),
            }}
          >
            📝 Atividades
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {contextData.loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p>Carregando dados...</p>
            </div>
          ) : (
            <div style={styles.tabContent}>{renderTabContent()}</div>
          )}
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            onClick={() => onNavigateToDespesas(emenda)}
            style={styles.actionButton}
          >
            💰 Ver Despesas ({contextData.resumoFinanceiro.totalDespesas})
          </button>

          <button
            onClick={() => onNavigateToRelatorios(emenda)}
            style={styles.actionButtonSecondary}
          >
            📊 Relatórios
          </button>
        </div>
      </div>
    </div>
  );

  function renderTabContent() {
    switch (activeTab) {
      case "resumo":
        return renderResumoTab();
      case "despesas":
        return renderDespesasTab();
      case "atividades":
        return renderAtividadesTab();
      default:
        return renderResumoTab();
    }
  }

  function renderResumoTab() {
    const { resumoFinanceiro } = contextData;

    return (
      <div style={styles.resumoContent}>
        {/* KPIs */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>💰</div>
            <div style={styles.kpiContent}>
              <span style={styles.kpiValue}>
                {formatCurrency(resumoFinanceiro.valorExecutado)}
              </span>
              <span style={styles.kpiLabel}>Executado</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>🏦</div>
            <div style={styles.kpiContent}>
              <span style={styles.kpiValue}>
                {formatCurrency(resumoFinanceiro.saldoRestante)}
              </span>
              <span style={styles.kpiLabel}>Saldo</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📈</div>
            <div style={styles.kpiContent}>
              <span style={styles.kpiValue}>
                {resumoFinanceiro.percentualExecutado.toFixed(1)}%
              </span>
              <span style={styles.kpiLabel}>Execução</span>
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiIcon}>📋</div>
            <div style={styles.kpiContent}>
              <span style={styles.kpiValue}>
                {resumoFinanceiro.totalLancamentos}
              </span>
              <span style={styles.kpiLabel}>Despesas</span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Execução Orçamentária</span>
            <span style={styles.progressPercent}>
              {resumoFinanceiro.percentualExecutado.toFixed(1)}%
            </span>
          </div>

          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${Math.min(100, resumoFinanceiro.percentualExecutado)}%`,
              }}
            />
          </div>
        </div>

        {/* Informações da Emenda */}
        <div style={styles.emendaInfo}>
          <h4 style={styles.sectionTitle}>📋 Informações da Emenda</h4>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Tipo:</span>
              <span style={styles.infoValue}>{emenda?.tipo}</span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Município:</span>
              <span style={styles.infoValue}>
                {emenda?.municipio}/{emenda?.uf}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Validade:</span>
              <span style={styles.infoValue}>
                {formatDate(emenda?.validade)}
              </span>
            </div>

            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>GND:</span>
              <span style={styles.infoValue}>{emenda?.gnd}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDespesasTab() {
    const { despesas } = contextData;

    return (
      <div style={styles.despesasContent}>
        <div style={styles.sectionHeader}>
          <h4 style={styles.sectionTitle}>💰 Últimas 5 Despesas</h4>
          <button
            onClick={() => onNavigateToDespesas(emenda)}
            style={styles.seeAllButton}
          >
            Ver Todos →
          </button>
        </div>

        {despesas.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>📝</span>
            <p style={styles.emptyText}>Nenhuma despesa encontrada</p>
            <button
              onClick={() => onNavigateToDespesas(emenda)}
              style={styles.createButton}
            >
              ➕ Criar Primeira Despesa
            </button>
          </div>
        ) : (
          <div style={styles.lancamentosList}>
            {lancamentos.map((lancamento) => (
              <div key={lancamento.id} style={styles.lancamentoItem}>
                <div style={styles.lancamentoHeader}>
                  <span style={styles.lancamentoNumero}>
                    {lancamento.numero}
                  </span>
                  <span style={styles.lancamentoValor}>
                    {formatCurrency(lancamento.valor)}
                  </span>
                </div>

                <p style={styles.lancamentoDescricao}>{lancamento.descricao}</p>

                <div style={styles.lancamentoFooter}>
                  <span style={styles.lancamentoData}>
                    📅 {formatDate(lancamento.data)}
                  </span>
                  <span style={styles.lancamentoFornecedor}>
                    🏢 {lancamento.notaFiscalFornecedor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function renderAtividadesTab() {
    const { atividades } = contextData;

    return (
      <div style={styles.atividadesContent}>
        <h4 style={styles.sectionTitle}>📝 Atividades Recentes</h4>

        <div style={styles.atividadesList}>
          {atividades.map((atividade) => (
            <div key={atividade.id} style={styles.atividadeItem}>
              <div style={styles.atividadeIcon}>
                {atividade.tipo === "lancamento" ? "💰" : "📋"}
              </div>

              <div style={styles.atividadeContent}>
                <p style={styles.atividadeDescricao}>{atividade.descricao}</p>

                <div style={styles.atividadeFooter}>
                  <span style={styles.atividadeData}>
                    📅 {formatDate(atividade.data)}
                  </span>

                  {atividade.valor && (
                    <span style={styles.atividadeValor}>
                      💰 {formatCurrency(atividade.valor)}
                    </span>
                  )}

                  {atividade.usuario && (
                    <span style={styles.atividadeUsuario}>
                      👤 {atividade.usuario}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  panel: {
    backgroundColor: "white",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 4px 0",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6c757d",
    margin: 0,
  },

  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#6c757d",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
  },

  tabs: {
    display: "flex",
    borderBottom: "1px solid #e9ecef",
    backgroundColor: "#f8f9fa",
  },

  tab: {
    flex: 1,
    padding: "12px 16px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    color: "#6c757d",
  },

  activeTab: {
    backgroundColor: "white",
    color: "#007bff",
    borderBottom: "2px solid #007bff",
  },

  content: {
    flex: 1,
    overflow: "auto",
    padding: "24px",
  },

  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    gap: "16px",
  },

  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e9ecef",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  tabContent: {
    minHeight: "300px",
  },

  resumoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
  },

  kpiCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  kpiIcon: {
    fontSize: "24px",
  },

  kpiContent: {
    display: "flex",
    flexDirection: "column",
  },

  kpiValue: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },

  kpiLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },

  progressSection: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  progressLabel: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#495057",
  },

  progressPercent: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#007bff",
  },

  progressBar: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e9ecef",
    borderRadius: "4px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },

  emendaInfo: {
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
  },

  sectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#2c3e50",
    margin: "0 0 16px 0",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },

  infoItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 0",
    borderBottom: "1px solid #e9ecef",
  },

  infoLabel: {
    fontSize: "14px",
    color: "#6c757d",
    fontWeight: "500",
  },

  infoValue: {
    fontSize: "14px",
    color: "#2c3e50",
    fontWeight: "500",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  seeAllButton: {
    background: "none",
    border: "1px solid #007bff",
    color: "#007bff",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "12px",
    cursor: "pointer",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
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
    margin: "0 0 20px 0",
  },

  createButton: {
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "14px",
    cursor: "pointer",
  },

  lancamentosContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  lancamentosList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  lancamentoItem: {
    padding: "16px",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
  },

  lancamentoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },

  lancamentoNumero: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#007bff",
  },

  lancamentoValor: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#28a745",
  },

  lancamentoDescricao: {
    fontSize: "14px",
    color: "#495057",
    margin: "0 0 8px 0",
  },

  lancamentoFooter: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#6c757d",
  },

  lancamentoData: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  lancamentoFornecedor: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  atividadesContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  atividadesList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  atividadeItem: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    border: "1px solid #e9ecef",
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
  },

  atividadeIcon: {
    fontSize: "20px",
    marginTop: "2px",
  },

  atividadeContent: {
    flex: 1,
  },

  atividadeDescricao: {
    fontSize: "14px",
    color: "#2c3e50",
    margin: "0 0 8px 0",
    fontWeight: "500",
  },

  atividadeFooter: {
    display: "flex",
    gap: "16px",
    fontSize: "12px",
    color: "#6c757d",
  },

  atividadeData: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  atividadeValor: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#28a745",
    fontWeight: "500",
  },

  atividadeUsuario: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  actions: {
    display: "flex",
    gap: "12px",
    padding: "20px 24px",
    backgroundColor: "#f8f9fa",
    borderTop: "1px solid #e9ecef",
  },

  actionButton: {
    flex: 1,
    padding: "12px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },

  actionButtonSecondary: {
    padding: "12px 20px",
    backgroundColor: "white",
    color: "#6c757d",
    border: "1px solid #6c757d",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
};

export default ContextPanel;
