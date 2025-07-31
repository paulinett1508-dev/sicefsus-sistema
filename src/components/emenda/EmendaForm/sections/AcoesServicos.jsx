// src/components/emenda/EmendaForm/sections/AcoesServicos.jsx
// ✅ FIX CIRÚRGICO: APENAS formatação monetária + ícone ℹ️
// 100% ESTRUTURA ORIGINAL PRESERVADA

import React, { useState } from "react";
import { formatarMoedaInput } from "../../../../utils/formatters";
import { useToast } from "../../../Toast";

const AcoesServicos = ({
  formData = {},
  onChange,
  disabled = false,
  fieldErrors = {},
}) => {
  const { success, error } = useToast();

  // ✅ FUNÇÃO LOCAL ORIGINAL
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ ESTADOS LOCAIS ORIGINAIS
  const [tipoAcaoServico, setTipoAcaoServico] = useState("Metas Quantitativas");
  const [novaAcaoServico, setNovaAcaoServico] = useState({
    tipo: "Metas Quantitativas",
    descricao: "",
    complemento: "",
    valor: "",
  });

  // ✅ TIPOS ORIGINAIS
  const tiposAcao = [
    { value: "Metas Quantitativas", label: "Metas Quantitativas" },
    { value: "Metas", label: "Metas" },
  ];

  // ✅ HANDLER ORIGINAL
  const handleTipoChange = (e) => {
    const novoTipo = e.target.value;
    setTipoAcaoServico(novoTipo);
    setNovaAcaoServico((prev) => ({
      ...prev,
      tipo: novoTipo,
      valor: novoTipo === "Metas" ? "" : prev.valor,
    }));
  };

  // ✅ FIX: APENAS formatação monetária adicionada
  const handleNovaAcaoChange = (field, value) => {
    let valorFormatado = value;

    // ✅ ÚNICA MUDANÇA: Formatação para valor monetário
    if (field === "valor") {
      valorFormatado = formatarMoedaInput(value);
    }

    setNovaAcaoServico((prev) => ({
      ...prev,
      [field]: valorFormatado,
    }));
  };

  // ✅ FUNÇÃO ORIGINAL PRESERVADA
  const adicionarAcaoServico = () => {
    // Validações
    if (!novaAcaoServico.descricao.trim()) {
      error("Preencha a descrição/estratégia");
      return;
    }
    if (!novaAcaoServico.complemento.trim()) {
      error("Preencha o detalhamento");
      return;
    }
    if (
      tipoAcaoServico === "Metas Quantitativas" &&
      (!novaAcaoServico.valor || novaAcaoServico.valor === "0,00")
    ) {
      error("Preencha o valor para Metas Quantitativas");
      return;
    }

    const novaAcao = {
      tipo: tipoAcaoServico,
      estrategia: novaAcaoServico.descricao,
      descricao: novaAcaoServico.complemento,
      valor:
        tipoAcaoServico === "Metas Quantitativas" ? novaAcaoServico.valor : "",
      id: Date.now(),
    };

    const acoesAtualizadas = [...(formData.acoesServicos || []), novaAcao];

    onChange?.({
      target: {
        name: "acoesServicos",
        value: acoesAtualizadas,
      },
    });

    // Limpar formulário
    setNovaAcaoServico({
      tipo: tipoAcaoServico,
      descricao: "",
      complemento: "",
      valor: "",
    });

    success(`${tipoAcaoServico} adicionada com sucesso!`);
  };

  // ✅ FUNÇÃO ORIGINAL PRESERVADA
  const removerAcaoServico = (index) => {
    if (window.confirm("Tem certeza que deseja remover esta ação/serviço?")) {
      const acoesAtualizadas = (formData.acoesServicos || []).filter(
        (_, i) => i !== index,
      );

      onChange?.({
        target: {
          name: "acoesServicos",
          value: acoesAtualizadas,
        },
      });

      success("Ação/Serviço removida!");
    }
  };

  // ✅ FUNÇÃO ORIGINAL PRESERVADA
  const calcularTotalMetasQuantitativas = () => {
    return (formData.acoesServicos || [])
      .filter((a) => a.tipo === "Metas Quantitativas" && a.valor)
      .reduce((total, a) => {
        const valor =
          typeof a.valor === "string" && a.valor.includes(",")
            ? parseFloat(a.valor.replace(/[^\d,]/g, "").replace(",", "."))
            : parseFloat(a.valor);
        return total + (valor || 0);
      }, 0);
  };

  // ✅ FUNÇÃO ORIGINAL PRESERVADA
  const podeAdicionarAcao = () => {
    const temDescricao = novaAcaoServico.descricao.trim();
    const temComplemento = novaAcaoServico.complemento.trim();
    const temValor =
      tipoAcaoServico === "Metas" ||
      (novaAcaoServico.valor && novaAcaoServico.valor !== "0,00");

    return temDescricao && temComplemento && temValor;
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📊</span>
        Ações e Serviços
      </legend>

      {!disabled && (
        <>
          {/* Formulário para adicionar nova ação/serviço - ORIGINAL */}
          <div style={styles.novaAcaoContainer}>
            <div style={styles.tipoSelector}>
              <label style={styles.label}>Tipo de Ação/Serviço</label>
              <select
                value={tipoAcaoServico}
                onChange={handleTipoChange}
                style={styles.select}
              >
                {tiposAcao.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={
                window.innerWidth <= 768
                  ? styles.smallScreenGrid
                  : styles.acoesFormGrid
              }
            >
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {tipoAcaoServico === "Metas Quantitativas"
                    ? "Estratégia"
                    : "Título da Meta"}
                </label>
                <input
                  type="text"
                  value={novaAcaoServico.descricao}
                  onChange={(e) =>
                    handleNovaAcaoChange("descricao", e.target.value)
                  }
                  style={styles.input}
                  placeholder={
                    tipoAcaoServico === "Metas Quantitativas"
                      ? "Ex: Estratégia de Rastreamento e Controle de Condições Crônicas"
                      : "Ex: Oferta de medicamentos da Atenção Básica"
                  }
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {tipoAcaoServico === "Metas Quantitativas"
                    ? "Descrição Detalhada"
                    : "Detalhamento"}
                </label>
                <textarea
                  value={novaAcaoServico.complemento}
                  onChange={(e) =>
                    handleNovaAcaoChange("complemento", e.target.value)
                  }
                  style={{ ...styles.textarea, minHeight: "80px" }}
                  placeholder={
                    tipoAcaoServico === "Metas Quantitativas"
                      ? "Aquisição de Insumos e Materiais de Uso Contínuo para Acompanhamento de Pessoas com Condições Crônicas"
                      : "Manutenção da oferta de medicamentos, insumos e materiais de forma regular para os estabelecimentos de saúde"
                  }
                />
              </div>

              {tipoAcaoServico === "Metas Quantitativas" && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Valor (R$)
                    {/* ✅ ÚNICO ACRÉSCIMO: ícone ℹ️ */}
                    <span
                      style={styles.infoIcon}
                      title="Digite apenas números. Formatação aplicada automaticamente"
                    >
                      ℹ️
                    </span>
                  </label>
                  <input
                    type="text"
                    value={novaAcaoServico.valor}
                    onChange={(e) =>
                      handleNovaAcaoChange("valor", e.target.value)
                    }
                    style={styles.input}
                    placeholder="200.000,00"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={adicionarAcaoServico}
                style={{
                  ...styles.addButton,
                  ...(!podeAdicionarAcao() && styles.addButtonDisabled),
                }}
                disabled={!podeAdicionarAcao()}
              >
                ➕ Adicionar {tipoAcaoServico}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Lista de ações/serviços adicionadas - ORIGINAL */}
      <div style={styles.acoesListContainer}>
        <h4 style={styles.listTitle}>
          Ações/Serviços Cadastradas ({(formData.acoesServicos || []).length})
        </h4>

        {!formData.acoesServicos || formData.acoesServicos.length === 0 ? (
          <div style={styles.emptyState}>
            Nenhuma ação/serviço cadastrada ainda.
            <br />
            <small>
              Use o formulário acima para adicionar metas quantitativas ou
              metas.
            </small>
          </div>
        ) : (
          <div style={styles.acoesList}>
            {formData.acoesServicos.map((acao, index) => (
              <div key={acao.id || index} style={styles.acaoItem}>
                <div
                  style={
                    window.innerWidth <= 768
                      ? styles.smallScreenHeader
                      : styles.acaoHeader
                  }
                >
                  <div style={styles.acaoTags}>
                    <span style={styles.acaoTipo}>{acao.tipo}</span>
                    {acao.tipo === "Metas Quantitativas" && acao.valor && (
                      <span style={styles.acaoValor}>
                        {typeof acao.valor === "string" &&
                        acao.valor.includes(",")
                          ? `R$ ${acao.valor}`
                          : formatCurrency(parseFloat(acao.valor) || 0)}
                      </span>
                    )}
                  </div>
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => removerAcaoServico(index)}
                      style={styles.removeButton}
                      onMouseEnter={(e) =>
                        (e.target.style.background =
                          styles.removeButtonHover.background)
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.background =
                          styles.removeButton.background)
                      }
                    >
                      🗑️ Remover
                    </button>
                  )}
                </div>

                <div style={styles.acaoDescricao}>
                  <strong>{acao.estrategia}</strong>
                </div>

                <div style={styles.acaoComplemento}>{acao.descricao}</div>
              </div>
            ))}
          </div>
        )}

        {/* Resumo total apenas para Metas Quantitativas - ORIGINAL */}
        {formData.acoesServicos &&
          formData.acoesServicos.some(
            (a) => a.tipo === "Metas Quantitativas" && a.valor,
          ) && (
            <div style={styles.resumoTotal}>
              <strong>
                Valor Total das Metas Quantitativas:{" "}
                {formatCurrency(calcularTotalMetasQuantitativas())}
              </strong>
            </div>
          )}
      </div>
    </fieldset>
  );
};

