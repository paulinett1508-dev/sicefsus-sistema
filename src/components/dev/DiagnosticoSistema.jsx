import React, { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { formatarMoeda } from "../../utils/formatters";

// ✅ FUNÇÃO CRÍTICA: Parse monetário correto para formato BR
const parseValorMonetario = (valor) => {
  if (typeof valor === "number") return valor;
  if (typeof valor !== "string") valor = String(valor);

  const valorLimpo = valor
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const valorFloat = parseFloat(valorLimpo);
  return isNaN(valorFloat) ? 0 : valorFloat;
};

function DiagnosticoSistema() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const executarDiagnostico = async () => {
    setLoading(true);

    try {
      // 1. Buscar todas as emendas
      const emendasSnapshot = await getDocs(collection(db, "emendas"));
      const emendas = emendasSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const problemas = [];

      // 2. Para cada emenda, verificar inconsistências
      for (const emenda of emendas) {
        // Buscar despesas
        const despesasQuery = query(
          collection(db, "despesas"),
          where("emendaId", "==", emenda.id),
        );
        const despesasSnapshot = await getDocs(despesasQuery);
        const despesas = despesasSnapshot.docs.map((doc) => doc.data());

        // ✅ CORREÇÃO: Parse monetário correto
        const valorTotal = parseValorMonetario(
          emenda.valor || emenda.valorTotal || emenda.valorRecurso || 0,
        );

        // ✅ CORREÇÃO: Parse individual de cada despesa
        const valorExecutadoReal = despesas.reduce((sum, d) => {
          const valorDespesa = parseValorMonetario(d.valor || 0);
          return sum + valorDespesa;
        }, 0);

        const saldoReal = valorTotal - valorExecutadoReal;

        // ✅ CORREÇÃO: Parse dos valores no banco
        const valorExecutadoBanco = parseValorMonetario(
          emenda.valorExecutado || 0,
        );
        const saldoBanco = parseValorMonetario(emenda.saldoDisponivel || 0);

        // Verificar discrepâncias
        const diferencaExecutado = Math.abs(
          valorExecutadoReal - valorExecutadoBanco,
        );
        const diferencaSaldo = Math.abs(saldoReal - saldoBanco);

        if (diferencaExecutado > 1 || diferencaSaldo > 1) {
          problemas.push({
            id: emenda.id,
            numero: emenda.numeroEmenda || emenda.numero,
            municipio: emenda.municipio,
            uf: emenda.uf,
            valorTotal: valorTotal, // ✅ Já parseado
            despesas: despesas.length,
            executadoBanco: valorExecutadoBanco, // ✅ Já parseado
            executadoReal: valorExecutadoReal,
            saldoBanco: saldoBanco, // ✅ Já parseado
            saldoReal: saldoReal,
            diferencaExecutado: diferencaExecutado,
            diferencaSaldo: diferencaSaldo,
            severidade:
              diferencaExecutado > 10000
                ? "CRÍTICA"
                : diferencaExecutado > 100
                  ? "MODERADA"
                  : "LEVE",
          });
        }
      }

      setResultado({
        totalEmendas: emendas.length,
        problemasEncontrados: problemas.length,
        emendasOk: emendas.length - problemas.length,
        problemas: problemas.sort(
          (a, b) => b.diferencaExecutado - a.diferencaExecutado,
        ),
        problemaCritico: problemas.filter((p) => p.severidade === "CRÍTICA")
          .length,
        problemaModerado: problemas.filter((p) => p.severidade === "MODERADA")
          .length,
        problemaLeve: problemas.filter((p) => p.severidade === "LEVE").length,
      });
    } catch (error) {
      console.error("Erro no diagnóstico:", error);
      alert(`Erro: ${error.message}`);
    }

    setLoading(false);
  };

  const copiarIdsProblemas = () => {
    if (!resultado || resultado.problemas.length === 0) return;

    const ids = resultado.problemas.map((p) => p.id).join("\n");
    navigator.clipboard.writeText(ids);
    alert(
      `✅ ${resultado.problemas.length} IDs copiados para a área de transferência!`,
    );
  };

  return (
    <div className="diagnostico-sistema">
      <div className="diagnostico-header">
        <h2>🔍 Diagnóstico do Sistema</h2>
        <p className="descricao">
          Analisa todas as emendas do sistema em busca de inconsistências nos
          valores calculados vs armazenados.
        </p>
      </div>

      <button
        className="btn-diagnostico"
        onClick={executarDiagnostico}
        disabled={loading}
      >
        {loading ? "⏳ Analisando..." : "🚀 Executar Diagnóstico Completo"}
      </button>

      {resultado && (
        <div className="resultado-diagnostico">
          {/* Resumo Geral */}
          <div className="resumo-geral">
            <h3>📊 Resumo Geral</h3>
            <div className="cards-resumo">
              <div className="card-stat total">
                <div className="stat-icone">📋</div>
                <div className="stat-info">
                  <span className="stat-numero">{resultado.totalEmendas}</span>
                  <span className="stat-descricao">Total de Emendas</span>
                </div>
              </div>

              <div className="card-stat ok">
                <div className="stat-icone">✅</div>
                <div className="stat-info">
                  <span className="stat-numero">{resultado.emendasOk}</span>
                  <span className="stat-descricao">Emendas OK</span>
                </div>
              </div>

              <div className="card-stat problema">
                <div className="stat-icone">⚠️</div>
                <div className="stat-info">
                  <span className="stat-numero">
                    {resultado.problemasEncontrados}
                  </span>
                  <span className="stat-descricao">Com Problemas</span>
                </div>
              </div>
            </div>

            {/* Detalhamento por Severidade */}
            {resultado.problemasEncontrados > 0 && (
              <div className="detalhamento-severidade">
                <h4>Problemas por Severidade:</h4>
                <div className="badges-severidade">
                  <div className="badge-item critica">
                    <span className="badge-numero">
                      {resultado.problemaCritico}
                    </span>
                    <span className="badge-texto">Críticas</span>
                  </div>
                  <div className="badge-item moderada">
                    <span className="badge-numero">
                      {resultado.problemaModerado}
                    </span>
                    <span className="badge-texto">Moderadas</span>
                  </div>
                  <div className="badge-item leve">
                    <span className="badge-numero">
                      {resultado.problemaLeve}
                    </span>
                    <span className="badge-texto">Leves</span>
                  </div>
                </div>
              </div>
            )}

            {/* Status do Sistema */}
            <div
              className={`status-sistema ${resultado.problemasEncontrados === 0 ? "ok" : "alerta"}`}
            >
              <span className="status-icone">
                {resultado.problemasEncontrados === 0 ? "✅" : "⚠️"}
              </span>
              <span className="status-texto">
                {resultado.problemasEncontrados === 0
                  ? "Sistema íntegro - Nenhuma inconsistência encontrada!"
                  : `${resultado.problemasEncontrados} inconsistência(s) detectada(s)`}
              </span>
            </div>
          </div>

          {/* Lista de Problemas */}
          {resultado.problemas.length > 0 && (
            <div className="secao-problemas">
              <div className="header-problemas">
                <h3>🐛 Problemas Detectados</h3>
                <button
                  className="btn-copiar-ids"
                  onClick={copiarIdsProblemas}
                  title="Copiar todos os IDs"
                >
                  📋 Copiar IDs
                </button>
              </div>

              <div className="lista-problemas">
                {resultado.problemas.map((problema, index) => (
                  <div
                    key={index}
                    className={`problema-card ${problema.severidade.toLowerCase()}`}
                  >
                    <div className="problema-header">
                      <div className="problema-titulo">
                        <span
                          className={`badge-severidade ${problema.severidade.toLowerCase()}`}
                        >
                          {problema.severidade}
                        </span>
                        <strong>
                          #{index + 1} - {problema.numero}
                        </strong>
                      </div>
                      <button
                        className="btn-copiar-id"
                        onClick={() => {
                          navigator.clipboard.writeText(problema.id);
                          alert("✅ ID copiado!");
                        }}
                        title="Copiar ID"
                      >
                        📋
                      </button>
                    </div>

                    <div className="problema-info">
                      <div className="info-grid">
                        <div>
                          <span className="label">ID:</span>
                          <span className="valor-id">{problema.id}</span>
                        </div>
                        <div>
                          <span className="label">Local:</span>
                          <span className="valor">
                            {problema.municipio}/{problema.uf}
                          </span>
                        </div>
                        <div>
                          <span className="label">Valor Total:</span>
                          <span className="valor">
                            {formatarMoeda(problema.valorTotal)}
                          </span>
                        </div>
                        <div>
                          <span className="label">Despesas:</span>
                          <span className="valor">{problema.despesas}</span>
                        </div>
                      </div>

                      <div className="comparacao-detalhada">
                        <div className="comparacao-coluna banco">
                          <h5>❌ No Banco</h5>
                          <div className="valores">
                            <div className="valor-item">
                              <span>Executado:</span>
                              <strong>
                                {formatarMoeda(problema.executadoBanco)}
                              </strong>
                            </div>
                            <div className="valor-item">
                              <span>Saldo:</span>
                              <strong>
                                {formatarMoeda(problema.saldoBanco)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <div className="comparacao-seta">→</div>

                        <div className="comparacao-coluna real">
                          <h5>✅ Real (Calculado)</h5>
                          <div className="valores">
                            <div className="valor-item">
                              <span>Executado:</span>
                              <strong>
                                {formatarMoeda(problema.executadoReal)}
                              </strong>
                            </div>
                            <div className="valor-item">
                              <span>Saldo:</span>
                              <strong>
                                {formatarMoeda(problema.saldoReal)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="alerta-diferenca">
                        <span className="icone-alerta">⚠️</span>
                        <span className="texto-diferenca">
                          Diferença no executado:{" "}
                          <strong>
                            {formatarMoeda(problema.diferencaExecutado)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ações Recomendadas */}
          {resultado.problemasEncontrados > 0 && (
            <div className="acoes-recomendadas">
              <h4>🔧 Ações Recomendadas:</h4>
              <ol>
                <li>
                  Use a ferramenta <strong>"Recalcular Emenda"</strong> para
                  corrigir os valores
                </li>
                <li>
                  Corrija primeiro as emendas marcadas como{" "}
                  <span className="badge-inline critica">CRÍTICA</span>
                </li>
                <li>
                  Verifique se há despesas duplicadas ou com valores incorretos
                </li>
                <li>Execute o diagnóstico novamente após as correções</li>
              </ol>
            </div>
          )}
        </div>
      )}

      <style>{`
        .diagnostico-sistema {
          max-width: 1400px;
          margin: 0 auto;
        }

        .diagnostico-header {
          margin-bottom: 24px;
        }

        .diagnostico-header h2 {
          font-size: 24px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .descricao {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .btn-diagnostico {
          width: 100%;
          padding: 16px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 24px;
        }

        .btn-diagnostico:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .btn-diagnostico:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .resultado-diagnostico {
          margin-top: 24px;
        }

        .resumo-geral {
          background: white;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .resumo-geral h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 16px 0;
        }

        .cards-resumo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .card-stat {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .card-stat.total {
          border-left: 4px solid #3b82f6;
        }

        .card-stat.ok {
          border-left: 4px solid #10b981;
        }

        .card-stat.problema {
          border-left: 4px solid #f59e0b;
        }

        .stat-icone {
          font-size: 32px;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-numero {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-descricao {
          font-size: 12px;
          color: #64748b;
        }

        .detalhamento-severidade {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .detalhamento-severidade h4 {
          font-size: 14px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 12px 0;
        }

        .badges-severidade {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .badge-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
        }

        .badge-item.critica {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-item.moderada {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-item.leve {
          background: #dbeafe;
          color: #1e40af;
        }

        .badge-numero {
          font-weight: 700;
          font-size: 16px;
        }

        .badge-texto {
          font-weight: 500;
        }

        .status-sistema {
          margin-top: 20px;
          padding: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
        }

        .status-sistema.ok {
          background: #d1fae5;
          color: #065f46;
        }

        .status-sistema.alerta {
          background: #fed7aa;
          color: #92400e;
        }

        .status-icone {
          font-size: 24px;
        }

        .status-texto {
          font-size: 14px;
        }

        .secao-problemas {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .header-problemas {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-problemas h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .btn-copiar-ids {
          padding: 8px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-copiar-ids:hover {
          background: #2563eb;
        }

        .lista-problemas {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .problema-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 16px;
          border-left: 4px solid #cbd5e1;
        }

        .problema-card.crítica {
          border-left-color: #dc2626;
        }

        .problema-card.moderada {
          border-left-color: #f59e0b;
        }

        .problema-card.leve {
          border-left-color: #3b82f6;
        }

        .problema-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .problema-titulo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .problema-titulo strong {
          font-size: 16px;
          color: #1e293b;
        }

        .badge-severidade {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-severidade.crítica {
          background: #dc2626;
          color: white;
        }

        .badge-severidade.moderada {
          background: #f59e0b;
          color: white;
        }

        .badge-severidade.leve {
          background: #3b82f6;
          color: white;
        }

        .btn-copiar-id {
          padding: 6px 12px;
          background: #e2e8f0;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn-copiar-id:hover {
          background: #cbd5e1;
        }

        .problema-info {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
        }

        .info-grid div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label {
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
        }

        .valor {
          font-size: 14px;
          color: #1e293b;
          font-weight: 600;
        }

        .valor-id {
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
          background: #e2e8f0;
          padding: 4px 8px;
          border-radius: 4px;
          word-break: break-all;
        }

        .comparacao-detalhada {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 16px;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 8px;
        }

        .comparacao-coluna {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .comparacao-coluna h5 {
          font-size: 13px;
          font-weight: 600;
          margin: 0;
        }

        .comparacao-coluna.banco h5 {
          color: #dc2626;
        }

        .comparacao-coluna.real h5 {
          color: #10b981;
        }

        .valores {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .valor-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px;
          background: #f8fafc;
          border-radius: 4px;
          font-size: 13px;
        }

        .valor-item span {
          color: #64748b;
        }

        .valor-item strong {
          color: #1e293b;
          font-weight: 600;
        }

        .comparacao-seta {
          font-size: 24px;
          color: #cbd5e1;
          font-weight: bold;
        }

        .alerta-diferenca {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 6px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icone-alerta {
          font-size: 18px;
        }

        .texto-diferenca {
          font-size: 14px;
          color: #92400e;
        }

        .texto-diferenca strong {
          font-weight: 700;
        }

        .acoes-recomendadas {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 20px;
          margin-top: 24px;
        }

        .acoes-recomendadas h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin: 0 0 12px 0;
        }

        .acoes-recomendadas ol {
          margin: 0;
          padding-left: 20px;
          color: #1e40af;
        }

        .acoes-recomendadas li {
          margin-bottom: 8px;
          font-size: 14px;
        }

        .badge-inline {
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: 700;
        }

        .badge-inline.critica {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default DiagnosticoSistema;
