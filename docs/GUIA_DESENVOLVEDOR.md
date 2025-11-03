
# 📘 GUIA DE ORIENTAÇÃO PARA DESENVOLVEDORES - SICEFSUS

## 🎯 Objetivo deste Guia

Este documento identifica os **arquivos fundamentais** que qualquer desenvolvedor DEVE conhecer antes de mexer em qualquer parte do sistema. São os "arquivos-chave" que funcionam como alicerces arquitetônicos do SICEFSUS.

---

## 🏗️ ARQUIVOS PRIMORDIAIS (LEITURA OBRIGATÓRIA)

### 🔴 **NÍVEL 1: FUNDAÇÃO DO SISTEMA** (Sem eles, você não entende NADA)

#### 1. **`src/App.jsx`** ⭐⭐⭐⭐⭐
**POR QUÊ:** Orquestrador central de TODAS as rotas e navegação
- Define estrutura de rotas (Dashboard, Emendas, Despesas, etc.)
- Gerencia autenticação global
- Implementa proteção de navegação
- Controla sidebar e layout principal

**🎯 O QUE SABER:**
- Sistema de rotas protegidas (`PrivateRoute`)
- Contexto de proteção de navegação (`NavigationProtectionContext`)
- Como as páginas se conectam entre si

---

#### 2. **`src/context/UserContext.jsx`** ⭐⭐⭐⭐⭐
**POR QUÊ:** Gerencia TODA a autenticação e dados do usuário logado
- Carrega dados do Firebase Auth + Firestore
- Normaliza campos (`nome`, `tipo`, `municipio`, `uf`)
- Disponibiliza usuário para TODO o sistema

**🎯 O QUE SABER:**
- Como o sistema distingue **Admin** vs **Operador**
- Estrutura do objeto `usuario` que circula pelo sistema
- Campos críticos: `tipo`, `municipio`, `uf`, `status`

---

#### 3. **`src/firebase/firebaseConfig.js`** ⭐⭐⭐⭐⭐
**POR QUÊ:** Conexão com o banco de dados Firebase
- Inicializa Firebase
- Exporta `auth` e `db` usados em TODO o sistema
- Diferencia ambiente DEV vs PROD

**🎯 O QUE SABER:**
- Como acessar coleções (`emendas`, `usuarios`, `despesas`)
- Variáveis de ambiente críticas

---

#### 4. **`src/config/constants.js`** ⭐⭐⭐⭐
**POR QUÊ:** Define TODOS os valores fixos e listas do sistema
- Programas de Saúde
- Naturezas de Despesa
- Ações Orçamentárias
- Status de Despesas

**🎯 O QUE SABER:**
- De onde vêm os dropdowns/selects do sistema
- Valores permitidos para campos críticos

---

### 🟠 **NÍVEL 2: ESTRUTURA DE DADOS** (Como as informações são organizadas)

#### 5. **`src/utils/firebaseCollections.js`** ⭐⭐⭐⭐
**POR QUÊ:** Define a estrutura (schema) de TODAS as coleções Firebase
- Estrutura de `emendas`
- Estrutura de `despesas`
- Estrutura de `usuarios`
- Campos obrigatórios vs opcionais

**🎯 O QUE SABER:**
- Quais campos existem em cada coleção
- Relacionamento entre emendas e despesas
- Campos calculados vs armazenados

---

#### 6. **`src/hooks/useEmendaFormData.js`** ⭐⭐⭐⭐
**POR QUÊ:** Lógica CENTRAL de manipulação de emendas
- Carrega/Salva emendas no Firebase
- Valida dados antes de salvar
- Gerencia estado do formulário

**🎯 O QUE SABER:**
- Como emendas são criadas/editadas
- Fluxo de validação
- Campos calculados (percentual executado, saldo disponível)

---

#### 7. **`src/hooks/useDespesasData.js`** ⭐⭐⭐⭐
**POR QUÊ:** Lógica CENTRAL de carregamento de despesas
- Busca despesas do Firebase
- Filtra por emenda/usuário
- Cache e otimização

**🎯 O QUE SABER:**
- Como despesas são vinculadas a emendas
- Filtros de permissão (Admin vê tudo, Operador vê só seu município)

---

### 🟡 **NÍVEL 3: COMPONENTES CRÍTICOS** (UIs principais)

#### 8. **`src/components/emenda/EmendaForm/index.jsx`** ⭐⭐⭐⭐
**POR QUÊ:** Formulário principal de cadastro/edição de emendas
- Controla abas (Dados Básicos, Despesas, Cronograma, etc.)
- Integra validações
- Gerencia navegação entre abas

