// src/components/admin/MigracaoDespesas.jsx
// 🔄 COMPONENTE PARA MIGRAÇÃO DE DESPESAS VIA INTERFACE WEB
// ✅ Usa autenticação do usuário logado (com permissões de admin)

import React, { useState } from "react";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

const MigracaoDespesas = () => {
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState({ atual: 0, total: 0 });
  const [resultado, setResultado] = useState(null);
  const [log, setLog] = useState([]);

  const adicionarLog = (mensagem) => {
    setLog((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()} - ${mensagem}`,
    ]);
  };

  const migrarDespesas = async () => {
    if (
      !window.confirm(
        '⚠️ Deseja iniciar a migração? Esta operação adicionará o campo "status" em todas as despesas.',
      )
    ) {
      return;
    }

    setProcessando(true);
    setResultado(null);
    setLog([]);

    const stats = {
      total: 0,
      migradas: 0,
      jaTemStatus: 0,
      erros: 0,
    };

    try {
      adicionarLog("📊 Buscando despesas no banco...");

      const despesasRef = collection(db, "despesas");
      const snapshot = await getDocs(despesasRef);

      stats.total = snapshot.size;
      setProgresso({ atual: 0, total: stats.total });
      adicionarLog(`✅ Encontradas ${stats.total} despesas`);

      if (stats.total === 0) {
        adicionarLog("ℹ️ Nenhuma despesa para migrar");
        setResultado(stats);
        return;
      }

      const batchSize = 500;
      let batch = writeBatch(db);
      let operacoesNoBatch = 0;
      let batchCount = 1;

      adicionarLog("🔄 Processando despesas...");

      for (const docSnap of snapshot.docs) {
        const despesa = docSnap.data();
        const despesaId = docSnap.id;

        // Atualizar progresso
        setProgresso((prev) => ({ ...prev, atual: prev.atual + 1 }));

        // Verificar se já tem status
        if (despesa.status) {
          stats.jaTemStatus++;
          continue;
        }

        // Determinar status
        const novoStatus = determinarStatus(despesa);

        // Adicionar ao batch
        const despesaRef = doc(db, "despesas", despesaId);
        batch.update(despesaRef, {
          status: novoStatus,
          migradoEm: new Date().toISOString(),
          migradoPor: "migracao-web-v1",
        });

        operacoesNoBatch++;
        stats.migradas++;

        // Executar batch quando atingir o limite
        if (operacoesNoBatch === batchSize) {
          adicionarLog(
            `💾 Salvando lote ${batchCount}... (${stats.migradas} despesas)`,
          );
          await batch.commit();
          adicionarLog(`✅ Lote ${batchCount} salvo!`);

          batch = writeBatch(db);
          operacoesNoBatch = 0;
          batchCount++;
        }
      }

      // Executar último batch
      if (operacoesNoBatch > 0) {
        adicionarLog(`💾 Salvando lote final ${batchCount}...`);
        await batch.commit();
        adicionarLog(`✅ Lote ${batchCount} salvo!`);
      }

      adicionarLog("✅ Migração concluída com sucesso!");
      setResultado(stats);
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      adicionarLog(`❌ ERRO: ${error.message}`);
      stats.erros++;
      setResultado(stats);
    } finally {
      setProcessando(false);
    }
  };

  const determinarStatus = (despesa) => {
    if (despesa.numeroEmpenho && despesa.numeroNota) return "EXECUTADA";
    if (despesa.cnpjFornecedor) return "EXECUTADA";
    if (despesa.dataEmpenho) return "EXECUTADA";
    if (despesa.fornecedor) return "EXECUTADA";
    if (despesa.discriminacao && despesa.discriminacao.length > 50)
      return "EXECUTADA";
    return "EXECUTADA";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔄 Migração de Despesas</h2>
        <p style={styles.description}>
          Este processo adicionará o campo <code>status</code> em todas as
          despesas que ainda não possuem este campo.
        </p>

        <div style={styles.warning}>
          <strong>⚠️ Atenção:</strong> Esta operação deve ser executada apenas
          UMA vez.
        </div>

        <button
          onClick={migrarDespesas}
          disabled={processando}
          style={{
            ...styles.button,
            ...(processando ? styles.buttonDisabled : {}),
          }}
        >
          {processando ? "⏳ Processando..." : "🚀 Iniciar Migração"}
        </button>

        {processando && (
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progresso.total > 0 ? (progresso.atual / progresso.total) * 100 : 0}%`,
                }}
              />
            </div>
            <p style={styles.progressText}>
              {progresso.atual} / {progresso.total} despesas processadas
            </p>
          </div>
        )}

        {resultado && (
          <div style={styles.resultado}>
            <h3 style={styles.resultadoTitle}>📊 Resultado da Migração</h3>
            <table style={styles.table}>
              <tbody>
                <tr>
                  <td style={styles.tableLabel}>Total de despesas:</td>
                  <td style={styles.tableValue}>{resultado.total}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>✅ Migradas:</td>
                  <td style={{ ...styles.tableValue, color: "#28a745" }}>
                    {resultado.migradas}
                  </td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>⏭️ Já tinham status:</td>
                  <td style={styles.tableValue}>{resultado.jaTemStatus}</td>
                </tr>
                <tr>
                  <td style={styles.tableLabel}>❌ Erros:</td>
                  <td
                    style={{
                      ...styles.tableValue,
                      color: resultado.erros > 0 ? "#dc3545" : "#666",
                    }}
                  >
                    {resultado.erros}
                  </td>
                </tr>
              </tbody>
            </table>

            {resultado.migradas > 0 && (
              <div style={styles.successMessage}>
                ✅ Migração concluída! Verifique as despesas no sistema.
              </div>
            )}
          </div>
        )}

        {log.length > 0 && (
          <div style={styles.logContainer}>
            <h3 style={styles.logTitle}>📝 Log da Migração</h3>
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
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    margin: "0 0 16px 0",
    color: "#154360",
    fontSize: "24px",
  },
  description: {
    color: "#666",
    marginBottom: "20px",
    lineHeight: "1.5",
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
    padding: "12px 24px",
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
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "6px",
  },
  resultadoTitle: {
    margin: "0 0 16px 0",
    fontSize: "18px",
    color: "#154360",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableLabel: {
    padding: "8px",
    fontWeight: "bold",
    color: "#495057",
    width: "60%",
  },
  tableValue: {
    padding: "8px",
    textAlign: "right",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#154360",
  },
  successMessage: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#d4edda",
    border: "1px solid #c3e6cb",
    borderRadius: "4px",
    color: "#155724",
    textAlign: "center",
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
    maxHeight: "300px",
    overflowY: "auto",
    fontFamily: "monospace",
    fontSize: "12px",
  },
  logLine: {
    padding: "4px 0",
    color: "#495057",
    borderBottom: "1px solid #e9ecef",
  },
};

export default MigracaoDespesas;
