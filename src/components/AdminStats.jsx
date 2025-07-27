// src/components/AdminStats.jsx - Estatísticas Conforme Padrão SICEFSUS
import React from "react";

const AdminStats = ({ users }) => {
  // ✅ CALCULAR ESTATÍSTICAS
  const calculateStats = () => {
    const total = users.length;
    const active = users.filter((u) => u.status === "ativo").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const pendingFirstAccess = users.filter((u) => u.primeiroAcesso).length;

    // Usuários que acessaram nas últimas 24h
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    const recentLogins = users.filter((u) => {
      if (!u.ultimoAcesso) return false;
      return u.ultimoAcesso.toDate() > dayAgo;
    }).length;

    return { total, active, admins, recentLogins, pendingFirstAccess };
  };

  const stats = calculateStats();

  const StatCard = ({ icon, value, label, color = "primary", subtext }) => (
    <div className={`stat-item ${color}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
      {subtext && <span className="stat-subtext">{subtext}</span>}
    </div>
  );

  return (
    <>
      <div className="stats-row">
        <StatCard value={stats.total} label="Total Usuários" color="primary" />

        <StatCard value={stats.active} label="Ativos" color="success" />

        <StatCard value={stats.admins} label="Admins" color="warning" />

        <StatCard value={stats.recentLogins} label="Login 24h" color="info" />

        {stats.pendingFirstAccess > 0 && (
          <StatCard
            value={stats.pendingFirstAccess}
            label="Primeiro Acesso"
            color="danger"
          />
        )}
      </div>

      {/* ✅ ESTILOS CONFORME PADRÃO SICEFSUS ORIGINAL */}
      <style>{`
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
        }

        .stat-item {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          border-left: 4px solid #007bff;
        }

        .stat-item.success {
          border-left-color: #28a745;
        }

        .stat-item.warning {
          border-left-color: #ffc107;
        }

        .stat-item.info {
          border-left-color: #17a2b8;
        }

        .stat-item.danger {
          border-left-color: #dc3545;
        }

        .stat-value {
          display: block;
          font-size: 1.8em;
          font-weight: 700;
          color: #2c3e50;
        }

        .stat-label {
          font-size: 0.9em;
          color: #6c757d;
          margin-top: 5px;
        }

        .stat-subtext {
          font-size: 0.8em;
          color: #adb5bd;
          margin-top: 3px;
          display: block;
        }

        @media (max-width: 768px) {
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
};

export default AdminStats;
