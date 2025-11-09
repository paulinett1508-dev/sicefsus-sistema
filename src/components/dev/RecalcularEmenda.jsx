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

// ✅ FUNÇÃO CRÍTICA: Parse monetário correto para formato BR
const parseValorMonetario = (valor) => {
  // Se já é número, retorna direto
  if (typeof valor === "number") return valor;

  // Se não é string, converte
  if (typeof valor !== "string") {
    valor = String(valor);
  }

  // Remove "R$", espaços e caracteres especiais
  // Remove TODOS os pontos (separador de milhar)
  // Converte vírgula em ponto (separador decimal)
  const valorLimpo = valor
    .replace(/[R$\s]/g, "") // Remove R$ e espaços
    .replace(/\./g, "") // Remove pontos (milhar)
    .replace(",", "."); // Converte vírgula em ponto

  const valorFloat = parseFloat(valorLimpo);
  return isNaN(valorFloat) ? 0 : valorFloat;
};

function RecalcularEmenda() {
  const [emendas, setEmendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecalculo, setLoadingRecalculo] = useState(false);
  const [preview, setPreview] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroProblema, setFiltroProblema] = useState("todas");

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

        // ✅ CORREÇÃO: Parse monetário correto + fallback para múltiplos campos
        const valorTotal = parseValorMonetario(
          emenda.valor || emenda.valorTotal || emenda.valorRecurso || 0,
        );

        // ✅ CORREÇÃO: Parse de cada despesa individualmente
        const valorExecutadoReal = despesas.reduce((sum, d) => {
          const valorDespesa = parseValorMonetario(d.valor || 0);
          return sum + valorDespesa;
        }, 0);

        const saldoReal = valorTotal - valorExecutadoReal;

        // ✅ CORREÇÃO: Parse dos valores no banco também
        const valorExecutadoBanco = parseValorMonetario(
          emenda.valorExecutado || 0,
        );
        const saldoBanco = parseValorMonetario(emenda.saldoDisponivel || 0);

        // Verificar discrepância
        const diferencaExecutado = Math.abs(
          valorExecutadoReal - valorExecutadoBanco,
        );
        const diferencaSaldo = Math.abs(saldoReal - saldoBanco);
        const temProblema = diferencaExecutado > 1 || diferencaSaldo > 1;

        emendasData.push({
          ...emenda,
          despesas: despesas.length,
          valorExecutadoReal,
          saldoReal,
          valorTotalParsed: valorTotal, // ✅ Armazena valor parseado
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
    // ✅ Usa valor já parseado
    const valorTotal = emenda.valorTotalParsed || 0;

    setPreview({
      emenda,
      despesas: emenda.despesas,
      valoresBanco: {
        valorExecutado: parseValorMonetario(emenda.valorExecutado || 0),
        saldoDisponivel: parseValorMonetario(emenda.saldoDisponivel || 0),
        percentualExecutado: parseValorMonetario(
          emenda.percentualExecutado || 0,
        ),
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
        `Número: ${preview.emenda.numeroEmenda || preview.emenda.numero}\n\n` +
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
      emenda.numero?.toLowerCase().includes(busca.toLowerCase()) ||
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

      {/* Tabela de Emendas */}
      <div className="tabela-emendas">
        {emendasFiltradas.length === 0 ? (
          <div className="sem-resultados">
            <p>🔍 Nenhuma emenda encontrada com esses filtros.</p>
          </div>
        ) : (
          <table className="tabela-recalculo">
            <thead>
              <tr>
                <th>Número</th>
                <th>Município/UF</th>
                <th>Valor Total</th>
                <th>Despesas</th>
                <th>Exec. Banco</th>
                <th>Exec. Real</th>
                <th>Diferença</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {emendasFiltradas.map((emenda) => (
                <tr
                  key={emenda.id}
                  className={emenda.temProblema ? "com-problema" : ""}
                >
                  <td>
                    <strong>{emenda.numeroEmenda || emenda.numero}</strong>
                  </td>
                  <td>
                    {emenda.municipio}/{emenda.uf}
                  </td>
                  <td>{formatarMoeda(emenda.valorTotalParsed)}</td>
                  <td style={{ textAlign: "center" }}>{emenda.despesas}</td>
                  <td>
                    {formatarMoeda(
                      parseValorMonetario(emenda.valorExecutado || 0),
                    )}
                  </td>
                  <td>{formatarMoeda(emenda.valorExecutadoReal)}</td>
                  <td>
                    {emenda.temProblema ? (
                      <span
                        className={`diferenca ${emenda.severidade?.toLowerCase()}`}
                      >
                        {formatarMoeda(emenda.diferencaExecutado)}
                      </span>
                    ) : (
                      <span className="ok">-</span>
                    )}
                  </td>
                  <td>
                    {emenda.temProblema ? (
                      <span
                        className={`badge-severidade ${emenda.severidade?.toLowerCase()}`}
                      >
                        {emenda.severidade}
                      </span>
                    ) : (
                      <span className="badge-ok">✅ OK</span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn-selecionar-tabela"
                      onClick={() => selecionarEmenda(emenda)}
                    >
                      🔧 Selecionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                <strong>Número:</strong>{" "}
                {preview.emenda.numeroEmenda || preview.emenda.numero}
              </p>
              <p>
                <strong>Município:</strong> {preview.emenda.municipio}/
                {preview.emenda.uf}
              </p>
              <p>
                <strong>Valor Total:</strong>{" "}
                {formatarMoeda(preview.emenda.valorTotalParsed)}
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