// ✅ ESTILOS ORIGINAIS + apenas ícone ℹ️
const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
    color: "#154360",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "18px",
  },
  novaAcaoContainer: {
    background: "#f8f9fa",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "2px dashed #dee2e6",
  },
  tipoSelector: {
    marginBottom: "15px",
  },
  acoesFormGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr 200px",
    gap: "20px",
    alignItems: "start",
  },
  smallScreenGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    alignItems: "start",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
  },
  addButton: {
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
    whiteSpace: "nowrap",
  },
  addButtonDisabled: {
    background: "#6c757d",
    cursor: "not-allowed",
  },
  acoesListContainer: {
    marginTop: "20px",
  },
  listTitle: {
    margin: "0 0 15px 0",
    color: "#154360",
  },
  emptyState: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
    padding: "20px",
  },
  acoesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  acaoItem: {
    background: "white",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  acaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  smallScreenHeader: {
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-start",
  },
  acaoTags: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  acaoTipo: {
    background: "#154360",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "bold",
  },
  acaoValor: {
    background: "#28a745",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },
  removeButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "0.9em",
  },
  removeButtonHover: {
    background: "#c82333",
  },
  acaoDescricao: {
    color: "#154360",
    marginBottom: "8px",
    fontSize: "1.05em",
  },
  acaoComplemento: {
    color: "#6c757d",
    fontSize: "0.95em",
    lineHeight: "1.4",
  },
  resumoTotal: {
    background: "#e9ecef",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    color: "#154360",
  },
  // ✅ ÚNICO ACRÉSCIMO: estilo do ícone
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default AcoesServicos;
