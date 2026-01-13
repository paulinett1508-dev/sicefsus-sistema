// src/components/emenda/EmendaForm/sections/ExecucaoOrcamentaria.jsx
// ✅ CORRIGIDO: DespesaForm não fecha mais automaticamente ao executar
// ✅ CORRIGIDO: Proteções contra fechamento acidental
// ✅ TODAS AS LÓGICAS ANTERIORES PRESERVADAS 100%

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../../../firebase/firebaseConfig";
import { useTheme } from "../../../../context/ThemeContext";
import Toast from "../../../Toast";
import DespesaForm from "../../../DespesaForm";
import ConfirmationModal from "../../../ConfirmationModal";
import { parseValorMonetario } from "../../../../utils/formatters";
import { serverTimestamp } from "firebase/firestore";
// 🆕 Importações para sistema de naturezas (envelopes orçamentários)
import NaturezasList from "../../../natureza/NaturezasList";
import { useNaturezasData } from "../../../../hooks/useNaturezasData";


const formatCurrency = (valor) =>
  (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

// ===== Principal =====
const ExecucaoOrcamentaria = ({ formData, usuario }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [emendaIdReal, setEmendaIdReal] = useState(null);

  // Estado para controle de migração de despesas legado
  const [migrandoLegado, setMigrandoLegado] = useState(false);

  // Estilos dinâmicos baseados no tema
  const dynamicStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: 20,
      padding: 20,
      backgroundColor: isDark ? "var(--theme-bg)" : "#f8f9fa",
    },
    statCard: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      padding: 18,
      borderRadius: 12,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      textAlign: "center",
      border: isDark ? "1px solid var(--theme-border)" : "none",
    },
    statLabel: {
      fontSize: 13,
      fontWeight: 600,
      color: isDark ? "var(--theme-text-secondary)" : "#6c757d",
      marginBottom: 8,
    },
    statusFinanceiroWrapper: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      borderRadius: 12,
      padding: 16,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      border: isDark ? "1px solid var(--theme-border)" : "none",
    },
    // Padrão fieldset/legend igual a Dados Básicos
    fieldset: {
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: isDark ? "var(--theme-border)" : "#2563EB",
      borderRadius: "10px",
      padding: "20px",
      background: isDark
        ? "var(--theme-surface)"
        : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.1)",
      marginBottom: 20,
    },
    legend: {
      background: isDark ? "var(--theme-surface-secondary)" : "white",
      padding: "5px 15px",
      borderRadius: "20px",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: isDark ? "var(--theme-border)" : "#2563EB",
      color: isDark ? "var(--theme-text)" : "#2563EB",
      fontWeight: "bold",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    // Manter secao para compatibilidade
    secao: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      borderRadius: 12,
      padding: 16,
      boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
      border: isDark ? "1px solid var(--theme-border)" : "none",
    },
    secaoHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      paddingBottom: 12,
      borderBottom: isDark ? "2px solid var(--theme-border)" : "2px solid #e9ecef",
    },
    statusFinanceiroTitulo: {
      margin: "0 0 12px 0",
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? "var(--theme-text)" : "#334155",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    miniCardLabel: {
      fontSize: 10,
      fontWeight: 600,
      color: isDark ? "var(--theme-text-secondary)" : "#475569",
      textTransform: "uppercase",
      letterSpacing: "0.3px",
    },
    miniCardValue: {
      fontSize: 14,
      fontWeight: 700,
      color: isDark ? "var(--theme-text)" : "#0f172a",
      fontFamily: "monospace",
    },
    // Tabela
    tabelaWrapper: {
      overflowX: "auto",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e9ecef"}`,
      borderRadius: 8,
    },
    thead: {
      backgroundColor: isDark ? "#1E293B" : "#1E293B",
      color: "#fff",
      fontWeight: 600,
      fontSize: 14,
      borderBottom: "2px solid #34495e",
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    trEven: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f9f9f9"
    },
    trOdd: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff"
    },
    td: {
      padding: "10px 8px",
      borderBottom: `1px solid ${isDark ? "var(--theme-border)" : "#eee"}`,
      fontSize: 12,
      color: isDark ? "var(--theme-text)" : "#333",
      verticalAlign: "middle",
    },
    // Cards de status financeiro
    miniCardPago: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.15)" : "#f0fdf4",
      borderColor: isDark ? "#059669" : "#86efac",
    },
    miniCardLiquidado: {
      backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#ecfdf5",
      borderColor: isDark ? "#10b981" : "#6ee7b7",
    },
    miniCardEmpenhado: {
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.15)" : "#eff6ff",
      borderColor: isDark ? "#3b82f6" : "#93c5fd",
    },
    miniCardPendente: {
      backgroundColor: isDark ? "rgba(245, 158, 11, 0.15)" : "#fef3c7",
      borderColor: isDark ? "#f59e0b" : "#fcd34d",
    },
    // Formulário inline
    cardFormInline: {
      backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#f8fafc",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
    },
    // Empty state
    emptyState: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      padding: 20,
      border: `1px dashed ${isDark ? "var(--theme-border)" : "#cbd5e1"}`,
      borderRadius: 12,
      background: isDark ? "var(--theme-surface-secondary)" : "#f8fafc",
      marginTop: 8,
      marginBottom: 12,
    },
    emptyTitle: {
      margin: 0,
      fontSize: 16,
      fontWeight: 700,
      color: isDark ? "var(--theme-text)" : "#0f172a"
    },
    emptyText: {
      margin: "6px 0 0 0",
      fontSize: 13,
      color: isDark ? "var(--theme-text-secondary)" : "#475569"
    },
    // Modal de edição
    formularioEdicaoModal: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      borderRadius: 12,
      width: "100%",
      maxWidth: 1400,
      maxHeight: "95vh",
      display: "flex",
      flexDirection: "column",
      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
      border: "3px solid #3B82F6",
    },
    // Botões
    btn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      color: isDark ? "var(--theme-text)" : "#0f172a",
      border: `1px solid ${isDark ? "var(--theme-border)" : "#e2e8f0"}`,
      padding: "8px 12px",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
    },
    btnVoltar: {
      backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
      color: "#3B82F6",
      border: "none",
      padding: "10px 20px",
      borderRadius: 6,
      fontSize: 14,
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
  };

  // 🆕 Estados para edição/visualização/execução de despesa
  const [despesaEmEdicao, setDespesaEmEdicao] = useState(null);
  const [modoVisualizacao, setModoVisualizacao] = useState(null); // 'editar' | 'visualizar' | 'executar' | 'criar' | 'criar-executada' | null
  
  // 🆕 Estado para modal de confirmação de exclusão de despesa planejada
  const [modalExclusaoPlanejada, setModalExclusaoPlanejada] = useState({
    isVisible: false,
    despesa: null,
  });

  // ✅ PROTEÇÃO: Prevenir navegação enquanto modal está aberto
  useEffect(() => {
    if (modalExclusaoPlanejada.isVisible) {
      console.log("🔒 Modal de exclusão aberto - Navegação bloqueada");
    }
  }, [modalExclusaoPlanejada.isVisible]);

  // ✅ RESOLVER ID - PRIORIZAR ID DIRETO (evitar consultas desnecessárias)
  useEffect(() => {
    // Prioridade absoluta: IDs diretos
    const idDireto = formData?.id || formData?.emendaId;

    if (idDireto) {
      console.log('✅ ExecucaoOrcamentaria - ID direto encontrado:', {
        id: idDireto,
        numero: formData?.numero,
        municipio: formData?.municipio
      });
      setEmendaIdReal(idDireto);
    } else {
      console.warn('⚠️ ExecucaoOrcamentaria - Nenhum ID encontrado:', {
        formDataKeys: formData ? Object.keys(formData) : [],
        numero: formData?.numero
      });
      setEmendaIdReal(null);
    }
  }, [formData?.id, formData?.emendaId]);

  const emendaId = emendaIdReal || formData?.id || formData?.emendaId;
  const temEmendaSalva = !!emendaId;

  // 🆕 Hook para gerenciar naturezas (envelopes orçamentários)
  const {
    naturezas,
    despesasPorNatureza,
    loading: loadingNaturezas,
    salvando: salvandoNatureza,
    criar: criarNatureza,
    atualizar: atualizarNatureza,
    excluir: excluirNatureza,
    carregarDespesasNatureza,
    validarAlocacao,
    calculos: calculosNaturezas,
  } = useNaturezasData(emendaId, usuario, { autoCarregar: temEmendaSalva });

  // 🔄 MIGRAÇÃO AUTOMÁTICA: Converter despesas PLANEJADAS em EXECUTADAS (vinculadas a naturezas)
  const migrarDespesasPlanejadas = useCallback(async () => {
    if (!emendaId || migrandoLegado) return;

    try {
      // Buscar TODAS as despesas planejadas (com ou sem naturezaId)
      const despesasParaMigrar = despesas.filter(
        (d) => d.status === "PLANEJADA"
      );

      if (despesasParaMigrar.length === 0) {
        console.log('ℹ️ Nenhuma despesa planejada para migrar');
        return;
      }

      console.log(`🔄 Migrando ${despesasParaMigrar.length} despesas planejadas para executadas...`);
      setMigrandoLegado(true);

      for (const despesa of despesasParaMigrar) {
        const naturezaCodigo = despesa.estrategia || despesa.naturezaDespesa || "339039";
        const naturezaDescricao = despesa.estrategia || despesa.naturezaDespesa || "OUTROS SERVIÇOS";
        const valorDespesa = parseValorMonetario(despesa.valor) || 0;

        let naturezaId = despesa.naturezaId; // Pode já ter naturezaId

        // Se não tem naturezaId, vincular a uma natureza existente ou criar nova
        if (!naturezaId) {
          // Verificar se já existe natureza com esse código
          const naturezaExistente = naturezas.find(
            (n) => n.codigo === naturezaCodigo.split(" - ")[0]
          );

          if (naturezaExistente) {
            // Usar natureza existente
            naturezaId = naturezaExistente.id;
            console.log(`📦 Usando natureza existente: ${naturezaExistente.descricao}`);
          } else {
            // Criar nova natureza com o valor da despesa
            const novaNatureza = await criarNatureza({
              codigo: naturezaCodigo.split(" - ")[0],
              descricao: naturezaDescricao,
              valorAlocado: valorDespesa,
            });
            naturezaId = novaNatureza.id;
            console.log(`✅ Natureza criada: ${naturezaDescricao}`);
          }
        }

        // Atualizar despesa: mudar status para EXECUTADA
        await updateDoc(doc(db, "despesas", despesa.id), {
          naturezaId,
          status: "EXECUTADA",
          statusPagamento: despesa.statusPagamento || "pendente",
          atualizadoEm: new Date().toISOString(),
          migradoDeLegado: true,
        });

        console.log(`✅ Despesa ${despesa.id} migrada para EXECUTADA (natureza: ${naturezaId})`);
      }

      showToast({
        message: `${despesasParaMigrar.length} despesas migradas com sucesso!`,
        type: "success",
      });

      // Recarregar dados
      await carregarDespesas();
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      showToast({
        message: "Erro ao migrar despesas: " + error.message,
        type: "error",
      });
    } finally {
      setMigrandoLegado(false);
    }
  }, [emendaId, despesas, naturezas, migrandoLegado, criarNatureza]);

  // ✅ CARREGAR DESPESAS DA EMENDA
  const carregarDespesas = async () => {
    if (!emendaId) {
      console.warn('⚠️ Tentativa de carregar despesas sem emendaId');
      setDespesas([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📥 Carregando despesas para emenda:', emendaId);

      // ✅ CORREÇÃO CRÍTICA: Filtrar APENAS por emendaId
      // As regras do Firestore já garantem que só veremos despesas autorizadas
      const despesasQuery = query(
        collection(db, "despesas"),
        where("emendaId", "==", emendaId)
      );

      // Verificacao de autenticacao (sem log de dados sensiveis)

      console.log('🔍 Query de despesas:', {
        emendaId,
        usuario: {
          tipo: usuario?.tipo,
          municipio: usuario?.municipio,
          uf: usuario?.uf
        }
      });

      const despesasSnapshot = await getDocs(despesasQuery);
      const despesasData = despesasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${despesasData.length} despesas carregadas para emenda ${emendaId}`);
      setDespesas(despesasData);
    } catch (error) {
      console.error('❌ Erro ao carregar despesas:', error);

      // ✅ TRATAMENTO ESPECÍFICO PARA ERRO DE PERMISSÃO
      if (error.code === 'permission-denied') {
        console.warn('🔒 Erro de permissão ao carregar despesas');
        setToast({
          show: true,
          message: "Sem permissão para carregar despesas",
          type: "error",
        });
      }
      setDespesas([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 CARREGAR DESPESAS
  useEffect(() => {
    carregarDespesas();
  }, [emendaId]);

  // ✅ DETECTAR FLAG DE PRIMEIRA DESPESA (vindo do modal pós-criação)
  useEffect(() => {
    if (location.state?.criarPrimeiraDespesa && despesas.length === 0) {
      console.log("🎯 GESTOR: Abrindo modal de primeira despesa automaticamente");
      // Aguardar renderização completa
      setTimeout(() => {
        setModoVisualizacao("criar-executada"); // Abrir diretamente como criação executada
        setDespesaEmEdicao({
          status: 'EXECUTADA',
          emendaId: emendaId,
          discriminacao: '',
          valor: '',
          numeroEmenda: formData?.numero || '',
          municipio: formData?.municipio || '',
          uf: formData?.uf || '',
        });
        // Limpar state para não reabrir
        window.history.replaceState({}, document.title);
      }, 500);
    }
  }, [location.state, despesas.length, emendaId, formData?.numero, formData?.municipio, formData?.uf]);


  // ✅ CRÍTICO: Separação ESTRITA entre planejadas e executadas
  const despesasPlanejadas = despesas.filter((d) => d.status === "PLANEJADA");
  const despesasExecutadas = despesas.filter((d) => d.status !== "PLANEJADA");

  const valorEmendaParsed = (() => {
    const raw = formData?.valor || formData?.valorRecurso || 0;
    if (typeof raw === "number") return raw;
    if (typeof raw === "string")
      return parseFloat(raw.replace(/[^\d,]/g, "").replace(",", ".")) || 0;
    return 0;
  })();

  // ✅ CORREÇÃO CRÍTICA: Despesas planejadas NÃO consomem saldo
  const stats = {
    valorEmenda: valorEmendaParsed,
    // 🟡 Planejadas: Apenas para visualização (não debitam)
    totalPlanejado: despesasPlanejadas.reduce(
      (acc, d) => acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
      0,
    ),
    // 💸 Executadas: SOMENTE estas consomem o saldo
    totalExecutado: despesasExecutadas.reduce(
      (acc, d) => acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
      0,
    ),
    // ✅ Cada status é EXCLUSIVO (uma despesa só pode estar em 1 status)
    totalPago: despesasExecutadas
      .filter((d) => d.statusPagamento === "pago")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalLiquidado: despesasExecutadas
      .filter((d) => d.statusPagamento === "liquidado")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalEmpenhado: despesasExecutadas
      .filter((d) => d.statusPagamento === "empenhado")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
    totalPendente: despesasExecutadas
      .filter((d) => !d.statusPagamento || d.statusPagamento === "pendente")
      .reduce(
        (acc, d) =>
          acc + (parseValorMonetario(d.valor) || Number(d.valor) || 0),
        0,
      ),
  };

  // ✅ Cálculos derivados
  stats.percentualExecutado =
    (stats.totalExecutado / stats.valorEmenda) * 100 || 0;

  // 🆕 Cálculos de naturezas (envelopes orçamentários)
  stats.valorAlocado = calculosNaturezas?.valorTotalAlocado || 0;
  stats.percentualAlocado =
    stats.valorEmenda > 0
      ? (stats.valorAlocado / stats.valorEmenda) * 100
      : 0;

  // ✅ Novos campos com nomes claros
  stats.saldoParaNaturezas = stats.valorEmenda - stats.valorAlocado; // Para criar NOVAS naturezas
  stats.saldoNaoExecutado = stats.valorEmenda - stats.totalExecutado; // Quanto ainda não foi gasto

  // Aliases para compatibilidade
  stats.saldoLivre = stats.saldoParaNaturezas;
  stats.saldoDisponivel = stats.saldoNaoExecutado;

  // 🔄 UNIFICAÇÃO: Criar naturezas virtuais das despesas executadas sem naturezaId
  const naturezasConsolidadas = useMemo(() => {
    // Agrupar despesas executadas por código de natureza
    const despesasSemNatureza = despesasExecutadas.filter(d => !d.naturezaId);
    const agrupadas = {};

    despesasSemNatureza.forEach(despesa => {
      const naturezaStr = despesa.naturezaDespesa || despesa.estrategia || "339039 - OUTROS SERVIÇOS";
      const codigo = naturezaStr.split(" - ")[0].trim();
      const descricao = naturezaStr;

      if (!agrupadas[codigo]) {
        agrupadas[codigo] = {
          codigo,
          descricao,
          despesas: [],
          valorExecutado: 0,
        };
      }
      agrupadas[codigo].despesas.push(despesa);
      agrupadas[codigo].valorExecutado += parseValorMonetario(despesa.valor) || 0;
    });

    // Criar naturezas virtuais (prefixo virtual_ para identificar)
    const naturezasVirtuais = Object.values(agrupadas).map(grupo => ({
      id: `virtual_${grupo.codigo}`,
      codigo: grupo.codigo,
      descricao: grupo.descricao,
      valorAlocado: 0, // Usuário precisa definir
      valorExecutado: grupo.valorExecutado,
      saldoDisponivel: -grupo.valorExecutado, // Negativo = precisa alocar
      status: "pendente_regularizacao",
      isVirtual: true, // Flag para identificar
      despesasVinculadas: grupo.despesas,
      quantidadeDespesas: grupo.despesas.length,
    }));

    // Mesclar naturezas reais com virtuais (reais primeiro)
    const naturezasReais = naturezas.map(nat => ({
      ...nat,
      isVirtual: false,
    }));

    // Filtrar virtuais que já têm natureza real correspondente
    const codigosReais = naturezasReais.map(n => n.codigo);
    const virtuaisSemReal = naturezasVirtuais.filter(v => !codigosReais.includes(v.codigo));

    return [...naturezasReais, ...virtuaisSemReal];
  }, [naturezas, despesasExecutadas]);

  // Quantidade de naturezas que precisam regularização
  const naturezasPendentes = naturezasConsolidadas.filter(n => n.isVirtual).length;

  // 🔄 Despesas já vinculadas a naturezas (para não duplicar na lista separada)
  const despesasVinculadasIds = useMemo(() => {
    const ids = new Set();
    naturezasConsolidadas.forEach(nat => {
      if (nat.despesasVinculadas) {
        nat.despesasVinculadas.forEach(d => ids.add(d.id));
      }
    });
    // Também incluir despesas com naturezaId
    despesasExecutadas.filter(d => d.naturezaId).forEach(d => ids.add(d.id));
    return ids;
  }, [naturezasConsolidadas, despesasExecutadas]);

  const showToast = (config) => {
    setToast({ show: true, ...config });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // 🔄 REGULARIZAR: Converter natureza virtual em real e vincular despesas
  const regularizarNatureza = useCallback(async (naturezaVirtual, valorAlocado) => {
    if (!naturezaVirtual.isVirtual) return;

    try {
      console.log("🔄 Regularizando natureza virtual:", naturezaVirtual);
      setMigrandoLegado(true);

      // Criar natureza real
      const novaNatureza = await criarNatureza({
        codigo: naturezaVirtual.codigo,
        descricao: naturezaVirtual.descricao,
        valorAlocado: valorAlocado || naturezaVirtual.valorExecutado,
      });

      console.log("✅ Natureza criada:", novaNatureza);

      // Vincular todas as despesas à natureza criada
      for (const despesa of naturezaVirtual.despesasVinculadas || []) {
        await updateDoc(doc(db, "despesas", despesa.id), {
          naturezaId: novaNatureza.id || novaNatureza,
          atualizadoEm: new Date().toISOString(),
        });
        console.log(`✅ Despesa ${despesa.id} vinculada à natureza`);
      }

      showToast({
        message: `Natureza "${naturezaVirtual.descricao}" regularizada com sucesso!`,
        type: "success",
      });

      // Recarregar dados
      await carregarDespesas();
    } catch (error) {
      console.error("❌ Erro ao regularizar:", error);
      showToast({
        message: "Erro ao regularizar natureza: " + error.message,
        type: "error",
      });
    } finally {
      setMigrandoLegado(false);
    }
  }, [criarNatureza, carregarDespesas]);

  const handleEditarDespesa = (despesa) => {
    console.log("✏️ ExecucaoOrcamentaria: Tentando abrir EDIÇÃO", {
      despesaId: despesa?.id,
      despesaStatus: despesa?.status,
      emendaId: emendaId,
      temDespesa: !!despesa,
      temEmenda: !!emendaId
    });

    // ✅ VALIDAÇÃO: Verificar se despesa existe
    if (!despesa || !despesa.id) {
      console.error("❌ Despesa inválida para edição:", despesa);
      alert("⚠️ Erro: Despesa inválida");
      return;
    }

    // ✅ VALIDAÇÃO: Verificar se emenda existe
    if (!emendaId) {
      console.error("❌ Emenda não identificada");
      alert("⚠️ Erro: Emenda não identificada");
      return;
    }

    console.log("✅ Abrindo modal de edição com despesa:", despesa);
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("editar");
  };

  const handleVisualizarDespesa = (despesa) => {
    console.log(
      "👁️ ExecucaoOrcamentaria: Abrindo DespesaForm para VISUALIZAÇÃO",
      despesa,
    );
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("visualizar");
  };

  // ✅ Handler para executar despesa planejada - Abre DespesaForm diretamente
  const handleExecutarDespesa = useCallback((despesa, event) => {
    console.log("▶️ INÍCIO - handleExecutarDespesa chamado");
    console.log("📋 Despesa recebida:", {
      id: despesa?.id,
      discriminacao: despesa?.discriminacao,
      valor: despesa?.valor,
      municipio: despesa?.municipio,
      uf: despesa?.uf,
      status: despesa?.status
    });
    console.log("👤 Usuário executando:", {
      tipo: usuario?.tipo,
      role: usuario?.role,
      municipio: usuario?.municipio,
      uf: usuario?.uf,
      email: usuario?.email
    });

    // ✅ CORREÇÃO: Prevenir propagação de evento
    event?.stopPropagation();
    event?.preventDefault();

    // Verificar permissão de gestor/operador (apenas do seu município)
    if (usuario?.tipo === "gestor" || usuario?.role === "gestor" || usuario?.tipo === "operador" || usuario?.role === "operador") {
      console.log("🔐 Verificando permissões de localidade...");
      
      const despesaMunicipio = despesa.municipio || formData?.municipio;
      const despesaUf = despesa.uf || formData?.uf;
      const usuarioMunicipio = usuario.municipio;
      const usuarioUf = usuario.uf;

      console.log("📍 Comparação geográfica:", {
        despesa: `${despesaMunicipio}/${despesaUf}`,
        usuario: `${usuarioMunicipio}/${usuarioUf}`,
        match: despesaMunicipio === usuarioMunicipio && despesaUf === usuarioUf
      });

      if (despesaMunicipio !== usuarioMunicipio || despesaUf !== usuarioUf) {
        console.error("❌ PERMISSÃO NEGADA - Localidades incompatíveis");
        alert(`⚠️ Você não tem permissão para executar despesas de ${despesaMunicipio}/${despesaUf}.\n\nSua localidade: ${usuarioMunicipio}/${usuarioUf}`);
        return;
      }
      console.log("✅ Permissão de localidade verificada com sucesso");
    }

    // ✅ ABRIR FORMULÁRIO DIRETAMENTE (sem modal de confirmação)
    console.log("🎯 Abrindo DespesaForm em modo execução...");
    setDespesaEmEdicao(despesa);
    setModoVisualizacao("executar");
    console.log("✅ DespesaForm em modo execução configurado");
    
  }, [usuario, formData]);


  // ✅ Handler para fechar formulário (COM PROTEÇÃO)
  const handleFecharFormulario = (foiSalvoComSucesso = false) => {
    console.log(
      "🚪 Tentando fechar - Modo:",
      modoVisualizacao,
      "| Salvou?",
      foiSalvoComSucesso,
    );

    // ✅ PROTEÇÃO: Só confirmar cancelamento se NÃO foi salvo com sucesso
    if (modoVisualizacao === "executar" && !foiSalvoComSucesso) {
      const confirmacao = window.confirm(
        "⚠️ Cancelar execução?\n\n" +
          "Dados não salvos serão perdidos.",
      );

      if (!confirmacao) {
        console.log("❌ Fechamento cancelado pelo usuário");
        return; // NÃO FECHA
      }
    }

    console.log("✅ Fechando formulário");
    setDespesaEmEdicao(null);
    setModoVisualizacao(null);
    carregarDespesas();
  };

  // ✅ Função para recalcular e atualizar valores da emenda no Firestore
  const atualizarValoresEmenda = useCallback(async (despesaExcluida = null) => {
    if (!emendaId) return;

    try {
      // Recarregar despesas atualizadas do Firestore
      const despesasQuery = query(
        collection(db, "despesas"),
        where("emendaId", "==", emendaId)
      );
      const despesasSnapshot = await getDocs(despesasQuery);
      const despesasAtualizadas = despesasSnapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // Calcular novo valor executado (apenas despesas EXECUTADAS)
      const novoValorExecutado = despesasAtualizadas
        .filter(d => d.status === "EXECUTADA")
        .reduce((sum, d) => sum + parseValorMonetario(d.valor || 0), 0);

      // Pegar valor total da emenda
      const valorEmenda = parseValorMonetario(
        formData?.valor || formData?.valorRecurso || formData?.valorTotal || 0
      );

      // Calcular saldo e percentual
      const novoSaldoDisponivel = valorEmenda - novoValorExecutado;
      const novoPercentual = valorEmenda > 0 ? (novoValorExecutado / valorEmenda) * 100 : 0;

      // Atualizar emenda no Firestore
      await updateDoc(doc(db, "emendas", emendaId), {
        valorExecutado: novoValorExecutado,
        saldoDisponivel: novoSaldoDisponivel,
        percentualExecutado: novoPercentual,
        totalDespesas: despesasAtualizadas.length,
        atualizadoEm: serverTimestamp(),
      });

      console.log("✅ Valores da emenda atualizados:", {
        valorExecutado: novoValorExecutado,
        saldoDisponivel: novoSaldoDisponivel,
        percentualExecutado: novoPercentual,
        totalDespesas: despesasAtualizadas.length
      });

      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar valores da emenda:", error);
      return false;
    }
  }, [emendaId, formData]);

  const handleRemoverDespesaPlanejada = (despesa, event) => {
    // ✅ CRÍTICO: Prevenir propagação de eventos
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("🗑️ Abrindo modal de confirmação de exclusão:", {
      despesaId: despesa.id,
      discriminacao: despesa.discriminacao || despesa.estrategia
    });

    setModalExclusaoPlanejada({
      isVisible: true,
      despesa: despesa,
    });
  };

  const confirmarRemocaoPlanejada = async () => {
    const despesa = modalExclusaoPlanejada.despesa;

    if (!despesa) {
      console.warn("⚠️ Tentativa de remover despesa sem dados");
      return;
    }

    console.log("✅ Confirmando remoção de despesa planejada:", despesa.id);

    try {
      await deleteDoc(doc(db, "despesas", despesa.id));
      console.log("✅ Despesa removida com sucesso");

      // ✅ CORREÇÃO: Atualizar valores da emenda após exclusão
      await atualizarValoresEmenda(despesa);

      showToast({
        message: "Despesa planejada removida",
        type: "success",
      });

      // ✅ IMPORTANTE: Fechar modal ANTES de recarregar
      setModalExclusaoPlanejada({ isVisible: false, despesa: null });

      // Recarregar lista
      await carregarDespesas();
    } catch (e) {
      console.error("❌ Erro ao remover despesa:", e);
      showToast({
        message: "Erro ao remover despesa: " + e.message,
        type: "error",
      });
      setModalExclusaoPlanejada({ isVisible: false, despesa: null });
    }
  };

  // ✅ Handler para excluir despesa (usado pelo NaturezasList)
  const handleExcluirDespesa = async (despesa) => {
    if (!despesa?.id) {
      console.warn("⚠️ Tentativa de excluir despesa sem ID");
      return;
    }

    console.log("🗑️ Excluindo despesa:", despesa.id);

    try {
      await deleteDoc(doc(db, "despesas", despesa.id));
      console.log("✅ Despesa excluída com sucesso");

      // ✅ CORREÇÃO: Atualizar valores da emenda após exclusão
      await atualizarValoresEmenda(despesa);

      showToast({
        message: "Despesa excluída com sucesso",
        type: "success",
      });

      // Recarregar lista geral
      await carregarDespesas();

      // ✅ FIX: Atualizar despesasPorNatureza para a UI refletir a exclusão
      if (despesa.naturezaId) {
        console.log("🔄 Atualizando despesasPorNatureza para natureza:", despesa.naturezaId);
        await carregarDespesasNatureza(despesa.naturezaId);
      }
    } catch (e) {
      console.error("❌ Erro ao excluir despesa:", e);
      showToast({
        message: "Erro ao excluir despesa: " + e.message,
        type: "error",
      });
    }
  };

  // ✅ PROTEÇÃO: Rastrear mudanças de estado
  useEffect(() => {
    console.log("🔄 ExecucaoOrcamentaria - Estado mudou:", {
      despesaEmEdicao: despesaEmEdicao?.id || null,
      modoVisualizacao,
      timestamp: new Date().toISOString(),
    });

    if (modoVisualizacao === "executar" && despesaEmEdicao) {
      console.log("🔒 Modo execução ATIVO - DespesaForm protegido");
    }
  }, [despesaEmEdicao, modoVisualizacao]);


  // Verificar se a emenda está salva
  // Verifica tanto emendaId (criação) quanto formData.id (edição)
  const emendaSalvaId = emendaId || formData?.id;

  console.log('🔍 ExecucaoOrcamentaria - IDs:', {
    emendaId,
    formDataId: formData?.id,
    emendaSalvaId,
    numeroEmenda: formData?.numeroEmenda
  });

  // ✅ LOG DETALHADO DE PERMISSÕES GESTOR
  console.log('👤 ExecucaoOrcamentaria - Usuário:', {
    email: usuario?.email,
    tipo: usuario?.tipo,
    role: usuario?.role,
    municipio: usuario?.municipio,
    uf: usuario?.uf,
    timestamp: new Date().toISOString()
  });

  if (!emendaSalvaId) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 24px',
        backgroundColor: '#f5f5f5',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 64 }}>save</span>
        </div>
        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
          Salve a emenda primeiro
        </h3>
        <p style={{ fontSize: '14px', color: '#999' }}>
          Para gerenciar despesas, salve a emenda antes de continuar.
        </p>
      </div>
    );
  }


  return (
    <div style={dynamicStyles.container}>
      {toast.show && <Toast message={toast.message} type={toast.type} />}

      {/* Estatísticas principais */}
      <div style={styles.statsWrapper}>
        <div style={dynamicStyles.statCard}>
          <div style={dynamicStyles.statLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>payments</span> Valor da Emenda</div>
          <div style={styles.statValue}>
            {formatCurrency(stats.valorEmenda)}
          </div>
        </div>
        <div style={dynamicStyles.statCard}>
          <div style={dynamicStyles.statLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle", color: "#3b82f6" }}>account_balance_wallet</span> Total Alocado</div>
          <div style={{ ...styles.statValue, color: "#3b82f6" }}>
            {formatCurrency(stats.valorAlocado)}
          </div>
          <div style={styles.statHint}>reservado em naturezas</div>
        </div>
        <div style={dynamicStyles.statCard}>
          <div style={dynamicStyles.statLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle", color: stats.saldoParaNaturezas > 0 ? "#10b981" : "#ef4444" }}>savings</span> Saldo p/ Naturezas</div>
          <div style={{ ...styles.statValue, color: stats.saldoParaNaturezas > 0 ? "#10b981" : "#ef4444" }}>
            {formatCurrency(stats.saldoParaNaturezas)}
          </div>
          <div style={styles.statHint}>para criar novas naturezas</div>
        </div>
        <div style={dynamicStyles.statCard}>
          <div style={dynamicStyles.statLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle", color: "#27ae60" }}>check_circle</span> Total Executado</div>
          <div style={{ ...styles.statValue, color: "#27ae60" }}>
            {formatCurrency(stats.totalExecutado)}
          </div>
          <div style={styles.statHint}>consome das naturezas</div>
        </div>
        <div style={dynamicStyles.statCard}>
          <div style={dynamicStyles.statLabel}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>analytics</span> % Executado</div>
          <div style={styles.statValue}>
            {stats.percentualExecutado.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 🆕 Indicador de alocação visual */}
      {stats.valorAlocado > 0 && (
        <div style={{
          backgroundColor: isDark ? "var(--theme-surface)" : "#fff",
          borderRadius: 12,
          padding: 16,
          boxShadow: isDark ? "var(--shadow)" : "0 2px 4px rgba(0,0,0,0.06)",
          border: isDark ? "1px solid var(--theme-border)" : "none",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "var(--theme-text-secondary)" : "#64748b" }}>
              Alocação Orçamentária
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#3b82f6" }}>
              {stats.percentualAlocado.toFixed(1)}% alocado
            </span>
          </div>
          <div style={{
            height: 8,
            backgroundColor: isDark ? "var(--theme-surface-secondary)" : "#e2e8f0",
            borderRadius: 4,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(stats.percentualAlocado, 100)}%`,
              backgroundColor: stats.percentualAlocado >= 100 ? "#ef4444" : "#3b82f6",
              borderRadius: 4,
              transition: "width 0.3s ease",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: isDark ? "var(--theme-text-secondary)" : "#94a3b8" }}>
            <span>{naturezas.length} naturezas cadastradas</span>
            <span>Para novas naturezas: {formatCurrency(stats.saldoParaNaturezas)}</span>
          </div>
        </div>
      )}

      {/* 🆕 Mini-cards de status financeiro */}
      <div style={dynamicStyles.statusFinanceiroWrapper}>
        <h4 style={dynamicStyles.statusFinanceiroTitulo}>Status Financeiro</h4>
        <div style={styles.statusMiniGrid}>
          <div style={{ ...styles.miniCard, ...dynamicStyles.miniCardPago }}>
            <div style={styles.miniCardIcon}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>payments</span></div>
            <div style={styles.miniCardContent}>
              <div style={dynamicStyles.miniCardLabel}>Pago</div>
              <div style={dynamicStyles.miniCardValue}>
                {formatCurrency(stats.totalPago)}
              </div>
              <div style={styles.miniCardHint}><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>check_circle</span> Concluído</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...dynamicStyles.miniCardLiquidado }}>
            <div style={styles.miniCardIcon}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit_note</span></div>
            <div style={styles.miniCardContent}>
              <div style={dynamicStyles.miniCardLabel}>Liquidado</div>
              <div style={dynamicStyles.miniCardValue}>
                {formatCurrency(stats.totalLiquidado)}
              </div>
              <div style={styles.miniCardHint}><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>hourglass_empty</span> Aguardando pagamento</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...dynamicStyles.miniCardEmpenhado }}>
            <div style={styles.miniCardIcon}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>assignment</span></div>
            <div style={styles.miniCardContent}>
              <div style={dynamicStyles.miniCardLabel}>Empenhado</div>
              <div style={dynamicStyles.miniCardValue}>
                {formatCurrency(stats.totalEmpenhado)}
              </div>
              <div style={styles.miniCardHint}><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>hourglass_empty</span> Aguardando liquidação</div>
            </div>
          </div>
          <div style={{ ...styles.miniCard, ...dynamicStyles.miniCardPendente }}>
            <div style={styles.miniCardIcon}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span></div>
            <div style={styles.miniCardContent}>
              <div style={dynamicStyles.miniCardLabel}>Pendente</div>
              <div style={dynamicStyles.miniCardValue}>
                {formatCurrency(stats.totalPendente)}
              </div>
              <div style={styles.miniCardHint}><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>hourglass_empty</span> Aguardando empenho</div>
            </div>
          </div>
        </div>
      </div>



      {/* Seção Unificada: Execução Orçamentária */}
      <fieldset style={dynamicStyles.fieldset}>
        <legend style={dynamicStyles.legend}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_balance_wallet</span>
          Execução Orçamentária
          <span style={{
            marginLeft: 8,
            backgroundColor: isDark ? "var(--theme-surface)" : "#2563EB",
            color: isDark ? "var(--theme-text)" : "#fff",
            padding: "2px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600
          }}>
            {naturezasConsolidadas.length} naturezas
          </span>
          {naturezasPendentes > 0 && (
            <span style={{
              marginLeft: 8,
              backgroundColor: "#f59e0b",
              color: "#fff",
              padding: "2px 10px",
              borderRadius: 12,
              fontSize: 12,
              fontWeight: 600
            }}>
              {naturezasPendentes} pendentes
            </span>
          )}
        </legend>

        {/* Banner de migração de despesas legado (PLANEJADAS) */}
        {despesasPlanejadas.length > 0 && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.1)" : "#fef3c7",
            borderRadius: 8,
            marginBottom: 16,
            border: `1px solid ${isDark ? "#f59e0b" : "#fcd34d"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#f59e0b" }}>sync</span>
              <span style={{ fontSize: 13, color: isDark ? "#fcd34d" : "#92400e" }}>
                <strong>{despesasPlanejadas.length} despesas planejadas</strong> do sistema antigo serão migradas.
              </span>
            </div>
            <button
              type="button"
              onClick={migrarDespesasPlanejadas}
              disabled={migrandoLegado}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: migrandoLegado ? "not-allowed" : "pointer",
                backgroundColor: migrandoLegado ? "#d1d5db" : "#f59e0b",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: migrandoLegado ? 0.7 : 1,
              }}
            >
              {migrandoLegado ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, animation: "spin 1s linear infinite" }}>sync</span>
                  Migrando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upgrade</span>
                  Migrar Agora
                </>
              )}
            </button>
          </div>
        )}

        {/* Banner informativo sobre naturezas pendentes de regularização */}
        {naturezasPendentes > 0 && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: isDark ? "rgba(59, 130, 246, 0.1)" : "#eff6ff",
            borderRadius: 8,
            marginBottom: 16,
            border: `1px solid ${isDark ? "#3b82f6" : "#93c5fd"}`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#3b82f6" }}>info</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#93c5fd" : "#1e40af" }}>
                  {naturezasPendentes} naturezas detectadas automaticamente
                </span>
                <p style={{ fontSize: 12, color: isDark ? "#93c5fd" : "#3b82f6", margin: "4px 0 0 0" }}>
                  Despesas executadas foram agrupadas por natureza. Clique em "Regularizar" para definir o valor alocado.
                </p>
              </div>
            </div>
          </div>
        )}

        {temEmendaSalva && (
          <NaturezasList
            naturezas={naturezasConsolidadas}
            emenda={{
              id: emendaId,
              valor: stats.valorEmenda,
              valorRecurso: stats.valorEmenda,
              valorAlocado: stats.valorAlocado,
              saldoParaNaturezas: stats.saldoParaNaturezas,
              saldoLivre: stats.saldoParaNaturezas, // Alias para compatibilidade
              numero: formData?.numero,
              municipio: formData?.municipio,
              uf: formData?.uf,
            }}
            loading={loadingNaturezas}
            salvando={salvandoNatureza || migrandoLegado}
            onCriarNatureza={criarNatureza}
            onEditarNatureza={atualizarNatureza}
            onExcluirNatureza={excluirNatureza}
            onRegularizarNatureza={regularizarNatureza}
            onNovaDespesa={(natureza) => {
              // Se for natureza virtual, precisa regularizar primeiro
              if (natureza.isVirtual) {
                alert("Regularize esta natureza antes de adicionar novas despesas.");
                return;
              }
              console.log("🆕 Criar despesa na natureza:", natureza);
              setDespesaEmEdicao({
                status: 'EXECUTADA',
                emendaId: emendaId,
                naturezaId: natureza.id,
                naturezaDespesa: natureza.descricao,
                discriminacao: '',
                valor: '',
                numeroEmenda: formData?.numero || '',
                municipio: formData?.municipio || usuario?.municipio || '',
                uf: formData?.uf || usuario?.uf || '',
              });
              setModoVisualizacao("criar-executada");
            }}
            onEditarDespesa={handleEditarDespesa}
            onVisualizarDespesa={handleVisualizarDespesa}
            onExcluirDespesa={handleExcluirDespesa}
            onCarregarDespesas={carregarDespesasNatureza}
            validarAlocacao={validarAlocacao}
            despesasPorNatureza={despesasPorNatureza}
          />
        )}
      </fieldset>

      {/* FORMULÁRIO UNIVERSAL: Edição | Visualização | Execução | Criação Direta */}
      {modoVisualizacao && despesaEmEdicao &&
        createPortal(
          <div
            style={styles.formularioEdicaoOverlay}
            onClick={(e) => {
              // ✅ BLOQUEAR fechamento ao clicar fora em modo execução ou criação
              if (
                e.target === e.currentTarget &&
                (modoVisualizacao === "executar" || modoVisualizacao === "criar" || modoVisualizacao === "criar-executada")
              ) {
                console.log("⚠️ Clique fora bloqueado - modo ativo:", modoVisualizacao);
                e.stopPropagation();
                return;
              }

              // Permitir fechar clicando fora em outros modos
              if (e.target === e.currentTarget) {
                handleFecharFormulario();
              }
            }}
          >
            <div style={dynamicStyles.formularioEdicaoModal}>
              <div style={styles.formularioEdicaoHeader}>
                <h2 style={styles.formularioTitulo}>
                  {modoVisualizacao === "editar" && <><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>}
                  {modoVisualizacao === "visualizar" && <><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>description</span> Informações da Despesa</>}
                  {modoVisualizacao === "executar" && <><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>play_arrow</span> Executar Despesa Planejada</>}
                  {modoVisualizacao === "criar" && <><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>add_circle</span> Nova Despesa</>}
                  {modoVisualizacao === "criar-executada" && <><span className="material-symbols-outlined" style={{ fontSize: 20, marginRight: 8, verticalAlign: "middle" }}>add_circle</span> Nova Despesa Executada</>}
                </h2>
                <button
                  onClick={() => {
                    console.log(
                      "🔘 Botão Voltar clicado - Modo:",
                      modoVisualizacao,
                    );
                    handleFecharFormulario();
                  }}
                  style={dynamicStyles.btnVoltar}
                >
                  ← Voltar
                </button>
              </div>
              <div style={styles.formularioEdicaoContent}>
                {(() => {
                  try {
                    console.log("🎨 Renderizando DespesaForm:", {
                      modo: modoVisualizacao,
                      temDespesa: !!despesaEmEdicao,
                      despesaId: despesaEmEdicao?.id,
                      emendaId: emendaId,
                      temUsuario: !!usuario
                    });

                    return (
                      <DespesaForm
                        usuario={usuario}
                        despesaParaEditar={modoVisualizacao === "criar" ? null : despesaEmEdicao}
                        emendaId={emendaId}
                        somenteLeitura={modoVisualizacao === "visualizar"}
                        modoExecucao={modoVisualizacao === "executar"} // 🔑 Flag especial
                        modoCriacaoDireta={modoVisualizacao === "criar-executada"}
                        emendaInfo={{
                          id: emendaId,
                          numero: formData?.numero,
                          municipio: formData?.municipio,
                          uf: formData?.uf,
                          autor: formData?.autor,
                          valor: stats.valorEmenda,
                        }}
                        onClose={() => {
                          console.log("📞 DespesaForm.onClose chamado");
                          handleFecharFormulario();
                        }}
                        onSuccess={() => {
                          console.log(
                            "📞 DespesaForm.onSuccess chamado - Modo:",
                            modoVisualizacao,
                          );
                          handleFecharFormulario(true); // ✅ Passa true = foi salvo com sucesso
                          showToast({
                            message:
                              modoVisualizacao === "executar"
                                ? "Despesa executada com sucesso!"
                                : modoVisualizacao === "criar-executada"
                                  ? "Despesa criada com sucesso!"
                                  : modoVisualizacao === "criar"
                                    ? "Despesa criada com sucesso!"
                                    : "Despesa atualizada com sucesso!",
                            type: "success",
                          });
                        }}
                        onSave={() => {
                          console.log(
                            "DespesaForm.onSave chamado - Modo:",
                            modoVisualizacao,
                          );
                          handleFecharFormulario(true);
                          showToast({
                            message:
                              modoVisualizacao === "executar"
                                ? "Despesa executada com sucesso!"
                                : modoVisualizacao === "criar-executada"
                                  ? "Despesa criada com sucesso!"
                                  : modoVisualizacao === "criar"
                                    ? "Despesa criada com sucesso!"
                                    : "Despesa atualizada com sucesso!",
                            type: "success",
                          });
                        }}
                      />
                    );
                  } catch (error) {
                    console.error("❌ Erro ao renderizar DespesaForm:", error);
                    return (
                      <div style={{ padding: 20, textAlign: 'center' }}>
                        <h3 style={{ color: '#e74c3c' }}>Erro ao carregar formulário</h3>
                        <p>{error.message}</p>
                        <button onClick={() => handleFecharFormulario()} style={styles.btnVoltar}>
                          Fechar
                        </button>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal de Confirmação de Exclusão de Despesa Planejada */}
      <ConfirmationModal
        isVisible={modalExclusaoPlanejada.isVisible}
        title="Remover Despesa Planejada"
        message={
          modalExclusaoPlanejada.despesa ? (
            <div style={{ textAlign: 'left' }}>
              <p><strong>Estratégia:</strong> {modalExclusaoPlanejada.despesa.estrategia || modalExclusaoPlanejada.despesa.naturezaDespesa}</p>
              <p><strong>Valor:</strong> {formatCurrency(modalExclusaoPlanejada.despesa.valor)}</p>
              <p style={{ marginTop: 16, color: '#856404' }}><span className="material-symbols-outlined" style={{ fontSize: 14, marginRight: 4, verticalAlign: "middle" }}>warning</span> Esta ação não pode ser desfeita.</p>
            </div>
          ) : null
        }
        onConfirm={confirmarRemocaoPlanejada}
        onCancel={() => setModalExclusaoPlanejada({ isVisible: false, despesa: null })}
        confirmText="Confirmar Remoção"
        cancelText="Cancelar"
        type="danger"
      />
      </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  btnNovaDespesa: {
    backgroundColor: "var(--primary, #2563EB)",
    color: "var(--white, #ffffff)",
    border: "none",
    padding: "10px 20px",
    borderRadius: "var(--border-radius-md, 8px)",
    fontSize: "var(--font-size-sm, 14px)",
    fontWeight: "var(--font-weight-semibold, 600)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
    whiteSpace: "nowrap",
  },
  statsWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 16,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    textAlign: "center",
  },
  statLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6c757d",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563EB",
    fontFamily: "monospace",
  },
  statHint: { fontSize: 11, color: "#adb5bd", marginTop: 4 },
  statusFinanceiroWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  statusFinanceiroTitulo: {
    margin: "0 0 12px 0",
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusMiniGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },
  miniCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid",
    transition: "all 0.2s ease",
    cursor: "default",
  },
  miniCardPago: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  miniCardLiquidado: {
    backgroundColor: "#ecfdf5",
    borderColor: "#6ee7b7",
  },
  miniCardEmpenhado: {
    backgroundColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  miniCardPendente: {
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
  },
  miniCardIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
  miniCardContent: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
    flex: 1,
  },
  miniCardLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
  miniCardValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    fontFamily: "monospace",
  },
  miniCardHint: {
    fontSize: 9,
    color: "#64748b",
  },
  secao: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
  },
  secaoHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottom: "2px solid #e9ecef",
  },
  secaoTitulo: {
    margin: 0,
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563EB",
  },
  badge: {
    backgroundColor: "#2563EB",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 999,
    fontSize: 12,
  },
  infoIcon: {
    fontSize: 16,
    cursor: "help",
    opacity: 0.6,
    transition: "opacity 0.2s",
    userSelect: "none",
  },
  cardFormInline: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  formInline: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  formGroup: { display: "flex", flexDirection: "column", gap: 4, minWidth: 0 },
  formGroupButton: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: "auto",
  },
  formFooterHint: { marginTop: 8, fontSize: 12, opacity: 0.8 },
  tabelaWrapper: {
    overflowX: "auto",
    border: "1px solid #e9ecef",
    borderRadius: 8,
  },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: {
    backgroundColor: "#1E293B",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    borderBottom: "2px solid #34495e",
    whiteSpace: "nowrap",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tbody: {},
  trEven: { backgroundColor: "#f9f9f9" },
  trOdd: { backgroundColor: "#fff" },
  td: {
    padding: "10px 8px",
    borderBottom: "1px solid #eee",
    fontSize: 12,
    color: "#333",
    verticalAlign: "middle",
  },
  tdValorPlanejado: {
    fontSize: 14,
    fontWeight: 700,
    color: "#f39c12",
    textAlign: "right",
    fontFamily: "monospace",
  },
  despesaAcoes: { display: "flex", gap: 8, justifyContent: "center" },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    color: "#0f172a",
    border: "1px solid #e2e8f0",
    padding: "8px 12px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnPrimary: {
    backgroundColor: "#0d6efd",
    color: "#fff",
    borderColor: "#0d6efd",
  },
  btnSecondary: {
    backgroundColor: "#6c757d",
    color: "#fff",
    borderColor: "#6c757d",
  },
  btnDanger: {
    backgroundColor: "#dc3545",
    color: "white",
    transition: "background-color 0.2s",
  },
  btnIconExecutar: {
    backgroundColor: "var(--primary, #2563EB)",
    color: "var(--white, #ffffff)",
    border: "none",
    padding: "6px 10px",
    borderRadius: "var(--border-radius-sm, 4px)",
    fontSize: "var(--font-size-sm, 14px)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  btnIconRemover: {
    backgroundColor: "var(--error, #EF4444)",
    color: "var(--white, #ffffff)",
    border: "none",
    padding: "6px 10px",
    borderRadius: "var(--border-radius-sm, 4px)",
    fontSize: "var(--font-size-sm, 14px)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: 20,
    border: "1px dashed #cbd5e1",
    borderRadius: 12,
    background: "#f8fafc",
    marginTop: 8,
    marginBottom: 12,
  },
  emptyEmoji: { fontSize: 28, marginBottom: 8 },
  emptyTitle: { margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" },
  emptyText: { margin: "6px 0 0 0", fontSize: 13, color: "#475569" },
  formularioEdicaoOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  formularioEdicaoModal: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 1400,
    maxHeight: "95vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    border: "3px solid #3B82F6",
  },
  formularioEdicaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#3B82F6",
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  formularioTitulo: {
    margin: 0,
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  btnVoltar: {
    backgroundColor: "#fff",
    color: "#3B82F6",
    border: "none",
    padding: "10px 20px",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  formularioEdicaoContent: {
    padding: 24,
    overflowY: "auto",
    flex: 1,
  },
};

export default ExecucaoOrcamentaria;