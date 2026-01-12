
// src/components/admin/UsersReportSection.jsx
import React, { useState, useMemo } from "react";

const UsersReportSection = ({ users, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Estatísticas
  const stats = useMemo(() => {
    const total = users.length;
    const ativos = users.filter((u) => u.status === "ativo").length;
    const inativos = users.filter((u) => u.status === "inativo").length;
    const admins = users.filter((u) => u.tipo === "admin").length;
    const gestores = users.filter((u) => u.tipo === "gestor").length;
    const operadores = users.filter((u) => u.tipo === "operador").length;

    return { total, ativos, inativos, admins, gestores, operadores };
  }, [users]);

  // Filtrar usuários
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        searchTerm === "" ||
        user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchTipo =
        filterTipo === "todos" || user.tipo === filterTipo;

      const matchStatus =
        filterStatus === "todos" || user.status === filterStatus;

      return matchSearch && matchTipo && matchStatus;
    });
  }, [users, searchTerm, filterTipo, filterStatus]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Carregando relatório...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Estatísticas */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--primary)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32 }}>group</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total de Usuários</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--success)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--success)" }}>check_circle</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.ativos}</div>
            <div style={styles.statLabel}>Usuários Ativos</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--error)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--error)" }}>pause_circle</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.inativos}</div>
            <div style={styles.statLabel}>Usuários Inativos</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--error)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--error)" }}>shield</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.admins}</div>
            <div style={styles.statLabel}>Administradores</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--warning)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--warning)" }}>account_balance</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.gestores}</div>
            <div style={styles.statLabel}>Gestores</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid var(--success)" }}>
          <div style={styles.statIcon}><span className="material-symbols-outlined" style={{ fontSize: 32, color: "var(--success)" }}>person</span></div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.operadores}</div>
            <div style={styles.statLabel}>Operadores</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Buscar por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos os tipos</option>
          <option value="admin">Administradores</option>
          <option value="gestor">Gestores</option>
          <option value="operador">Operadores</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={styles.select}
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Tabela */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Município</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.emptyMessage}>
                  Nenhum usuário encontrado com os filtros selecionados
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "var(--theme-surface)" : "var(--theme-surface-secondary)",
                  }}
                >
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>
                    <strong>{user.nome || "N/A"}</strong>
                  </td>
                  <td style={styles.td}>{user.email || "N/A"}</td>
                  <td style={styles.td}>
                    {user.municipio && user.uf ? (
                      <div>
                        {user.municipio}
                        <br />
                        <small style={{ color: "var(--theme-text-secondary)" }}>{user.uf}</small>
                      </div>
                    ) : (
                      <span style={{ color: "var(--theme-text-muted)" }}>N/A</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          user.tipo === "admin"
                            ? "var(--error)"
                            : user.tipo === "gestor"
                            ? "var(--warning)"
                            : "var(--success)",
                        color: user.tipo === "gestor" ? "var(--warning-800)" : "var(--white)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 4, verticalAlign: "middle" }}>
                        {user.tipo === "admin" ? "shield" : user.tipo === "gestor" ? "account_balance" : "person"}
                      </span>
                      {user.tipo?.toUpperCase() || "N/A"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          user.status === "ativo" ? "var(--success)" : "var(--secondary)",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 4, verticalAlign: "middle" }}>
                        {user.status === "ativo" ? "check_circle" : "pause_circle"}
                      </span>
                      {user.status === "ativo" ? "ATIVO" : "INATIVO"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {user.criadoEm?.toDate
                      ? new Date(user.criadoEm.toDate()).toLocaleDateString(
                          "pt-BR"
                        )
                      : "N/A"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div style={styles.summary}>
        Exibindo <strong>{filteredUsers.length}</strong> de{" "}
        <strong>{users.length}</strong> usuários
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "var(--theme-surface)",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px var(--theme-shadow)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    backgroundColor: "var(--theme-surface-secondary)",
    padding: "16px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  statIcon: {
    fontSize: "32px",
  },

  statContent: {
    flex: 1,
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--theme-text)",
  },

  statLabel: {
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
  },

  filters: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: "12px",
    marginBottom: "20px",
  },

  searchInput: {
    padding: "10px 15px",
    border: "1px solid var(--theme-border)",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
  },

  select: {
    padding: "10px 15px",
    border: "1px solid var(--theme-border)",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
  },

  tableContainer: {
    overflowX: "auto",
    marginBottom: "16px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "12px",
    color: "var(--theme-text-secondary)",
    textTransform: "uppercase",
    backgroundColor: "var(--theme-surface-secondary)",
    borderBottom: "2px solid var(--theme-border)",
  },

  td: {
    padding: "12px",
    fontSize: "13px",
    borderBottom: "1px solid var(--theme-border)",
  },

  badge: {
    fontSize: "10px",
    color: "var(--white)",
    padding: "4px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "inline-block",
  },

  emptyMessage: {
    textAlign: "center",
    padding: "40px",
    color: "var(--theme-text-secondary)",
    fontStyle: "italic",
  },

  summary: {
    fontSize: "14px",
    color: "var(--theme-text-secondary)",
    textAlign: "center",
    paddingTop: "12px",
    borderTop: "1px solid var(--theme-border)",
  },

  loading: {
    textAlign: "center",
    padding: "40px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--theme-border)",
    borderTop: "3px solid var(--primary)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
};

export default UsersReportSection;
