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

  // Estilos - Design compacto e profissional
  const styles = {
    container: {
      backgroundColor: isDark ? "var(--theme-surface)" : "var(--theme-surface, #ffffff)",
      borderRadius: "var(--border-radius-md, 8px)",
      padding: "16px",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "12px",
    },
    titulo: {
      fontSize: "var(--font-size-sm, 14px)",
      fontWeight: "var(--font-weight-semibold, 600)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      margin: 0,
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    campo: {
      marginBottom: "12px",
    },
    label: {
      display: "block",
      fontSize: "var(--font-size-xs, 12px)",
      fontWeight: "var(--font-weight-medium, 500)",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      marginBottom: "4px",
    },
    input: {
      width: "100%",
      padding: "8px 10px",
      fontSize: "var(--font-size-sm, 13px)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--theme-surface, #ffffff)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      boxSizing: "border-box",
    },
    select: {
      width: "100%",
      padding: "8px 10px",
      fontSize: "var(--font-size-sm, 13px)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--theme-surface, #ffffff)",
      color: isDark ? "var(--theme-text)" : "var(--gray-800, #1E293B)",
      cursor: "pointer",
    },
    saldoInfo: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 10px",
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "var(--gray-50, #F8FAFC)",
      borderRadius: "var(--border-radius, 6px)",
      marginBottom: "12px",
      fontSize: "var(--font-size-xs, 12px)",
    },
    saldoLabel: {
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
    },
    saldoValor: {
      fontWeight: "var(--font-weight-semibold, 600)",
      color: saldoLivre > 0 ? "var(--success, #10B981)" : "var(--error, #EF4444)",
    },
    validacao: {
      marginTop: "6px",
      padding: "6px 10px",
      borderRadius: "var(--border-radius-sm, 4px)",
      fontSize: "11px",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    validacaoSucesso: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "rgba(16, 185, 129, 0.1)",
      color: "var(--success, #10B981)",
    },
    validacaoErro: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: "var(--error, #EF4444)",
    },
    erro: {
      backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)",
      color: "var(--error, #EF4444)",
      padding: "8px 10px",
      borderRadius: "var(--border-radius, 6px)",
      fontSize: "var(--font-size-xs, 12px)",
      marginBottom: "12px",
    },
    acoes: {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
      marginTop: "12px",
      paddingTop: "12px",
      borderTop: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
    },
    btnCancelar: {
      padding: "8px 16px",
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: `1px solid ${isDark ? "var(--theme-border)" : "var(--theme-border, #E2E8F0)"}`,
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: "transparent",
      color: isDark ? "var(--theme-text-secondary)" : "var(--gray-500, #64748B)",
      cursor: "pointer",
    },
    btnSalvar: {
      padding: "8px 16px",
      fontSize: "var(--font-size-sm, 13px)",
      fontWeight: "var(--font-weight-medium, 500)",
      border: "none",
      borderRadius: "var(--border-radius, 6px)",
      backgroundColor: "var(--primary, #2563EB)",
      color: "var(--white, #ffffff)",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    btnSalvarDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    linkVoltar: {
      color: "var(--primary, #2563EB)",
      fontSize: "11px",
      cursor: "pointer",
      textDecoration: "underline",
      marginTop: "6px",
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
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
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
        <label htmlFor="naturezaDespesa" style={styles.label}>Natureza de Despesa *</label>
        {modoCustomizado ? (
          <>
            <input
              type="text"
              id="naturezaDespesa"
              style={styles.input}
              placeholder="Ex: 339030 - MATERIAL DE CONSUMO"
              value={descricao}
              onChange={(e) => {
                setDescricao(e.target.value);
                const partes = e.target.value.split(" - ");
                setCodigo(partes[0] || e.target.value);
              }}
              aria-describedby="naturezaHint"
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
            id="naturezaDespesa"
            style={styles.select}
            value={descricao}
            onChange={handleSelecionarNatureza}
            aria-describedby="naturezaHint"
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
        <label htmlFor="valorAlocado" style={styles.label}>Valor a Alocar (R$) *</label>
        <input
          type="text"
          id="valorAlocado"
          style={styles.input}
          placeholder="0,00"
          value={valorAlocado}
          onChange={handleValorChange}
          aria-describedby="valorFeedback"
          inputMode="decimal"
        />

        {/* Feedback de validacao */}
        {validando && (
          <div id="valorFeedback" style={{ ...styles.validacao, backgroundColor: "#f3f4f6" }} role="status" aria-live="polite">
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 12, animation: "spin 1s linear infinite" }}
              aria-hidden="true"
            >
              sync
            </span>
            Validando...
          </div>
        )}
        {!validando && validacaoResultado && (
          <div
            id="valorFeedback"
            role="status"
            aria-live="polite"
            style={{
              ...styles.validacao,
              ...(validacaoResultado.valido
                ? styles.validacaoSucesso
                : styles.validacaoErro),
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
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
                style={{ fontSize: 14, animation: "spin 1s linear infinite" }}
              >
                sync
              </span>
              Salvando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
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
