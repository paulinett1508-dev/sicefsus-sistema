// components/emenda/EmendaDetail/sections/DespesasTab.jsx
import React from "react";
import { emendaDetailStyles } from "../styles/emendaDetailStyles";
import { despesaCardStyles } from "../../../despesa/DespesaCard/despesaCardStyles";
import DespesaCardPlanejada from "../../../despesa/DespesaCard/DespesaCardPlanejada";
import DespesaCardExecutada from "../../../despesa/DespesaCard/DespesaCardExecutada";

const DespesasTab = ({
  despesasEmenda,
  metricas,
  formatCurrency,
  formatDate,
  handleNovaDespesa,
  handleEditarDespesa,
}) => {
  if (despesasEmenda.length === 0) {
    return (
      <div style={emendaDetailStyles.despesasContainer}>
        <div style={emendaDetailStyles.emptyDespesas}>
          <div style={emendaDetailStyles.emptyIcon}>📋</div>
          <p style={emendaDetailStyles.emptyText}>
            Nenhuma despesa cadastrada para esta emenda.
          </p>
          <button
            onClick={handleNovaDespesa}
            style={emendaDetailStyles.btnSuccess}
          >
            ➕ Cadastrar primeira despesa
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={emendaDetailStyles.despesasContainer}>
      <div style={emendaDetailStyles.despesasHeader}>
        <h3 style={emendaDetailStyles.despesasTitle}>
          💸 Despesas da Emenda ({metricas.totalDespesas})
        </h3>
        <button
          onClick={handleNovaDespesa}
          style={emendaDetailStyles.btnSuccess}
        >
          ➕ Nova Despesa
        </button>
      </div>

      {/* DESPESAS PLANEJADAS */}
      <div style={despesaCardStyles.despesasSection}>
        <h3 style={despesaCardStyles.despesasSectionTitle}>
          🟡 Despesas Planejadas (2)
        </h3>
        <div style={despesaCardStyles.despesasCardsGrid}>
          <DespesaCardPlanejada
            numero="1"
            descricao="Equipamentos hospitalares"
            valor="R$ 2.500,00"
            onClick={() => console.log("Clicou em planejada 1")}
          />
          <DespesaCardPlanejada
            numero="2"
            descricao="Medicamentos e suplementos"
            valor="R$ 2.500,00"
            onClick={() => console.log("Clicou em planejada 2")}
          />
        </div>
      </div>

      {/* DESPESAS EXECUTADAS */}
      <div style={despesaCardStyles.despesasSection}>
        <h3 style={despesaCardStyles.despesasSectionTitle}>
          🟢 Despesas Executadas ({despesasEmenda.length})
        </h3>
        <div style={despesaCardStyles.despesasCardsGrid}>
          {despesasEmenda.map((despesa) => (
            <DespesaCardExecutada
              key={despesa.id}
              numero={despesa.id}
              descricao={despesa.descricao}
              valor={formatCurrency(despesa.valor)}
              empenho={despesa.numeroEmpenho}
              data={formatDate(despesa.data)}
              natureza={despesa.naturezaDespesa}
              onClick={() => handleEditarDespesa(despesa)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DespesasTab;
