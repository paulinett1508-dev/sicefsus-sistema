// src/components/logs/LogsPage.jsx
// Pagina de logs acessivel para Admin e Gestor

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../../context/UserContext";
import { getPermissionsByRole } from "../../config/permissions";
import { auditService } from "../../services/auditService";
import LogsSection from "../admin/LogsSection";

const LogsPage = () => {
  const { user: usuario } = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: ""
  });

  // Verificar permissao de ver logs
  const permissions = usuario?.tipo ? getPermissionsByRole(usuario.tipo) : {};
  const podeVerLogs = permissions.podeVerLogs === true;

  // Carregar logs filtrados por municipio (para gestor)
  const carregarLogs = useCallback(async () => {
    if (!usuario || !podeVerLogs) return;

    setLoading(true);
    try {
      const filtros = {
        limit: 500
      };

      // Se for gestor, filtrar por municipio
      if (usuario.tipo === "gestor") {
        filtros.municipio = usuario.municipio;
        filtros.uf = usuario.uf;
      }

      console.log("Carregando logs com filtros:", filtros);
      const logsData = await auditService.getLogs(filtros);

      setLogs(logsData);
      console.log(`${logsData.length} logs carregados`);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  }, [usuario, podeVerLogs]);

  useEffect(() => {
    carregarLogs();
  }, [carregarLogs]);

  // Verificar permissao
  if (!podeVerLogs) {
    return (
      <div style={styles.accessDenied}>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: "var(--error)" }}>lock</span>
        <h2 style={styles.accessDeniedTitle}>Acesso Negado</h2>
        <p style={styles.accessDeniedText}>Voce nao tem permissao para visualizar os logs do sistema.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span className="material-symbols-outlined" style={{ fontSize: 28, marginRight: 10, verticalAlign: "middle" }}>assignment</span>
          Logs de Auditoria
        </h1>
        {usuario.tipo === "gestor" && (
          <div style={styles.filterBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6 }}>location_on</span>
            Filtrando: {usuario.municipio}/{usuario.uf?.toUpperCase()}
          </div>
        )}
      </div>

      {usuario.tipo === "gestor" && (
        <div style={styles.infoBox}>
          <span className="material-symbols-outlined" style={{ fontSize: 18, marginRight: 8 }}>info</span>
          <span>Como Gestor, voce visualiza apenas os logs relacionados ao seu municipio ({usuario.municipio}/{usuario.uf?.toUpperCase()}).</span>
        </div>
      )}

      <LogsSection
        logs={logs}
        logFilters={logFilters}
        setLogFilters={setLogFilters}
        onAtualizarLogs={carregarLogs}
        loading={loading}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "16px"
  },
  title: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "var(--theme-text)",
    display: "flex",
    alignItems: "center",
    margin: 0
  },
  filterBadge: {
    display: "flex",
    alignItems: "center",
    padding: "10px 18px",
    backgroundColor: "var(--warning-100, #fef3c7)",
    color: "var(--warning-700, #b45309)",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500",
    border: "1px solid var(--warning-200, #fde68a)"
  },
  infoBox: {
    display: "flex",
    alignItems: "center",
    padding: "14px 18px",
    backgroundColor: "var(--info-50, #eff6ff)",
    color: "var(--info-700, #1d4ed8)",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid var(--info-200, #bfdbfe)"
  },
  accessDenied: {
    textAlign: "center",
    padding: "80px 24px",
    color: "var(--theme-text-secondary)"
  },
  accessDeniedTitle: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--theme-text)",
    marginTop: "16px",
    marginBottom: "8px"
  },
  accessDeniedText: {
    fontSize: "16px",
    color: "var(--theme-text-secondary)",
    margin: 0
  }
};

export default LogsPage;
