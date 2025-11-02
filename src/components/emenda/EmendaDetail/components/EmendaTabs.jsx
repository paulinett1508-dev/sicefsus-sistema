// components/emenda/EmendaDetail/components/EmendaTabs.jsx
import React from "react";
import { emendaDetailStyles } from "../styles/emendaDetailStyles";

const EmendaTabs = ({ abaAtiva, setAbaAtiva, totalDespesas }) => {
  const tabs = [
    { id: "visao-geral", label: "📊 Visão Geral" },
    { id: "despesas", label: `💸 Despesas (${totalDespesas})` },
    { id: "nova-despesa", label: "➕ Nova Despesa" },
  ];

  return (
    <div style={emendaDetailStyles.tabsHeader}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            ...emendaDetailStyles.tab,
            ...(abaAtiva === tab.id ? emendaDetailStyles.tabActive : {}),
          }}
          onClick={() => setAbaAtiva(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EmendaTabs;
