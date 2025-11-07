
# 📘 RESUMO DIDÁTICO - SICEFSUS

**Sistema Integrado de Controle e Execução Financeira do SUS**  
**Versão:** 2.3.78  
**Última Atualização:** 07/11/2025

---

## 🎯 O QUE É O SICEFSUS?

Sistema web desenvolvido em React para gerenciar **emendas parlamentares** destinadas à saúde pública. Permite cadastro, acompanhamento e controle de execução orçamentária de forma organizada e transparente.

---

## 👥 TIPOS DE USUÁRIOS

### 🔴 **Administrador**
- Acesso total ao sistema
- Visualiza todas as emendas (todos os municípios)
- Gerencia usuários
- Acessa relatórios consolidados

### 🔵 **Operador Municipal**
- Acesso restrito ao seu município/UF
- Gerencia apenas emendas do seu município
- Cadastra e acompanha despesas locais
- Acessa relatórios do município

---

## 🏗️ ESTRUTURA PRINCIPAL DO SISTEMA

### 1️⃣ **EMENDAS** (Fonte dos Recursos)

**O que é:** Verba parlamentar destinada a um município específico

**Campos Principais:**
- **Identificação**: Número, Parlamentar, Município/UF
- **Financeiro**: Valor Total, Valor Executado, Saldo Disponível
- **Cronograma**: Datas de aprovação, início, fim e validade
- **Beneficiário**: CNPJ, dados bancários

**Ciclo de Vida:**
```
Cadastro → Planejamento (opcional) → Execução → Conclusão
```

### 2️⃣ **DESPESAS** (Execução dos Recursos)

**Tipos de Despesas:**

#### 📋 **Planejadas** (Opcional)
- Planejamento prévio de como gastar
- Define natureza e valor
- Pode ser executada depois
- **COR:** Amarelo

#### ✅ **Executadas** (Obrigatório)
- Gasto real/efetivo
- Vinculada a uma emenda
- Campos completos: empenho, nota fiscal, fornecedor
- **COR:** Verde

**Campos de uma Despesa Executada:**
- Emenda vinculada
- Discriminação (descrição)
- Valor
- Número do Empenho
- Número da Nota Fiscal
- CNPJ do Fornecedor
- Datas (empenho, liquidação, pagamento)
- Natureza da Despesa
- Status de Pagamento

---

## 🔄 FLUXOS OPERACIONAIS

### 📊 **Fluxo Completo: Planejar → Executar**

```mermaid
1. CADASTRAR EMENDA
   ↓
2. PLANEJAR DESPESAS (opcional)
   - Adiciona despesas planejadas
   - Define quanto vai gastar em cada natureza
   ↓
3. EXECUTAR DESPESA PLANEJADA
   - Abre modal de execução
   - Preenche dados do empenho, fornecedor, datas
   - Salva como EXECUTADA
   - Remove da lista de PLANEJADAS
   ↓
4. ACOMPANHAR SALDO
   - Dashboard mostra execução
   - Relatórios consolidados
```

### ⚡ **Fluxo Direto: Criar Executada**

```mermaid
1. CADASTRAR EMENDA
   ↓
2. ADICIONAR DESPESA EXECUTADA (botão "➕ Nova Despesa")
   - Não precisa planejar antes
   - Cadastra despesa já executada diretamente
   ↓
3. ACOMPANHAR SALDO
```

---

## 📋 MÓDULOS PRINCIPAIS

### 1. **Dashboard** 📊
- Visão geral das emendas
- Indicadores de execução
- Cronograma de vencimentos
- Rankings de municípios (Admin)
- Velocidade de execução

### 2. **Emendas** 📝
- Listagem com filtros
- Cadastro/Edição
- Abas:
  - **Dados Básicos**: Identificação, valores, cronograma
  - **Execução Orçamentária**: Planejamento e despesas

### 3. **Despesas** 💰
- Listagem agrupada por emenda
- Cadastro de despesas executadas
- Filtros por emenda, período, status
- Cards visuais (Planejadas vs Executadas)

### 4. **Relatórios** 📄
Tipos disponíveis:
- **Consolidado**: Resumo geral do período
- **Analítico**: Detalhamento por parlamentar
- **Execução**: Status orçamentário
- **Despesas**: Listagem detalhada
- **Prestação de Contas**: Formatação oficial

### 5. **Administração** 👤 (Admin only)
- Gestão de usuários
- Logs de auditoria
- Migrações de dados

---

## 💡 CONCEITOS IMPORTANTES

### 🧮 **Cálculo de Saldo**

```
Saldo Disponível = Valor da Emenda - Total Executado
```

**⚠️ IMPORTANTE:** 
- Apenas despesas **EXECUTADAS** contam
- Despesas **PLANEJADAS** não reduzem o saldo real

### 📊 **Percentual de Execução**

```
% Executado = (Valor Executado / Valor Total) × 100
```

### 🎨 **Cores e Status**

| Cor | Significado | Uso |
|-----|-------------|-----|
| 🟢 Verde | Executado/Pago | Despesas concluídas |
| 🟡 Amarelo | Planejado/Empenhado | Em andamento |
| 🔴 Vermelho | Vencido/Alerta | Ação necessária |
| 🔵 Azul | Ativo/Normal | Status normal |

---

## 🔐 PERMISSÕES E SEGURANÇA

### Matriz de Permissões

| Ação | Admin | Operador |
|------|-------|----------|
| Ver todas emendas | ✅ | ❌ (só seu município) |
| Criar emenda | ✅ | ✅ |
| Editar emenda | ✅ | ✅ (só seu município) |
| Excluir emenda | ✅ | ❌ |
| Criar despesa | ✅ | ✅ |
| Editar despesa | ✅ | ✅ |
| Excluir despesa | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ |
| Ver relatórios gerais | ✅ | ❌ (só seu município) |

