// src/components/Relatorios.jsx
import React, { useState } from "react";
import { useRelatoriosData } from "../hooks/useRelatoriosData";
import { useToast } from "./Toast";
import RelatoriosCards from "./relatorios/RelatoriosCards";
import RelatoriosFiltros from "./relatorios/RelatoriosFiltros";
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
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: "#10B981" }}>check_circle</span>
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

  // Toast para notificações
  const toast = useToast();

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

      await gerador.gerar(filtros);
      gerador.salvar();

      // Verificar se houve warnings durante a geração
      const warnings = gerador.getWarnings?.() || [];
      if (warnings.length > 0) {
        warnings.forEach(w => toast.warning(w));
      }

      // Mostrar modal de sucesso
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

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
    <div className="relatorios-container">
      {/* Header */}
      <div className="relatorios-header">
        <h1 className="relatorios-title">
          <span className="material-symbols-outlined" style={{ fontSize: 28, marginRight: 8, verticalAlign: "middle" }}>description</span>
          Central de Relatórios
        </h1>
        <p className="relatorios-subtitle">
          Gere relatórios profissionais em PDF com os dados do sistema
        </p>
      </div>

      {/* Conteúdo Principal */}
      {!selectedReport ? (
        <RelatoriosCards onSelectReport={handleSelecionarRelatorio} />
      ) : (
        <div className="relatorios-config">
          {/* Header da Configuração */}
          <div className="relatorios-config-header">
            <button className="relatorios-back-btn" onClick={handleVoltar}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
              Voltar
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
            emendas={emendas}
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
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>picture_as_pdf</span>
                  Gerar PDF
                </>
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
  );
}
