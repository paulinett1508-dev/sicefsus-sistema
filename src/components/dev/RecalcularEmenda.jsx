import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { formatarMoeda } from "../../utils/formatters";

function RecalcularEmenda() {
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecalculo, setLoadingRecalculo] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroProblema, setFiltroProblema] = useState("todas"); // 'todas' | 'apenas-problemas'

  // Carregar todas as emendas ao montar
  useEffect(() => {
    carregarEmendas();
  }, []);

  const carregarEmendas = async () => {
    setLoading(true);
    try {
      const emendasSnapshot = await getDocs(collection(db, "emendas"));
      const emendasData = [];

      for (const docEmenda of emendasSnapshot.docs) {
        const emenda = { id: docEmenda.id, ...docEmenda.data() };

        // Buscar despesas desta emenda
        const despesasQuery = query(
          collection(db, "despesas"),
          where("emendaId", "==", emenda.id),
        );
        const despesasSnapshot = await getDocs(despesasQuery);
        const despesas = despesasSnapshot.docs.map((doc) => doc.data());

        // ✅ CORREÇÃO: Usar (emenda.valor || emenda.valorTotal)
        const valorTotal = emenda.valor || emenda.valorTotal || 0;

        // Calcular valores reais
        const valorExecutadoReal = despesas.reduce(
          (sum, d) => sum + (d.valor || 0),
          0,
        );
        const saldoReal = valorTotal - valorExecutadoReal;

        // Verificar discrepância
        const diferencaExecutado = Math.abs(
          valorExecutadoReal - (emenda.valorExecutado || 0),
        );
        const diferencaSaldo = Math.abs(
          saldoReal - (emenda.saldoDisponivel || 0),
        );
        const temProblema = diferencaExecutado > 1 || diferencaSaldo > 1;

        emendasData.push({
          ...emenda,
          despesas: despesas.length,
          valorExecutadoReal,
          saldoReal,
          diferencaExecutado,
          diferencaSaldo,
          temProblema,
          severidade:
            diferencaExecutado > 10000
              ? "CRÍTICA"
              : diferencaExecutado > 100
                ? "MODERADA"
                : "LEVE",
        });
      }

      // Ordenar: problemas primeiro, depois por diferença
      emendasData.sort((a, b) => {
        if (a.temProblema && !b.temProblema) return -1;
        if (!a.temProblema && b.temProblema) return 1;
        return b.diferencaExecutado - a.diferencaExecutado;
      });

      setEmendas(emendasData);
    } catch (error) {
      console.error("Erro ao carregar emendas:", error);
      alert(`Erro: ${error.message}`);
    }
    setLoading(false);
  };

  const selecionarEmenda = (emenda) => {
    // ✅ CORREÇÃO: Usar (emenda.valor || emenda.valorTotal)
    const valorTotal = emenda.valor || emenda.valorTotal || 0;

    setPreview({
      emenda,
      despesas: emenda.despesas,
      valoresBanco: {
        valorExecutado: emenda.valorExecutado || 0,
        saldoDisponivel: emenda.saldoDisponivel || 0,
        percentualExecutado: emenda.percentualExecutado || 0,
      },
      valoresCalculados: {
        valorExecutado: emenda.valorExecutadoReal,
        saldoDisponivel: emenda.saldoReal,
        percentualExecutado:
          valorTotal > 0 ? (emenda.valorExecutadoReal / valorTotal) * 100 : 0,
      },
    });
    setSucesso(false);
  };

  const aplicarCorrecao = async () => {
    if (!preview) return;

    const confirma = window.confirm(
      `⚠️ CONFIRMAR RECÁLCULO?\n\n` +
        `Emenda: ${preview.emenda.id}\n` +
        `Número: ${preview.emenda.numeroEmenda}\n\n` +
        `Esta ação não pode ser desfeita.\n\n` +
        `Deseja continuar?`,
    );

    if (!confirma) return;

    setLoadingRecalculo(true);

    try {
      // ✅ CORREÇÃO: Arredondar para 2 casas decimais
      await updateDoc(doc(db, "emendas", preview.emenda.id), {
        valorExecutado:
          Math.round(preview.valoresCalculados.valorExecutado * 100) / 100,
        saldoDisponivel:
          Math.round(preview.valoresCalculados.saldoDisponivel * 100) / 100,
        percentualExecutado:
          Math.round(preview.valoresCalculados.percentualExecutado * 100) / 100,
        atualizadoEm: new Date(),
      });

      setSucesso(true);
      alert("✅ Emenda recalculada com sucesso!");

      // Recarregar lista
      await carregarEmendas();
      setPreview(null);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert(`❌ Erro: ${error.message}`);
    }

    setLoadingRecalculo(false);
  };

  // Filtrar emendas
  const emendasFiltradas = emendas.filter((emenda) => {
    // Filtro de busca
    const matchBusca =
      !busca ||
      emenda.numeroEmenda?.toLowerCase().includes(busca.toLowerCase()) ||
      emenda.municipio?.toLowerCase().includes(busca.toLowerCase()) ||
      emenda.id?.toLowerCase().includes(busca.toLowerCase());

    // Filtro de problema
    const matchProblema =
      filtroProblema === "todas" ||
      (filtroProblema === "apenas-problemas" && emenda.temProblema);

    return matchBusca && matchProblema;
  });

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div className="loading-spinner"></div>
        <p>Carregando emendas...</p>
      </div>
    );
  }

  return (
    <div className="recalcular-emenda">
      <h2>🔧 Recalcular Valores de Emenda</h2>
      <p className="descricao">
        Selecione uma emenda da lista para recalcular seus valores baseado nas
        despesas cadastradas.
      </p>

      {/* Filtros */}
      <div className="filtros">
        <input
          type="text"
          placeholder="🔍 Buscar por número, município ou ID..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-busca"
        />

        <select
          value={filtroProblema}
          onChange={(e) => setFiltroProblema(e.target.value)}
          className="select-filtro"
        >
          <option value="todas">📋 Todas as emendas ({emendas.length})</option>
          <option value="apenas-problemas">
            ⚠️ Apenas com problemas (
            {emendas.filter((e) => e.temProblema).length})
          </option>
        </select>

        <button onClick={carregarEmendas} className="btn-recarregar">
          🔄 Recarregar
        </button>
      </div>

      {/* Estatísticas */}
      <div className="estatisticas">
        <div className="stat">
          <span className="stat-label">Total:</span>
          <span className="stat-valor">{emendas.length}</span>
        </div>
        <div className="stat problema">
          <span className="stat-label">Com Problemas:</span>
          <span className="stat-valor">
            {emendas.filter((e) => e.temProblema).length}
          </span>
        </div>
        <div className="stat critica">
          <span className="stat-label">Críticas:</span>
          <span className="stat-valor">
            {emendas.filter((e) => e.severidade === "CRÍTICA").length}
          </span>
        </div>
      </div>

      {/* Lista de Emendas */}
      <div className="lista-emendas">
        {emendasFiltradas.length === 0 ? (
          <div className="sem-resultados">
            <p>🔍 Nenhuma emenda encontrada com esses filtros.</p>
          </div>
        ) : (
          emendasFiltradas.map((emenda) => (
            <div
              key={emenda.id}
              className={`emenda-card ${emenda.temProblema ? "com-problema" : ""} ${emenda.severidade?.toLowerCase()}`}
              onClick={() => selecionarEmenda(emenda)}
            >
              <div className="emenda-header">
                <div>
                  <strong>{emenda.numeroEmenda}</strong>
                  <span className="emenda-municipio">
                    {emenda.municipio}/{emenda.uf}
                  </span>
                </div>
                {emenda.temProblema && (
                  <span
                    className={`badge-severidade ${emenda.severidade.toLowerCase()}`}
                  >
                    {emenda.severidade}
                  </span>
                )}
              </div>

              <div className="emenda-info">
                <div className="info-item">
                  <span className="label">Valor Total:</span>
                  <span className="valor">
                    {formatarMoeda(emenda.valor || emenda.valorTotal)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Despesas:</span>
                  <span className="valor">{emenda.despesas}</span>
                </div>
              </div>

              {emenda.temProblema && (
                <div className="diferenca-alerta">
                  <span>
                    ⚠️ Diferença: {formatarMoeda(emenda.diferencaExecutado)}
                  </span>
                </div>
              )}

              <div className="emenda-footer">
                <span className="emenda-id">ID: {emenda.id}</span>
                <button className="btn-selecionar">👉 Selecionar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview */}
      {preview && (
        <>
          {/* Overlay */}
          <div
            className="preview-overlay"
            onClick={() => setPreview(null)}
          ></div>

          {/* Modal */}
          <div className="preview-recalculo">
            <div className="preview-header">
              <h3>📊 Preview do Recálculo</h3>
              <button onClick={() => setPreview(null)} className="btn-fechar">
                ✕
              </button>
            </div>

            <div className="info-emenda">
              <p>
                <strong>Número:</strong> {preview.emenda.numeroEmenda}
              </p>
              <p>
                <strong>Município:</strong> {preview.emenda.municipio}/
                {preview.emenda.uf}
              </p>
              <p>
                <strong>Valor Total:</strong>{" "}
                {formatarMoeda(
                  preview.emenda.valor || preview.emenda.valorTotal,
                )}
              </p>
              <p>
                <strong>Despesas:</strong> {preview.despesas} cadastrada(s)
              </p>
            </div>

            <div className="comparacao">
              <div className="coluna banco">
                <h4>❌ Valores no Banco</h4>
                <p>
                  Executado:{" "}
                  {formatarMoeda(preview.valoresBanco.valorExecutado)}
                </p>
                <p>
                  Saldo: {formatarMoeda(preview.valoresBanco.saldoDisponivel)}
                </p>
                <p>
                  Percentual:{" "}
                  {preview.valoresBanco.percentualExecutado.toFixed(2)}%
                </p>
              </div>

              <div className="seta">→</div>

              <div className="coluna calculado">
                <h4>✅ Valores Calculados</h4>
                <p>
                  Executado:{" "}
                  {formatarMoeda(preview.valoresCalculados.valorExecutado)}
                </p>
                <p>
                  Saldo:{" "}
                  {formatarMoeda(preview.valoresCalculados.saldoDisponivel)}
                </p>
                <p>
                  Percentual:{" "}
                  {preview.valoresCalculados.percentualExecutado.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="acoes">
              <button
                className="btn-aplicar"
                onClick={aplicarCorrecao}
                disabled={loadingRecalculo}
              >
                {loadingRecalculo ? "⏳ Aplicando..." : "✅ Aplicar Correção"}
              </button>
              <button className="btn-cancelar" onClick={() => setPreview(null)}>
                ❌ Cancelar
              </button>
            </div>

            {sucesso && (
              <div className="sucesso-msg">
                ✅ Correção aplicada com sucesso!
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default RecalcularEmenda;
