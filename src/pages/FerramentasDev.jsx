import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import RecalcularEmenda from "../components/dev/RecalcularEmenda";
import DiagnosticoSistema from "../components/dev/DiagnosticoSistema";
import "./FerramentasDev.css";

function FerramentasDev() {
  const { user: usuario } = useUser();
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
        <p className="detalhe-acesso">
          {usuario?.tipo === "admin"
            ? "Você é um Admin, mas não possui permissões de SuperAdmin."
            : "Apenas administradores com privilégios especiais podem acessar esta área."}
        </p>
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
          e correção do sistema. Todas as ações são registradas em log e podem
          impactar o sistema. Use com cautela.
        </div>
      </div>

      {/* Info do Usuário */}
      <div className="info-usuario">
        <div className="avatar">
          {usuario?.nome?.charAt(0).toUpperCase() || "S"}
        </div>
        <div className="usuario-dados">
          <strong>{usuario?.nome || "SuperAdmin"}</strong>
          <span>{usuario?.email}</span>
        </div>
      </div>

      {/* Abas */}
      <div className="abas-ferramentas">
        <button
          className={`aba ${abaAtiva === "recalcular" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("recalcular")}
        >
          <span className="aba-icone">🔧</span>
          <span className="aba-texto">Recalcular Emenda</span>
        </button>
        <button
          className={`aba ${abaAtiva === "diagnostico" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("diagnostico")}
        >
          <span className="aba-icone">🔍</span>
          <span className="aba-texto">Diagnóstico do Sistema</span>
        </button>
      </div>

      {/* Conteúdo */}
      <div className="conteudo-ferramenta">
        {abaAtiva === "recalcular" && <RecalcularEmenda />}
        {abaAtiva === "diagnostico" && <DiagnosticoSistema />}
      </div>

      {/* Footer */}
      <div className="footer-dev">
        <span className="footer-texto">
          👑 SuperAdmin: {usuario?.nome} • Sessão iniciada em:{" "}
          {new Date().toLocaleString("pt-BR")}
        </span>
      </div>
    </div>
  );
}

export default FerramentasDev;
