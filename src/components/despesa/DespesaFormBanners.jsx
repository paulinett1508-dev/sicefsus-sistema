// src/components/despesa/DespesaFormBanners.jsx
// ✅ Componente especializado para banners informativos e de permissão

import React from "react";

const DespesaFormBanners = ({ userRole, userMunicipio, userUf, emendas }) => {
  return (
    <>
      {/* Banner de Permissões */}
      {(userRole === "operador" || userRole === "user") && userMunicipio && (
        <div style={styles.permissaoInfo}>
          <span style={styles.permissaoIcon}>🔒</span>
          <div style={styles.permissaoContent}>
            <span style={styles.permissaoTexto}>
              <strong>Operador:</strong> Você pode criar despesas apenas para
              emendas do município{" "}
              <strong>
                {userMunicipio}/{userUf || "UF não informada"}
              </strong>
            </span>
            <span style={styles.permissaoSubtexto}>
              {emendas.length} emenda(s) disponível(is) para seu município
            </span>
          </div>
        </div>
      )}

      {/* Banner de Aviso - Usuário sem Município */}
      {(userRole === "operador" || userRole === "user") && !userMunicipio && (
        <div style={styles.avisoMunicipio}>
          <span style={styles.avisoIcon}>⚠️</span>
          <div style={styles.avisoContent}>
            <span style={styles.avisoTexto}>
              <strong>Configuração Pendente:</strong> Seu usuário não possui
              município/UF cadastrado no sistema.
            </span>
            <span style={styles.avisoSubtexto}>
              Entre em contato com o administrador para configurar seu acesso.
            </span>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  permissaoInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#fff3cd",
    border: "2px solid #ffc107",
    borderRadius: 12,
    marginBottom: "30px",
    fontSize: 14,
    color: "#856404",
    boxShadow: "0 4px 12px rgba(255, 193, 7, 0.15)",
  },
  permissaoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  permissaoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  permissaoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },
  permissaoSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },
  avisoMunicipio: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px 20px",
    backgroundColor: "#f8d7da",
    border: "2px solid #dc3545",
    borderRadius: 12,
    marginBottom: "30px",
    fontSize: 14,
    color: "#721c24",
    boxShadow: "0 4px 12px rgba(220, 53, 69, 0.15)",
  },
  avisoIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  avisoContent: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    flex: 1,
  },
  avisoTexto: {
    fontSize: 14,
    lineHeight: 1.4,
    fontWeight: "500",
  },
  avisoSubtexto: {
    fontSize: 12,
    opacity: 0.8,
    fontWeight: "400",
  },
};

export default DespesaFormBanners;