**🎯 O QUE SABER:**
- Como as abas se comunicam
- Onde dados são salvos
- Sistema de proteção contra perda de dados

---

#### 9. **`src/components/DespesaForm.jsx`** ⭐⭐⭐⭐
**POR QUÊ:** Formulário de cadastro de despesas
- Valida campos obrigatórios
- Calcula impacto no saldo da emenda
- Integra com naturezas/ações orçamentárias

**🎯 O QUE SABER:**
- Diferença entre despesa planejada vs executada
- Validações de data e valor
- Relação com a emenda-mãe

---

#### 10. **`src/components/Sidebar.jsx`** ⭐⭐⭐
**POR QUÊ:** Menu principal do sistema
- Define rotas visíveis para cada tipo de usuário
- Proteção de navegação em formulários
- Integra busca global

**🎯 O QUE SABER:**
- Como menus Admin vs Operador diferem
- Sistema de proteção ao sair de formulários

---

### 🟢 **NÍVEL 4: LÓGICA DE NEGÓCIO** (Regras do sistema)

#### 11. **`src/utils/validators.js`** ⭐⭐⭐⭐
**POR QUÊ:** TODAS as validações de dados
- Valida UF/Município
- Valida CNPJ
- Valida datas
- Valida valores monetários

**🎯 O QUE SABER:**
- Regras de negócio implementadas
- O que é considerado válido/inválido

---

#### 12. **`src/utils/formatters.js`** ⭐⭐⭐
**POR QUÊ:** Formatação de valores monetários
- Conversão de string → número
- Formatação para exibição
- Parsing de inputs

**🎯 O QUE SABER:**
- Como valores monetários são manipulados
- Evitar bugs de cálculo

---

#### 13. **`src/hooks/usePermissions.js`** ⭐⭐⭐⭐
**POR QUÊ:** Controla permissões de Admin vs Operador
- Define o que cada tipo pode fazer
- Filtra dados por localização
- Valida ações críticas

**🎯 O QUE SABER:**
- Regras de permissão por tipo de usuário
- Como filtros de município/UF funcionam

---

## 📋 CHECKLIST PARA NOVO DESENVOLVEDOR

Antes de começar a desenvolver, certifique-se de:

- [ ] Li `App.jsx` e entendi as rotas principais
- [ ] Li `UserContext.jsx` e sei como autenticação funciona
- [ ] Li `firebaseConfig.js` e sei conectar no Firebase
- [ ] Li `constants.js` e conheço os valores fixos do sistema
- [ ] Li `firebaseCollections.js` e conheço a estrutura de dados
- [ ] Li `useEmendaFormData.js` e entendo CRUD de emendas
- [ ] Li `useDespesasData.js` e entendo CRUD de despesas
- [ ] Li `validators.js` e conheço as regras de validação
- [ ] Li `usePermissions.js` e entendo diferença Admin/Operador
- [ ] Testei criar uma emenda no sistema
- [ ] Testei criar uma despesa vinculada
- [ ] Entendi como saldo disponível é calculado

---

## 🚨 REGRAS DE OURO

1. **NUNCA** altere `firebaseCollections.js` sem revisar impacto em TODOS os formulários
2. **SEMPRE** use `validators.js` para validar dados antes de salvar
3. **SEMPRE** use `formatters.js` para valores monetários (evita bugs de centavos)
4. **SEMPRE** respeite permissões definidas em `usePermissions.js`
5. **NUNCA** salve dados sem validação prévia
6. **SEMPRE** teste como Admin E como Operador

---

## 📊 FLUXO DE DADOS CRÍTICO

```
Login (Login.jsx) 
  ↓
UserContext carrega dados (UserContext.jsx)
  ↓
App.jsx define rotas protegidas
  ↓
Sidebar mostra menu baseado em permissões
  ↓
EmendaForm/DespesaForm coletam dados
  ↓
validators.js valida tudo
  ↓
Firebase salva (firebaseConfig.js)
  ↓
Dashboard/Relatórios exibem resultados
```

---

## 💡 DICA FINAL

**Antes de mexer em QUALQUER funcionalidade:**

1. Identifique qual arquivo da lista acima está envolvido
2. Leia TODO o arquivo (não só a função que vai alterar)
3. Busque no projeto onde mais esse arquivo é usado (Ctrl+Shift+F)
