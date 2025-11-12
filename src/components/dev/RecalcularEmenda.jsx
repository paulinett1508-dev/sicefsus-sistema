import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { formatarMoeda, parseValorMonetario } from "../../utils/formatters";

export default function RecalcularEmenda() {
  // 🔧 ESTADOS
  const [emendasCarregadas, setEmendasCarregadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Estados para modal e preview
  const [emendaSelecionada, setEmendaSelecionada] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [preview, setPreview] = useState(null);
  const [processando, setProcessando] = useState(false);

  // Estados para busca e filtros
  const [termoBusca, setTermoBusca] = useState("");
  const [filtroProblema, setFiltroProblema] = useState("todos");

  // 🔍 CARREGAR EMENDAS AO MONTAR
  useEffect(() => {
    carregarEmendas();
  }, []);

  // 📥 CARREGAR EMENDAS DO FIREBASE
  const carregarEmendas = async () => {
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      console.log("📥 Carregando emendas...");

      // Buscar todas as emendas
      const emendasSnapshot = await getDocs(collection(db, "emendas"));
      const emendas = [];

      for (const emendaDoc of emendasSnapshot.docs) {
        const emendaData = emendaDoc.data();

        // Buscar despesas da emenda
        const despesasQuery = query(
          collection(db, "despesas"),
          where("emendaId", "==", emendaDoc.id),
        );
        const despesasSnapshot = await getDocs(despesasQuery);

        // ✅ CORREÇÃO: Calcular valor executado REAL (soma das despesas) com parse correto
        const valorExecutadoReal = despesasSnapshot.docs.reduce(
          (total, despDoc) => {
            const desp = despDoc.data();
            return total + parseValorMonetario(desp.valor || 0);
          },
          0,
        );

        // ✅ CORREÇÃO: Valor que está no banco com parse correto
        const valorExecutadoBanco = parseValorMonetario(emendaData.valorExecutado || 0);
        
        // ✅ CORREÇÃO: Valor total com fallback igual ao Diagnóstico
        const valorTotal = parseValorMonetario(
          emendaData.valorTotal || emendaData.valor || emendaData.valorRecurso || 0
        );

        // Calcular diferença
        const diferenca = Math.abs(valorExecutadoBanco - valorExecutadoReal);

        // Classificar severidade
        let severidade = "ok";
        if (diferenca > 10000) severidade = "crítica";
        else if (diferenca > 1000) severidade = "moderada";
        else if (diferenca > 100) severidade = "leve";

        emendas.push({
          id: emendaDoc.id,
          ...emendaData,
          numeroDespesas: despesasSnapshot.size,
          valorExecutadoReal,
          valorExecutadoBanco,
          diferenca,
          severidade,
        });
      }

      setEmendasCarregadas(emendas);
      console.log(`✅ ${emendas.length} emendas carregadas`);
    } catch (error) {
      console.error("❌ Erro ao carregar emendas:", error);
      setErro(`Erro ao carregar emendas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 SELECIONAR EMENDA (ABRE MODAL)
  const handleSelecionarEmenda = (emenda) => {
    console.log("🎯 Emenda selecionada:", emenda);

    // ✅ CORREÇÃO: Calcular valores com parse correto
    const valorTotal = parseValorMonetario(
      emenda.valorTotal || emenda.valor || emenda.valorRecurso || 0
    );
    const valorBanco = parseValorMonetario(emenda.valorExecutadoBanco || 0);
    const valorCalculado = parseValorMonetario(emenda.valorExecutadoReal || 0);
    const diferenca = Math.abs(valorBanco - valorCalculado);

    const saldoBanco = valorTotal - valorBanco;
    const saldoCalculado = valorTotal - valorCalculado;

    // Montar preview
    setPreview({
      numero: emenda.numeroEmenda || emenda.numero || "Sem número",
      municipio: emenda.municipio || "N/A",
      uf: emenda.uf || "N/A",
      valorTotal: valorTotal,
      valorBanco: valorBanco,
      valorCalculado: valorCalculado,
      diferenca: diferenca,
      saldoBanco: saldoBanco,
      saldoCalculado: saldoCalculado,
      percentualBanco: valorTotal > 0 ? (valorBanco / valorTotal) * 100 : 0,
      percentualCalculado:
        valorTotal > 0 ? (valorCalculado / valorTotal) * 100 : 0,
      numeroDespesas: emenda.numeroDespesas || 0,
      timestampInicio: Date.now(), // Para medir latência
    });

    setEmendaSelecionada(emenda);
    setMostrarModal(true);

    console.log("✅ Modal aberto");
  };

  // ✅ APLICAR RECÁLCULO
  const handleAplicarRecalculo = async () => {
    if (!emendaSelecionada || !preview) {
      alert("❌ Erro: Nenhuma emenda selecionada");
      return;
    }

    // Confirmação
    if (
      !window.confirm(
        `⚠️ CONFIRMA O RECÁLCULO?\n\n` +
          `Emenda: ${preview.numero}\n` +
          `Município: ${preview.municipio}/${preview.uf}\n\n` +
          `Valor Executado Atual: ${formatarMoeda(preview.valorBanco)}\n` +
          `Novo Valor Calculado: ${formatarMoeda(preview.valorCalculado)}\n` +
          `Diferença: ${formatarMoeda(preview.diferenca)}\n\n` +
          `Esta ação NÃO pode ser desfeita!`,
      )
    ) {
      return;
    }

    setProcessando(true);

    try {
      const emendaRef = doc(db, "emendas", emendaSelecionada.id);

      // Calcular novo saldo
      const novoSaldo = preview.valorTotal - preview.valorCalculado;

      // Atualizar no Firebase COM CONFIRMAÇÃO
      await updateDoc(emendaRef, {
        valorExecutado: preview.valorCalculado,
        saldoDisponivel: novoSaldo,
        percentualExecutado: preview.percentualCalculado,
        recalculadoEm: Timestamp.now(),
        recalculadoPor: "SuperAdmin",
        versaoCalculo: Date.now(),
      });

      // 🔍 VERIFICAR SE SALVOU MESMO (força leitura do servidor)
      const verificacao = await getDoc(emendaRef);
      const dadosVerificados = verificacao.data();
      
      const salvamentoConfirmado = 
        Math.abs(dadosVerificados.valorExecutado - preview.valorCalculado) < 0.01;

      if (!salvamentoConfirmado) {
        throw new Error("Falha na verificação do salvamento - valores não conferem");
      }

      setSucesso(
        `✅ Recálculo aplicado e VERIFICADO!\n\n` +
          `Emenda: ${preview.numero}\n` +
          `Valor executado: ${formatarMoeda(preview.valorCalculado)}\n` +
          `Saldo disponível: ${formatarMoeda(novoSaldo)}\n\n` +
          `⏱️ Salvamento confirmado em ${Date.now() - preview.timestampInicio}ms`,
      );

      // Fechar modal
      setMostrarModal(false);
      setEmendaSelecionada(null);
      setPreview(null);

      // Recarregar com delay menor
      setTimeout(() => {
        carregarEmendas();
        setSucesso("");
      }, 2000);
    } catch (error) {
      console.error("❌ Erro ao aplicar recálculo:", error);
      setErro(`❌ Erro ao aplicar recálculo: ${error.message}`);
    } finally {
      setProcessando(false);
    }
  };

  // 🔍 FILTRAR EMENDAS
  const emendasFiltradas = emendasCarregadas.filter((emenda) => {
    // Filtro de texto
    const textoMatch =
      !termoBusca ||
      (emenda.numeroEmenda || "")
        .toLowerCase()
        .includes(termoBusca.toLowerCase()) ||
      (emenda.municipio || "")
        .toLowerCase()
        .includes(termoBusca.toLowerCase()) ||
      (emenda.parlamentar || "")
        .toLowerCase()
        .includes(termoBusca.toLowerCase());

    // Filtro de problema
    const problemaMatch =
      filtroProblema === "todos" ||
      (filtroProblema === "com-problema" && emenda.severidade !== "ok") ||
      (filtroProblema === "ok" && emenda.severidade === "ok");

    return textoMatch && problemaMatch;
  });

  return (
    <div style={styles.container}>
      {/* CABEÇALHO */}
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 Diagnóstico e Recálculo</h2>
        <p style={styles.subtitle}>
          Identifica inconsistências automaticamente. Clique em "Selecionar" para corrigir.
        </p>
      </div>

      {/* FILTROS */}
      <div style={styles.filtros}>
        <input
          type="text"
          placeholder="🔍 Buscar emenda..."
          value={termoBusca}
          onChange={(e) => setTermoBusca(e.target.value)}
          style={styles.inputBusca}
        />

        <select
          value={filtroProblema}
          onChange={(e) => setFiltroProblema(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todas</option>
          <option value="com-problema">Com problemas</option>
          <option value="ok">OK</option>
        </select>

        <button
          onClick={carregarEmendas}
          style={styles.btnRecarregar}
          disabled={loading}
        >
          {loading ? "⏳ Carregando..." : "🔄 Recarregar"}
        </button>
      </div>

      {/* MENSAGENS */}
      {erro && <div style={styles.erro}>❌ {erro}</div>}

      {sucesso && <div style={styles.sucesso}>{sucesso}</div>}

      {/* LOADING */}
      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Carregando emendas...</p>
        </div>
      )}

      {/* TABELA */}
      {!loading && emendasFiltradas.length > 0 && (
        <div style={styles.tabelaContainer}>
          <table className="tabela-recalculo" style={styles.tabela}>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Município</th>
                <th>Total</th>
                <th>Desp.</th>
                <th>Banco</th>
                <th>Real</th>
                <th>Dif.</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {emendasFiltradas.map((emenda) => (
                <tr
                  key={emenda.id}
                  className={emenda.severidade !== "ok" ? "com-problema" : ""}
                >
                  <td>
                    <strong>
                      {emenda.numeroEmenda || emenda.numero || "N/A"}
                    </strong>
                  </td>
                  <td>
                    {emenda.municipio || "N/A"}/{emenda.uf || "N/A"}
                  </td>
                  <td>{formatarMoeda(emenda.valorTotal)}</td>
                  <td style={{ textAlign: "center" }}>
                    {emenda.numeroDespesas}
                  </td>
                  <td>{formatarMoeda(emenda.valorExecutadoBanco)}</td>
                  <td>{formatarMoeda(emenda.valorExecutadoReal)}</td>
                  <td>
                    {emenda.diferenca > 100 ? (
                      <span
                        className={`diferenca ${emenda.severidade}`}
                        style={{
                          color:
                            emenda.severidade === "crítica"
                              ? "#dc3545"
                              : emenda.severidade === "moderada"
                                ? "#856404"
                                : "#0c5460",
                          fontWeight: "bold",
                        }}
                      >
                        {formatarMoeda(emenda.diferenca)}
                      </span>
                    ) : (
                      <span className="ok">-</span>
                    )}
                  </td>
                  <td>
                    {emenda.severidade === "ok" ? (
                      <span className="badge-ok">✅</span>
                    ) : (
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          background:
                            emenda.severidade === "crítica"
                              ? "#dc3545"
                              : emenda.severidade === "moderada"
                                ? "#ffc107"
                                : "#17a2b8",
                          color: "white",
                        }}
                      >
                        {emenda.severidade === "crítica" && "🔴"}
                        {emenda.severidade === "moderada" && "🟡"}
                        {emenda.severidade === "leve" && "🔵"}
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-selecionar-tabela"
                      onClick={() => handleSelecionarEmenda(emenda)}
                      style={styles.btnSelecionar}
                      title="Revisar e corrigir"
                    >
                      🔧
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SEM RESULTADOS */}
      {!loading && emendasFiltradas.length === 0 && (
        <div style={styles.semResultados}>
          <p>📭 Nenhuma emenda encontrada</p>
        </div>
      )}

      {/* MODAL DE PREVIEW */}
      {mostrarModal && preview && (
        <div
          style={styles.modalOverlay}
          onClick={() => !processando && setMostrarModal(false)}
        >
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* HEADER */}
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0 }}>🔧 Confirmação</h3>
              <button
                onClick={() => setMostrarModal(false)}
                style={styles.btnFechar}
                disabled={processando}
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div style={styles.modalBody}>
              {/* DADOS DA EMENDA */}
              <div style={styles.previewSection}>
                <p>
                  <strong>Emenda:</strong> {preview.numero} • {preview.municipio}/{preview.uf}
                </p>
                <p>
                  <strong>Total:</strong> {formatarMoeda(preview.valorTotal)} • {preview.numeroDespesas} despesas
                </p>
              </div>

              {/* COMPARAÇÃO */}
              <div style={styles.previewSection}>
                <h4 style={styles.sectionTitle}>💰 Valores</h4>
                <table style={styles.tabelaComparacao}>
                  <thead>
                    <tr>
                      <th style={styles.thComparacao}>Métrica</th>
                      <th style={styles.thComparacao}>Banco (Atual)</th>
                      <th style={styles.thComparacao}>Calculado (Novo)</th>
                      <th style={styles.thComparacao}>Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={styles.tdComparacao}>Valor Executado</td>
                      <td style={styles.tdComparacao}>
                        {formatarMoeda(preview.valorBanco)}
                      </td>
                      <td
                        style={{
                          ...styles.tdComparacao,
                          fontWeight: "bold",
                          color: "#28a745",
                        }}
                      >
                        {formatarMoeda(preview.valorCalculado)}
                      </td>
                      <td
                        style={{
                          ...styles.tdComparacao,
                          color:
                            preview.diferenca > 1000 ? "#dc3545" : "#28a745",
                          fontWeight: "bold",
                        }}
                      >
                        {formatarMoeda(preview.diferenca)}
                      </td>
                    </tr>
                    <tr style={{ background: "#f8f9fa" }}>
                      <td style={styles.tdComparacao}>Saldo Disponível</td>
                      <td style={styles.tdComparacao}>
                        {formatarMoeda(preview.saldoBanco)}
                      </td>
                      <td
                        style={{
                          ...styles.tdComparacao,
                          fontWeight: "bold",
                          color: "#28a745",
                        }}
                      >
                        {formatarMoeda(preview.saldoCalculado)}
                      </td>
                      <td style={styles.tdComparacao}>-</td>
                    </tr>
                    <tr>
                      <td style={styles.tdComparacao}>Percentual Executado</td>
                      <td style={styles.tdComparacao}>
                        {preview.percentualBanco.toFixed(2)}%
                      </td>
                      <td
                        style={{
                          ...styles.tdComparacao,
                          fontWeight: "bold",
                          color: "#28a745",
                        }}
                      >
                        {preview.percentualCalculado.toFixed(2)}%
                      </td>
                      <td style={styles.tdComparacao}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ALERTA */}
              {preview.diferenca > 1000 && (
                <div style={styles.alerta}>
                  ⚠️ Diferença significativa detectada
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => setMostrarModal(false)}
                style={styles.btnCancelar}
                disabled={processando}
              >
                Cancelar
              </button>
              <button
                onClick={handleAplicarRecalculo}
                disabled={processando}
                style={{
                  ...styles.btnAplicar,
                  opacity: processando ? 0.6 : 1,
                  cursor: processando ? "not-allowed" : "pointer",
                }}
              >
                {processando ? "Aplicando..." : "✅ Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🎨 ESTILOS
const styles = {
  container: {
    padding: "20px",
  },
  header: {
    marginBottom: "30px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "14px",
    margin: 0,
  },
  filtros: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  inputBusca: {
    flex: 1,
    minWidth: "300px",
    padding: "10px 14px",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
  },
  select: {
    padding: "10px 14px",
    border: "1px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    minWidth: "200px",
    cursor: "pointer",
  },
  btnRecarregar: {
    padding: "10px 20px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  erro: {
    background: "#f8d7da",
    color: "#721c24",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    border: "1px solid #f5c6cb",
  },
  sucesso: {
    background: "#d4edda",
    color: "#155724",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    border: "1px solid #c3e6cb",
    whiteSpace: "pre-line",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
  tabelaContainer: {
    overflowX: "auto",
    background: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tabela: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  btnSelecionar: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
  },
  semResultados: {
    textAlign: "center",
    padding: "60px 20px",
    background: "white",
    borderRadius: "8px",
    color: "#6c757d",
  },

  // MODAL
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "12px 12px 0 0",
  },
  btnFechar: {
    background: "transparent",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    padding: "0 10px",
  },
  modalBody: {
    padding: "30px",
  },
  previewSection: {
    marginBottom: "25px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "15px",
    fontSize: "16px",
    color: "#2c3e50",
  },
  tabelaComparacao: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "15px",
    fontSize: "14px",
  },
  thComparacao: {
    background: "#e9ecef",
    padding: "12px",
    textAlign: "left",
    fontWeight: "600",
    borderBottom: "2px solid #dee2e6",
  },
  tdComparacao: {
    padding: "12px",
    borderBottom: "1px solid #dee2e6",
  },
  alerta: {
    background: "#fff3cd",
    border: "1px solid #ffc107",
    color: "#856404",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    fontSize: "14px",
  },
  modalFooter: {
    padding: "20px 30px",
    borderTop: "1px solid #e9ecef",
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
  },
  btnCancelar: {
    padding: "12px 24px",
    background: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnAplicar: {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #28a745 0%, #20c997 100%)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

// Adicionar animação do spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .tabela-recalculo thead th {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tabela-recalculo tbody tr {
      transition: all 0.2s ease;
    }

    .tabela-recalculo tbody tr:hover {
      background-color: #f8f9fa;
      transform: scale(1.005);
    }

    .tabela-recalculo tbody tr.com-problema {
      background-color: #fff3cd;
    }

    .tabela-recalculo tbody tr.com-problema:hover {
      background-color: #ffe69c;
    }

    .tabela-recalculo td {
      padding: 14px 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .badge-ok {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      background: #28a745;
      color: white;
      text-transform: uppercase;
    }

    .btn-selecionar-tabela:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  `;
  document.head.appendChild(style);
}
