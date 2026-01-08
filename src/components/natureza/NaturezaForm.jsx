// src/components/natureza/NaturezaForm.jsx
// Formulario para cadastrar/editar natureza de despesa (envelope orcamentario)

import React, { useState, useEffect, useCallback } from "react";
import { NATUREZAS_DESPESA } from "../../config/constants";
import { parseValorMonetario, formatarMoedaInput } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";

/**
 * Formulario para cadastrar natureza de despesa
 * @param {object} props
 * @param {function} props.onSalvar - Callback ao salvar
 * @param {function} props.onCancelar - Callback ao cancelar
 * @param {object} props.naturezaParaEditar - Natureza para edicao (opcional)
 * @param {number} props.saldoLivre - Saldo livre da emenda
 * @param {boolean} props.salvando - Se esta salvando
 * @param {function} props.validarAlocacao - Funcao para validar alocacao
 */
const NaturezaForm = ({
  onSalvar,
  onCancelar,
  naturezaParaEditar = null,
  saldoLivre = 0,
  salvando = false,
  validarAlocacao,
}) => {
  const { isDark } = useTheme?.() || { isDark: false };

  // Estados do formulario
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorAlocado, setValorAlocado] = useState("");
  const [modoCustomizado, setModoCustomizado] = useState(false);
  const [erro, setErro] = useState("");
  const [validando, setValidando] = useState(false);
  const [validacaoResultado, setValidacaoResultado] = useState(null);

  // Preencher dados se for edicao
  useEffect(() => {
    if (naturezaParaEditar) {
      setCodigo(naturezaParaEditar.codigo || "");
      setDescricao(naturezaParaEditar.descricao || "");
      setValorAlocado(
        naturezaParaEditar.valorAlocado
          ? formatarMoedaInput(String(naturezaParaEditar.valorAlocado))
          : ""
      );
      // Verificar se codigo esta na lista ou e customizado
      const codigoNaLista = NATUREZAS_DESPESA.some((n) =>
        n.startsWith(naturezaParaEditar.codigo)
      );
      setModoCustomizado(!codigoNaLista);
    }
  }, [naturezaParaEditar]);

  // Validar alocacao quando valor muda
  useEffect(() => {
    const validar = async () => {
      const valorNum = parseValorMonetario(valorAlocado);
      if (valorNum <= 0) {
        setValidacaoResultado(null);
        return;
      }

      if (validarAlocacao) {
        setValidando(true);
        try {
          const resultado = await validarAlocacao(
            valorNum,
            naturezaParaEditar?.id
          );
          setValidacaoResultado(resultado);
        } catch (err) {
          setValidacaoResultado({ valido: false, mensagem: err.message });
        }
        setValidando(false);
      }
    };

    const timeout = setTimeout(validar, 300);
    return () => clearTimeout(timeout);
  }, [valorAlocado, validarAlocacao, naturezaParaEditar?.id]);

  // Handler para selecao de natureza
  const handleSelecionarNatureza = (e) => {
    const valor = e.target.value;
    if (valor === "__custom__") {
      setModoCustomizado(true);
      setCodigo("");
      setDescricao("");
    } else {
      const partes = valor.split(" - ");
      setCodigo(partes[0] || "");
      setDescricao(valor);
    }
  };

  // Handler para valor monetario
  const handleValorChange = (e) => {
    const valorFormatado = formatarMoedaInput(e.target.value);
    setValorAlocado(valorFormatado);
    setErro("");
  };

  // Validar e salvar
  const handleSalvar = async () => {
    setErro("");

    // Validacoes
    if (!codigo.trim()) {
      setErro("Selecione ou digite o codigo da natureza");
      return;
    }

    const valorNum = parseValorMonetario(valorAlocado);
    if (valorNum <= 0) {
      setErro("Digite um valor maior que zero");
      return;
    }

    if (validacaoResultado && !validacaoResultado.valido) {
      setErro(validacaoResultado.mensagem);
      return;
    }

    // Chamar callback de salvar
    try {
      await onSalvar({
        codigo: codigo.trim(),
        descricao: descricao.trim() || codigo.trim(),
        valorAlocado: valorNum,
      });
    } catch (err) {
      setErro(err.message);
    }
  };

  // Estilos
  const styles = {
    container: {
      backgroundColor: isDark ? "var(--bg-secondary)" : "#ffffff",
      borderRadius: "12px",
      padding: "20px",
      border: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    titulo: {
      fontSize: "16px",
      fontWeight: 600,
      color: isDark ? "var(--text-primary)" : "#1e293b",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    campo: {
      marginBottom: "16px",
    },
    label: {
      display: "block",
      fontSize: "13px",
      fontWeight: 500,
      color: isDark ? "var(--text-secondary)" : "#64748b",
      marginBottom: "6px",
    },
    input: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
      borderRadius: "8px",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#ffffff",
      color: isDark ? "var(--text-primary)" : "#1e293b",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "10px 12px",
      fontSize: "14px",
      border: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
      borderRadius: "8px",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#ffffff",
      color: isDark ? "var(--text-primary)" : "#1e293b",
      cursor: "pointer",
    },
    saldoInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px",
      backgroundColor: isDark ? "var(--bg-tertiary)" : "#f8fafc",
      borderRadius: "8px",
      marginBottom: "16px",
      fontSize: "13px",
    },
    saldoLabel: {
      color: isDark ? "var(--text-secondary)" : "#64748b",
    },
    saldoValor: {
      fontWeight: 600,
      color: saldoLivre > 0 ? "#10b981" : "#ef4444",
    },
    validacao: {
      marginTop: "8px",
      padding: "8px 12px",
      borderRadius: "6px",
      fontSize: "12px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    validacaoSucesso: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#d1fae5",
      color: "#059669",
    },
    validacaoErro: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#fee2e2",
      color: "#dc2626",
    },
    erro: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#fee2e2",
      color: "#dc2626",
      padding: "10px 12px",
      borderRadius: "8px",
      fontSize: "13px",
      marginBottom: "16px",
    },
    acoes: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "20px",
      paddingTop: "16px",
      borderTop: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
    },
    btnCancelar: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: 500,
      border: `1px solid ${isDark ? "var(--border-color)" : "#e2e8f0"}`,
      borderRadius: "8px",
      backgroundColor: "transparent",
      color: isDark ? "var(--text-secondary)" : "#64748b",
      cursor: "pointer",
    },
    btnSalvar: {
      padding: "10px 20px",
      fontSize: "14px",
      fontWeight: 500,
      border: "none",
      borderRadius: "8px",
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    btnSalvarDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    linkVoltar: {
      color: "#3b82f6",
      fontSize: "12px",
      cursor: "pointer",
      textDecoration: "underline",
      marginTop: "8px",
      display: "inline-block",
    },
  };

  const podeSalvar =
    codigo.trim() &&
    parseValorMonetario(valorAlocado) > 0 &&
    (!validacaoResultado || validacaoResultado.valido) &&
    !salvando &&
    !validando;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.titulo}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            {naturezaParaEditar ? "edit" : "add_circle"}
          </span>
          {naturezaParaEditar ? "Editar Natureza" : "Nova Natureza de Despesa"}
        </h3>
      </div>

      {/* Info saldo livre */}
      <div style={styles.saldoInfo}>
        <span style={styles.saldoLabel}>Saldo livre para alocacao:</span>
        <span style={styles.saldoValor}>
          R$ {saldoLivre.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Erro geral */}
      {erro && <div style={styles.erro}>{erro}</div>}

      {/* Campo natureza */}
      <div style={styles.campo}>
        <label style={styles.label}>Natureza de Despesa *</label>
        {modoCustomizado ? (
          <>
            <input
              type="text"
              style={styles.input}
              placeholder="Ex: 339030 - MATERIAL DE CONSUMO"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                const partes = e.target.value.split(" - ");
                setCodigo(partes[0] || e.target.value);
              }}
            />
            <span
              style={styles.linkVoltar}
              onClick={() => {
                setModoCustomizado(false);
                setCodigo("");
                setDescricao("");
              }}
            >
              Voltar para lista
            </span>
          </>
        ) : (
          <select
            style={styles.select}
            value={descricao}
            onChange={handleSelecionarNatureza}
          >
            <option value="">Selecione uma natureza...</option>
            {NATUREZAS_DESPESA.map((natureza) => (
              <option key={natureza} value={natureza}>
                {natureza}
              </option>
            ))}
            <option value="__custom__">Digitar outra...</option>
          </select>
        )}
      </div>

      {/* Campo valor */}
      <div style={styles.campo}>
        <label style={styles.label}>Valor a Alocar (R$) *</label>
        <input
          type="text"
          style={styles.input}
          placeholder="0,00"
          value={valorAlocado}
          onChange={handleValorChange}
        />

        {/* Feedback de validacao */}
        {validando && (
          <div style={{ ...styles.validacao, backgroundColor: "#f3f4f6" }}>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 14, animation: "spin 1s linear infinite" }}
            >
              sync
            </span>
            Validando...
          </div>
        )}
        {!validando && validacaoResultado && (
          <div
            style={{
              ...styles.validacao,
              ...(validacaoResultado.valido
                ? styles.validacaoSucesso
                : styles.validacaoErro),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              {validacaoResultado.valido ? "check_circle" : "error"}
            </span>
            {validacaoResultado.mensagem}
            {validacaoResultado.valido && validacaoResultado.saldoAposAlocacao !== undefined && (
              <span style={{ marginLeft: "auto" }}>
                Saldo apos: R${" "}
                {validacaoResultado.saldoAposAlocacao.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botoes */}
      <div style={styles.acoes}>
        <button style={styles.btnCancelar} onClick={onCancelar} type="button">
          Cancelar
        </button>
        <button
          style={{
            ...styles.btnSalvar,
            ...(podeSalvar ? {} : styles.btnSalvarDisabled),
          }}
          onClick={handleSalvar}
          disabled={!podeSalvar}
          type="button"
        >
          {salvando ? (
            <>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16, animation: "spin 1s linear infinite" }}
              >
                sync
              </span>
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                save
              </span>
              {naturezaParaEditar ? "Salvar Alteracoes" : "Criar Natureza"}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NaturezaForm;
