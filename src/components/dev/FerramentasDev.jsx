import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import RecalcularEmenda from "../components/dev/RecalcularEmenda";
import DiagnosticoSistema from "../components/dev/DiagnosticoSistema";
import "./FerramentasDev.css";

function FerramentasDev() {
  const { usuario } = useUser();
  const [abaAtiva, setAbaAtiva] = useState("recalcular");

  // Verificação de SuperAdmin
  const isSuperAdmin =
    usuario?.tipo === "admin" && usuario?.superAdmin === true;

  if (!isSuperAdmin) {
    return (
      <div className="acesso-negado">
        <div className="icone-alerta">🚫</div>
        <h2>Acesso Negado</h2>
        <p>Esta área é restrita a Super Administradores.</p>
      </div>
    );
  }

  return (
    <div className="ferramentas-dev">
      {/* Header */}
      <div className="header-dev">
        <div className="titulo-secao">
          <span className="icone-crown">👑</span>
          <h1>Ferramentas de Desenvolvedor</h1>
        </div>
        <div className="badge-super">SUPER ADMIN</div>
      </div>

      {/* Aviso */}
      <div className="alerta-dev">
        <span className="icone-aviso">⚠️</span>
        <div>
          <strong>Área Técnica:</strong> Ferramentas avançadas para diagnóstico
          e correção do sistema. Use com cautela.
        </div>
      </div>

      {/* Abas */}
      <div className="abas-ferramentas">
        <button
          className={`aba ${abaAtiva === "recalcular" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("recalcular")}
        >
          🔧 Recalcular Emenda
        </button>
        <button
          className={`aba ${abaAtiva === "diagnostico" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("diagnostico")}
        >
          🔍 Diagnóstico do Sistema
        </button>
      </div>

      {/* Conteúdo */}
      <div className="conteudo-ferramenta">
        {abaAtiva === "recalcular" && <RecalcularEmenda />}
        {abaAtiva === "diagnostico" && <DiagnosticoSistema />}
      </div>
    </div>
  );
}

export default FerramentasDev;
