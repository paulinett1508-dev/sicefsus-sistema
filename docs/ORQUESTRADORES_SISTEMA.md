
# 🎯 ORQUESTRADORES PRINCIPAIS DO SICEFSUS

## 📋 Índice de Arquivos Críticos

Este documento lista os **arquivos orquestradores** do sistema - aqueles que controlam o fluxo, a arquitetura e as configurações fundamentais. **Todo desenvolvedor DEVE conhecer estes arquivos antes de modificar o sistema.**

---

## 🔴 NÍVEL 1: ORQUESTRAÇÃO CENTRAL (Modificar com EXTREMO cuidado)

### 1. **`src/App.jsx`** ⭐⭐⭐⭐⭐
**Caminho:** `src/App.jsx`  
**Função:** Orquestrador principal de rotas e navegação  
**Responsabilidades:**
- Define TODAS as rotas do sistema
- Gerencia autenticação global
- Implementa proteção de navegação
- Controla sidebar e layout principal
- Sistema de proteção contra perda de dados em formulários

**Impacto de Alterações:** 🔴 CRÍTICO - Pode quebrar navegação inteira

---

### 2. **`src/context/UserContext.jsx`** ⭐⭐⭐⭐⭐
**Caminho:** `src/context/UserContext.jsx`  
**Função:** Gerenciamento de autenticação e dados do usuário  
**Responsabilidades:**
- Carrega dados do Firebase Auth + Firestore
- Normaliza campos (`nome`, `tipo`, `municipio`, `uf`)
- Disponibiliza usuário para TODO o sistema
- Distingue Admin vs Operador

**Impacto de Alterações:** 🔴 CRÍTICO - Afeta autenticação global

---

### 3. **`src/firebase/firebaseConfig.js`** ⭐⭐⭐⭐⭐
**Caminho:** `src/firebase/firebaseConfig.js`  
**Função:** Conexão com Firebase (banco de dados)  
**Responsabilidades:**
- Inicializa Firebase
- Exporta `auth` e `db` usados em TODO o sistema
- Diferencia ambiente DEV vs PROD

**Impacto de Alterações:** 🔴 CRÍTICO - Sistema para de funcionar

---

### 4. **`src/index.jsx`** ⭐⭐⭐⭐
**Caminho:** `src/index.jsx`  
**Função:** Ponto de entrada da aplicação  
**Responsabilidades:**
- Inicializa React
- Aplica UserProvider global
- Configura sistema de logs

**Impacto de Alterações:** 🔴 CRÍTICO - Quebra inicialização

---

## 🟠 NÍVEL 2: CONFIGURAÇÕES E SCHEMAS (Modificar com cuidado)

### 5. **`src/config/constants.js`** ⭐⭐⭐⭐
**Caminho:** `src/config/constants.js`  
**Função:** Valores fixos e listas do sistema  
**Responsabilidades:**
- Programas de Saúde
- Naturezas de Despesa
- Ações Orçamentárias
- Status de Despesas

**Impacto de Alterações:** 🟡 ALTO - Afeta dropdowns e validações

---

### 6. **`src/utils/firebaseCollections.js`** ⭐⭐⭐⭐
**Caminho:** `src/utils/firebaseCollections.js`  
**Função:** Schemas e estrutura de dados  
**Responsabilidades:**
- Define estrutura de `emendas`
- Define estrutura de `despesas`
- Define estrutura de `usuarios`
- Validações de campos

**Impacto de Alterações:** 🟡 ALTO - Afeta CRUD completo

---

### 7. **`vite.config.js`** ⭐⭐⭐⭐
**Caminho:** `vite.config.js`  
**Função:** Configuração do bundler (build)  
**Responsabilidades:**
- Define variáveis de ambiente
- Configurações de build
- Otimizações de produção

**Impacto de Alterações:** 🟡 ALTO - Afeta build e deploy

---

### 8. **`.replit`** ⭐⭐⭐⭐
**Caminho:** `.replit`  
**Função:** Configuração do ambiente Replit  
**Responsabilidades:**
- Define comando de execução (`run`)
- Configuração de deployment
- Portas e módulos

**Impacto de Alterações:** 🟡 ALTO - Afeta execução no Replit

---

## 🟡 NÍVEL 3: HOOKS CENTRAIS (Lógica de negócio)

### 9. **`src/hooks/useEmendaFormData.js`** ⭐⭐⭐⭐
**Caminho:** `src/hooks/useEmendaFormData.js`  
**Função:** Lógica central de manipulação de emendas  
**Responsabilidades:**
- Carrega/Salva emendas no Firebase
- Valida dados antes de salvar
- Gerencia estado do formulário
- Calcula campos (percentual executado, saldo)

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta CRUD de emendas

---

### 10. **`src/hooks/useDespesasData.js`** ⭐⭐⭐⭐
**Caminho:** `src/hooks/useDespesasData.js`  
**Função:** Lógica central de carregamento de despesas  
**Responsabilidades:**
- Busca despesas do Firebase
- Filtra por emenda/usuário
- Cache e otimização

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta CRUD de despesas

---

### 11. **`src/hooks/usePermissions.js`** ⭐⭐⭐⭐
**Caminho:** `src/hooks/usePermissions.js`  
**Função:** Controle de permissões (Admin vs Operador)  
**Responsabilidades:**
- Define o que cada tipo pode fazer
- Filtra dados por localização
- Valida ações críticas

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta segurança

---

## 🟢 NÍVEL 4: COMPONENTES PRINCIPAIS (UI crítica)

