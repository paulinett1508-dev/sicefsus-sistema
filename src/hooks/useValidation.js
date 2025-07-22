// src/hooks/useValidation.js
import { useState, useCallback } from "react";

// Regras de validação pré-definidas
export const validationRules = {
  // Campo obrigatório
  required:
    (message = "Campo obrigatório") =>
    (value) => {
      if (!value || (typeof value === "string" && !value.trim())) {
        return message;
      }
      return null;
    },

  // Email válido
  email:
    (message = "Email inválido") =>
    (value) => {
      if (!value) return null;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value.trim()) ? null : message;
    },

  // Comprimento mínimo
  minLength: (min, message) => (value) => {
    if (!value) return null;
    const actualMessage = message || `Mínimo ${min} caracteres`;
    return value.length >= min ? null : actualMessage;
  },

  // Comprimento máximo
  maxLength: (max, message) => (value) => {
    if (!value) return null;
    const actualMessage = message || `Máximo ${max} caracteres`;
    return value.length <= max ? null : actualMessage;
  },

  // Número válido
  numeric:
    (message = "Deve ser um número") =>
    (value) => {
      if (!value) return null;
      return !isNaN(Number(value)) ? null : message;
    },

  // Número positivo
  positiveNumber:
    (message = "Deve ser um número positivo") =>
    (value) => {
      if (!value) return null;
      const num = Number(value);
      return !isNaN(num) && num > 0 ? null : message;
    },

  // Número inteiro
  integer:
    (message = "Deve ser um número inteiro") =>
    (value) => {
      if (!value) return null;
      const num = Number(value);
      return !isNaN(num) && Number.isInteger(num) ? null : message;
    },

  // Range de valores
  range: (min, max, message) => (value) => {
    if (!value) return null;
    const num = Number(value);
    const actualMessage = message || `Valor deve estar entre ${min} e ${max}`;
    return !isNaN(num) && num >= min && num <= max ? null : actualMessage;
  },

  // CPF válido
  cpf:
    (message = "CPF inválido") =>
    (value) => {
      if (!value) return null;

      const cpf = value.replace(/[^\d]/g, "");

      if (cpf.length !== 11) return message;
      if (/^(\d)\1{10}$/.test(cpf)) return message;

      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return message;

      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = 11 - (sum % 11);
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(10))) return message;

      return null;
    },

  // CNPJ válido
  cnpj:
    (message = "CNPJ inválido") =>
    (value) => {
      if (!value) return null;

      const cnpj = value.replace(/[^\d]/g, "");

      if (cnpj.length !== 14) return message;
      if (/^(\d)\1{13}$/.test(cnpj)) return message;

      const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      const weights2 = [6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9];

      const calc = (cnpj, weights) => {
        const sum = cnpj
          .slice(0, weights.length)
          .reduce((acc, digit, i) => acc + parseInt(digit) * weights[i], 0);
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
      };

      const digit1 = calc(cnpj, weights1);
      const digit2 = calc(cnpj, weights2);

      return parseInt(cnpj[12]) === digit1 && parseInt(cnpj[13]) === digit2
        ? null
        : message;
    },

  // Data futura
  futureDate:
    (message = "Data deve ser futura") =>
    (value) => {
      if (!value) return null;
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return inputDate > today ? null : message;
    },

  // Data passada
  pastDate:
    (message = "Data deve ser no passado") =>
    (value) => {
      if (!value) return null;
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return inputDate < today ? null : message;
    },

  // Data válida
  validDate:
    (message = "Data inválida") =>
    (value) => {
      if (!value) return null;
      const date = new Date(value);
      return !isNaN(date.getTime()) ? null : message;
    },

  // Telefone brasileiro
  phoneNumber:
    (message = "Telefone inválido") =>
    (value) => {
      if (!value) return null;
      const phone = value.replace(/[^\d]/g, "");
      return phone.length >= 10 && phone.length <= 11 ? null : message;
    },

  // URL válida
  url:
    (message = "URL inválida") =>
    (value) => {
      if (!value) return null;
      try {
        new URL(value);
        return null;
      } catch {
        return message;
      }
    },

  // Senha forte
  strongPassword:
    (
      message = "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo",
    ) =>
    (value) => {
      if (!value) return null;
      const strongRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return strongRegex.test(value) ? null : message;
    },

  // Confirmação de senha
  confirmPassword:
    (originalPassword, message = "Senhas não coincidem") =>
    (value) => {
      if (!value) return null;
      return value === originalPassword ? null : message;
    },

  // Validador customizado
  custom: (validator, message) => (value) => {
    try {
      return validator(value) ? null : message;
    } catch (error) {
      return message;
    }
  },

  // Apenas letras
  alphabetic:
    (message = "Apenas letras são permitidas") =>
    (value) => {
      if (!value) return null;
      const alphabeticRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
      return alphabeticRegex.test(value) ? null : message;
    },

  // Apenas números
  numericOnly:
    (message = "Apenas números são permitidos") =>
    (value) => {
      if (!value) return null;
      const numericRegex = /^\d+$/;
      return numericRegex.test(value) ? null : message;
    },

  // Sem espaços
  noSpaces:
    (message = "Espaços não são permitidos") =>
    (value) => {
      if (!value) return null;
      return value.indexOf(" ") === -1 ? null : message;
    },

  // Lista de valores permitidos
  oneOf: (allowedValues, message) => (value) => {
    if (!value) return null;
    const actualMessage =
      message || `Valor deve ser um dos seguintes: ${allowedValues.join(", ")}`;
    return allowedValues.includes(value) ? null : actualMessage;
  },
};

