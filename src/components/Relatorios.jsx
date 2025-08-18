
// src/components/Relatorios.jsx - IMPLEMENTAÇÃO DO SYSTEMHEADER
import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../context/UserContext";
import SystemHeader from "./shared/SystemHeader";
import { useRelatoriosData } from "../hooks/useRelatoriosData";
import RelatoriosCards from "./relatorios/RelatoriosCards";
import RelatoriosFiltros from "./relatorios/RelatoriosFiltros";
import { TIPOS_RELATORIOS, FILTROS_INICIAIS } from "../utils/relatoriosConstants";
import BaseRelatorio from "./relatorios/geradores/BaseRelatorio";
import RelatorioConsolidado from "./relatorios/geradores/RelatorioConsolidado";
import RelatorioAnalitico from "./relatorios/geradores/RelatorioAnalitico";
import RelatorioDespesas from "./relatorios/geradores/RelatorioDespesas";
import RelatorioExecucao from "./relatorios/geradores/RelatorioExecucao";
import RelatorioPrestacao from "./relatorios/geradores/RelatorioPrestacao";

const Relatorios = () => {
  const { currentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_INICIAIS);
  const [relatoriosGerados] = useState([]);

  const {
    emendas,
    despesas,
    parlamentares,
    ufs,
    loading: dataLoading,
    error,
  } = useRelatoriosData();

  // Aplicar filtros baseados nos dados disponíveis
  const aplicarFiltros = (filtrosAtivos) => {
    let emendasFiltradas = [...emendas];
    let despesasFiltradas = [...despesas];

    // Filtro por período
    if (filtrosAtivos.dataInicio) {
      const dataInicio = new Date(filtrosAtivos.dataInicio);
      emendasFiltradas = emendasFiltradas.filter((emenda) => {
        const dataEmenda = new Date(emenda.dataInclusao);
        return dataEmenda >= dataInicio;
      });
      despesasFiltradas = despesasFiltradas.filter((despesa) => {
        const dataDespesa = new Date(despesa.dataLancamento);
        return dataDespesa >= dataInicio;
      });
    }

    if (filtrosAtivos.dataFim) {
      const dataFim = new Date(filtrosAtivos.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      emendasFiltradas = emendasFiltradas.filter((emenda) => {
        const dataEmenda = new Date(emenda.dataInclusao);
        return dataEmenda <= dataFim;
      });
      despesasFiltradas = despesasFiltradas.filter((despesa) => {
        const dataDespesa = new Date(despesa.dataLancamento);
        return dataDespesa <= dataFim;
      });
    }

    // Filtro por parlamentar
    if (filtrosAtivos.parlamentar) {
      emendasFiltradas = emendasFiltradas.filter(
        (emenda) => emenda.autor === filtrosAtivos.parlamentar
      );
    }

    // Filtro por UF
    if (filtrosAtivos.uf) {
      emendasFiltradas = emendasFiltradas.filter(
        (emenda) => emenda.uf === filtrosAtivos.uf
      );
      despesasFiltradas = despesasFiltradas.filter(
        (despesa) => despesa.uf === filtrosAtivos.uf
      );
    }

    // Filtro por município
    if (filtrosAtivos.municipio) {
      emendasFiltradas = emendasFiltradas.filter(
        (emenda) => emenda.municipio === filtrosAtivos.municipio
      );
      despesasFiltradas = despesasFiltradas.filter(
        (despesa) => despesa.municipio === filtrosAtivos.municipio
      );
    }

    return { emendasFiltradas, despesasFiltradas };
  };

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

      let relatorio;
      switch (selectedReport.id) {
        case "consolidado":
          relatorio = new RelatorioConsolidado();
          break;
        case "analitico":
          relatorio = new RelatorioAnalitico();
          break;
        case "despesas":
          relatorio = new RelatorioDespesas();
          break;
        case "execucao":
          relatorio = new RelatorioExecucao();
          break;
        case "prestacao":
          relatorio = new RelatorioPrestacao();
          break;
        default:
          relatorio = new BaseRelatorio();
      }

      await relatorio.gerar({
        emendas: emendasFiltradas,
        despesas: despesasFiltradas,
        filtros: filtros,
        usuario: currentUser,
      });

      console.log(`Relatório ${selectedReport.nome} gerado com sucesso`);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setGenerating(false);
    }
  };

  const { emendasFiltradas, despesasFiltradas } = aplicarFiltros(filtros);

  return (
    <div style={{ padding: "20px" }}>
      {/* ✅ SYSTEMHEADER IMPLEMENTADO */}
      <SystemHeader
        usuario={currentUser}
        loading={loading || dataLoading}
        modulo="Relatórios"
        dadosTexto="relatórios disponíveis"
        dadosContador={relatoriosGerados.length}
      >
        {/* Banner específico de Relatórios */}
        {currentUser?.tipo === "operador" && (
          <div style={styles.relatoriosBanner}>
            <span style={styles.bannerIcon}>📊</span>
            <div style={styles.bannerContent}>
              <span style={styles.bannerTexto}>
                <strong>Acesso aos Relatórios:</strong> Você pode gerar relatórios apenas 
                para emendas e despesas do seu município.
              </span>
            </div>
          </div>
        )}
      </SystemHeader>

      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          Erro ao carregar dados: {error}
        </div>
      )}

      {!selectedReport ? (
        <RelatoriosCards
          tiposRelatorios={TIPOS_RELATORIOS}
          onSelecionarRelatorio={handleSelecionarRelatorio}
          emendas={emendas}
          despesas={despesas}
          usuario={currentUser}
        />
      ) : (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleVoltar}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              ← Voltar
            </button>
            <h2 style={{ display: "inline", color: "#333" }}>
              {selectedReport.nome}
            </h2>
          </div>

          <RelatoriosFiltros
            selectedReport={selectedReport}
            filtros={filtros}
            onFiltroChange={handleFiltroChange}
            onLimparFiltros={handleLimparFiltros}
            parlamentares={parlamentares}
            ufs={ufs}
            previewData={{
              emendas: emendasFiltradas.length,
              despesas: despesasFiltradas.length,
            }}
          />

          <div style={{ marginTop: "20px" }}>
            <button
              onClick={handleGerarRelatorio}
              disabled={generating || dataLoading}
              style={{
                padding: "12px 24px",
                backgroundColor: generating ? "#ccc" : "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: generating ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              {generating ? "Gerando..." : "📄 Gerar Relatório"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  relatoriosBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#e8f5e8",
    border: "2px solid #4caf50",
    borderRadius: 12,
    marginBottom: "20px",
    fontSize: 14,
    color: "#2e7d32",
    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.15)",
  },
  bannerIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  bannerContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  bannerTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },
};

export default Relatorios;
