// src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx
// Header do formulário de emenda extraído
// ✅ CORRIGIDO: Banner sem ID da emenda

import React from "react";

const EmendaFormHeader = ({
  modo = "criar",
  emendaId = null,
  parlamentar = "",
  showSuccessMessage = false,
  successMessage = "",
}) => {
  // CONFIGURAÇÃO DO MODO - SEM ID DA EMENDA
  const configuracao = {
    criar: {
      titulo: "Criar Emenda",
      tituloIcon: "edit_note",
      subtitulo: "Preencha os dados para criar uma nova emenda",
      cor: "#d4edda",
      corTexto: "#155724",
    },
    editar: {
      titulo: "Editar Emenda",
      tituloIcon: "edit",
      subtitulo: `Parlamentar: ${parlamentar || "Não informado"}`,
      cor: "#d4edda",
      corTexto: "#155724",
    },
    visualizar: {
      titulo: "Visualizar Emenda",
      tituloIcon: "visibility",
      subtitulo: `Parlamentar: ${parlamentar || "Não informado"}`,
      cor: "#e7f3ff",
      corTexto: "#004085",
    },
  };

  const config = configuracao[modo] || configuracao.criar;

  return (
    <>
      {/* Header Principal */}
      <div
        style={{
          ...styles.header,
          backgroundColor: config.cor,
          color: config.corTexto,
        }}
      >
        <h2 style={styles.headerTitle}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8, verticalAlign: "middle" }}>{config.tituloIcon}</span>
          {config.titulo}
        </h2>
        <p style={styles.headerSubtitle}>{config.subtitulo}</p>
      </div>

      {/* Mensagem de Sucesso */}
      {showSuccessMessage && (
        <div style={styles.successMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#155724" }}>check_circle</span>
          <span style={styles.successText}>
            {successMessage ||
              `${modo === "criar" ? "Emenda criada" : "Emenda atualizada"} com sucesso!`}
          </span>
        </div>
      )}
    </>
  );
};

// ✅ ESTILOS EXTRAÍDOS DO ORIGINAL
const styles = {
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "2px solid #dee2e6",
  },
  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
  },
  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.8,
  },
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #c3e6cb",
    marginBottom: "20px",
  },
  successIcon: {
    fontSize: "20px",
  },
  successText: {
    fontWeight: "bold",
  },
};

export default EmendaFormHeader;
