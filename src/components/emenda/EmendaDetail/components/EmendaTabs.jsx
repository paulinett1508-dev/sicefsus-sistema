// components/emenda/EmendaDetail/components/EmendaTabs.jsx
import React from "react";
import { emendaDetailStyles } from "../styles/emendaDetailStyles";

const EmendaTabs = ({ abaAtiva, setAbaAtiva, totalDespesas }) => {
  const tabs = [
    { id: "visao-geral", label: "Visão Geral", icon: "analytics" },
    { id: "despesas", label: `Despesas (${totalDespesas})`, icon: "receipt_long" },
    { id: "nova-despesa", label: "Nova Despesa", icon: "add_circle" },
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
          <span className="material-symbols-outlined" style={{ fontSize: 16, marginRight: 6, verticalAlign: "middle" }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default EmendaTabs;
