// src/components/UsersTable.jsx - Tabela de Usuários Conforme Padrão SICEFSUS
import React from "react";

const UsersTable = ({ 
  users, 
  onEdit, 
  onResetPassword, 
  onDelete, 
  saving = false 
}) => {

  const formatLastAccess = (lastAccess) => {
    if (!lastAccess) {
      return <span className="never-accessed">Nunca acessou</span>;
    }
    return <span>{lastAccess.toDate().toLocaleString("pt-BR")}</span>;
  };

  const formatLocation = (user) => {
    if (user.role === "admin") {
      return "🌐 Acesso Total";
    }

    if (user.municipio && user.uf) {
      return `${user.municipio}/${user.uf.toUpperCase()}`;
    }

    return "⚠️ Não configurado";
  };

  const formatStatus = (status) => {
    const statusMap = {
      ativo: { label: "✅ Ativo", className: "ativo" },
      inativo: { label: "⏸️ Inativo", className: "inativo" },
      bloqueado: { label: "🚫 Bloqueado", className: "bloqueado" }
    };

    const statusInfo = statusMap[status] || statusMap.ativo;
    return <span className={`status ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const formatRole = (role) => {
    return (
      <span className={`badge ${role}`}>
        {role === "admin" ? "👑 Admin" : "👤 Usuário"}
      </span>
    );
  };

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Clique em "Novo Usuário" para adicionar o primeiro usuário ao sistema.</p>
      </div>
    );
  }

  return (
    <>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Departamento</th>
              <th>Município/UF</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.primeiroAcesso ? "first-access" : ""}>
                <td>
                  <div className="user-name">
                    {user.nome}
                    {user.primeiroAcesso && (
                      <span className="first-access-badge">🔑 Primeiro acesso</span>
                    )}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{formatRole(user.role)}</td>
                <td>{formatStatus(user.status)}</td>
                <td>{user.departamento || "-"}</td>
                <td>{formatLocation(user)}</td>
                <td>
                  <div className="access-info">
                    {formatLastAccess(user.ultimoAcesso)}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(user)}
                      title="Editar dados"
                      disabled={saving}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-reset"
                      onClick={() => onResetPassword(user)}
                      title={user.primeiroAcesso ? "Reenviar email de primeiro acesso" : "Enviar reset de senha"}
                      disabled={saving}
                    >
                      🔑
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(user)}
                      title="Excluir usuário"
                      disabled={saving}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ ESTILOS CONFORME PADRÃO SICEFSUS ORIGINAL */}
      <style>{`
        .users-table {
          overflow-x: auto;
        }

        .users-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0;
        }

        .users-table th,
        .users-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .users-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .users-table tr:hover {
          background: #f8f9fa;
        }

        .first-access {
          background: #fff8e1 !important;
        }

        .first-access:hover {
          background: #fff3cd !important;
        }

        .user-name {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .first-access-badge {
          background: #fff3cd;
          color: #856404;
          font-size: 0.75em;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 500;
          width: fit-content;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 500;
        }

        .badge.admin {
          background: #dc3545;
          color: white;
        }

        .badge.user {
          background: #28a745;
          color: white;
        }

        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.85em;
          font-weight: 500;
        }

        .status.ativo {
          background: #d4edda;
          color: #155724;
        }

        .status.inativo {
          background: #fff3cd;
          color: #856404;
        }

        .status.bloqueado {
          background: #f8d7da;
          color: #721c24;
        }

        .access-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .never-accessed {
          color: #dc3545;
          font-style: italic;
          font-size: 0.9em;
        }

        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .btn-edit,
        .btn-reset,
        .btn-delete {
          background: none;
          border: none;
          font-size: 1.2em;
          cursor: pointer;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .btn-edit:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        .btn-reset:hover:not(:disabled) {
          background: #17a2b8;
          color: white;
        }

        .btn-delete:hover:not(:disabled) {
          background: #dc3545;
          color: white;
        }

        .btn-edit:disabled,
        .btn-reset:disabled,
        .btn-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 3em;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #495057;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .users-table {
            font-size: 0.9em;
          }

          .action-buttons {
            flex-direction: column;
          }

          .users-table th,
          .users-table td {
            padding: 8px;
          }
        }
      `}</style>
    </>
  );
};

export default UsersTable;// src/components/UsersTable.jsx - Tabela de Usuários Isolada
import React from "react";

const UsersTable = ({ 
  users, 
  onEdit, 
  onResetPassword, 
  onDelete, 
  saving = false 
}) => {

  const formatLastAccess = (lastAccess) => {
    if (!lastAccess) {
      return <span className="never-accessed">Nunca acessou</span>;
    }
    return <span>{lastAccess.toDate().toLocaleString("pt-BR")}</span>;
  };

  const formatLocation = (user) => {
    if (user.role === "admin") {
      return "🌐 Acesso Total";
    }

    if (user.municipio && user.uf) {
      return `${user.municipio}/${user.uf.toUpperCase()}`;
    }

    return "⚠️ Não configurado";
  };

  const formatStatus = (status) => {
    const statusMap = {
      ativo: { label: "✅ Ativo", className: "ativo" },
      inativo: { label: "⏸️ Inativo", className: "inativo" },
      bloqueado: { label: "🚫 Bloqueado", className: "bloqueado" }
    };

    const statusInfo = statusMap[status] || statusMap.ativo;
    return <span className={`status ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const formatRole = (role) => {
    return (
      <span className={`badge ${role}`}>
        {role === "admin" ? "👑 Admin" : "👤 Usuário"}
      </span>
    );
  };

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">👥</div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Clique em "Novo Usuário" para adicionar o primeiro usuário ao sistema.</p>
      </div>
    );
  }

  return (
    <div className="users-table">
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Departamento</th>
              <th>Município/UF</th>
              <th>Último Acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.primeiroAcesso ? "first-access" : ""}>
                <td>
                  <div className="user-name">
                    {user.nome}
                    {user.primeiroAcesso && (
                      <span className="first-access-badge">🔑 Primeiro acesso</span>
                    )}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{formatRole(user.role)}</td>
                <td>{formatStatus(user.status)}</td>
                <td>{user.departamento || "-"}</td>
                <td>{formatLocation(user)}</td>
                <td>
                  <div className="access-info">
                    {formatLastAccess(user.ultimoAcesso)}
                  </div>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => onEdit(user)}
                      title="Editar dados"
                      disabled={saving}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-reset"
                      onClick={() => onResetPassword(user)}
                      title={user.primeiroAcesso ? "Reenviar email de primeiro acesso" : "Enviar reset de senha"}
                      disabled={saving}
                    >
                      🔑
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(user)}
                      title="Excluir usuário"
                      disabled={saving}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;