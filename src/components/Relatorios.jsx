// src/components/Relatorios.jsx
import React, { useState, useMemo } from "react";
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
          <span className="material-symbols-outlined" style={{ fontSize: 64, color: "var(--success)" }}>check_circle</span>
        </div>
        <h2 className="relatorios-modal-title">
          Relatório gerado com sucesso!
        </h2>
        <p className="relatorios-modal-message">
          O download do PDF foi iniciado automaticamente.
        </p>
        <button type="button" className="relatorios-modal-button" onClick={onClose}>
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
  // Rastreia campos que foram preenchidos automaticamente pela inteligência de filtros
  const [autoFilled, setAutoFilled] = useState(new Set());

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
  // Lazy: só carrega dados do Firestore quando o usuário seleciona um relatório
  } = useRelatoriosData(usuario, selectedReport !== null);

  // ── Inteligência de Filtros ─────────────────────────────────────────────
  // Calcula opções disponíveis para cada filtro com base nos demais filtros ativos
  const smartOptions = useMemo(() => {
    let availableEmendas = emendas.filter(
      (e) => (e.status || "").toLowerCase() !== "inativa",
    );

    // Filtrar emendas por parlamentar (se não foi auto-preenchido)
    if (filtros.parlamentar && !autoFilled.has("parlamentar")) {
      availableEmendas = availableEmendas.filter((e) =>
        (e.autor || e.parlamentar)
          ?.toLowerCase()
          .includes(filtros.parlamentar.toLowerCase()),
      );
    }

    // Filtrar emendas por município (se não foi auto-preenchido)
    if (filtros.municipio && !autoFilled.has("municipio")) {
      availableEmendas = availableEmendas.filter((e) =>
        e.municipio?.toLowerCase().includes(filtros.municipio.toLowerCase()),
      );
    }

    // Filtrar emendas por fornecedor: só mostra emendas que têm despesas daquele fornecedor
    if (filtros.fornecedor) {
      const fornLower = filtros.fornecedor.toLowerCase();
      const emendaIdsComFornecedor = new Set(
        despesas
          .filter(
            (d) =>
              (d.fornecedor || "").toLowerCase().includes(fornLower) ||
              (d.cnpjFornecedor || "").toLowerCase().includes(fornLower),
          )
          .map((d) => d.emendaId),
      );
      availableEmendas = availableEmendas.filter((e) =>
        emendaIdsComFornecedor.has(e.id),
      );
    }

    // Derivar opções disponíveis a partir das emendas filtradas
    const emendaIds = new Set(availableEmendas.map((e) => e.id));
    const availableDespesas = despesas.filter((d) => emendaIds.has(d.emendaId));

    return {
      emendas: availableEmendas,
      parlamentares: [
        ...new Set(
          availableEmendas
            .map((e) => e.autor || e.parlamentar)
            .filter(Boolean),
        ),
      ].sort(),
      municipios: [
        ...new Set(availableEmendas.map((e) => e.municipio).filter(Boolean)),
      ].sort(),
      fornecedores: [
        ...new Set(availableDespesas.map((d) => d.fornecedor).filter(Boolean)),
      ].sort(),
    };
  }, [emendas, despesas, filtros.parlamentar, filtros.municipio, filtros.fornecedor, autoFilled]);

  // Handler com inteligência de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;

    // ── Emenda selecionada: auto-preenche parlamentar, município e desativa período
    if (name === "emenda" && value) {
      const emenda = emendas.find((em) => em.id === value);
      if (emenda) {
        setFiltros((prev) => ({
          ...prev,
          emenda: value,
          parlamentar: emenda.autor || emenda.parlamentar || "",
          municipio: emenda.municipio || "",
          dataInicio: "",
          dataFim: "",
        }));
        setAutoFilled(new Set(["parlamentar", "municipio", "periodo"]));
        return;
      }
    }

    // ── Emenda desmarcada: limpa campos auto-preenchidos
    if (name === "emenda" && !value) {
      setFiltros((prev) => {
        const next = { ...prev, emenda: "" };
        if (autoFilled.has("parlamentar")) next.parlamentar = "";
        if (autoFilled.has("municipio")) next.municipio = "";
        return next;
      });
      setAutoFilled(new Set());
      return;
    }

    // ── Fornecedor selecionado: se todas as emendas filtradas têm o mesmo
    //    parlamentar/município, auto-preenche
    if (name === "fornecedor" && value) {
      const fornLower = value.toLowerCase();
      const emendaIdsComFornecedor = new Set(
        despesas
          .filter(
            (d) =>
              (d.fornecedor || "").toLowerCase().includes(fornLower) ||
              (d.cnpjFornecedor || "").toLowerCase().includes(fornLower),
          )
          .map((d) => d.emendaId),
      );
      const emendasDoFornecedor = emendas.filter((e) =>
        emendaIdsComFornecedor.has(e.id),
      );

      const newAutoFilled = new Set();
      const next = { ...filtros, fornecedor: value };

      // Se todas as emendas do fornecedor são do mesmo parlamentar, auto-preenche
      const parlUnicos = [
        ...new Set(
          emendasDoFornecedor
            .map((e) => e.autor || e.parlamentar)
            .filter(Boolean),
        ),
      ];
      if (parlUnicos.length === 1 && !filtros.parlamentar) {
        next.parlamentar = parlUnicos[0];
        newAutoFilled.add("parlamentar");
      }

      // Se todas as emendas do fornecedor são do mesmo município, auto-preenche
      const munUnicos = [
        ...new Set(
          emendasDoFornecedor.map((e) => e.municipio).filter(Boolean),
        ),
      ];
      if (munUnicos.length === 1 && !filtros.municipio) {
        next.municipio = munUnicos[0];
        newAutoFilled.add("municipio");
      }

      // Se só tem uma emenda, auto-seleciona
      if (emendasDoFornecedor.length === 1 && !filtros.emenda) {
        next.emenda = emendasDoFornecedor[0].id;
        newAutoFilled.add("emenda");
      }

      setFiltros(next);
      if (newAutoFilled.size > 0) setAutoFilled(newAutoFilled);
      return;
    }

    // ── Fornecedor desmarcado: limpa auto-preenchidos por ele
    if (name === "fornecedor" && !value) {
      setFiltros((prev) => {
        const next = { ...prev, fornecedor: "" };
        if (autoFilled.has("parlamentar")) next.parlamentar = "";
        if (autoFilled.has("municipio")) next.municipio = "";
        if (autoFilled.has("emenda")) next.emenda = "";
        return next;
      });
      setAutoFilled(new Set());
      return;
    }

    // ── Alteração genérica: se o campo era auto-preenchido, remove o tracking
    setFiltros((prev) => ({ ...prev, [name]: value }));
    if (autoFilled.has(name)) {
      setAutoFilled((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
  };

  const handleLimparFiltros = () => {
    setFiltros(FILTROS_INICIAIS);
    setAutoFilled(new Set());
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
      const { emendasFiltradas, despesasFiltradas } = aplicarFiltros(filtros, {
        usarMesAno: selectedReport.campos.includes("mes"),
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
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  // Calcular preview dos dados (memoizado para evitar recálculo a cada render)
  const previewData = useMemo(() => {
    const usarMesAno = selectedReport?.campos?.includes("mes") ?? false;
    const { emendasFiltradas, despesasFiltradas } = aplicarFiltros(filtros, { usarMesAno });
    return {
      totalEmendas: emendasFiltradas.length,
      totalDespesas: despesasFiltradas.length,
      valorTotal: emendasFiltradas.reduce(
        (sum, e) => sum + (e.valorTotal || 0),
        0,
      ),
    };
  // aplicarFiltros fecha sobre emendas e despesas — listá-los aqui é equivalente
  // a listar aplicarFiltros, sem precisar de useCallback no hook
  }, [filtros, emendas, despesas, selectedReport]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="relatorios-error">
        <span className="material-symbols-outlined" style={{ fontSize: 40 }}>error</span>
        <p>Erro ao carregar dados: {error}</p>
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
            <button type="button" className="relatorios-back-btn" onClick={handleVoltar}>
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
            parlamentares={smartOptions.parlamentares}
            emendas={smartOptions.emendas}
            totalEmendas={emendas.filter(e => (e.status || "").toLowerCase() !== "inativa").length}
            municipios={smartOptions.municipios}
            fornecedores={smartOptions.fornecedores}
            autoFilled={autoFilled}
            previewData={previewData}
          />

          {/* Botões de Ação */}
          <div className="relatorios-actions">
            <button
              type="button"
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
