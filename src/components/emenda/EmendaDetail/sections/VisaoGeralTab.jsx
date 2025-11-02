// components/emenda/EmendaDetail/sections/VisaoGeralTab.jsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { emendaDetailStyles, THEME_COLORS } from "../styles/emendaDetailStyles";

const VisaoGeralTab = ({
  emenda,
  metricas,
  dadosExecucao,
  dadosLinha,
  formatCurrency,
  handleNovaDespesa,
  setAbaAtiva,
  onEditarEmenda,
}) => {
  const { ACCENT } = THEME_COLORS;

  return (
    <div style={emendaDetailStyles.visaoGeralContainer}>
      {/* Gráficos */}
      <div style={emendaDetailStyles.chartsGrid}>
        <div style={emendaDetailStyles.chartCard}>
          <h3 style={emendaDetailStyles.chartTitle}>
            📊 Distribuição de Execução
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dadosExecucao}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosExecucao.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={emendaDetailStyles.chartCard}>
          <h3 style={emendaDetailStyles.chartTitle}>
            📈 Despesas ao Longo do Tempo
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosLinha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={ACCENT}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detalhes da Emenda */}
      <div style={emendaDetailStyles.detalhesGrid}>
        <div style={emendaDetailStyles.detalheCard}>
          <h4 style={emendaDetailStyles.detalheTitle}>📋 Informações Gerais</h4>
          <div style={emendaDetailStyles.detalheContent}>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Número:</span>
              <span style={emendaDetailStyles.detalheValue}>
                {emenda.numero}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Emenda:</span>
              <span style={emendaDetailStyles.detalheValue}>
                {emenda.emenda}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Tipo:</span>
              <span style={emendaDetailStyles.detalheValue}>{emenda.tipo}</span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Funcional:</span>
              <span style={emendaDetailStyles.detalheValue}>
                {emenda.funcional}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>CNPJ:</span>
              <span style={emendaDetailStyles.detalheValue}>{emenda.cnpj}</span>
            </div>
          </div>
        </div>

        <div style={emendaDetailStyles.detalheCard}>
          <h4 style={emendaDetailStyles.detalheTitle}>📊 Estatísticas</h4>
          <div style={emendaDetailStyles.detalheContent}>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>
                Total de Despesas:
              </span>
              <span style={emendaDetailStyles.detalheValue}>
                {metricas.totalDespesas}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>
                Média por Despesa:
              </span>
              <span style={emendaDetailStyles.detalheValue}>
                {formatCurrency(
                  metricas.totalDespesas > 0
                    ? metricas.valorExecutado / metricas.totalDespesas
                    : 0,
                )}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Pendentes:</span>
              <span style={emendaDetailStyles.detalheValue}>
                {metricas.despesasPendentes}
              </span>
            </div>
            <div style={emendaDetailStyles.detalheRow}>
              <span style={emendaDetailStyles.detalheLabel}>Aprovadas:</span>
              <span style={emendaDetailStyles.detalheValue}>
                {metricas.despesasAprovadas}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div style={emendaDetailStyles.acoesRapidas}>
        <h4 style={emendaDetailStyles.acoesTitle}>⚡ Ações Rápidas</h4>
        <div style={emendaDetailStyles.acoesGrid}>
          <button
            onClick={handleNovaDespesa}
            style={emendaDetailStyles.acaoButton}
          >
            ➕ Nova Despesa
          </button>
          <button
            onClick={() => setAbaAtiva("despesas")}
            style={emendaDetailStyles.acaoButton}
          >
            📋 Ver Todas as Despesas
          </button>
          <button
            onClick={() => onEditarEmenda(emenda)}
            style={emendaDetailStyles.acaoButton}
          >
            ✏️ Editar Emenda
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisaoGeralTab;
