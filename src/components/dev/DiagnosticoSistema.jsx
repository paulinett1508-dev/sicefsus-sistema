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
      <h2>🔍 Diagnóstico do Sistema</h2>
      <p className="descricao">
        Analisa todas as emendas do sistema em busca de inconsistências nos
        valores calculados vs armazenados.
      </p>

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
    </div>
  );
}

export default DiagnosticoSistema;
