// src/components/emenda/EmendaForm/index.jsx - CORREÇÃO COMPATIBILIDADE v2.4
// ✅ PRESERVA: Toda estrutura modular existente (seções + componentes)
// ✅ CORRIGE: Incompatibilidade de contexto de usuário com Dashboard

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { useUser } from '../../../context/UserContext'; // ✅ MESMO IMPORT DO DASHBOARD

// ✅ IMPORTS DAS SEÇÕES EXISTENTES (PRESERVADOS)
import Identificacao from './sections/Identificacao';
import DadosBasicos from './sections/DadosBasicos';
import DadosBeneficiario from './sections/DadosBeneficiario';
import ClassificacaoTecnica from './sections/ClassificacaoTecnica';
import DadosBancarios from './sections/DadosBancarios';
import Cronograma from './sections/Cronograma';
import AcoesServicos from './sections/AcoesServicos';

// ✅ IMPORTS DOS COMPONENTES EXISTENTES (PRESERVADOS)
import EmendaFormHeader from './components/EmendaFormHeader';
import EmendaFormActions from './components/EmendaFormActions';
import EmendaFormCancelModal from './components/EmendaFormCancelModal';

// ✅ HOOKS EXISTENTES (SE HOUVER)
// import { useValidation } from '../../../hooks/useValidation';
// import { useEmendaFormNavigation } from '../../../hooks/useEmendaFormNavigation';

const EmendaForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // ✅ ESTRUTURA COMPATÍVEL COM DASHBOARD v2.4
  const { user } = useUser();
  const userLoading = !user;

  // ✅ ESTADOS PRINCIPAIS
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [formData, setFormData] = useState({
    // Identificação
    numero: '',
    autor: '',

    // Dados Básicos  
    municipio: '',
    uf: '',
    valor: '',
    valorRecurso: '', // ✅ COMPATÍVEL COM DASHBOARD
    programa: '',

    // Beneficiário
    beneficiario: '',
    cnpjBeneficiario: '',

    // Classificação
    tipo: 'Individual',
    modalidade: '',
    objeto: '',

    // Bancários
    banco: '',
    agencia: '',
    conta: '',

    // Cronograma
    dataAprovacao: '',
    dataValidade: '', // ✅ COMPATÍVEL COM CRONOGRAMA
    inicioExecucao: '',
    finalExecucao: '',

    // Ações e Serviços
    acoesServicos: [],

    // Observações
    observacoes: ''
  });

  const mountedRef = useRef(true);
  const timeoutRef = useRef(null);
  const isEdicao = Boolean(id);

  // ✅ CLEANUP
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ VERIFICAÇÃO DE USUÁRIO (IGUAL DASHBOARD)
  if (userLoading || !user || !user.email || !user.tipo) {
    return (
      <div style={styles.container}>
        <EmendaFormHeader 
          isEdicao={isEdicao}
          onBack={() => navigate('/emendas')}
        />

        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>⏳ Aguardando dados do usuário...</p>
          <p style={styles.loadingSubtext}>Verificando permissões do usuário...</p>
        </div>
      </div>
    );
  }

  // ✅ PERMISSÕES (IGUAL DASHBOARD)
  const userRole = user.tipo || user.role || "operador";
  const userMunicipio = user.municipio || "";
  const userUf = user.uf || "";

  console.log("🔐 Permissões EmendaForm:", { userRole, userMunicipio, userUf });

  // ✅ CARREGAMENTO INICIAL COM TIMEOUT
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📝 Iniciando carregamento EmendaForm...');

        // Timeout de segurança - 10 segundos
        timeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            console.warn('⏰ Timeout: Carregamento EmendaForm demorou mais que 10s');
            setLoading(false);
            if (isEdicao) {
              setError('Timeout ao carregar dados da emenda. Tente novamente.');
            }
          }
        }, 10000);

        if (isEdicao) {
          // ✅ CARREGAR EMENDA EXISTENTE
          console.log(`📖 Carregando emenda ${id}...`);

          const emendaDoc = await getDoc(doc(db, 'emendas', id));

          if (!emendaDoc.exists()) {
            throw new Error('Emenda não encontrada');
          }

          const emendaData = emendaDoc.data();

          // ✅ VERIFICAR PERMISSÕES PARA EDIÇÃO
          if (userRole === "operador" && emendaData.municipio !== userMunicipio) {
            throw new Error('Você não tem permissão para editar esta emenda');
          }

          if (mountedRef.current) {
            // ✅ MAPEAR DADOS PARA FORMULÁRIO (COMPATÍVEL)
            setFormData({
              // Identificação
              numero: emendaData.numero || '',
              autor: emendaData.autor || emendaData.parlamentar || '',

              // Dados Básicos
              municipio: emendaData.municipio || '',
              uf: emendaData.uf || '',
              valor: emendaData.valor || emendaData.valorRecurso || '',
              valorRecurso: emendaData.valorRecurso || emendaData.valor || '',
              programa: emendaData.programa || '',

              // Beneficiário  
              beneficiario: emendaData.beneficiario || '',
              cnpjBeneficiario: emendaData.cnpjBeneficiario || '',

              // Classificação
              tipo: emendaData.tipo || 'Individual',
              modalidade: emendaData.modalidade || '',
              objeto: emendaData.objeto || '',

              // Bancários
              banco: emendaData.banco || '',
              agencia: emendaData.agencia || '',
              conta: emendaData.conta || '',

              // Cronograma
              dataAprovacao: emendaData.dataAprovacao || '',
              dataValidade: emendaData.dataValidade || emendaData.dataValidada || '',
              inicioExecucao: emendaData.inicioExecucao || '',
              finalExecucao: emendaData.finalExecucao || '',

              // Ações e Serviços
              acoesServicos: emendaData.acoesServicos || [],

              // Observações
              observacoes: emendaData.observacoes || ''
            });
          }

        } else {
          // ✅ NOVA EMENDA - PRÉ-PREENCHER DADOS DO OPERADOR
          if (userRole === "operador" && userMunicipio) {
            setFormData(prev => ({
              ...prev,
              municipio: userMunicipio,
              uf: userUf
            }));
          }
        }

        if (mountedRef.current) {
          clearTimeout(timeoutRef.current);
          setLoading(false);
          console.log('✅ EmendaForm carregado com sucesso');
        }

      } catch (error) {
        console.error('❌ Erro ao carregar EmendaForm:', error);

        if (mountedRef.current) {
          clearTimeout(timeoutRef.current);
          setError(error.message);
          setLoading(false);
        }
      }
    };

    // ✅ CARREGAR APENAS SE USUÁRIO COMPLETO
    if (user && user.email && (user.tipo || user.role)) {
      console.log("🚀 Iniciando carregamento para usuário:", user.email);
      carregarDados();
    } else {
      console.log("⏳ Aguardando dados completos do usuário...");
      // Fallback: se não tem dados após 5s, mostrar erro
      const fallbackTimeout = setTimeout(() => {
        if (mountedRef.current && !user?.email) {
          setError("Dados do usuário não carregaram. Tente fazer login novamente.");
          setLoading(false);
        }
      }, 5000);

      return () => clearTimeout(fallbackTimeout);
    }
  }, [id, user?.email, user?.tipo, user?.role, isEdicao, userRole, userMunicipio, userUf]);

  // ✅ HANDLE INPUT CHANGE
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ VALIDAÇÃO BÁSICA
  const validarFormulario = () => {
    const errors = [];

    // Campos obrigatórios básicos
    if (!formData.numero?.trim()) errors.push('Número da emenda é obrigatório');
    if (!formData.autor?.trim()) errors.push('Autor/Parlamentar é obrigatório');
    if (!formData.municipio?.trim()) errors.push('Município é obrigatório');
    if (!formData.uf?.trim()) errors.push('UF é obrigatória');
    if (!formData.valor?.toString().trim()) errors.push('Valor é obrigatório');
    if (!formData.dataAprovacao?.trim()) errors.push('Data de aprovação é obrigatória');
    if (!formData.dataValidade?.trim()) errors.push('Data de validade é obrigatória');

    // Validar valor numérico
    const valorNumerico = parseFloat(formData.valor?.toString().replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      errors.push('Valor deve ser um número positivo');
    }

    return errors;
  };

  // ✅ SUBMIT
  const handleSubmit = async () => {
    const errors = validarFormulario();
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    try {
      setSaving(true);
      setError(null);

      console.log(isEdicao ? '💾 Salvando alterações...' : '➕ Criando nova emenda...');

      // ✅ PREPARAR DADOS COMPATÍVEIS COM DASHBOARD
      const valorNumerico = parseFloat(formData.valor?.toString().replace(/[^\d,.-]/g, '').replace(',', '.'));

      const dadosParaSalvar = {
        // Dados básicos
        numero: formData.numero?.trim(),
        autor: formData.autor?.trim(),
        parlamentar: formData.autor?.trim(), // ✅ COMPATIBILIDADE
        municipio: formData.municipio?.trim(),
        uf: formData.uf?.trim(),
        valor: valorNumerico,
        valorRecurso: valorNumerico, // ✅ COMPATIBILIDADE COM DASHBOARD
        programa: formData.programa?.trim(),

        // Beneficiário
        beneficiario: formData.beneficiario?.trim(),
        cnpjBeneficiario: formData.cnpjBeneficiario?.trim(),

        // Classificação
        tipo: formData.tipo,
        modalidade: formData.modalidade?.trim(),
        objeto: formData.objeto?.trim(),

        // Bancários
        banco: formData.banco?.trim(),
        agencia: formData.agencia?.trim(),
        conta: formData.conta?.trim(),

        // Cronograma
        dataAprovacao: formData.dataAprovacao,
        dataValidade: formData.dataValidade,
        dataValidada: formData.dataValidade, // ✅ COMPATIBILIDADE COM CRONOGRAMA
        inicioExecucao: formData.inicioExecucao,
        finalExecucao: formData.finalExecucao,

        // Ações e Serviços
        acoesServicos: formData.acoesServicos || [],

        // Observações
        observacoes: formData.observacoes?.trim(),

        // ✅ METADADOS PARA DASHBOARD/CRONOGRAMA
        valorExecutado: 0, // Compatível com cronograma
        status: 'Ativa',

        // Auditoria
        atualizadoEm: serverTimestamp(),
        atualizadoPor: user.uid || user.email
      };

      if (isEdicao) {
        // Atualizar emenda existente
        await updateDoc(doc(db, 'emendas', id), dadosParaSalvar);
        console.log('✅ Emenda atualizada');
      } else {
        // Criar nova emenda
        dadosParaSalvar.criadoEm = serverTimestamp();
        dadosParaSalvar.criadoPor = user.uid || user.email;

        await addDoc(collection(db, 'emendas'), dadosParaSalvar);
        console.log('✅ Emenda criada');
      }

      // Navegar de volta
      navigate('/emendas');

    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
      setError(`Erro ao salvar emenda: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // ✅ FORÇA PARADA (BOTÃO EMERGÊNCIA)
  const forcarParada = () => {
    console.log("🛑 Forçando parada do EmendaForm");
    clearTimeout(timeoutRef.current);
    setLoading(false);
    if (isEdicao) {
      setError("Carregamento interrompido pelo usuário. Clique em 'Tentar Novamente' para recarregar.");
    }
  };

  // ✅ RETRY
  const tentarNovamente = () => {
    setError(null);
    setLoading(true);
  };

  // ✅ LOADING COM BOTÃO DE EMERGÊNCIA
  if (loading) {
    return (
      <div style={styles.container}>
        <EmendaFormHeader 
          isEdicao={isEdicao}
          onBack={() => navigate('/emendas')}
        />

        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3>Carregando formulário...</h3>
          <p style={styles.loadingText}>
            {isEdicao 
              ? "Carregando dados da emenda..." 
              : "Preparando formulário para nova emenda..."}
          </p>

          {/* 🛑 BOTÃO DE EMERGÊNCIA */}
          <div style={styles.emergencyControls}>
            <button onClick={forcarParada} style={styles.stopButton}>
              🛑 Parar Carregamento
            </button>
            <p style={styles.emergencyText}>
              Se o carregamento está demorando muito, clique acima para interromper
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ERROR
  if (error) {
    return (
      <div style={styles.container}>
        <EmendaFormHeader 
          isEdicao={isEdicao}
          onBack={() => navigate('/emendas')}
        />

        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>❌</div>
          <h3>Erro no Formulário</h3>
          <p style={styles.errorMessage}>{error}</p>

          <div style={styles.errorActions}>
            <button onClick={tentarNovamente} style={styles.retryButton}>
              🔄 Tentar Novamente
            </button>
            <button onClick={() => navigate('/emendas')} style={styles.backButton}>
              ← Voltar para Lista
            </button>
          </div>

          <div style={styles.debugInfo}>
            <details>
              <summary>Informações de Debug</summary>
              <pre style={styles.debugText}>
                {JSON.stringify({
                  user: user?.email || 'não logado',
                  tipo: user?.tipo || user?.role || 'indefinido',
                  municipio: user?.municipio || 'não informado',
                  isEdicao,
                  emendaId: id,
                  timestamp: new Date().toISOString()
                }, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // ✅ FORMULÁRIO PRINCIPAL - USANDO SEÇÕES EXISTENTES
  return (
    <div style={styles.container}>
      <EmendaFormHeader 
        isEdicao={isEdicao}
        onBack={() => navigate('/emendas')}
      />

      <form onSubmit={(e) => e.preventDefault()} style={styles.form}>
        {/* ✅ SEÇÕES EXISTENTES PRESERVADAS */}

        <Identificacao
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}} // TODO: Implementar validação por seção se necessário
        />

        <DadosBasicos
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
          userRole={userRole}
          userMunicipio={userMunicipio}
          userUf={userUf}
        />

        <DadosBeneficiario
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
        />

        <ClassificacaoTecnica
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
        />

        <DadosBancarios
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
        />

        <Cronograma
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
        />

        <AcoesServicos
          formData={formData}
          handleInputChange={handleInputChange}
          errors={{}}
        />

        {/* ✅ AÇÕES DO FORMULÁRIO */}
        <EmendaFormActions
          isEdicao={isEdicao}
          saving={saving}
          onCancel={() => setShowCancelModal(true)}
          onSubmit={handleSubmit}
        />
      </form>

      {/* ✅ MODAL DE CANCELAMENTO */}
      {showCancelModal && (
        <EmendaFormCancelModal
          isOpen={showCancelModal}
          onConfirm={() => navigate('/emendas')}
          onCancel={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
};

// ✅ ESTILOS CONSISTENTES COM DASHBOARD v2.4
const styles = {
  container: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e9ecef',
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    margin: '20px 0',
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "400px",
    gap: "20px",
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  loadingText: {
    color: '#666',
    fontSize: '14px',
    marginBottom: '30px'
  },
  loadingSubtext: {
    fontSize: '13px',
    color: '#666',
    marginTop: '8px'
  },
  emergencyControls: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#fff3cd',
    borderRadius: '6px',
    border: '1px solid #ffeaa7'
  },
  stopButton: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '10px'
  },
  emergencyText: {
    fontSize: '12px',
    color: '#856404',
    margin: 0
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
    margin: '20px 0'
  },
  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: '14px',
    marginBottom: '20px'
  },
  errorActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  retryButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  debugInfo: {
    marginTop: '20px',
    textAlign: 'left'
  },
  debugText: {
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '11px',
    overflow: 'auto'
  }
};

// ✅ KEYFRAMES PARA SPINNER
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-component="emenda-form"]')) {
  styleSheet.setAttribute("data-component", "emenda-form");
  document.head.appendChild(styleSheet);
}

export default EmendaForm;