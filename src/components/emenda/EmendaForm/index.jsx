// src/components/emenda/EmendaForm/index.jsx - VALIDAÇÃO CORRIGIDA
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
import LoadingOverlay from "../../LoadingOverlay";
import Toast from "../../Toast";

// Imports de utilitários e validações
import {
  formatarMoedaDisplay,
  formatarMoedaInput,
  parseValorMonetario,
} from "../../../utils/formatters";
import { validarFormularioEmenda } from "../../../utils/validators";
import { validarCNPJ, limparCNPJ } from "../../../utils/cnpjUtils";

const EmendaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // ✅ NOVA FUNÇÃO: Detectar se formulário foi modificado
  const isFormModified = () => {
    const fieldsToCheck = [
      'numero', 'autor', 'municipio', 'valor', 'programa', 
      'objeto', 'beneficiario', 'banco', 'agencia', 'conta'
    ];
    
    return fieldsToCheck.some(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    });
  };

  // ✅ NOVO ESTADO: Calcular modificações em tempo real
  const hasUnsavedChanges = isFormModified();

  const [formData, setFormData] = useState({
    numero: "",
    autor: "",
    municipio: "",
    uf: "",
    cnpj: "", // ✅ CAMPO CNPJ ADICIONADO
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
    numeroProposta: "",
    funcional: "",
    dataOb: "",
    dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
    acoesServicos: [],
    observacoes: "",
  });

  const [expandedSections, setExpandedSections] = useState({
    identificacao: true,
    dadosBasicos: true,
    beneficiario: false,
    complementares: false,
  });

  const mountedRef = useRef(true);
  const isEdicao = Boolean(id);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const inicializar = async () => {
      console.log("🚀 Inicializando EmendaForm...", {
        isEdicao,
        userId: user?.uid,
        userEmail: user?.email,
      });

      try {
        setLoading(true);
        setError(null);

        if (isEdicao && id) {
          console.log("📝 Carregando emenda para edição:", id);

          const emendaDoc = await getDoc(doc(db, "emendas", id));

          if (!emendaDoc.exists()) {
            throw new Error("Emenda não encontrada");
          }

          const emendaData = emendaDoc.data();
          console.log("✅ Emenda carregada:", emendaData.numero);

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
            cnpj: emendaData.cnpj || "", // ✅ MAPEAR CAMPO CNPJ
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
            numeroProposta: emendaData.numeroProposta || "",
            funcional: emendaData.funcional || "",
            dataOb: emendaData.dataOb || "",
            acoesServicos: emendaData.acoesServicos || [],
            observacoes: emendaData.observacoes || "",
          });
        } else {
          console.log("➕ Modo criação - preparando formulário limpo");

          if (user?.tipo === "operador" && user?.municipio && user?.uf) {
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

    if (user) {
      inicializar();
    } else {
      console.log("⏳ Aguardando dados do usuário...");
    }
  }, [user, id, isEdicao]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // ✅ VALIDAÇÃO CORRIGIDA E COMPLETA
  const validarFormulario = () => {
    const errors = [];

    // Campos obrigatórios básicos
    if (!formData.numero?.trim()) {
      errors.push("Número da emenda é obrigatório");
    }

    if (!formData.autor?.trim()) {
      errors.push("Parlamentar/Autor é obrigatório");
    }

    if (!formData.municipio?.trim()) {
      errors.push("Município é obrigatório");
    }

    if (!formData.uf?.trim()) {
      errors.push("UF é obrigatória");
    }

    if (!formData.programa?.trim()) {
      errors.push("Programa é obrigatório");
    }

    if (!formData.objeto?.trim()) {
      errors.push("Objeto da Proposta é obrigatório");
    }

    if (!formData.beneficiario?.trim()) {
      errors.push("Beneficiário (CNPJ) é obrigatório");
    }

    if (!formData.valor?.toString().trim()) {
      errors.push("Valor do Recurso é obrigatório");
    }

    // ✅ VALIDAÇÃO CNPJ CORRIGIDA - Campo Identificação
    if (formData.cnpj) {
      const cnpjLimpo = limparCNPJ(formData.cnpj);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.cnpj)) {
          errors.push("CNPJ do município (Identificação) é inválido");
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.push("CNPJ do município está incompleto");
      }
    }

    // ✅ VALIDAÇÃO CNPJ BENEFICIÁRIO CORRIGIDA
    if (formData.beneficiario) {
      const cnpjLimpo = limparCNPJ(formData.beneficiario);
      if (cnpjLimpo && cnpjLimpo.length === 14) {
        if (!validarCNPJ(formData.beneficiario)) {
          errors.push("CNPJ do beneficiário é inválido");
        }
      } else if (cnpjLimpo && cnpjLimpo.length > 0) {
        errors.push("CNPJ do beneficiário está incompleto");
      }
    }

    // Validação de valor
    if (formData.valor) {
      const valorNumerico = parseFloat(
        formData.valor
          .toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        errors.push("Valor do recurso deve ser maior que zero");
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDAÇÃO COMPLETA ANTES DE SALVAR
    const validationErrors = validarFormulario();

    if (validationErrors.length > 0) {
      setToast({
        show: true,
        message: `❌ Erro na validação:\n${validationErrors.join("\n")}`,
        type: "error",
      });
      return;
    }

    // Prevenir duplo clique
    if (salvando) return;

    setSalvando(true);

    try {
      const valorNumerico = parseFloat(
        formData.valor
          ?.toString()
          .replace(/[R$\s]/g, "")
          .replace(/\./g, "")
          .replace(",", "."),
      );

      // ✅ DADOS CORRIGIDOS - Campos mapeados corretamente
      const dadosParaSalvar = {
        numero: formData.numero?.trim(),
        autor: formData.autor?.trim(),
        parlamentar: formData.autor?.trim(),
        municipio: formData.municipio?.trim(),
        uf: formData.uf?.trim(),
        cnpj: formData.cnpj?.trim(), // ✅ SALVAR CAMPO CNPJ
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
        numeroProposta: formData.numeroProposta?.trim(),
        funcional: formData.funcional?.trim(),
        dataOb: formData.dataOb,
        acoesServicos: formData.acoesServicos || [],
        observacoes: formData.observacoes?.trim(),
        valorExecutado: 0,
        status: "Ativa",
        dataUltimaAtualizacao: new Date().toISOString().split("T")[0],
        atualizadoEm: serverTimestamp(),
        atualizadoPor: user.uid || user.email,
      };

      if (isEdicao) {
        await updateDoc(doc(db, "emendas", id), dadosParaSalvar);
        console.log("✅ Emenda atualizada");

        setToast({
          show: true,
          message: "✅ Emenda atualizada com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/emendas", { replace: true });
        }, 800);
      } else {
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;
        await addDoc(collection(db, "emendas"), dadosParaSalvar);
        console.log("✅ Emenda criada");

        setToast({
          show: true,
          message: "✅ Emenda cadastrada com sucesso!",
          type: "success",
        });

        setTimeout(() => {
          navigate("/emendas", { replace: true });
        }, 800);
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      let mensagemErro = "❌ Erro ao salvar emenda. ";

      if (error.code === "permission-denied") {
        mensagemErro += "Você não tem permissão para esta operação.";
      } else if (error.code === "already-exists") {
        mensagemErro += "Já existe uma emenda com este número.";
      } else {
        mensagemErro += "Tente novamente.";
      }

      setToast({
        show: true,
        message: mensagemErro,
        type: "error",
      });
    } finally {
      setSalvando(false);
    }
  };

  const emendaParaEditar = null;
  const onSuccess = null;

  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // ✅ NOVO HANDLER: Voltar simples (sem modal)
  const handleSimpleBack = () => {
    console.log("🔙 Navegação simples - formulário vazio");
    navigate("/emendas", { replace: true });
  };

  const buscarDadosFornecedor = async (cnpj) => {
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, "");

      const response = await fetch(
        `https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`,
      );

      if (response.ok) {
        const dados = await response.json();

        setFormData((prev) => ({
          ...prev,
          beneficiario: dados.nome_fantasia || dados.razao_social,
          razaoSocial: dados.razao_social,
        }));

        setToast({
          show: true,
          message: `✅ Dados do CNPJ carregados: ${dados.nome_fantasia || dados.razao_social}`,
          type: "success",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
    }
  };

  // ✅ RENDERIZAÇÃO CONDICIONAL DENTRO DO COMPONENTE
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>
            {!user
              ? "Carregando..."
              : isEdicao
                ? "Carregando dados da emenda..."
                : "Preparando formulário..."}
          </h3>
        </div>
      </div>
    );
  }

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
          setFormData={setFormData}
          errors={{}}
          styles={styles}
          buscarDadosFornecedor={buscarDadosFornecedor}
          expanded={expandedSections.beneficiario}
          onToggle={() => toggleSection("beneficiario")}
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
          onCancel={handleCancel}
          onSimpleBack={handleSimpleBack}
          onSubmit={handleSubmit}
          isEdit={isEdicao}
          salvando={salvando}
          loading={saving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </form>

      {showCancelModal && (
        <EmendaFormCancelModal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          hasUnsavedChanges={true}
        />
      )}

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: "", type: "" })}
      />

      <LoadingOverlay
        show={salvando}
        message={
          isEdicao
            ? "Atualizando emenda parlamentar..."
            : "Cadastrando nova emenda parlamentar..."
        }
      />
    </div>
  );
};

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
  formGroup: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
    position: "relative",
  },
  input: {
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    marginTop: "4px",
  },
  inputValid: {
    borderColor: "#27ae60",
    backgroundColor: "#f0fff4",
  },
  inputInvalid: {
    borderColor: "#e74c3c",
    backgroundColor: "#fff5f5",
  },
  validationFeedback: {
    position: "absolute",
    right: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "20px",
    cursor: "pointer",
  },
  helperText: {
    fontSize: "12px",
    marginTop: "4px",
    color: "#666",
  },
  errorText: {
    fontSize: "12px",
    marginTop: "4px",
    color: "#e74c3c",
    fontWeight: "500",
  },
  expandedSection: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "20px",
    backgroundColor: "#fdfdfd",
    marginTop: "20px",
  },
  sectionTitle: {
    margin: "0 0 16px 0",
    paddingBottom: "8px",
    borderBottom: "1px solid #eee",
    color: "#333",
  },
  formRow: {
    display: "flex",
    gap: "16px",
  },
};

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
