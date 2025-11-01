// src/components/admin/MigracaoCompleta.jsx
// 🔄 MIGRAÇÃO COMPLETA VIA WEB
// ✅ Usa autenticação do usuário logado

import React, { useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteField,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const MigracaoCompleta = () => {
  const [processando, setProcessando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState("");
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const [resultado, setResultado] = useState(null);
  const [log, setLog] = useState([]);

  const adicionarLog = (mensagem) => {
    const timestamp = new Date().toLocaleTimeString();
    const mensagemCompleta = `${timestamp} - ${mensagem}`;
    setLog((prev) => [...prev, mensagemCompleta]);
    console.log(mensagemCompleta);
  };

  const parseValorMonetario = (valor) => {
    if (!valor) return 0;
    const valorString = valor.toString();
    return (
      parseFloat(valorString.replace(/[^\d,]/g, "").replace(",", ".")) || 0
    );
  };

  const executarMigracao = async () => {
    if (
      !window.confirm(
        '⚠️ Esta migração irá:\n\n1. Adicionar status="EXECUTADA" nas despesas existentes\n2. Converter acoesServicos em despesas PLANEJADAS\n\nDeseja continuar?',
      )
    ) {
      return;
    }

    setProcessando(true);
    setResultado(null);
    setLog([]);

    const stats = {
      // Etapa 1: Status nas despesas
      totalDespesas: 0,
      despesasComStatus: 0,
      despesasAtualizadas: 0,

      // Etapa 2: acoesServicos → despesas
      totalEmendas: 0,
      emendasComAcoes: 0,
      despesasPlanejadas: 0,
      emendasLimpas: 0,

      erros: 0,
    };

    try {
      // ═══════════════════════════════════════════════════════════
      // ETAPA 1: ADICIONAR STATUS NAS DESPESAS EXISTENTES
      // ═══════════════════════════════════════════════════════════
      setEtapaAtual("Etapa 1: Atualizando despesas existentes");
      adicionarLog("═".repeat(50));
      adicionarLog("🚀 ETAPA 1: Adicionar status nas despesas");
      adicionarLog("═".repeat(50));

      const despesasRef = collection(db, "despesas");
      const despesasSnapshot = await getDocs(despesasRef);

      stats.totalDespesas = despesasSnapshot.size;
      setProgresso({ atual: 0, total: stats.totalDespesas });
      adicionarLog(`📊 Encontradas ${stats.totalDespesas} despesas`);

      let contador = 0;
      for (const despesaDoc of despesasSnapshot.docs) {
        contador++;
        setProgresso({ atual: contador, total: stats.totalDespesas });

        const despesa = despesaDoc.data();

        if (despesa.status) {
          stats.despesasComStatus++;
          adicionarLog(
            `⏭️  [${contador}/${stats.totalDespesas}] Despesa ${despesaDoc.id.substring(0, 8)}... já tem status`,
          );
          continue;
        }

        // Adicionar status EXECUTADA
        await updateDoc(doc(db, "despesas", despesaDoc.id), {
          status: "EXECUTADA",
          migradoEm: new Date().toISOString(),
          migradoPor: "migracao-web-v1",
        });

        stats.despesasAtualizadas++;
        adicionarLog(
          `✅ [${contador}/${stats.totalDespesas}] Despesa ${despesaDoc.id.substring(0, 8)}... → EXECUTADA`,
        );
      }

      adicionarLog(
        `\n✅ Etapa 1 concluída: ${stats.despesasAtualizadas} despesas atualizadas\n`,
      );

      // ═══════════════════════════════════════════════════════════
      // ETAPA 2: MIGRAR acoesServicos PARA DESPESAS PLANEJADAS
      // ═══════════════════════════════════════════════════════════
      setEtapaAtual("Etapa 2: Criando despesas planejadas");
      adicionarLog("═".repeat(50));
      adicionarLog("🚀 ETAPA 2: Migrar acoesServicos → despesas PLANEJADAS");
      adicionarLog("═".repeat(50));

      const emendasRef = collection(db, "emendas");
      const emendasSnapshot = await getDocs(emendasRef);

      stats.totalEmendas = emendasSnapshot.size;
      adicionarLog(`📊 Encontradas ${stats.totalEmendas} emendas`);

      for (const emendaDoc of emendasSnapshot.docs) {
        const emenda = emendaDoc.data();
        const emendaId = emendaDoc.id;

        // Verificar se tem acoesServicos
        if (!emenda.acoesServicos || emenda.acoesServicos.length === 0) {
          continue;
        }

        stats.emendasComAcoes++;
        adicionarLog(
          `\n📋 Emenda ${emenda.numero || emendaId}: ${emenda.acoesServicos.length} ações`,
        );

        // Criar despesas PLANEJADAS para cada ação
        for (const acao of emenda.acoesServicos) {
          try {
            const novaDespesa = {
              emendaId: emendaId,
              estrategia: acao.estrategia || "",
              naturezaDespesa: acao.estrategia || "",
              valor: parseValorMonetario(acao.valorAcao),
              status: "PLANEJADA",

              // Campos vazios (preenchidos na execução)
              discriminacao: "",
              numeroEmpenho: "",
              numeroNota: "",
              numeroContrato: "",
              dataEmpenho: "",
              dataLiquidacao: "",
              dataPagamento: "",
              acao: "",
              classificacaoFuncional: "",
              elementoDespesa: "",
              fonteRecurso: "",
              programaTrabalho: "",
              planoInterno: "",
              categoria: "",
              cnpjFornecedor: "",
              fornecedor: "",
              nomeFantasia: "",
              enderecoFornecedor: "",
              cidadeUf: "",
              cep: "",
              telefoneFornecedor: "",
              emailFornecedor: "",
              situacaoCadastral: "",
              contrapartida: 0,
              percentualExecucao: 0,
              etapaExecucao: "",
              coordenadasGeograficas: "",
              populacaoBeneficiada: "",
              impactoSocial: "",
              descricao: "",
              observacoes: "",
              criadaEm: new Date().toISOString(),
              criadaPor: "migracao-web-v1",
              dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
            };

            await addDoc(collection(db, "despesas"), novaDespesa);
            stats.despesasPlanejadas++;

            adicionarLog(
              `   ✅ Despesa PLANEJADA: ${acao.estrategia} - R$ ${parseValorMonetario(acao.valorAcao).toFixed(2)}`,
            );
          } catch (error) {
            adicionarLog(`   ❌ Erro: ${error.message}`);
            stats.erros++;
          }
        }

        // Remover acoesServicos da emenda
        try {
          await updateDoc(doc(db, "emendas", emendaId), {
            acoesServicos: deleteField(),
          });
          stats.emendasLimpas++;
          adicionarLog(`   🗑️  Campo acoesServicos removido`);
        } catch (error) {
          adicionarLog(`   ⚠️  Erro ao remover: ${error.message}`);
          stats.erros++;
        }
      }

      adicionarLog(
        `\n✅ Etapa 2 concluída: ${stats.despesasPlanejadas} despesas PLANEJADAS criadas\n`,
      );

      // ═══════════════════════════════════════════════════════════
      // RELATÓRIO FINAL
      // ═══════════════════════════════════════════════════════════
      adicionarLog("═".repeat(50));
      adicionarLog("🎉 MIGRAÇÃO COMPLETA!");
      adicionarLog("═".repeat(50));

      setResultado(stats);
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      adicionarLog(`❌ ERRO CRÍTICO: ${error.message}`);
      stats.erros++;
      setResultado(stats);
    } finally {
      setProcessando(false);
      setEtapaAtual("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔄 Migração Completa do Sistema</h2>

        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>📋 O que esta migração faz:</h3>
          <ol style={styles.infoList}>
            <li>
              <strong>Etapa 1:</strong> Adiciona campo{" "}
              <code>status="EXECUTADA"</code> em todas as despesas existentes
            </li>
            <li>
              <strong>Etapa 2:</strong> Converte o planejamento (
              <code>acoesServicos</code>) em despesas com{" "}
              <code>status="PLANEJADA"</code>
            </li>
          </ol>
        </div>

        <div style={styles.warning}>
          <strong>⚠️ IMPORTANTE:</strong> Execute esta migração apenas UMA vez!
        </div>

        <button
          onClick={executarMigracao}
          disabled={processando}
          style={{
            ...styles.button,
            ...(processando ? styles.buttonDisabled : {}),
          }}
        >
          {processando ? "⏳ Processando..." : "🚀 Iniciar Migração Completa"}
        </button>

        {etapaAtual && <div style={styles.etapaAtual}>{etapaAtual}</div>}

        {processando && progresso.total > 0 && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${(progresso.atual / progresso.total) * 100}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>
              {progresso.atual} / {progresso.total}
            </p>
          </div>
        )}

        {resultado && (
          <div style={styles.resultado}>
            <h3 style={styles.resultadoTitle}>📊 Resultado da Migração</h3>

            <div style={styles.resultadoSection}>
              <h4 style={styles.sectionTitle}>Etapa 1: Despesas Existentes</h4>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>Total de despesas:</td>
                    <td style={styles.tableValue}>{resultado.totalDespesas}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Já tinham status:</td>
                    <td style={styles.tableValue}>
                      {resultado.despesasComStatus}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>✅ Atualizadas:</td>
                    <td style={{ ...styles.tableValue, color: "#28a745" }}>
                      {resultado.despesasAtualizadas}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={styles.resultadoSection}>
              <h4 style={styles.sectionTitle}>
                Etapa 2: Planejamento → Despesas
              </h4>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>Total de emendas:</td>
                    <td style={styles.tableValue}>{resultado.totalEmendas}</td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>Com planejamento:</td>
                    <td style={styles.tableValue}>
                      {resultado.emendasComAcoes}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>
                      ✅ Despesas PLANEJADAS criadas:
                    </td>
                    <td style={{ ...styles.tableValue, color: "#f39c12" }}>
                      {resultado.despesasPlanejadas}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.tableLabel}>🗑️ Emendas limpas:</td>
                    <td style={styles.tableValue}>{resultado.emendasLimpas}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={styles.resultadoSection}>
              <table style={styles.table}>
                <tbody>
                  <tr>
                    <td style={styles.tableLabel}>
                      <strong>❌ Total de erros:</strong>
                    </td>
                    <td
                      style={{
                        ...styles.tableValue,
                        color: resultado.erros > 0 ? "#dc3545" : "#28a745",
                      }}
                    >
                      {resultado.erros}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {resultado.erros === 0 && (
              <div style={styles.successMessage}>
                🎉 Migração concluída com sucesso! O sistema está pronto para
                uso.
              </div>
            )}
          </div>
        )}

        {log.length > 0 && (
          <div style={styles.logContainer}>
            <h3 style={styles.logTitle}>📝 Log Detalhado</h3>
            <div style={styles.logContent}>
              {log.map((linha, index) => (
                <div key={index} style={styles.logLine}>
                  {linha}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 20px 0",
    color: "#154360",
    fontSize: "24px",
  },
  infoBox: {
    backgroundColor: "#e3f2fd",
    border: "1px solid #2196f3",
    borderRadius: "6px",
    padding: "16px",
    marginBottom: "20px",
  },
  infoTitle: {
    margin: "0 0 12px 0",
    color: "#1565c0",
    fontSize: "16px",
  },
  infoList: {
    margin: "0",
    paddingLeft: "20px",
    color: "#1976d2",
    lineHeight: "1.8",
  },
  warning: {
    backgroundColor: "#fff3cd",
    border: "1px solid #ffc107",
    borderRadius: "4px",
    padding: "12px",
    marginBottom: "20px",
    color: "#856404",
  },
  button: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "14px 28px",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    transition: "all 0.2s",
  },
  buttonDisabled: {
    backgroundColor: "#6c757d",
    cursor: "not-allowed",
    opacity: 0.6,
  },
  etapaAtual: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#e3f2fd",
    borderRadius: "4px",
    textAlign: "center",
    fontWeight: "bold",
    color: "#1565c0",
  },
  progressContainer: {
    marginTop: "20px",
  },
  progressBar: {
    width: "100%",
    height: "24px",
    backgroundColor: "#e9ecef",
    borderRadius: "12px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#28a745",
    transition: "width 0.3s ease",
  },
  progressText: {
    textAlign: "center",
    marginTop: "8px",
    color: "#666",
    fontSize: "14px",
  },
  resultado: {
    marginTop: "24px",
  },
  resultadoTitle: {
    margin: "0 0 20px 0",
    fontSize: "20px",
    color: "#154360",
  },
  resultadoSection: {
    marginBottom: "20px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    color: "#495057",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableLabel: {
    padding: "8px",
    color: "#495057",
    width: "70%",
  },
  tableValue: {
    padding: "8px",
    textAlign: "right",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#154360",
  },
  successMessage: {
    marginTop: "16px",
    padding: "16px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "6px",
    color: "#155724",
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },
  logContainer: {
    marginTop: "24px",
  },
  logTitle: {
    margin: "0 0 12px 0",
    fontSize: "16px",
    color: "#495057",
  },
  logContent: {
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "4px",
    padding: "12px",
    maxHeight: "400px",
    overflowY: "auto",
    fontFamily: "monospace",
    fontSize: "12px",
  },
  logLine: {
    padding: "2px 0",
    color: "#495057",
    borderBottom: "1px solid #e9ecef",
  },
};

export default MigracaoCompleta;
