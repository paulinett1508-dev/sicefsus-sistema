// components/emenda/EmendaDetail/components/EmendaKPIs.jsx
import React from "react";
import { emendaDetailStyles, THEME_COLORS } from "../styles/emendaDetailStyles";

const EmendaKPIs = ({ metricas, formatCurrency }) => {
  const { SUCCESS, ERROR, PRIMARY } = THEME_COLORS;

  return (
    <div style={emendaDetailStyles.kpiSection}>
      <div style={emendaDetailStyles.kpiGrid}>
        <div style={emendaDetailStyles.kpiCard}>
          <div style={emendaDetailStyles.kpiIcon}>💰</div>
          <div style={emendaDetailStyles.kpiContent}>
            <div style={emendaDetailStyles.kpiValue}>
              {formatCurrency(metricas.valorTotal)}
            </div>
            <div style={emendaDetailStyles.kpiLabel}>Valor Total</div>
          </div>
        </div>

        <div style={emendaDetailStyles.kpiCard}>
          <div style={emendaDetailStyles.kpiIcon}>📊</div>
          <div style={emendaDetailStyles.kpiContent}>
            <div style={{ ...emendaDetailStyles.kpiValue, color: SUCCESS }}>
              {formatCurrency(metricas.valorExecutado)}
            </div>
            <div style={emendaDetailStyles.kpiLabel}>Executado</div>
          </div>
        </div>

        <div style={emendaDetailStyles.kpiCard}>
          <div style={emendaDetailStyles.kpiIcon}>💳</div>
          <div style={emendaDetailStyles.kpiContent}>
            <div
              style={{
                ...emendaDetailStyles.kpiValue,
                color: metricas.saldoDisponivel > 0 ? SUCCESS : ERROR,
              }}
            >
              {formatCurrency(metricas.saldoDisponivel)}
            </div>
            <div style={emendaDetailStyles.kpiLabel}>Saldo Disponível</div>
          </div>
        </div>

        <div style={emendaDetailStyles.kpiCard}>
          <div style={emendaDetailStyles.kpiIcon}>📈</div>
          <div style={emendaDetailStyles.kpiContent}>
            <div style={{ ...emendaDetailStyles.kpiValue, color: PRIMARY }}>
              {metricas.percentualExecutado?.toFixed(1)}%
            </div>
            <div style={emendaDetailStyles.kpiLabel}>% Executado</div>
          </div>
        </div>

        <div style={emendaDetailStyles.kpiCard}>
          <div style={emendaDetailStyles.kpiIcon}>💸</div>
          <div style={emendaDetailStyles.kpiContent}>
            <div style={emendaDetailStyles.kpiValue}>
              {metricas.totalDespesas}
            </div>
            <div style={emendaDetailStyles.kpiLabel}>Despesas</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmendaKPIs;
