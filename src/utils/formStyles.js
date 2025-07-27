// ✅ ESTILOS UNIVERSAIS PARA FORMS - COM DARK MODE COMPLETO
// Usar estes estilos tanto no EmendaForm.jsx quanto no DespesaForm.jsx

const formStyles = {
  // ✅ Container principal
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "var(--theme-bg)",
    fontFamily: "var(--font-family)",
    color: "var(--theme-text)",
    transition: "background-color 0.3s ease, color 0.3s ease",
  },

  // ✅ Header
  header: {
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    border: "2px solid var(--theme-border)",
    backgroundColor: "var(--theme-surface)",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  headerTitle: {
    margin: "0 0 10px 0",
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--primary)",
  },

  headerSubtitle: {
    margin: "0 0 10px 0",
    fontSize: "14px",
    opacity: 0.8,
    color: "var(--theme-text-secondary)",
  },

  // ✅ Success Message
  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "var(--success-light)",
    color: "var(--success-dark)",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid var(--success)",
    marginBottom: "20px",
    boxShadow: "var(--shadow-sm)",
  },

  successIcon: {
    fontSize: "20px",
  },

  successText: {
    fontWeight: "bold",
  },

  // ✅ Info cards (emenda info, etc)
  emendaInfo: {
    backgroundColor: "var(--accent-light)",
    border: "2px solid var(--accent)",
    borderRadius: "10px",
    padding: "20px",
    marginBottom: "30px",
    color: "var(--accent-dark)",
  },

  emendaInfoTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "var(--accent-dark)",
    marginBottom: "15px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  emendaInfoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "15px",
  },

  emendaInfoRow: {
    fontSize: "14px",
    color: "var(--accent-dark)",
  },

  // ✅ Form principal
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
  },

  // ✅ Fieldsets
  fieldset: {
    border: "2px solid var(--primary)",
    borderRadius: "10px",
    padding: "20px",
    background:
      "linear-gradient(135deg, var(--theme-surface) 0%, var(--theme-surface-secondary) 100%)",
    boxShadow: "var(--shadow)",
    transition: "background 0.3s ease, border-color 0.3s ease",
  },

  legend: {
    background: "var(--theme-surface)",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid var(--primary)",
    color: "var(--primary)",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background-color 0.3s ease, border-color 0.3s ease",
  },

  legendIcon: {
    fontSize: "18px",
  },

  // ✅ Form grids e grupos
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  // ✅ Labels
  label: {
    fontWeight: "bold",
    color: "var(--theme-text)",
    fontSize: "14px",
  },

  labelRequired: {
    fontWeight: "bold",
    color: "var(--theme-text)",
    fontSize: "14px",
  },

  labelObrigatorio: {
    fontWeight: "bold",
    color: "var(--primary)",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "5px",
  },

  required: {
    color: "var(--error)",
  },

  // ✅ Inputs
  input: {
    padding: "12px",
    border: "2px solid var(--theme-border)",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    boxSizing: "border-box",
  },

  inputError: {
    padding: "12px",
    border: "2px solid var(--error)",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "all 0.3s ease",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    boxSizing: "border-box",
  },

  inputReadonly: {
    padding: "12px",
    border: "2px solid var(--accent)",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "var(--accent-light)",
    color: "var(--accent-dark)",
    fontWeight: "bold",
    boxSizing: "border-box",
  },

  // ✅ Select
  select: {
    padding: "12px",
    border: "2px solid var(--theme-border)",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    cursor: "pointer",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },

  selectError: {
    padding: "12px",
    border: "2px solid var(--error)",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  // ✅ Textarea
  textarea: {
    padding: "12px",
    border: "2px solid var(--theme-border)",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "var(--font-family)",
    backgroundColor: "var(--theme-surface)",
    color: "var(--theme-text)",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
  },

  // ✅ Help text e erros
  errorText: {
    color: "var(--error)",
    fontSize: "12px",
    marginTop: "5px",
    fontWeight: "500",
  },

  helpText: {
    color: "var(--theme-text-secondary)",
    fontSize: "12px",
    marginTop: "5px",
  },

  // ✅ Botões especiais
  toggleButton: {
    backgroundColor: "var(--info)",
    color: "var(--white)",
    padding: "12px 24px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "20px",
    transition: "all 0.3s ease",
    boxShadow: "var(--shadow-sm)",
  },

  // ✅ Containers especiais para novos campos
  naturezaDespesaContainer: {
    background: "var(--theme-surface-secondary)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "1px solid var(--theme-border)",
  },

  naturezaDespesaGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "20px",
    marginBottom: "20px",
  },

  naturezaDisplay: {
    background: "var(--theme-surface)",
    border: "2px solid var(--primary)",
    borderRadius: "8px",
    padding: "15px",
  },

  naturezaDisplayRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "bold",
  },

  naturezaLabel: {
    color: "var(--primary)",
    textTransform: "uppercase",
  },

  naturezaValor: {
    color: "var(--success)",
    fontFamily: "monospace",
    fontSize: "18px",
  },

  detalhamentoRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "20px",
    marginBottom: "25px",
    padding: "15px",
    background: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
    borderRadius: "8px",
  },

  detalhamentoCampo: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  // ✅ Ações e Serviços (EmendaForm)
  novaAcaoContainer: {
    background: "var(--theme-surface-secondary)",
    borderRadius: "8px",
    padding: "20px",
    marginBottom: "20px",
    border: "2px dashed var(--theme-border)",
  },

  tipoSelector: {
    marginBottom: "15px",
  },

  novaAcaoForm: {
    display: "grid",
    gridTemplateColumns: "2fr 3fr 1fr auto",
    gap: "15px",
    alignItems: "end",
  },

  addButton: {
    background: "var(--success)",
    color: "var(--white)",
    border: "none",
    borderRadius: "6px",
    padding: "12px 16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    boxShadow: "var(--shadow-sm)",
  },

  addButtonDisabled: {
    background: "var(--secondary)",
    cursor: "not-allowed",
  },

  acoesListContainer: {
    marginTop: "20px",
  },

  emptyState: {
    textAlign: "center",
    color: "var(--theme-text-secondary)",
    fontStyle: "italic",
    padding: "20px",
  },

  acoesList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  acaoItem: {
    background: "var(--theme-surface)",
    border: "1px solid var(--theme-border)",
    borderRadius: "8px",
    padding: "15px",
    boxShadow: "var(--shadow-sm)",
  },

  acaoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },

  acaoTipo: {
    background: "var(--primary)",
    color: "var(--white)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "bold",
  },

  acaoValor: {
    background: "var(--success)",
    color: "var(--white)",
    padding: "4px 12px",
    borderRadius: "20px",
    fontWeight: "bold",
  },

  removeButton: {
    background: "var(--error)",
    color: "var(--white)",
    border: "none",
    borderRadius: "4px",
    padding: "4px 8px",
    cursor: "pointer",
    fontSize: "0.9em",
    transition: "all 0.2s ease",
  },

  removeButtonHover: {
    background: "var(--error-dark)",
  },

  acaoDescricao: {
    color: "var(--primary)",
    marginBottom: "8px",
    fontSize: "1.05em",
  },

  acaoComplemento: {
    color: "var(--theme-text-secondary)",
    fontSize: "0.95em",
    lineHeight: "1.4",
  },

  resumoTotal: {
    background: "var(--theme-surface-secondary)",
    padding: "15px",
    borderRadius: "8px",
    marginTop: "20px",
    textAlign: "center",
    color: "var(--primary)",
    border: "1px solid var(--theme-border)",
  },

  // ✅ Botões de ação
  buttonContainer: {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "30px",
    paddingTop: "20px",
    borderTop: "1px solid var(--theme-border)",
  },

  cancelButtonStyle: {
    padding: "12px 24px",
    backgroundColor: "var(--secondary)",
    color: "var(--white)",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "var(--shadow-sm)",
  },

  submitButton: {
    padding: "12px 24px",
    backgroundColor: "var(--success)",
    color: "var(--white)",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "var(--shadow-sm)",
  },

  // ✅ Responsividade
  smallScreenNovaAcaoForm: {
    gridTemplateColumns: "1fr",
  },

  smallScreenAcaoHeader: {
    flexDirection: "column",
    gap: "10px",
    alignItems: "flex-start",
  },

  // ✅ Estados especiais
  "@media (max-width: 768px)": {
    container: {
      padding: "10px",
    },
    formGrid: {
      gridTemplateColumns: "1fr",
    },
    naturezaDespesaGrid: {
      gridTemplateColumns: "1fr",
    },
    detalhamentoRow: {
      gridTemplateColumns: "1fr",
      gap: "15px",
    },
    naturezaDisplayRow: {
      flexDirection: "column",
      gap: "10px",
      textAlign: "center",
    },
    buttonContainer: {
      flexDirection: "column",
    },
  },
};