// Hook principal de validação
export function useValidation(schema) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((fieldName, value, rules) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, []);

  const validateForm = useCallback(
    (values) => {
      const newErrors = {};
      let isValid = true;

      Object.keys(schema).forEach((fieldName) => {
        const rules = schema[fieldName];
        const value = values[fieldName];
        const error = validateField(fieldName, value, rules);

        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return { isValid, errors: newErrors };
    },
    [schema, validateField],
  );

  const validateSingleField = useCallback(
    (fieldName, value) => {
      const rules = schema[fieldName];
      if (!rules) return null;

      const error = validateField(fieldName, value, rules);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      return error;
    },
    [schema, validateField],
  );

  const setFieldTouched = useCallback((fieldName, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [fieldName]: isTouched,
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    setTouched((prev) => {
      const newTouched = { ...prev };
      delete newTouched[fieldName];
      return newTouched;
    });
  }, []);

  const getFieldError = useCallback(
    (fieldName) => {
      return touched[fieldName] ? errors[fieldName] : null;
    },
    [errors, touched],
  );

  const isFieldValid = useCallback(
    (fieldName) => {
      return !getFieldError(fieldName);
    },
    [getFieldError],
  );

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearErrors,
    clearFieldError,
    getFieldError,
    isFieldValid,
    hasErrors: Object.keys(errors).length > 0,
    hasFieldError: (fieldName) => !!getFieldError(fieldName),
  };
}