---

## 🗂️ ARQUITETURA TÉCNICA

### **Stack Tecnológico**
- **Frontend**: React 18 + Vite
- **Backend**: Firebase (Auth + Firestore)
- **Roteamento**: React Router v6
- **Gráficos**: Recharts
- **PDFs**: jsPDF + autoTable

### **Principais Hooks Customizados**
- `useEmendaFormData` - Lógica do formulário de emendas
- `useDespesasData` - Carregamento de despesas
- `useEmendaDespesa` - Relacionamento emenda-despesa
- `usePermissions` - Controle de acesso
- `useDashboardData` - Dados do dashboard

### **Componentes-Chave**
```
App.jsx (Orquestrador)
├── Dashboard.jsx
├── Emendas.jsx
│   └── EmendaForm/
│       ├── DadosBasicosTab
│       └── ExecucaoOrcamentaria
├── Despesas.jsx
│   └── DespesaForm.jsx
├── Relatorios.jsx
└── Administracao.jsx
```

---

## 📊 DADOS E COLEÇÕES FIREBASE

### **Coleção: `emendas`**
```javascript
{
  numero: "001/2025",
  parlamentar: "Dep. João Silva",
  municipio: "São Paulo",
  uf: "SP",
  valorRecurso: 500000,
  valorExecutado: 150000, // Calculado
  saldoDisponivel: 350000, // Calculado
  dataAprovacao: "2025-01-01",
  dataValidade: "2025-12-31",
  // ... outros campos
}
```

### **Coleção: `despesas`**
```javascript
{
  emendaId: "abc123",
  discriminacao: "Compra de equipamentos",
  valor: 50000,
  status: "EXECUTADA", // ou "PLANEJADA"
  numeroEmpenho: "2025/001",
  numeroNota: "12345",
  fornecedorCnpj: "12.345.678/0001-90",
  dataEmpenho: "2025-02-01",
  naturezaDespesa: "Material Médico",
  statusPagamento: "Pago",
  // ... outros campos
}
```

### **Coleção: `usuarios`**
```javascript
{
  nome: "Maria Santos",
  email: "maria@municipio.gov.br",
  tipo: "operador", // ou "admin"
  municipio: "São Paulo",
  uf: "SP",
  status: "ativo",
  // ... outros campos
}
```

---

## 🚀 FUNCIONALIDADES DESTACADAS

### ✅ **Novidades da Versão 2.3.78**

1. **Botão "Nova Despesa" Direto**
   - Cria despesa executada sem planejar
   - Fluxo mais ágil para municípios

2. **Modal Unificado de Execução**
   - Serve para executar planejada OU criar nova
   - Título dinâmico conforme contexto

3. **Validações Aprimoradas**
   - Verificação de saldo em tempo real
   - Alerta ao alterar valor de despesa
   - Validação cronológica de datas

4. **UX Melhorada**
   - Barra de progresso visual no painel de emenda
   - Cores semafóricas (verde/amarelo/vermelho)
   - Feedback contextual em toasts

---

## 📚 GLOSSÁRIO

| Termo | Significado |
|-------|-------------|
| **Emenda** | Verba parlamentar destinada a município |
| **Despesa Planejada** | Planejamento de gasto (não executa ainda) |
| **Despesa Executada** | Gasto real/efetivado |
| **Saldo Disponível** | Quanto ainda pode ser gasto |
| **Natureza de Despesa** | Categoria do gasto (ex: Material Médico) |
| **Empenho** | Documento que reserva verba |
| **Liquidação** | Confirmação de entrega do bem/serviço |
| **Pagamento** | Transferência efetiva do valor |
| **CNPJ** | Cadastro Nacional de Pessoa Jurídica |
| **UF** | Unidade Federativa (estado) |

---

## 🔧 BOAS PRÁTICAS

### Para Operadores Municipais:
1. ✅ Cadastre a emenda assim que receber
2. ✅ Planeje despesas (opcional mas recomendado)
3. ✅ Preencha todos os campos obrigatórios
4. ✅ Mantenha dados atualizados
5. ✅ Acompanhe o saldo disponível

### Para Administradores:
1. ✅ Monitore vencimentos no Dashboard
2. ✅ Gere relatórios mensais
3. ✅ Audite logs regularmente
4. ✅ Valide dados antes de exportar
5. ✅ Faça backup periódico

---

## ❓ FAQ - PERGUNTAS FREQUENTES

**1. Preciso planejar despesas antes de executar?**
- ❌ Não, é opcional. Pode criar despesa executada direto.

**2. Despesas planejadas contam no saldo?**
- ❌ Não, apenas as EXECUTADAS reduzem o saldo real.

**3. Posso excluir uma despesa?**
- Admin: ✅ Sim  
- Operador: ❌ Não, precisa solicitar ao admin

**4. Como sei se uma emenda está vencendo?**
- Dashboard mostra cronograma com alertas visuais

**5. Posso editar o valor de uma despesa já cadastrada?**
- ✅ Sim, mas o sistema alertará sobre impacto no saldo

**6. Operador pode ver emendas de outros municípios?**
- ❌ Não, apenas do seu município/UF

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Consulte este guia
2. Verifique logs de auditoria (Admin)
3. Entre em contato com administrador do sistema

---

**🔖 Documento gerado automaticamente**  
**📅 Última atualização:** 07/11/2025  
**✍️ Mantenha este documento sincronizado com atualizações do sistema**
