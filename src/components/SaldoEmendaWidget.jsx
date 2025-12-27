import React, { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const SaldoEmendaWidget = ({ 
  emendaId, 
  valorDespesaAtual = 0, 
  compacto = false 
}) => {
  const [emenda, setEmenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Carregar dados da emenda
  useEffect(() => {
    const carregarEmenda = async () => {
      if (!emendaId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const emendaDoc = await getDoc(doc(db, "emendas", emendaId));

        if (emendaDoc.exists()) {
          const emendaData = { id: emendaDoc.id, ...emendaDoc.data() };
          setEmenda(emendaData);
        } else {
          setError("Emenda não encontrada");
        }
      } catch (err) {
        console.error("Erro ao carregar emenda:", err);
        setError("Erro ao carregar emenda");
      } finally {
        setLoading(false);
      }
    };

    carregarEmenda();
  }, [emendaId]);

  // ✅ Formatação de moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  // ✅ Calcular valores
  const valorTotal = emenda?.valorTotal || emenda?.valorRecurso || 0;
  const valorExecutado = emenda?.valorExecutado || 0;
  const saldoAtual = valorTotal - valorExecutado;
  const saldoAposNovaDesp = saldoAtual - valorDespesaAtual;
  const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

  // ✅ Determinar status do saldo
  const getStatusSaldo = () => {
    if (saldoAposNovaDesp < 0) {
      return { cor: "#dc3545", texto: "Saldo Insuficiente", icon: <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>warning</span> };
    } else if (saldoAposNovaDesp < valorTotal * 0.1) {
      return { cor: "#fd7e14", texto: "Saldo Baixo", icon: <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>bolt</span> };
    } else {
      return { cor: "#28a745", texto: "Saldo OK", icon: <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: "middle" }}>check_circle</span> };
    }
  };

  if (loading) {
    return (
      <div style={styles.widget}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <span>Carregando saldo da emenda...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.widget, ...styles.error }}>
        <span><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>cancel</span> {error}</span>
      </div>
    );
  }

  if (!emenda) {
    return (
      <div style={{ ...styles.widget, ...styles.warning }}>
        <span><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>warning</span> Selecione uma emenda para ver o saldo</span>
      </div>
    );
  }

  const status = getStatusSaldo();

  if (compacto) {
    return (
      <div style={{ ...styles.widget, ...styles.compacto }}>
        <div style={styles.compactoInfo}>
          <span style={styles.compactoLabel}>Saldo:</span>
          <span style={{ ...styles.compactoValor, color: status.cor }}>
            {formatCurrency(saldoAtual)}
          </span>
          {valorDespesaAtual > 0 && (
            <span style={styles.compactoApos}>
              → {formatCurrency(saldoAposNovaDesp)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.widget}>
      <div style={styles.header}>
        <h4 style={styles.title}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 6, verticalAlign: "middle" }}>payments</span> Saldo da Emenda {emenda.numero || emenda.numeroEmenda}
        </h4>
        <span style={{ ...styles.status, backgroundColor: status.cor }}>
          {status.icon} {status.texto}
        </span>
      </div>

      <div style={styles.grid}>
        <div style={styles.item}>
          <span style={styles.label}>Valor Total:</span>
          <span style={styles.valor}>{formatCurrency(valorTotal)}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Executado:</span>
          <span style={styles.valor}>{formatCurrency(valorExecutado)}</span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>Saldo Atual:</span>
          <span style={{ ...styles.valor, color: "#28a745" }}>
            {formatCurrency(saldoAtual)}
          </span>
        </div>

        <div style={styles.item}>
          <span style={styles.label}>% Executado:</span>
          <span style={styles.valor}>{percentualExecutado.toFixed(1)}%</span>
        </div>
      </div>

      {valorDespesaAtual > 0 && (
        <div style={styles.simulacao}>
          <div style={styles.simulacaoHeader}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>analytics</span> Simulação com Nova Despesa
          </div>
          <div style={styles.simulacaoContent}>
            <span style={styles.simulacaoLabel}>
              Valor da Despesa: {formatCurrency(valorDespesaAtual)}
            </span>
            <span style={styles.simulacaoLabel}>
              Saldo Após Despesa:{" "}
              <span style={{ color: status.cor, fontWeight: "bold" }}>
                {formatCurrency(saldoAposNovaDesp)}
              </span>
            </span>
          </div>
        </div>
      )}

      <div style={styles.info}>
        <div style={styles.infoRow}>
          <span>Parlamentar: {emenda.parlamentar || "Não informado"}</span>
        </div>
        <div style={styles.infoRow}>
          <span>Município: {emenda.municipio || "Não informado"}</span>
        </div>
      </div>
    </div>
  );
};

// ✅ Estilos do componente
const styles = {
  widget: {
    backgroundColor: "#f8f9fa",
    border: "2px solid #dee2e6",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
    fontFamily: "Arial, sans-serif",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    color: "#6c757d",
    padding: "20px",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid #e3e3e3",
    borderTop: "2px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  error: {
    backgroundColor: "#f8d7da",
    borderColor: "#f5c6cb",
    color: "#721c24",
  },
  warning: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    color: "#856404",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: "600",
    color: "#2563EB",
  },
  status: {
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 8px",
    borderRadius: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "16px",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },
  valor: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  simulacao: {
    backgroundColor: "#e3f2fd",
    border: "1px solid #bbdefb",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "16px",
  },
  simulacaoHeader: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1976d2",
    marginBottom: "8px",
  },
  simulacaoContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  simulacaoLabel: {
    fontSize: "13px",
    color: "#1976d2",
  },
  info: {
    backgroundColor: "white",
    border: "1px solid #e9ecef",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    color: "#495057",
  },
  infoRow: {
    marginBottom: "4px",
  },
  // Estilos para versão compacta
  compacto: {
    padding: "8px 12px",
    marginBottom: "12px",
  },
  compactoInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  compactoLabel: {
    fontSize: "12px",
    color: "#6c757d",
    fontWeight: "500",
  },
  compactoValor: {
    fontSize: "14px",
    fontWeight: "600",
  },
  compactoApos: {
    fontSize: "12px",
    color: "#6c757d",
  },
};

// CSS para animação do spinner
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default SaldoEmendaWidget;