// Hook para validação em tempo real de formulários
export function useFormValidation(initialValues, schema) {
  const [values, setValues] = useState(initialValues);
  const validation = useValidation(schema);

  const handleChange = useCallback(
    (fieldName, value) => {
      setValues((prev) => ({
        ...prev,
        [fieldName]: value,
      }));

      // Validar apenas se o campo já foi tocado
      if (validation.touched[fieldName]) {
        validation.validateSingleField(fieldName, value);
      }
    },
    [validation],
  );

  const handleBlur = useCallback(
    (fieldName) => {
      validation.setFieldTouched(fieldName);
      validation.validateSingleField(fieldName, values[fieldName]);
    },
    [validation, values],
  );

  const handleSubmit = useCallback(
    (callback) => {
      return (e) => {
        e.preventDefault();

        // Marcar todos os campos como tocados
        Object.keys(schema).forEach((fieldName) => {
          validation.setFieldTouched(fieldName);
        });

        const { isValid } = validation.validateForm(values);

        if (isValid) {
          callback(values);
        }
      };
    },
    [validation, values, schema],
  );

  const reset = useCallback(
    (newValues = initialValues) => {
      setValues(newValues);
      validation.clearErrors();
    },
    [initialValues, validation],
  );

  const setValue = useCallback((fieldName, value) => {
    setValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const setAllValues = useCallback((newValues) => {
    setValues(newValues);
  }, []);

  return {
    values,
    errors: validation.errors,
    touched: validation.touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setValues: setAllValues,
    hasErrors: validation.hasErrors,
    getFieldError: validation.getFieldError,
    isFieldValid: validation.isFieldValid,
    validateForm: () => validation.validateForm(values),
    clearFieldError: validation.clearFieldError,
  };
}

// Utilitários para formatação comum
export const formatters = {
  // Formatar CPF
  formatCPF: (value) => {
    if (!value) return "";
    const cpf = value.replace(/[^\d]/g, "");
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  },

  // Formatar CNPJ
  formatCNPJ: (value) => {
    if (!value) return "";
    const cnpj = value.replace(/[^\d]/g, "");
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5",
    );
  },

  // Formatar telefone
  formatPhone: (value) => {
    if (!value) return "";
    const phone = value.replace(/[^\d]/g, "");
    if (phone.length === 11) {
      return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    } else if (phone.length === 10) {
      return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return value;
  },

  // Formatar CEP
  formatCEP: (value) => {
    if (!value) return "";
    const cep = value.replace(/[^\d]/g, "");
    return cep.replace(/(\d{5})(\d{3})/, "$1-$2");
  },

  // Formatar moeda
  formatCurrency: (value) => {
    if (!value) return "";
    const number = parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", "."));
    if (isNaN(number)) return "";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(number);
  },
};

// Schemas pré-definidos para o sistema
export const schemas = {
  // Schema para emendas
  emenda: {
    numero: [
      validationRules.required("Número da emenda é obrigatório"),
      validationRules.minLength(3, "Número deve ter pelo menos 3 caracteres"),
    ],
    autor: [
      validationRules.required("Autor é obrigatório"),
      validationRules.minLength(2, "Nome do autor muito curto"),
      validationRules.maxLength(100, "Nome do autor muito longo"),
    ],
    valorTotal: [
      validationRules.required("Valor total é obrigatório"),
      validationRules.positiveNumber("Valor deve ser positivo"),
    ],
    validade: [
      validationRules.required("Data de validade é obrigatória"),
      validationRules.validDate("Data inválida"),
      validationRules.futureDate("Data deve ser futura"),
    ],
    tipo: [
      validationRules.required("Tipo é obrigatório"),
      validationRules.oneOf(
        ["individual", "bancada", "comissao", "relator"],
        "Tipo inválido",
      ),
    ],
  },

  // Schema para despesas
  despesa: {
    emendaId: [validationRules.required("Emenda é obrigatória")],
    valor: [
      validationRules.required("Valor é obrigatório"),
      validationRules.positiveNumber("Valor deve ser positivo"),
    ],
    descricao: [
      validationRules.required("Descrição é obrigatória"),
      validationRules.minLength(5, "Descrição muito curta"),
      validationRules.maxLength(200, "Descrição muito longa"),
    ],
    notaFiscalNumero: [
      validationRules.required("Número da nota fiscal é obrigatório"),
    ],
    notaFiscalData: [
      validationRules.required("Data da nota fiscal é obrigatória"),
      validationRules.validDate("Data inválida"),
    ],
    notaFiscalFornecedor: [
      validationRules.required("Fornecedor é obrigatório"),
      validationRules.minLength(2, "Nome do fornecedor muito curto"),
    ],
  },

  // Schema para usuários
  usuario: {
    email: [
      validationRules.required("Email é obrigatório"),
      validationRules.email("Email inválido"),
    ],
    senha: [
      validationRules.required("Senha é obrigatória"),
      validationRules.minLength(6, "Senha deve ter pelo menos 6 caracteres"),
    ],
    role: [
      validationRules.required("Perfil é obrigatório"),
      validationRules.oneOf(["user", "admin"], "Perfil inválido"),
    ],
  },
};
