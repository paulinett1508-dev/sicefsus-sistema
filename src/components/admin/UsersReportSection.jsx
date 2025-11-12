
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
        <div style={{ ...styles.statCard, borderLeft: "4px solid #007bff" }}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.total}</div>
            <div style={styles.statLabel}>Total de Usuários</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #28a745" }}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.ativos}</div>
            <div style={styles.statLabel}>Usuários Ativos</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #dc3545" }}>
          <div style={styles.statIcon}>⏸️</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.inativos}</div>
            <div style={styles.statLabel}>Usuários Inativos</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #dc3545" }}>
          <div style={styles.statIcon}>🔑</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.admins}</div>
            <div style={styles.statLabel}>Administradores</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #ffc107" }}>
          <div style={styles.statIcon}>🏛️</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.gestores}</div>
            <div style={styles.statLabel}>Gestores</div>
          </div>
        </div>

        <div style={{ ...styles.statCard, borderLeft: "4px solid #28a745" }}>
          <div style={styles.statIcon}>👤</div>
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
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
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
                        <small style={{ color: "#666" }}>{user.uf}</small>
                      </div>
                    ) : (
                      <span style={{ color: "#999" }}>N/A</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          user.tipo === "admin"
                            ? "#dc3545"
                            : user.tipo === "gestor"
                            ? "#ffc107"
                            : "#28a745",
                      }}
                    >
                      {user.tipo === "admin"
                        ? "🔑 ADMIN"
                        : user.tipo === "gestor"
                        ? "🏛️ GESTOR"
                        : "👤 OPERADOR"}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.badge,
                        backgroundColor:
                          user.status === "ativo" ? "#28a745" : "#6c757d",
                      }}
                    >
                      {user.status === "ativo" ? "✅ ATIVO" : "⏸️ INATIVO"}
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
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    backgroundColor: "#f8f9fa",
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
    color: "#333",
  },

  statLabel: {
    fontSize: "12px",
    color: "#666",
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
    border: "1px solid #ced4da",
    borderRadius: "5px",
    fontSize: "14px",
  },

  select: {
    padding: "10px 15px",
    border: "1px solid #ced4da",
    borderRadius: "5px",
    fontSize: "14px",
    backgroundColor: "white",
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
    color: "#495057",
    textTransform: "uppercase",
    backgroundColor: "#f8f9fa",
    borderBottom: "2px solid #e9ecef",
  },

  td: {
    padding: "12px",
    fontSize: "13px",
    borderBottom: "1px solid #e9ecef",
  },

  badge: {
    fontSize: "10px",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "inline-block",
  },

  emptyMessage: {
    textAlign: "center",
    padding: "40px",
    color: "#6c757d",
    fontStyle: "italic",
  },

  summary: {
    fontSize: "14px",
    color: "#666",
    textAlign: "center",
    paddingTop: "12px",
    borderTop: "1px solid #e9ecef",
  },

  loading: {
    textAlign: "center",
    padding: "40px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f3f3",
    borderTop: "3px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 16px",
  },
};

export default UsersReportSection;