// ✅ EFEITOS HOVER E FOCUS PARA INPUTS (adicionar via CSS ou JavaScript)
const addFormInteractivity = () => {
  // CSS para adicionar no tema principal
  const css = `
    /* Form inputs hover/focus effects */
    input:focus, select:focus, textarea:focus {
      border-color: var(--accent) !important;
      box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1) !important;
      outline: none !important;
    }

    input:hover:not(:focus), select:hover:not(:focus), textarea:hover:not(:focus) {
      border-color: var(--theme-border-light) !important;
    }

    /* Button hover effects */
    button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md) !important;
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    /* Fieldset animations */
    fieldset {
      transition: all 0.3s ease;
    }

    fieldset:hover {
      box-shadow: var(--shadow-md);
    }

    /* Select styling */
    select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1.5em 1.5em;
      padding-right: 2.5rem;
    }

    /* Dark mode adjustments */
    [data-theme="dark"] select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }

    /* Scrollbar styling */
    textarea::-webkit-scrollbar {
      width: 8px;
    }

    textarea::-webkit-scrollbar-track {
      background: var(--theme-surface-secondary);
      border-radius: 4px;
    }

    textarea::-webkit-scrollbar-thumb {
      background: var(--theme-border);
      border-radius: 4px;
    }

    textarea::-webkit-scrollbar-thumb:hover {
      background: var(--accent);
    }
  `;

  // Adicionar CSS se não existir
  if (!document.getElementById("form-styles")) {
    const style = document.createElement("style");
    style.id = "form-styles";
    style.textContent = css;
    document.head.appendChild(style);
  }
};

// ✅ EXPORTAR PARA USO NOS FORMS
export { formStyles, addFormInteractivity };

// ✅ EXEMPLO DE USO:

/*
// No EmendaForm.jsx ou DespesaForm.jsx:

import { formStyles, addFormInteractivity } from '../utils/formStyles';

// No useEffect do componente:
useEffect(() => {
  addFormInteractivity();
}, []);

// Nos estilos do componente:
const styles = {
  ...formStyles,
  // Estilos específicos do componente se houver
};

// Substituir o objeto styles existente pelo novo
*/

// ✅ INSTRUÇÕES DE APLICAÇÃO:

/*
1. Criar arquivo: src/utils/formStyles.js com este conteúdo
2. Importar nos componentes EmendaForm.jsx e DespesaForm.jsx
3. Substituir const styles = {...} pelo import
4. Chamar addFormInteractivity() no useEffect
5. Testar o Dark Mode nos formulários
*/
