// src/components/Relatorios.jsx
import React, { useState, useEffect, useMemo } from "react";
import { usePageTitle } from "../hooks/usePageTitle";
import { useRelatoriosData } from "../hooks/useRelatoriosData";
import RelatoriosCards from "./relatorios/RelatoriosCards";
import RelatoriosFiltros from "./relatorios/RelatoriosFiltros";
import GlobalHeader from "./GlobalHeader";
import { RelatorioExecucao } from "./relatorios/geradores/RelatorioExecucao";
import { RelatorioPrestacao } from "./relatorios/geradores/RelatorioPrestacao";
import { RelatorioAnalitico } from "./relatorios/geradores/RelatorioAnalitico";
import { RelatorioDespesas } from "./relatorios/geradores/RelatorioDespesas";
import { RelatorioConsolidado } from "./relatorios/geradores/RelatorioConsolidado";
import { FILTROS_INICIAIS } from "../utils/relatoriosConstants";
import "../styles/relatorios.css";

// Modal de Sucesso
function ModalSucesso({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="relatorios-modal-overlay" onClick={onClose}>
      <div
        className="relatorios-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relatorios-modal-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="#27AE60" strokeWidth="2" />
            <path
              d="M8 12L11 15L16 9"
              stroke="#27AE60"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="relatorios-modal-title">
          Relatório gerado com sucesso!
        </h2>
        <p className="relatorios-modal-message">
          O download do PDF foi iniciado automaticamente.
        </p>
        <button className="relatorios-modal-button" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function Relatorios({ usuario }) {
  const [selectedReport, setSelectedReport] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [generating, setGenerating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Hook customizado para carregar dados
  const {
    emendas,
    despesas,
    loading,
    error,
    aplicarFiltros,
    parlamentares,
    ufs,
  } = useRelatoriosData(usuario);

  // Calcular preview dos dados
  const getPreviewData = () => {
    const { emendasFiltradas, despesasFiltradas } = aplicarFiltros(filtros);
    return {
      totalEmendas: emendasFiltradas.length,
      totalDespesas: despesasFiltradas.length,
      valorTotal: emendasFiltradas.reduce(
        (sum, e) => sum + (e.valorTotal || 0),
        0,
      ),
    };
  };

  // Use useMemo to memoize the filteredData based on filtros
  const filteredData = useMemo(() => {
    return aplicarFiltros(filtros);
  }, [filtros, aplicarFiltros]);

  // Handlers
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleLimparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
  };

  const handleSelecionarRelatorio = (tipo) => {
    setSelectedReport(tipo);
  };

  const handleVoltar = () => {
    setSelectedReport(null);
    setFiltros(FILTROS_INICIAIS);
  };

  // Gerar relatório baseado no tipo selecionado
  const handleGerarRelatorio = async () => {
    if (!selectedReport) return;

    setGenerating(true);

    try {
      const { emendasFiltradas, despesasFiltradas } = aplicarFiltros(filtros);

      console.log("Dados filtrados:", {
        emendas: emendasFiltradas.length,
        despesas: despesasFiltradas.length,
      });

      let gerador;
      switch (selectedReport.id) {
        case "execucao-orcamentaria":
          gerador = new RelatorioExecucao(
            selectedReport,
            emendasFiltradas,
            despesasFiltradas,
            usuario,
          );
          break;
        case "prestacao-contas":
          gerador = new RelatorioPrestacao(
            selectedReport,
            emendasFiltradas,
            despesasFiltradas,
            usuario,
          );
          break;
        case "analitico-parlamentar":
          gerador = new RelatorioAnalitico(
            selectedReport,
            emendasFiltradas,
            despesasFiltradas,
            usuario,
          );
          break;
        case "despesas-detalhado":
          gerador = new RelatorioDespesas(
            selectedReport,
            emendasFiltradas,
            despesasFiltradas,
            usuario,
          );
          break;
        case "consolidado-mensal":
          gerador = new RelatorioConsolidado(
            selectedReport,
            emendasFiltradas,
            despesasFiltradas,
            usuario,
          );
          break;
        default:
          throw new Error("Tipo de relatório não reconhecido");
      }

      console.log("Gerador criado:", gerador);

      await gerador.gerar(filtros);
      gerador.salvar();

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro detalhado ao gerar relatório:", error);
      console.error("Stack trace:", error.stack);
      alert(
        `Erro ao gerar relatório: ${error.message}\n\nVerifique o console para mais detalhes.`,
      );
    } finally {
      setGenerating(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relatorios-loading">
        <div className="relatorios-spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relatorios-loading">
        <p style={{ color: "var(--error)" }}>Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <GlobalHeader 
        usuario={usuario}
        loading={loading}
        dataCount={filteredData.emendas?.length || 0}
        dataLabel="emendas"
      />
      <div style={styles.content}>
        {/* Conteúdo Principal */}
        {!selectedReport ? (
          <RelatoriosCards onSelectReport={handleSelecionarRelatorio} />
        ) : (
          <div className="relatorios-config">
            {/* Header da Configuração */}
            <div className="relatorios-config-header">
              <button className="relatorios-back-btn" onClick={handleVoltar}>
                ← Voltar
              </button>
              <h2 className="relatorios-config-title">{selectedReport.titulo}</h2>
            </div>

            {/* Filtros */}
            <RelatoriosFiltros
              selectedReport={selectedReport}
              filtros={filtros}
              onFiltroChange={handleFiltroChange}
              onLimparFiltros={handleLimparFiltros}
              parlamentares={parlamentares}
              ufs={ufs}
              previewData={getPreviewData()}
            />

            {/* Botões de Ação */}
            <div className="relatorios-actions">
              <button
                className="relatorios-generate-btn"
                onClick={handleGerarRelatorio}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <span className="relatorios-btn-spinner"></span>
                    Gerando...
                  </>
                ) : (
                  <>📄 Gerar PDF</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Modal de Sucesso */}
        <ModalSucesso
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        />
      </div>
    </div>
  );
}

// Define styles object, assuming it's used elsewhere or intended to be used.
// If 'styles' is defined in another file and imported, this part might be redundant.
// For completeness, let's assume a basic definition if not provided.
const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    overflowX: "hidden",
  },
  content: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
};

// CSS Animation
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.head.querySelector('style[data-animation="spin"]')) {
    style.setAttribute("data-animation", "spin");
    document.head.appendChild(style);
  }
}