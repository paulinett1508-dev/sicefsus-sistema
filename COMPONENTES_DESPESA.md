
# 📋 Documentação Completa - Componentes de Despesa

**Sistema de Gestão de Emendas Parlamentares**  
**Diretório:** `src/components/despesa`  
**Data:** 05/11/2025

---

## 📑 Índice

1. [Cards de Despesa](#cards-de-despesa)
   - [DespesaCardExecutada.jsx](#despesacardexecutadajsx)
   - [DespesaCardPlanejada.jsx](#despesacardplanejadajsx)
   - [despesaCardStyles.js](#despesacardstylesjs)

2. [Formulário de Despesa](#formulário-de-despesa)
   - [DespesaFormActions.jsx](#despesaformactionsjsx)
   - [DespesaFormAdvancedFields.jsx](#despesaformadvancedfieldsjsx)
   - [DespesaFormBanners.jsx](#despesaformbannersjsx)
   - [DespesaFormBasicFields.jsx](#despesaformbasicfieldsjsx)
   - [DespesaFormClassificacaoFuncional.jsx](#despesaformclassificacaofuncionaljsx)
   - [DespesaFormDateFields.jsx](#despesaformdatefieldsjsx)
   - [DespesaFormEmendaInfo.jsx](#despesaformemendainfojsx)
   - [DespesaFormEmpenhoFields.jsx](#despesaformempenhofieldsjsx)
   - [DespesaFormHeader.jsx](#despesaformheaderjsx)
   - [DespesaFormOrcamentoFields.jsx](#despesaformorcamentofieldsjsx)

3. [Listagem e Visualização](#listagem-e-visualização)
   - [DespesasBanner.jsx](#despesasbannerjsx)
   - [DespesasListHeader.jsx](#despesaslistheaderjsx)
   - [DespesasStats.jsx](#despesasstatsjsx)

---

## Cards de Despesa

### DespesaCardExecutada.jsx

```jsx
// components/despesa/DespesaCard/DespesaCardExecutada.jsx
import React from "react";
import { despesaCardStyles } from "./despesaCardStyles";

const DespesaCardExecutada = ({
  numero,
  descricao,
  valor,
  empenho,
  data,
  natureza,
  onClick,
}) => {
  return (
    <div
      style={despesaCardStyles.despesaCard}
      onClick={onClick}
      onMouseEnter={(e) => {
        Object.assign(
          e.currentTarget.style,
          despesaCardStyles.despesaCardHover,
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={despesaCardStyles.despesaCardHeader}>
        <span style={despesaCardStyles.despesaNumero}>#{numero}</span>
        <span style={despesaCardStyles.despesaStatusExecutada}>
          🟢 <strong>EXECUTADA</strong>
        </span>
      </div>
      <div style={despesaCardStyles.despesaDescricao}>{descricao}</div>
      <div style={despesaCardStyles.despesaValor}>
        <strong>{valor}</strong>
      </div>
      <div style={despesaCardStyles.despesaInfoExtra}>
        Empenho: {empenho} • {data} • {natureza}
      </div>
    </div>
  );
};

export default DespesaCardExecutada;
```

**Responsabilidade:** Renderizar card visual de uma despesa executada com informações resumidas.

**Props:**
- `numero`: Número identificador da despesa
- `descricao`: Descrição da despesa
- `valor`: Valor formatado em moeda
- `empenho`: Número do empenho
- `data`: Data da despesa
- `natureza`: Natureza da despesa
- `onClick`: Callback ao clicar no card

---

### DespesaCardPlanejada.jsx

```jsx
// components/despesa/DespesaCard/DespesaCardPlanejada.jsx
import React from "react";
import { despesaCardStyles } from "./despesaCardStyles";

const DespesaCardPlanejada = ({ numero, descricao, valor, onClick }) => {
  return (
    <div
      style={despesaCardStyles.despesaCard}
      onClick={onClick}
      onMouseEnter={(e) => {
        Object.assign(
          e.currentTarget.style,
          despesaCardStyles.despesaCardHover,
        );
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={despesaCardStyles.despesaCardHeader}>
        <span style={despesaCardStyles.despesaNumero}>#{numero}</span>
        <span style={despesaCardStyles.despesaStatusPlanejada}>
          🟡 <strong>PLANEJADA</strong>
        </span>
      </div>
      <div style={despesaCardStyles.despesaDescricao}>{descricao}</div>
      <div style={despesaCardStyles.despesaValor}>
        <strong>{valor}</strong>
      </div>
    </div>
  );
};

export default DespesaCardPlanejada;
```

**Responsabilidade:** Renderizar card visual de uma despesa planejada (ainda não executada).

**Props:**
- `numero`: Número identificador
- `descricao`: Descrição da despesa planejada
- `valor`: Valor formatado
- `onClick`: Callback ao clicar

---

### despesaCardStyles.js

```javascript
// components/despesa/DespesaCard/despesaCardStyles.js
// ✅ ESTILO "CLEAN" E PROFISSIONAL (Layout de "Faixa" / Strip)

export const despesaCardStyles = {
  // ==================== SEÇÕES ====================
  despesasSection: {
    marginBottom: "24px",
  },

  despesasSectionTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#154360",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // -------------------------------------------------
  // ✅ CORREÇÃO "FAIXA": Trocado Grid por Flex Column
  // -------------------------------------------------
  despesasCardsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px", // Espaçamento entre as faixas
  },

  // ==================== CARD BASE (agora é uma "Faixa") ====================
  despesaCard: {
    backgroundColor: "#ffffff", // Fundo BRANCO
    borderRadius: "8px",
    padding: "12px 16px",
    border: "1px solid #e9ecef", // Borda CINZA SUTIL
    borderLeft: "5px solid #22c55e", // ✅ ACENTO VERDE (Executada)
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    minHeight: "100px", // Altura mínima (antes era 130px)
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    width: "100%", // Garantir largura total
  },

  despesaCardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderColor: "#ced4da", // Um leve destaque na borda
  },

  // ==================== HEADER DO CARD ====================
  despesaCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  despesaNumero: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#6c757d",
  },

  // ==================== STATUS BADGES ====================
  despesaStatusPlanejada: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#856404",
    backgroundColor: "#fff3cd",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  despesaStatusExecutada: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#155724",
    backgroundColor: "#d4edda",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },

  // ==================== CONTEÚDO ====================
  despesaDescricao: {
    fontSize: "14px",
    fontWeight: "400",
    color: "#495057",
    lineHeight: "1.4",
  },

  despesaValor: {
    fontSize: "16px",
    color: "#154360",
  },

  // ==================== INFO EXTRA (SÓ EXECUTADAS) ====================
  despesaInfoExtra: {
    fontSize: "11px",
    color: "#6c757d",
    marginTop: "2px",
    paddingTop: "6px",
    borderTop: "1px solid #e9ecef",
    lineHeight: "1.2",
  },
};
```

**Responsabilidade:** Centralizar todos os estilos visuais dos cards de despesa.

---

## Formulário de Despesa

### DespesaFormActions.jsx

```jsx
// src/components/despesa/DespesaFormActions.jsx
// ✅ Componente especializado para botões de ação do formulário

import React from "react";

const DespesaFormActions = ({
  onCancelar,
  loading,
  modoVisualizacao,
  configModo,
}) => {
  return (
    <div style={styles.buttonContainer}>
      <button
        type="button"
        onClick={onCancelar}
        style={styles.cancelButtonStyle}
        disabled={loading}
      >
        ← Voltar
      </button>

      {!modoVisualizacao && (
        <button
          type="submit"
          style={{
            ...styles.submitButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading
            ? "⏳ Salvando..."
            : configModo.modo === "criar"
              ? "✅ Criar Despesa"
              : "✅ Atualizar Despesa"}
        </button>
      )}
    </div>
  );
};

const styles = {
  buttonContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButtonStyle: {
    backgroundColor: '#95a5a6',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  submitButton: {
    backgroundColor: '#27AE60',
    color: 'white',
    padding: '12px 32px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
  },
};

export default DespesaFormActions;
```

**Responsabilidade:** Renderizar botões de ação (Voltar/Salvar) do formulário.

---

### DespesaFormAdvancedFields.jsx

```jsx
// src/components/despesa/DespesaFormAdvancedFields.jsx
// ✅ Componente especializado para campos avançados da despesa

import React from "react";

const DespesaFormAdvancedFields = ({
  formData,
  errors,
  cnpjError,
  modoVisualizacao,
  handleInputChange,
}) => {
  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>📝</span>
        Campos Avançados
      </legend>

      <div style={styles.formGrid}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="pendente">Pendente</option>
            <option value="empenhado">Empenhado</option>
            <option value="liquidado">Liquidado</option>
            <option value="pago">Pago</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Categoria</label>
          <select
            name="categoria"
            value={formData.categoria}
            onChange={handleInputChange}
            style={styles.select}
            disabled={modoVisualizacao}
          >
            <option value="">Selecione a categoria</option>
            <option value="equipamentos">Equipamentos</option>
            <option value="reformas">Reformas</option>
            <option value="construcao">Construção</option>
            <option value="servicos">Serviços</option>
            <option value="medicamentos">Medicamentos</option>
            <option value="materiais">Materiais</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Centro de Custo</label>
          <input
            type="text"
            name="centroCusto"
            value={formData.centroCusto}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Código do centro de custo"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Natureza da Despesa</label>
          <input
            type="text"
            name="naturezaDespesa"
            value={formData.naturezaDespesa}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Ex: 4.4.90.52"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Elemento de Despesa</label>
          <input
            type="text"
            name="elementoDespesa"
            value={formData.elementoDespesa}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="Código do elemento"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            CNPJ do Fornecedor
            <span
              style={styles.infoIcon}
              title="CNPJ será validado automaticamente"
            >
              ℹ️
            </span>
          </label>
          <input
            type="text"
            name="cnpjFornecedor"
            value={formData.cnpjFornecedor}
            onChange={handleInputChange}
            style={cnpjError ? styles.inputError : styles.input}
            readOnly={modoVisualizacao}
            placeholder="00.000.000/0000-00"
            maxLength="18"
          />
          {cnpjError && <span style={styles.errorText}>{cnpjError}</span>}
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Telefone do Fornecedor</label>
          <input
            type="text"
            name="telefoneFornecedor"
            value={formData.telefoneFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Email do Fornecedor</label>
          <input
            type="email"
            name="emailFornecedor"
            value={formData.emailFornecedor}
            onChange={handleInputChange}
            style={styles.input}
            readOnly={modoVisualizacao}
            placeholder="fornecedor@email.com"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Endereço do Fornecedor</label>
        <textarea
          name="enderecoFornecedor"
          value={formData.enderecoFornecedor}
          onChange={handleInputChange}
          style={styles.textarea}
          readOnly={modoVisualizacao}
          placeholder="Endereço completo do fornecedor..."
          rows={3}
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Observações</label>
        <textarea
          name="observacoes"
          value={formData.observacoes}
          onChange={handleInputChange}
          style={styles.textarea}
          readOnly={modoVisualizacao}
          placeholder="Observações adicionais sobre a despesa..."
          rows={3}
        />
      </div>
    </fieldset>
  );
};

const styles = {
  fieldset: {
    border: "2px solid #154360",
    borderRadius: "10px",
    padding: "20px",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  legend: {
    background: "white",
    padding: "5px 15px",
    borderRadius: "20px",
    border: "2px solid #154360",
    color: "#154360",
    fontWeight: "bold",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  legendIcon: {
    fontSize: "18px",
  },
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
  label: {
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "5px",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  inputError: {
    padding: "12px",
    border: "2px solid #dc3545",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    boxSizing: "border-box",
  },
  select: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    boxSizing: "border-box",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    resize: "vertical",
    minHeight: "100px",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "5px",
  },
  infoIcon: {
    fontSize: "14px",
    color: "#0066cc",
    cursor: "help",
    userSelect: "none",
  },
};

export default DespesaFormAdvancedFields;
```

**Responsabilidade:** Renderizar campos avançados opcionais do formulário de despesa.

---

*Devido ao limite de caracteres, vou criar o arquivo completo. Continuando...*
