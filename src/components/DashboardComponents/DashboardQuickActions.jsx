// src/components/DashboardComponents/DashboardQuickActions.jsx
// 🎯 Ações Rápidas do Dashboard

import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardQuickActions = ({ userRole = "operador" }) => {
  const navigate = useNavigate();

  const acoes = [
    {
      id: "nova-despesa",
      titulo: "Nova Despesa",
      icone: "➕",
      descricao: "Registrar despesa",
      cor: "#27AE60",
      rota: "/despesas/novo",
      permissoes: ["admin", "operador"],
    },
    {
      id: "ver-emendas",
      titulo: "Emendas",
      icone: "📋",
      descricao: "Listar todas",
      cor: "#3498DB",
      rota: "/emendas",
      permissoes: ["admin", "operador"],
    },
    {
      id: "relatorios",
      titulo: "Relatórios",
      icone: "📊",
      descricao: "Gerar relatório",
      cor: "#9B59B6",
      rota: "/relatorios",
      permissoes: ["admin", "operador"],
    },
    {
      id: "nova-emenda",
      titulo: "Nova Emenda",
      icone: "📝",
      descricao: "Cadastrar emenda",
      cor: "#F39C12",
      rota: "/emendas/novo",
      permissoes: ["admin"],
    },
    {
      id: "usuarios",
      titulo: "Usuários",
      icone: "👥",
      descricao: "Gerenciar",
      cor: "#E74C3C",
      rota: "/usuarios",
      permissoes: ["admin"],
    },
  ];

  // Filtrar ações por permissão
  const acoesFiltradas = acoes.filter((acao) =>
    acao.permissoes.includes(userRole),
  );

  const handleAcaoClick = (rota) => {
    navigate(rota);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>⚡ Ações Rápidas</h3>
        <span style={styles.subtitle}>Acesso direto às funcionalidades</span>
      </div>

      <div style={styles.acoesGrid}>
        {acoesFiltradas.map((acao) => (
          <div
            key={acao.id}
            style={{
              ...styles.acaoCard,
              borderTop: `4px solid ${acao.cor}`,
            }}
            onClick={() => handleAcaoClick(acao.rota)}
          >
            <div
              style={{
                ...styles.acaoIcone,
                backgroundColor: `${acao.cor}15`,
              }}
            >
              <span style={{ ...styles.icone, color: acao.cor }}>
                {acao.icone}
              </span>
            </div>
            <div style={styles.acaoConteudo}>
              <span style={styles.acaoTitulo}>{acao.titulo}</span>
              <span style={styles.acaoDescricao}>{acao.descricao}</span>
            </div>
            <div style={styles.acaoSeta}>
              <span style={styles.setaIcone}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e9ecef",
    marginBottom: "16px",
  },
  header: {
    marginBottom: "20px",
    borderBottom: "1px solid #f1f3f4",
    paddingBottom: "12px",
  },
  title: {
    margin: "0 0 3px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  subtitle: {
    color: "#6c757d",
    fontSize: "13px",
    fontWeight: "400",
  },
  acoesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
  },
  acaoCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  acaoIcone: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  icone: {
    fontSize: "24px",
  },
  acaoConteudo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  acaoTitulo: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#2c3e50",
  },
  acaoDescricao: {
    fontSize: "12px",
    color: "#6c757d",
  },
  acaoSeta: {
    fontSize: "18px",
    color: "#cbd5e0",
    transition: "all 0.2s ease",
  },
  setaIcone: {
    display: "inline-block",
  },
};

export default DashboardQuickActions;
