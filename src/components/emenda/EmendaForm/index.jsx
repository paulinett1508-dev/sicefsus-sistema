// src/components/emenda/EmendaForm/index.jsx - CORREÇÕES CRÍTICAS
// ✅ CORRIGIDO: Valor dos recursos em formato monetário
// ✅ CORRIGIDO: CNPJ com mapeamento correto
// ✅ MANTIDO: Todas as funcionalidades existentes

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../firebase/firebaseConfig";
import { useUser } from "../../../context/UserContext";

// Imports das seções
import Identificacao from "./sections/Identificacao";
import DadosBasicos from "./sections/DadosBasicos";
import DadosBeneficiario from "./sections/DadosBeneficiario";
import DadosBancarios from "./sections/DadosBancarios";
import Cronograma from "./sections/Cronograma";
import AcoesServicos from "./sections/AcoesServicos";
import InformacoesComplementares from "./sections/InformacoesComplementares";

// Imports dos componentes
import EmendaFormHeader from "./components/EmendaFormHeader";
import EmendaFormActions from "./components/EmendaFormActions";
import EmendaFormCancelModal from "./components/EmendaFormCancelModal";

const EmendaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  // ✅ CORREÇÃO: Estados simplificados
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [formData, setFormData] = useState({
    numero: "",
    autor: "",
    municipio: "",
    uf: "",
    valor: "",
    valorRecurso: "",
    programa: "",
    beneficiario: "",
    cnpjBeneficiario: "",
    tipo: "Individual",
    modalidade: "",
    objeto: "",
    banco: "",
    agencia: "",
    conta: "",
    dataAprovacao: "",
    dataValidade: "",
    inicioExecucao: "",
    finalExecucao: "",
    // ✅ CAMPOS ADICIONADOS: Estados iniciais
    numeroProposta: "",
    funcional: "",
    dataOb: "",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0], // Data atual automática
    acoesServicos: [],
    observacoes: "",
  });

  const mountedRef = useRef(true);
  const isEdicao = Boolean(id);

  // ✅ CLEANUP
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ✅ CORREÇÃO PRINCIPAL: useEffect SEM dependências problemáticas
  useEffect(() => {
    const inicializar = async () => {
      // ✅ GUARD: Verificar se contexto está pronto
      if (!user || !user.email) {
        console.log("⏳ Aguardando dados do usuário...");
        return;
      }

      // ✅ EVITAR duplo carregamento
      if (isReady) {
        console.log("✅ Já inicializado, ignorando...");
        return;
      }

      console.log("🚀 Inicializando EmendaForm...", {
        isEdicao,
        userId: user.uid,
      });

      try {
        setLoading(true);
        setError(null);

        if (isEdicao && id) {
          // ✅ MODO EDIÇÃO: Carregar emenda
          console.log("📝 Carregando emenda para edição:", id);

          const emendaDoc = await getDoc(doc(db, "emendas", id));

          if (!emendaDoc.exists()) {
            throw new Error("Emenda não encontrada");
          }

          const emendaData = emendaDoc.data();
          console.log("✅ Emenda carregada:", emendaData.numero);

          // ✅ CORRIGIDO: Valor dos Recursos em formato monetário
          const valorFormatado =
            typeof emendaData.valorRecurso === "number"
              ? emendaData.valorRecurso.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : emendaData.valorRecurso || emendaData.valor || "";

          setFormData({
            numero: emendaData.numero || "",
            autor: emendaData.autor || emendaData.parlamentar || "",
            municipio: emendaData.municipio || "",
            uf: emendaData.uf || "",
            valor: valorFormatado,
            valorRecurso: valorFormatado,
            programa: emendaData.programa || "",
            beneficiario: emendaData.beneficiario || "",
            cnpjBeneficiario: emendaData.cnpjBeneficiario || "",
            tipo: emendaData.tipo || "Individual",
            modalidade: emendaData.modalidade || "",
            objeto: emendaData.objeto || "",
            banco: emendaData.banco || "",
            agencia: emendaData.agencia || "",
            conta: emendaData.conta || "",
            dataAprovacao: emendaData.dataAprovacao || "",
            dataValidade:
              emendaData.dataValidade || emendaData.dataValidada || "",
            inicioExecucao: emendaData.inicioExecucao || "",
            finalExecucao: emendaData.finalExecucao || "",
            // ✅ CAMPOS CORRIGIDOS: Mapeamento correto
            numeroProposta: emendaData.numeroProposta || "",
            funcional: emendaData.funcional || "",
            dataOb: emendaData.dataOb || "",
            acoesServicos: emendaData.acoesServicos || [],
            observacoes: emendaData.observacoes || "",
          });
        } else {
          // ✅ MODO CRIAÇÃO: Pré-preencher dados do operador
          console.log("➕ Modo criação - preparando formulário limpo");

          const userRole = user.tipo || user.role || "operador";

          if (userRole === "operador" && user.municipio && user.uf) {
            setFormData((prev) => ({
              ...prev,
              municipio: user.municipio,
              uf: user.uf,
            }));
            console.log(
              "📍 Pré-preenchido município/UF:",
              user.municipio,
              user.uf,
            );
          }
        }

        setIsReady(true);
        console.log("✅ EmendaForm inicializado com sucesso");
      } catch (error) {
        console.error("❌ Erro ao inicializar EmendaForm:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    inicializar();
  }, [user?.uid, user?.email, user?.tipo, id, isEdicao, isReady]);

  // ✅ HANDLERS simplificados
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = () => {
    const errors = [];

    if (!formData.numero?.trim()) errors.push("Número da emenda é obrigatório");
    if (!formData.autor?.trim()) errors.push("Autor/Parlamentar é obrigatório");
    if (!formData.municipio?.trim()) errors.push("Município é obrigatório");
    if (!formData.uf?.trim()) errors.push("UF é obrigatória");
    if (!formData.valor?.toString().trim()) errors.push("Valor é obrigatório");

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validarFormulario();
    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const valorNumerico = parseFloat(
        formData.valor
          ?.toString()
          .replace(/[R$\s]/g, "") // Remove R$ e espaços
          .replace(/\./g, "") // Remove pontos (milhares)
          .replace(",", "."), // Troca vírgula por ponto (decimais)
      );

      const dadosParaSalvar = {
        numero: formData.numero?.trim(),
        autor: formData.autor?.trim(),
        parlamentar: formData.autor?.trim(),
        municipio: formData.municipio?.trim(),
        uf: formData.uf?.trim(),
        valor: valorNumerico,
        valorRecurso: valorNumerico,
        programa: formData.programa?.trim(),
        beneficiario: formData.beneficiario?.trim(),
        cnpjBeneficiario: formData.cnpjBeneficiario?.trim(),
        tipo: formData.tipo,
        modalidade: formData.modalidade?.trim(),
        objeto: formData.objeto?.trim(),
        banco: formData.banco?.trim(),
        agencia: formData.agencia?.trim(),
        conta: formData.conta?.trim(),
        dataAprovacao: formData.dataAprovacao,
        dataValidade: formData.dataValidade,
        inicioExecucao: formData.inicioExecucao,
        finalExecucao: formData.finalExecucao,
        // ✅ CAMPOS CORRIGIDOS: Incluídos no salvamento
        numeroProposta: formData.numeroProposta?.trim(),
        funcional: formData.funcional?.trim(),
        dataOb: formData.dataOb,
        acoesServicos: formData.acoesServicos || [],
        observacoes: formData.observacoes?.trim(),
        valorExecutado: 0,
        status: "Ativa",
        // ✅ DATA AUTOMÁTICA: Data de última atualização
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0], // YYYY-MM-DD
        atualizadoEm: serverTimestamp(),
        atualizadoPor: user.uid || user.email,
      };

      if (isEdicao) {
        await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
        console.log("✅ Emenda atualizada");
      } else {
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;
        await addDoc(collection(db, "emendas"), dadosParaSalvar);
        console.log("✅ Emenda criada");
      }

      // ✅ NAVEGAÇÃO SIMPLES E DIRETA
      navigate("/emendas");
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      setError(`Erro ao salvar emenda: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ✅ LOADING inicial (aguardando usuário)
  if (!user || !user.email) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>Carregando...</h3>
          <p>Verificando dados do usuário...</p>
        </div>
      </div>
    );
  }

  // ✅ LOADING específico do formulário
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>Preparando formulário...</h3>
          <p>
            {isEdicao
              ? "Carregando dados da emenda..."
              : "Preparando nova emenda..."}
          </p>
        </div>
      </div>
    );
  }

  // ✅ ERROR state
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3>Erro no Formulário</h3>
          <p>{error}</p>
          <div style={styles.errorActions}>
            <button
              onClick={() => {
                setError(null);
                setIsReady(false);
              }}
              style={styles.retryButton}
            >
              🔄 Tentar Novamente
            </button>
            <button
              onClick={() => navigate("/emendas")}
              style={styles.backButton}
            >
              ← Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORMULÁRIO PRINCIPAL
  return (
    <div style={styles.container}>
      <EmendaFormHeader
        modo={isEdicao ? "editar" : "criar"}
        emendaId={id}
        parlamentar={formData.autor}
      />

      <form onSubmit={handleSubmit} style={styles.form}>
        <Identificacao
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <DadosBasicos
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <DadosBeneficiario
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <DadosBancarios
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <Cronograma
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <AcoesServicos
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <InformacoesComplementares
          formData={formData}
          onChange={handleInputChange}
          errors={{}}
        />

        <EmendaFormActions
          modo={isEdicao ? "editar" : "criar"}
          loading={saving}
          onCancel={() => setShowCancelModal(true)}
          onSubmit={handleSubmit}
        />
      </form>

      {showCancelModal && (
        <EmendaFormCancelModal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          hasUnsavedChanges={true}
        />
      )}
    </div>
  );
};

// ✅ ESTILOS (mantidos originais)
const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    minHeight: "100vh",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  form: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "24px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    border: "1px solid #e9ecef",
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #007bff",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
    backgroundColor: "white",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
    margin: "20px 0",
  },
  errorIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },
  errorActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  retryButton: {
    backgroundColor: "#28a745",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
};

// ✅ CSS animation
if (!document.querySelector('style[data-component="emenda-form-fixed"]')) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute("data-component", "emenda-form-fixed");
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default EmendaForm;
