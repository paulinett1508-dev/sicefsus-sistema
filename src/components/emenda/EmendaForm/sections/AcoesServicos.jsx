import React from "react";

const AcoesServicos = ({ formData = {}, onChange, fieldErrors = {} }) => {
  const estrategias = [
    "Aquisição de Insumos e Materiais de Uso Contínuo para Acompanhamento de Pessoas com Condições Crônicas",
    "Oferta de medicamentos da Atenção Básica",
    "Manutenção da oferta de medicamentos, insumos e materiais de forma regular para os estabelecimentos de saúde",
    "Estratégia de Rastreamento e Controle de Condições Crônicas",
    "Custeio de serviços especializados",
    "Reforma e adequação de unidades de saúde",
    "Construção de novas unidades",
    "Aquisição de equipamentos médicos",
    "Capacitação de profissionais",
    "Outros",
  ];

  const metas = [
    "Oferta de medicamentos da Atenção Básica",
    "Manutenção da oferta de medicamentos, insumos e materiais de forma regular para os estabelecimentos de saúde",
    "Redução de internações por condições sensíveis à atenção primária",
    "Melhoria da cobertura da atenção básica",
    "Fortalecimento da rede de atenção à saúde",
    "Ampliação do acesso aos serviços de saúde",
    "Qualificação da assistência farmacêutica",
    "Modernização da infraestrutura de saúde",
    "Capacitação de recursos humanos",
    "Outras",
  ];

  const handleInputChange = (e) => {
    onChange(e);
  };

  const formatarMoeda = (valor) => {
    if (!valor) return "";
    const numero = valor.replace(/\D/g, "");
    if (!numero) return "";
    const centavos = parseInt(numero, 10);
    const reais = centavos / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(reais);
  };

  const handleValorChange = (e) => {
    const { name, value } = e.target;
    const valorFormatado = formatarMoeda(value);
    onChange({ target: { name, value: valorFormatado } });
  };

  return (
    <fieldset style={styles.fieldset}>
      <legend style={styles.legend}>
        <span style={styles.legendIcon}>🎯</span>
        Ações e Serviços
      </legend>

      <div style={styles.formGrid}>
        {/* Estratégia */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Estratégia <span style={styles.required}>*</span>
          </label>
          <select
            name="estrategia"
            value={formData.estrategia || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.estrategia && styles.inputError),
            }}
            required
          >
            <option value="">Selecione a estratégia</option>
            {estrategias.map((estrategia) => (
              <option key={estrategia} value={estrategia}>
                {estrategia}
              </option>
            ))}
          </select>
          {fieldErrors.estrategia && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Meta */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Meta <span style={styles.required}>*</span>
          </label>
          <select
            name="meta"
            value={formData.meta || ""}
            onChange={handleInputChange}
            style={{
              ...styles.input,
              ...(fieldErrors.meta && styles.inputError),
            }}
            required
          >
            <option value="">Selecione a meta</option>
            {metas.map((meta) => (
              <option key={meta} value={meta}>
                {meta}
              </option>
            ))}
          </select>
          {fieldErrors.meta && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Valor */}
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="valorAcao"
            value={formData.valorAcao || ""}
            onChange={handleValorChange}
            style={{
              ...styles.input,
              ...styles.inputMoney,
              ...(fieldErrors.valorAcao && styles.inputError),
            }}
            placeholder="R$ 0,00"
            required
          />
          {fieldErrors.valorAcao && (
            <small style={styles.errorText}>Campo obrigatório</small>
          )}
        </div>

        {/* Indicador */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Indicador</label>
          <input
            type="text"
            name="indicador"
            value={formData.indicador || ""}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Ex: Número de beneficiários atendidos"
          />
        </div>

        {/* Unidade de Medida */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Unidade de Medida</label>
          <input
            type="text"
            name="unidadeMedida"
            value={formData.unidadeMedida || ""}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Ex: Pessoa, Unidade, Procedimento"
          />
        </div>

        {/* Quantidade */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Quantidade</label>
          <input
            type="number"
            name="quantidade"
            value={formData.quantidade || ""}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="0"
            min="1"
          />
        </div>
      </div>

      {/* Descrição detalhada */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Descrição Detalhada das Ações</label>
        <textarea
          name="descricaoAcoes"
          value={formData.descricaoAcoes || ""}
          onChange={handleInputChange}
          style={styles.textarea}
          placeholder="Descreva detalhadamente as ações que serão realizadas com os recursos da emenda..."
          rows="4"
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
  },
  required: {
    color: "#dc3545",
  },
  input: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
  },
  inputMoney: {
    fontWeight: "600",
    color: "#059669",
    textAlign: "right",
    fontSize: "16px",
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  textarea: {
    padding: "12px",
    border: "2px solid #dee2e6",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    backgroundColor: "white",
    resize: "vertical",
    fontFamily: "inherit",
  },
  inputError: {
    borderColor: "#dc3545",
    backgroundColor: "#fef2f2",
    boxShadow: "0 0 0 2px rgba(220, 53, 69, 0.25)",
  },
  errorText: {
    color: "#dc3545",
    fontSize: "12px",
    marginTop: "4px",
    display: "block",
    fontWeight: "bold",
  },
};

export default AcoesServicos;
