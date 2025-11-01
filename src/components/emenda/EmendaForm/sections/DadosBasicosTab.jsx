// src/components/emenda/EmendaForm/sections/DadosBasicosTab.jsx
// Aba que agrupa todas as seções de dados básicos

import React from "react";
import Identificacao from "./Identificacao";
import DadosBasicos from "./DadosBasicos";
import DadosBancarios from "./DadosBancarios";
import Cronograma from "./Cronograma";
import InformacoesComplementares from "./InformacoesComplementares";

const DadosBasicosTab = ({ formData, onChange, fieldErrors, onClearError }) => {
  return (
    <div style={styles.container}>
      {/* ✅ SEÇÃO: Identificação */}
      <Identificacao
        formData={formData}
        onChange={onChange}
        fieldErrors={fieldErrors}
        onClearError={onClearError}
      />

      {/* ✅ SEÇÃO: Dados Básicos */}
      <DadosBasicos
        formData={formData}
        onChange={onChange}
        fieldErrors={fieldErrors}
        onClearError={onClearError}
      />

      {/* ✅ SEÇÃO: Dados Bancários */}
      <DadosBancarios
        formData={formData}
        onChange={onChange}
        fieldErrors={fieldErrors}
        onClearError={onClearError}
      />

      {/* ✅ SEÇÃO: Cronograma */}
      <Cronograma
        formData={formData}
        onChange={onChange}
        fieldErrors={fieldErrors}
        onClearError={onClearError}
      />

      {/* ✅ SEÇÃO: Informações Complementares */}
      <InformacoesComplementares
        formData={formData}
        onChange={onChange}
        fieldErrors={fieldErrors}
        onClearError={onClearError}
      />
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
};

export default DadosBasicosTab;
