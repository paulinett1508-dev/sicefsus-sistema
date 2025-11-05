
# 📊 Estrutura Completa do Módulo de Despesas

**Sistema de Gestão de Emendas Parlamentares**  
**Data de Geração:** 05/11/2025  
**Versão:** 2.3.78

---

## 📑 Índice

1. [Componentes Principais](#componentes-principais)
2. [Componentes de Formulário](#componentes-de-formulário)
3. [Componentes de Listagem](#componentes-de-listagem)
4. [Componentes de Cards](#componentes-de-cards)
5. [Hooks Customizados](#hooks-customizados)
6. [Utilitários e Validadores](#utilitários-e-validadores)
7. [Integrações com Emendas](#integrações-com-emendas)
8. [Serviços e API](#serviços-e-api)
9. [Scripts de Migração](#scripts-de-migração)

---

## 1️⃣ Componentes Principais

### 📂 `src/components/`

#### `Despesas.jsx` (~ 180 linhas)
**Responsabilidade:** Orquestrador principal da view de despesas
- Gerencia estados de navegação (criar/editar/visualizar/listagem)
- Usa hooks customizados para dados e cálculos
- Controla permissões por tipo de usuário
- Integra formulário e listagem

#### `DespesaForm.jsx` (~ 200 linhas - REFATORADO)
**Responsabilidade:** Formulário completo de despesa
- Reutiliza componentes modulares
- Validação em tempo real
- Suporta modos: criar, editar, visualizar
- Integração com emendas e saldo disponível

#### `DespesasList.jsx` (~ 200 linhas)
**Responsabilidade:** Container de listagem de despesas
- Filtragem automática por emenda/município
- Cálculo de estatísticas em tempo real
- Renderização em cards ou tabela
- Handlers de edição/exclusão

#### `DespesasTable.jsx` (~ 500+ linhas)
**Responsabilidade:** Tabela detalhada com agrupamento
- Modo detalhado vs simplificado
- Agrupamento por emenda
- Formatação de datas, valores, status
- Ações inline (editar/visualizar/excluir)

#### `DespesasFilters.jsx`
**Responsabilidade:** Componente de filtros otimizado
- Busca geral (fornecedor, empenho, nota)
- Filtro por emenda (principal)
- Filtro por status e período
- Contagem de filtros ativos

#### `PrimeiraDespesaModal.jsx`
**Responsabilidade:** Modal UX para primeira despesa
- Guia interativo para cadastro inicial
- Exibe benefícios e informações da emenda
- Confirmação de criação ou visualização

---

## 2️⃣ Componentes de Formulário

### 📂 `src/components/despesa/`

#### `DespesaFormHeader.jsx`
**Responsabilidade:** Cabeçalho do formulário
- Exibe modo (criar/editar/visualizar)
- Mensagens de sucesso
- Informações contextuais

#### `DespesaFormActions.jsx`
**Responsabilidade:** Botões de ação do formulário
- Botão voltar
- Botão salvar (criar/atualizar)
- Estado de loading

#### `DespesaFormBanners.jsx`
**Responsabilidade:** Banners informativos e alertas
- Banner de permissões (operador)
- Aviso de município não configurado
- Informações contextuais

#### `DespesaFormBasicFields.jsx` (ATUALIZADO 05/11)
**Responsabilidade:** Campos básicos da despesa
- Emenda (não editável)
- Valor (editável com alerta)
- Discriminação (1 linha editável)
- Validação de saldo

#### `DespesaFormEmendaInfo.jsx` (ATUALIZADO 05/11)
**Responsabilidade:** Painel informativo da emenda
- Dados da emenda selecionada
- Barra de progresso visual
- Saldo disponível destacado
- Indicadores de status

#### `DespesaFormEmpenhoFields.jsx`
**Responsabilidade:** Campos de empenho e nota fiscal
- Número do empenho (obrigatório)
- Número da nota fiscal (obrigatório)
- Número do contrato (opcional)

#### `DespesaFormDateFields.jsx` (LAYOUT MELHORADO)
**Responsabilidade:** Campos de datas de execução
- Data do empenho
- Data da liquidação
- Data do pagamento
- Validação de sequência cronológica (Lei 4.320/64)
- Verificação de período da emenda

#### `DespesaFormClassificacaoFuncional.jsx` (NOVO UNIFICADO)
**Responsabilidade:** Classificação funcional-programática
- Ação orçamentária
- Status de pagamento
- Categoria
- Natureza de despesa (customizável)
- Elemento de despesa (customizável)
- Dados do fornecedor (CNPJ, razão social, etc.)
- Busca automática de CNPJ (BrasilAPI/ReceitaWS)
- Situação cadastral com cores dinâmicas

#### `DespesaFormAdvancedFields.jsx`
**Responsabilidade:** Campos avançados (legado)
- Mantido para compatibilidade
- Campos complementares

#### `DespesaFormOrcamentoFields.jsx`
**Responsabilidade:** Classificação orçamentária (legado)
- Mantido para compatibilidade
- Campos de dotação

---

## 3️⃣ Componentes de Listagem

### 📂 `src/components/despesa/`

#### `DespesasListHeader.jsx`
**Responsabilidade:** Header da página de listagem
- Status operacional
- Versão do sistema
- Dados do usuário e filtros ativos
- Informações da emenda (se aplicável)

#### `DespesasStats.jsx`
**Responsabilidade:** Cards de estatísticas
- Total de despesas
- Despesas pagas
- Despesas pendentes
- Valor total
- Adaptação por filtro/município

#### `DespesasBanner.jsx`
**Responsabilidade:** Banner de filtro por emenda
- Informações da emenda filtrada
- Quantidade de despesas
- Botão para limpar filtro

---

## 4️⃣ Componentes de Cards

### 📂 `src/components/despesa/DespesaCard/`

#### `despesaCardStyles.js`
**Responsabilidade:** Estilos centralizados dos cards
- Layout em "faixa" (strip)
- Cores e badges de status
- Transições e hover effects
- Modo responsivo

#### `DespesaCardExecutada.jsx`
**Responsabilidade:** Card visual de despesa executada
- Badge verde "EXECUTADA"
- Número, descrição, valor
- Empenho, data, natureza
- Click handler

#### `DespesaCardPlanejada.jsx`
**Responsabilidade:** Card visual de despesa planejada
- Badge amarelo "PLANEJADA"
- Número, descrição, valor
- Click handler

---

## 5️⃣ Hooks Customizados

### 📂 `src/hooks/`

#### `useDespesasData.js`
**Responsabilidade:** Carregamento de dados
- Fetching de despesas e emendas
- Filtros por emenda/município
- Cache e otimização
- Tratamento de erros
- Função de recarga

#### `useDespesasCalculos.js`
**Responsabilidade:** Cálculos financeiros
- Saldo de emenda
- Percentual executado
- Estatísticas gerais
- Validação de valores
- Performance otimizada (useMemo)

#### `useEmendaDespesa.js` (VERSÃO CORRIGIDA v2.1)
**Responsabilidade:** Relacionamento Emenda-Despesa
- Gestão de métricas financeiras
- Validação de nova despesa
- Atualização de saldo
- Listeners em tempo real
- Permissões de acesso

---

## 6️⃣ Utilitários e Validadores

### 📂 `src/utils/`

#### `despesaValidators.js`
**Responsabilidade:** Validações específicas de despesas
- Validação de CNPJ
- Validação de valores
- Validação de datas
- Regras de negócio

#### `formatters.js`
**Responsabilidade:** Formatação de dados
- Moeda (BRL)
- Datas (pt-BR)
- CNPJ/CPF
- Telefone, CEP
- Parse de valores monetários

#### `validators.js`
**Responsabilidade:** Validações gerais
- Validação de campos obrigatórios
- Validação de emenda vs despesa
- Sequência cronológica de datas
- Período de vigência

---

## 7️⃣ Integrações com Emendas

### 📂 `src/components/emenda/`

#### `EmendaForm/sections/ExecucaoOrcamentaria.jsx` (CORRIGIDO)
**Responsabilidade:** Gestão de despesas dentro da emenda
- Painel de controle financeiro
- Seção de planejamento (despesas planejadas)
- Seção de execução (despesas executadas)
- Formulário inline para criar planejadas
- Modal para executar despesa
- Edição/visualização de despesas integrada

#### `EmendaForm/sections/DespesasTab.jsx`
**Responsabilidade:** Aba de despesas no formulário de emenda
- Reutiliza componentes do módulo Despesas
- Navegação entre listagem e formulário
- Handlers de edição com prevenção de propagação
- Debug extremo para rastreamento

#### `EmendaForm/sections/ExecutarDespesaModal.jsx` (CORRIGIDO)
**Responsabilidade:** Modal de execução de despesa
- Formulário completo de execução
- Seção "Dados Básicos da Despesa" corrigida
- Validação de saldo
- Alerta de mudança de valor
- Dados de empenho, fornecedor, datas

#### `EmendaForm/sections/ConfirmarExecucaoDespesaModal.jsx`
**Responsabilidade:** Modal de confirmação antes de executar
- Exibe detalhes da despesa
- Cálculo de novo saldo
- Alerta de saldo negativo
- Informações de fluxo

#### `EmendaDetail/sections/DespesasTab.jsx`
**Responsabilidade:** Aba de despesas na visualização de emenda
- Listagem de despesas da emenda
- Criação de nova despesa
- Edição de despesas existentes
- Integração com cards executadas/planejadas

#### `EmendaDetail/sections/NovaDespesaTab.jsx`
**Responsabilidade:** Formulário de nova despesa (view de emenda)
- Campos simplificados
- Saldo disponível
- Validação inline

#### `DespesaModal.jsx`
**Responsabilidade:** Modal de despesa (legado)
- Mantido para compatibilidade
- Criação/edição de despesa

---

## 8️⃣ Visualização e Detalhes

### 📂 `src/components/`

#### `VisualizacaoEmendaDespesas.jsx`
**Responsabilidade:** Tela completa de visualização emenda + despesas
- Dados da emenda
- KPIs financeiros
- Abas: Visão Geral, Despesas, Nova Despesa
- Gráficos de execução (Pie, Line)
- Análise por fornecedor
- Lista detalhada de despesas

---

## 9️⃣ Serviços e API

### 📂 `src/services/`

#### `auditService.js`
**Responsabilidade:** Auditoria de operações
- Registro de criação/edição/exclusão
- Log de usuário e timestamp
- Rastreabilidade

---

## 🔟 Scripts de Migração

### 📂 `scripts/`

#### `migrarAcoesServicosParaDespesas.js`
**Responsabilidade:** Migração ES Module
- Converte acoesServicos → despesas PLANEJADAS
- Mantém histórico de planejamento
- Remove campo legado das emendas

#### `migrarDespesasStatus.js`
**Responsabilidade:** Adicionar campo status
- Migração de despesas antigas
- Define status baseado em campos preenchidos
- Batch processing

### 📂 `src/components/admin/`

#### `MigracaoCompleta.jsx`
**Responsabilidade:** Interface web de migração
- UI para executar migrações
- Progresso em tempo real
- Log detalhado
- Estatísticas finais

---

## 📊 Estrutura Visual de Hierarquia

```
DESPESAS (Módulo)
│
├── 🎯 ENTRADA PRINCIPAL
│   └── Despesas.jsx (Orquestrador)
│
├── 📝 FORMULÁRIO
│   ├── DespesaForm.jsx (Principal)
│   └── Componentes Modulares:
│       ├── DespesaFormHeader.jsx
│       ├── DespesaFormBanners.jsx
│       ├── DespesaFormEmendaInfo.jsx ⭐ (UX Aprimorada)
│       ├── DespesaFormBasicFields.jsx ⭐ (Atualizado)
│       ├── DespesaFormEmpenhoFields.jsx
│       ├── DespesaFormDateFields.jsx ⭐ (Validação Cronológica)
│       ├── DespesaFormClassificacaoFuncional.jsx ⭐ (Unificado + API CNPJ)
│       └── DespesaFormActions.jsx
│
├── 📋 LISTAGEM
│   ├── DespesasList.jsx (Container)
│   ├── DespesasTable.jsx (Tabela Agrupada)
│   ├── DespesasFilters.jsx
│   ├── DespesasListHeader.jsx
│   ├── DespesasStats.jsx
│   └── DespesasBanner.jsx
│
├── 🎴 CARDS
│   ├── despesaCardStyles.js (Estilos Centralizados)
│   ├── DespesaCardExecutada.jsx
│   └── DespesaCardPlanejada.jsx
│
├── 🔌 HOOKS
│   ├── useDespesasData.js (Fetching)
│   ├── useDespesasCalculos.js (Cálculos)
│   └── useEmendaDespesa.js (Relacionamento)
│
├── 🛠️ UTILITÁRIOS
│   ├── despesaValidators.js
│   ├── formatters.js
│   └── validators.js
│
├── 🔗 INTEGRAÇÃO EMENDAS
│   ├── EmendaForm/sections/
│   │   ├── ExecucaoOrcamentaria.jsx ⭐ (Corrigido)
│   │   ├── DespesasTab.jsx
│   │   ├── ExecutarDespesaModal.jsx ⭐ (Corrigido)
│   │   └── ConfirmarExecucaoDespesaModal.jsx
│   └── EmendaDetail/sections/
│       ├── DespesasTab.jsx
│       └── NovaDespesaTab.jsx
│
├── 👁️ VISUALIZAÇÃO
│   └── VisualizacaoEmendaDespesas.jsx (Tela Completa)
│
└── 🔄 MIGRAÇÃO
    ├── scripts/migrarAcoesServicosParaDespesas.js
    ├── scripts/migrarDespesasStatus.js
    └── admin/MigracaoCompleta.jsx
```

---

## 📌 Principais Características

### ✅ Modularização
- Componentes reutilizáveis
- Separação de responsabilidades
- Fácil manutenção

### ✅ Performance
- Hooks com useMemo/useCallback
- Cache de dados
- Batch processing

### ✅ UX/UI
- Validação em tempo real
- Feedback visual
- Mensagens contextuais
- Dark mode support

### ✅ Validações
- Saldo disponível
- Sequência cronológica
- CNPJ automático
- Período de vigência

### ✅ Integrações
- Firebase/Firestore
- APIs externas (CNPJ)
- Módulo de Emendas
- Sistema de Auditoria

---

## 🎯 Fluxos Principais

### 1. Criar Despesa
```
Despesas.jsx → handleCriar → DespesaForm.jsx → handleSubmit → Firebase
```

### 2. Editar Despesa
```
DespesasTable.jsx → handleEditar → Despesas.jsx → DespesaForm.jsx → Firebase
```

### 3. Executar Despesa Planejada
```
ExecucaoOrcamentaria.jsx → ExecutarDespesaModal.jsx → Firebase (criar EXECUTADA + deletar PLANEJADA)
```

### 4. Filtrar por Emenda
```
EmendasTable.jsx → navigate com filtro → Despesas.jsx → useDespesasData (filtrado)
```

---

**📅 Última Atualização:** 05/11/2025  
**🔖 Versão do Sistema:** 2.3.78  
**✍️ Gerado Automaticamente**
