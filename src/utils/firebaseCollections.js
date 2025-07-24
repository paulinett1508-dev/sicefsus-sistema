
// src/utils/firebaseCollections.js
// Utilitário para padronização das estruturas de coleções Firebase

export const COLLECTIONS = {
  USERS: 'users',
  EMENDAS: 'emendas',
  DESPESAS: 'despesas',
  LOGS: 'logs'
};

// Estruturas padrão das coleções
export const USER_SCHEMA = {
  uid: '',
  email: '',
  nome: '',
  displayName: '',
  role: 'user', // 'admin', 'user'
  status: 'ativo', // 'ativo', 'inativo'
  isActive: true,
  municipio: null,
  uf: null,
  departamento: '',
  telefone: '',
  createdAt: null,
  lastLogin: null
};

export const EMENDA_SCHEMA = {
  numero: '',
  valor: 0,
  parlamentar: '',
  municipio: '',
  uf: '',
  area: '',
  tipo: '',
  status: 'ativa',
  observacoes: '',
  dataCriacao: null,
  dataVencimento: null,
  dataModificacao: null
};

export const DESPESA_SCHEMA = {
  emendaId: '',
  descricao: '',
  valor: 0,
  categoria: '',
  fornecedor: '',
  numeroNota: '',
  dataVencimento: null,
  dataPagamento: null,
  status: 'pendente',
  observacoes: '',
  dataCriacao: null,
  dataModificacao: null
};

// Função para validar estrutura de documento
export function validateDocumentStructure(doc, schema) {
  if (!doc || typeof doc !== 'object') return false;
  
  // Verificar campos obrigatórios baseados no schema
  const requiredFields = Object.keys(schema).filter(key => 
    schema[key] !== null && schema[key] !== ''
  );
  
  return requiredFields.every(field => doc.hasOwnProperty(field));
}

// Função para normalizar documento baseado no schema
export function normalizeDocument(doc, schema) {
  const normalized = { ...schema };
  
  Object.keys(doc).forEach(key => {
    if (schema.hasOwnProperty(key)) {
      normalized[key] = doc[key];
    }
  });
  
  return normalized;
}