### 12. **`src/components/Sidebar.jsx`** ⭐⭐⭐
**Caminho:** `src/components/Sidebar.jsx`  
**Função:** Menu principal do sistema  
**Responsabilidades:**
- Define rotas visíveis por tipo de usuário
- Proteção de navegação em formulários
- Integra busca global

**Impacto de Alterações:** 🟢 MÉDIO - Afeta navegação visual

---

### 13. **`src/components/emenda/EmendaForm/index.jsx`** ⭐⭐⭐⭐
**Caminho:** `src/components/emenda/EmendaForm/index.jsx`  
**Função:** Formulário principal de emendas  
**Responsabilidades:**
- Controla abas (Dados Básicos, Despesas, etc.)
- Integra validações
- Gerencia navegação entre abas

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta cadastro de emendas

---

### 14. **`src/components/DespesaForm.jsx`** ⭐⭐⭐⭐
**Caminho:** `src/components/DespesaForm.jsx`  
**Função:** Formulário de despesas  
**Responsabilidades:**
- Valida campos obrigatórios
- Calcula impacto no saldo da emenda
- Integra naturezas/ações orçamentárias

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta cadastro de despesas

---

### 15. **`src/components/Dashboard.jsx`** ⭐⭐⭐
**Caminho:** `src/components/Dashboard.jsx`  
**Função:** Painel principal do sistema  
**Responsabilidades:**
- Visão geral das emendas
- Indicadores de execução
- Widgets de acompanhamento

**Impacto de Alterações:** 🟢 MÉDIO - Afeta visão geral

---

## 🔵 NÍVEL 5: SERVIÇOS E UTILIDADES

### 16. **`src/services/userService.js`** ⭐⭐⭐
**Caminho:** `src/services/userService.js`  
**Função:** Gerenciamento de usuários  
**Responsabilidades:**
- Criação de usuários
- Atualização de dados
- Exclusão de contas

**Impacto de Alterações:** 🟢 MÉDIO - Afeta admin de usuários

---

### 17. **`src/services/auditService.js`** ⭐⭐⭐
**Caminho:** `src/services/auditService.js`  
**Função:** Sistema de auditoria  
**Responsabilidades:**
- Registra ações no sistema
- Logs de alterações
- Estatísticas de uso

**Impacto de Alterações:** 🟢 MÉDIO - Afeta rastreabilidade

---

### 18. **`src/utils/validators.js`** ⭐⭐⭐⭐
**Caminho:** `src/utils/validators.js`  
**Função:** Validações de dados  
**Responsabilidades:**
- Valida UF/Município
- Valida CNPJ
- Valida datas e valores monetários

**Impacto de Alterações:** 🟠 MÉDIO-ALTO - Afeta validações globais

---

### 19. **`src/utils/formatters.js`** ⭐⭐⭐
**Caminho:** `src/utils/formatters.js`  
**Função:** Formatação de valores  
**Responsabilidades:**
- Conversão de string → número
- Formatação monetária
- Parsing de inputs

**Impacto de Alterações:** 🟢 MÉDIO - Afeta exibição de valores

---

## ⚙️ NÍVEL 6: CONFIGURAÇÕES EXTERNAS

### 20. **`package.json`** ⭐⭐⭐⭐
**Caminho:** `package.json`  
**Função:** Dependências do projeto  
**Responsabilidades:**
- Lista de pacotes npm
- Scripts de execução
- Versão do projeto

**Impacto de Alterações:** 🟡 ALTO - Afeta build e dependências

---

### 21. **`.env.production` / `.env.development`** ⭐⭐⭐⭐⭐
**Caminho:** `.env.production` e `.env.development`  
**Função:** Variáveis de ambiente  
**Responsabilidades:**
- Credenciais Firebase
- URLs de API
- Configurações de produção/desenvolvimento

**Impacto de Alterações:** 🔴 CRÍTICO - Quebra conexão com Firebase

---

### 22. **`firebase.json`** ⭐⭐⭐
**Caminho:** `firebase.json`  
**Função:** Configuração Firebase Hosting  
**Responsabilidades:**
- Regras de deploy
- Redirects e rewrites

**Impacto de Alterações:** 🟢 MÉDIO - Afeta deploy no Firebase

---

## 🎯 RESUMO PARA NOVOS DESENVOLVEDORES

### ✅ LEITURA OBRIGATÓRIA (Antes de modificar QUALQUER código):
1. `src/App.jsx`
2. `src/context/UserContext.jsx`
3. `src/firebase/firebaseConfig.js`
4. `src/utils/firebaseCollections.js`
5. `src/config/constants.js`

### ⚠️ CUIDADO EXTRA:
- `.env.production` - NUNCA commitar
- `vite.config.js` - Afeta build
- `package.json` - Afeta dependências

### 🚨 REGRAS DE OURO:
1. **NUNCA** altere `.env` sem backup
2. **SEMPRE** teste como Admin E Operador
3. **SEMPRE** valide dados antes de salvar
4. **NUNCA** modifique schemas sem revisar impacto

---

## 📊 FLUXO DE DADOS SIMPLIFICADO

```
Login → UserContext → App.jsx → Rotas Protegidas
                ↓
        Firebase (auth + db)
                ↓
        Hooks (useEmendaFormData, useDespesasData)
                ↓
        Componentes (EmendaForm, DespesaForm)
                ↓
        Firestore (emendas, despesas, usuarios)
```

---

**📅 Última Atualização:** 08/01/2025  
**✍️ Este documento deve ser atualizado a cada nova versão significativa**  
**🔄 Versão do Documento:** 1.0
