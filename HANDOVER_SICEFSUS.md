# 📋 DOCUMENTAÇÃO - Sistema SICEFSUS

**📅 Gerado em:** 09/08/2025, 15:10:28  
**🔧 Ambiente atual:** production  
**🌐 URL Produção:** https://sicefsus.replit.app/

---

## 🎯 SOBRE O SISTEMA

O **SICEFSUS** (Sistema de Controle de Execuções Financeiras do SUS) é uma aplicação web para gestão de emendas parlamentares do SUS, permitindo controle de despesas, relatórios e administração de usuários.

---

## 🔄 AMBIENTES E DEPLOY

### Configuração de Ambientes

**Ambiente Atual:** 🔴 PRODUÇÃO

| Ambiente | Project ID | Status |
|----------|------------|--------|
| Desenvolvimento | emendas-parlamentares-60dbd | ✅ |
| Produção | emendas-parlamentares-prod | ✅ |

**Script de Troca:** ✅ switch-env.sh disponível

### Comandos de Deploy

```bash
# Desenvolvimento
./switch-env.sh dev
npm run dev

# Produção
./switch-env.sh prod
npm run build:prod
# Clicar em "Redeploy" no Replit

# Voltar para dev
./switch-env.sh dev
```

---

## 📁 ESTRUTURA DO PROJETO

├── README.md (842 bytes)
├── analise-runner-2025-08-09T18-10-15.md (18.6 KB)
├── generate-version.js (2.5 KB)
├── package-lock.json (302.8 KB)
├── package.json (1.6 KB)
├── public/
│   └── version.json (516 bytes)
├── scripts/
│   ├── auto-increment.js (1.1 KB)
│   ├── increment-version.js (1.8 KB)
│   └── package.json (369 bytes)
├── src/
│   ├── App.jsx (20.3 KB)
│   ├── components/
│   │   ├── AdminPanel.jsx (15.7 KB)
│   │   ├── AdminStats.jsx (7.5 KB)
│   │   ├── Administracao.jsx (32.4 KB)
│   │   ├── CNPJInput.jsx (6.9 KB)
│   │   ├── CNPJTester.jsx (3.4 KB)
│   │   ├── ConfirmationModal.jsx (4.0 KB)
│   │   ├── ContextPanel.jsx (8.5 KB)
│   │   ├── Dashboard.jsx (18.3 KB)
│   │   ├── DashboardComponents/
│   │   │   ├── CronogramaWidget.jsx (16.1 KB)
│   │   │   └── MetricsGrid.jsx (2.6 KB)
│   │   ├── DataManager.jsx (27.2 KB)
│   │   ├── DebugPanel.jsx (2.2 KB)
│   │   ├── DespesaForm.jsx (20.2 KB)
│   │   ├── Despesas.jsx (12.5 KB)
│   │   ├── DespesasFilters.jsx (7.6 KB)
│   │   ├── DespesasList.jsx (9.5 KB)
│   │   ├── DespesasTable.jsx (24.2 KB)
│   │   ├── Emendas.jsx (20.9 KB)
│   │   ├── EmendasFilters.jsx (7.4 KB)
│   │   ├── EmendasList.jsx (28.7 KB)
│   │   ├── EmendasTable.jsx (21.9 KB)
│   │   ├── EnvironmentIndicator.jsx (3.0 KB)
│   │   ├── ErrorBoundary.jsx (4.5 KB)
│   │   ├── FirebaseError.jsx (3.5 KB)
│   │   ├── FluxoEmenda.jsx (17.9 KB)
│   │   ├── GlobalSearch.jsx (18.1 KB)
│   │   ├── Home.jsx (2.5 KB)
│   │   ├── LoadingOverlay.jsx (1.4 KB)
│   │   ├── Login.jsx (11.3 KB)
│   │   ├── PaginatedTable.jsx (0 bytes)
│   │   ├── Pagination.jsx (14.0 KB)
│   │   ├── PrimeiraDespesaModal.jsx (8.8 KB)
│   │   ├── PrintButton.jsx (3.1 KB)
│   │   ├── PrivateRoute.jsx (2.3 KB)
│   │   ├── Relatorios.jsx (7.7 KB)
│   │   ├── SaldoEmendaWidget.jsx (8.1 KB)
│   │   ├── Sidebar.jsx (15.3 KB)
│   │   ├── Sobre.jsx (12.4 KB)
│   │   ├── TemporaryBanner.jsx (3.1 KB)
│   │   ├── ThemeToggle.jsx (40 bytes)
│   │   ├── Toast.jsx (5.5 KB)
│   │   ├── UpdateNotification.jsx (4.5 KB)
│   │   ├── UserForm.jsx (33.1 KB)
│   │   ├── UsersTable.jsx (10.3 KB)
│   │   ├── VisualizacaoEmendaDespesas.jsx (34.9 KB)
│   │   ├── WorkflowManager.jsx (16.8 KB)
│   │   ├── despesa/
│   │   │   ├── DespesaFormActions.jsx (1.7 KB)
│   │   │   ├── DespesaFormAdvancedFields.jsx (7.4 KB)
│   │   │   ├── DespesaFormBanners.jsx (3.0 KB)
│   │   │   ├── DespesaFormBasicFields.jsx (7.6 KB)
│   │   │   ├── DespesaFormDateFields.jsx (4.9 KB)
│   │   │   ├── DespesaFormEmendaInfo.jsx (1.9 KB)
│   │   │   ├── DespesaFormEmpenhoFields.jsx (4.0 KB)
│   │   │   ├── DespesaFormHeader.jsx (2.3 KB)
│   │   │   ├── DespesaFormOrcamentoFields.jsx (5.3 KB)
│   │   │   ├── DespesasListHeader.jsx (6.3 KB)
│   │   │   └── DespesasStats.jsx (2.2 KB)
│   │   ├── emenda/
│   │   │   ├── EmendaForm/
│   │   │   │   ├── components/
│   │   │   │   │   ├── EmendaFormActions.jsx (4.4 KB)
│   │   │   │   │   ├── EmendaFormCancelModal.jsx (4.1 KB)
│   │   │   │   │   └── EmendaFormHeader.jsx (2.4 KB)
│   │   │   │   ├── index.jsx (19.1 KB)
│   │   │   │   └── sections/
│   │   │   │       ├── AcoesServicos.jsx (14.9 KB)
│   │   │   │       ├── ClassificacaoTecnica.jsx (5.7 KB)
│   │   │   │       ├── Cronograma.jsx (9.3 KB)
│   │   │   │       ├── DadosBancarios.jsx (7.5 KB)
│   │   │   │       ├── DadosBasicos.jsx (9.1 KB)
│   │   │   │       ├── DadosBeneficiario.jsx (12.8 KB)
│   │   │   │       ├── Identificacao.jsx (5.5 KB)
│   │   │   │       ├── InformacoesComplementares.jsx (7.6 KB)
│   │   │   │       └── InformacoesFinais.jsx (8.5 KB)
│   │   │   └── ModalExclusaoEmenda.jsx (7.3 KB)
│   │   └── relatorios/
│   │       ├── RelatoriosCards.jsx (949 bytes)
│   │       ├── RelatoriosConfig.jsx (0 bytes)
│   │       ├── RelatoriosFiltros.jsx (4.4 KB)
│   │       ├── RelatoriosHeader.jsx (0 bytes)
│   │       └── geradores/
│   │           ├── BaseRelatorio.js (1.7 KB)
│   │           ├── RelatorioAnalitico.js (8.3 KB)
│   │           ├── RelatorioConsolidado.js (11.7 KB)
│   │           ├── RelatorioDespesas.js (9.0 KB)
│   │           ├── RelatorioExecucao.js (4.3 KB)
│   │           └── RelatorioPrestacao.js (6.0 KB)
│   ├── config/
│   │   └── constants.js (1.1 KB)
│   ├── context/
│   │   └── UserContext.jsx (6.7 KB)
│   ├── firebase/
│   │   └── firebaseConfig.js (2.5 KB)
│   ├── hooks/
│   │   ├── useDashboardData.js (9.7 KB)
│   │   ├── useEmendaDespesa.js (18.1 KB)
│   │   ├── useEmendaFormData.js (0 bytes)
│   │   ├── useEmendaFormNavigation.js (5.2 KB)
│   │   ├── useNavigationProtection.js (8.9 KB)
│   │   ├── usePageTitle.js (927 bytes)
│   │   ├── usePagination.js (10.1 KB)
│   │   ├── usePermissions.js (6.2 KB)
│   │   ├── useRelatoriosData.js (3.9 KB)
│   │   └── useValidation.js (15.6 KB)
│   ├── images/
│   ├── index.jsx (456 bytes)
│   ├── services/
│   │   ├── auditService.js (11.0 KB)
│   │   ├── createAdminUser.js (3.9 KB)
│   │   ├── emendasService.js (1.6 KB)
│   │   └── userService.js (29.1 KB)
│   ├── styles/
│   └── utils/
│       ├── DisableConsole.jsx (6.8 KB)
│       ├── cnpjUtils.js (4.9 KB)
│       ├── despesaValidators.js (2.3 KB)
│       ├── errorHandlers.js (5.2 KB)
│       ├── exportImport.js (0 bytes)
│       ├── firebaseCollections.js (7.8 KB)
│       ├── formStyles.js (14.7 KB)
│       ├── formatters.js (5.2 KB)
│       ├── pdfHelpers.js (4.7 KB)
│       ├── printUtils.js (6.3 KB)
│       ├── relatoriosConstants.js (1.7 KB)
│       ├── validators.js (14.4 KB)
│       └── versionControl.js (8.3 KB)
├── switch-env.sh (3.8 KB)
├── tsconfig.json (505 bytes)
├── vercel.json (394 bytes)
└── vite.config.js (2.7 KB)


---

## 🛠️ TECNOLOGIAS E DEPENDÊNCIAS

### Principais
- **React:** não encontrado
- **React Router:** ^7.6.3
- **Firebase:** ^11.9.1
- **Vite:** ^5.0.0

### Scripts NPM
- **npm run dev:** `vite`
- **npm run build:** `node generate-version.js && vite build`
- **npm run build:dev:** `node scripts/auto-increment.js development && vite build --mode development`
- **npm run build:prod:** `node scripts/auto-increment.js production && vite build --mode production`
- **npm run preview:** `vite preview`

---

## 📄 ARQUIVOS DO SISTEMA

### 🧩 Componentes (81)

#### `src/components/AdminPanel.jsx`
- **Descrição:** 🔧 MELHORAR AdminPanel.jsx - Integrar com AuditService
- **Tamanho:** 15.7 KB
- **Exports:** nenhum

#### `src/components/AdminStats.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 7.5 KB
- **Exports:** default

#### `src/components/Administracao.jsx`
- **Descrição:** 🔧 CORREÇÃO: Administracao.jsx - Implementar Modal de Usuário
- **Tamanho:** 32.4 KB
- **Exports:** default

#### `src/components/CNPJInput.jsx`
- **Descrição:** src/components/CNPJInput.jsx - SOLUÇÃO RADICAL
- **Tamanho:** 6.9 KB
- **Exports:** default

#### `src/components/CNPJTester.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 3.4 KB
- **Exports:** default

#### `src/components/ConfirmationModal.jsx`
- **Descrição:** src/components/ConfirmationModal.jsx - Modal de Confirmação Personalizado
- **Tamanho:** 4.0 KB
- **Exports:** default

#### `src/components/ContextPanel.jsx`
- **Descrição:** 🔧 CORREÇÃO URGENTE: ContextPanel.jsx - Cálculo de Saldo Disponível
- **Tamanho:** 8.5 KB
- **Exports:** default

#### `src/components/Dashboard.jsx`
- **Descrição:** src/components/Dashboard.jsx - VERSÃO PROFISSIONAL
- **Tamanho:** 18.3 KB
- **Exports:** default

#### `src/components/DashboardComponents/CronogramaWidget.jsx`
- **Descrição:** src/components/DashboardComponents/CronogramaWidget.jsx
- **Tamanho:** 16.1 KB
- **Exports:** default

#### `src/components/DashboardComponents/MetricsGrid.jsx`
- **Descrição:** src/components/DashboardComponents/MetricsGrid.jsx
- **Tamanho:** 2.6 KB
- **Exports:** default

#### `src/components/DataManager.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 27.2 KB
- **Exports:** default

#### `src/components/DebugPanel.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 2.2 KB
- **Exports:** default

#### `src/components/DespesaForm.jsx`
- **Descrição:** src/components/DespesaForm.jsx
- **Tamanho:** 20.2 KB
- **Exports:** default

#### `src/components/Despesas.jsx`
- **Descrição:** Despesas.jsx - VERSÃO REFATORADA
- **Tamanho:** 12.5 KB
- **Exports:** default

#### `src/components/DespesasFilters.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 7.6 KB
- **Exports:** default

#### `src/components/DespesasList.jsx`
- **Descrição:** DespesasList.jsx - CORRIGIDO SEM useEmendaDespesa
- **Tamanho:** 9.5 KB
- **Exports:** default

#### `src/components/DespesasTable.jsx`
- **Descrição:** DespesasTable.jsx - VERSÃO COMPLETA COM SALDO PROGRESSIVO
- **Tamanho:** 24.2 KB
- **Exports:** default

#### `src/components/Emendas.jsx`
- **Descrição:** Emendas.jsx - Layout Padronizado com Despesas v2.3
- **Tamanho:** 20.9 KB
- **Exports:** default

#### `src/components/EmendasFilters.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 7.4 KB
- **Exports:** default

#### `src/components/EmendasList.jsx`
- **Descrição:** EmendasList.jsx - ORIGINAL CORRIGIDO
- **Tamanho:** 28.7 KB
- **Exports:** default

#### `src/components/EmendasTable.jsx`
- **Descrição:** EmendasTable.jsx - Com integração para Despesas
- **Tamanho:** 21.9 KB
- **Exports:** default

#### `src/components/EnvironmentIndicator.jsx`
- **Descrição:** src/components/EnvironmentIndicator.jsx
- **Tamanho:** 3.0 KB
- **Exports:** default

#### `src/components/ErrorBoundary.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 4.5 KB
- **Exports:** default

#### `src/components/FirebaseError.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 3.5 KB
- **Exports:** default

#### `src/components/FluxoEmenda.jsx`
- **Descrição:** src/components/FluxoEmenda.jsx - CORRIGIDO com fallback para onClose
- **Tamanho:** 17.9 KB
- **Exports:** default

#### `src/components/GlobalSearch.jsx`
- **Descrição:** src/components/GlobalSearch.jsx
- **Tamanho:** 18.1 KB
- **Exports:** default

#### `src/components/Home.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 2.5 KB
- **Exports:** default

#### `src/components/LoadingOverlay.jsx`
- **Descrição:** src/components/LoadingOverlay.jsx
- **Tamanho:** 1.4 KB
- **Exports:** default

#### `src/components/Login.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 11.3 KB
- **Exports:** default

#### `src/components/PaginatedTable.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 0 bytes
- **Exports:** nenhum

#### `src/components/Pagination.jsx`
- **Descrição:** src/components/Pagination.jsx
- **Tamanho:** 14.0 KB
- **Exports:** default, QuickPagination, PaginationInfo, paginationCSS

#### `src/components/PrimeiraDespesaModal.jsx`
- **Descrição:** src/components/PrimeiraDespesaModal.jsx
- **Tamanho:** 8.8 KB
- **Exports:** default

#### `src/components/PrintButton.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 3.1 KB
- **Exports:** default

#### `src/components/PrivateRoute.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 2.3 KB
- **Exports:** default

#### `src/components/Relatorios.jsx`
- **Descrição:** src/components/Relatorios.jsx
- **Tamanho:** 7.7 KB
- **Exports:** default

#### `src/components/SaldoEmendaWidget.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 8.1 KB
- **Exports:** default

#### `src/components/Sidebar.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 15.3 KB
- **Exports:** default

#### `src/components/Sobre.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 12.4 KB
- **Exports:** default

#### `src/components/TemporaryBanner.jsx`
- **Descrição:** src/components/TemporaryBanner.jsx - Banner Temporário que Aparece e Desaparece
- **Tamanho:** 3.1 KB
- **Exports:** default

#### `src/components/ThemeToggle.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 40 bytes
- **Exports:** nenhum

#### `src/components/Toast.jsx`
- **Descrição:** Toast.jsx - SISTEMA CORRIGIDO v2.0
- **Tamanho:** 5.5 KB
- **Exports:** default, ToastProvider, useToast

#### `src/components/UpdateNotification.jsx`
- **Descrição:** src/components/UpdateNotification.jsx
- **Tamanho:** 4.5 KB
- **Exports:** default

#### `src/components/UserForm.jsx`
- **Descrição:** src/components/UserForm.jsx - VERSÃO COMPLETA COM MELHORIAS
- **Tamanho:** 33.1 KB
- **Exports:** default

#### `src/components/UsersTable.jsx`
- **Descrição:** src/components/UsersTable.jsx - TABELA MELHORADA COM OPÇÃO DESATIVAR
- **Tamanho:** 10.3 KB
- **Exports:** default

#### `src/components/VisualizacaoEmendaDespesas.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 34.9 KB
- **Exports:** default

#### `src/components/WorkflowManager.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 16.8 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormActions.jsx`
- **Descrição:** src/components/despesa/DespesaFormActions.jsx
- **Tamanho:** 1.7 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormAdvancedFields.jsx`
- **Descrição:** src/components/despesa/DespesaFormAdvancedFields.jsx
- **Tamanho:** 7.4 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormBanners.jsx`
- **Descrição:** src/components/despesa/DespesaFormBanners.jsx
- **Tamanho:** 3.0 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormBasicFields.jsx`
- **Descrição:** src/components/despesa/DespesaFormBasicFields.jsx
- **Tamanho:** 7.6 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormDateFields.jsx`
- **Descrição:** src/components/despesa/DespesaFormDateFields.jsx
- **Tamanho:** 4.9 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormEmendaInfo.jsx`
- **Descrição:** src/components/despesa/DespesaFormEmendaInfo.jsx
- **Tamanho:** 1.9 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormEmpenhoFields.jsx`
- **Descrição:** src/components/despesa/DespesaFormEmpenhoFields.jsx
- **Tamanho:** 4.0 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormHeader.jsx`
- **Descrição:** src/components/despesa/DespesaFormHeader.jsx
- **Tamanho:** 2.3 KB
- **Exports:** default

#### `src/components/despesa/DespesaFormOrcamentoFields.jsx`
- **Descrição:** src/components/despesa/DespesaFormOrcamentoFields.jsx
- **Tamanho:** 5.3 KB
- **Exports:** default

#### `src/components/despesa/DespesasListHeader.jsx`
- **Descrição:** src/components/despesa/DespesasListHeader.jsx
- **Tamanho:** 6.3 KB
- **Exports:** default

#### `src/components/despesa/DespesasStats.jsx`
- **Descrição:** src/components/despesa/DespesasStats.jsx
- **Tamanho:** 2.2 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/components/EmendaFormActions.jsx`
- **Descrição:** src/components/emenda/EmendaForm/components/EmendaFormActions.jsx
- **Tamanho:** 4.4 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx`
- **Descrição:** src/components/emenda/EmendaForm/components/EmendaFormCancelModal.jsx
- **Tamanho:** 4.1 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx`
- **Descrição:** src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx
- **Tamanho:** 2.4 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/index.jsx`
- **Descrição:** src/components/emenda/EmendaForm/index.jsx - VALIDAÇÃO CORRIGIDA
- **Tamanho:** 19.1 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 14.9 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/ClassificacaoTecnica.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 5.7 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/Cronograma.jsx`
- **Descrição:** src/components/emenda/EmendaForm/sections/Cronograma.jsx
- **Tamanho:** 9.3 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/DadosBancarios.jsx`
- **Descrição:** src/components/emenda/EmendaForm/sections/DadosBancarios.jsx
- **Tamanho:** 7.5 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/DadosBasicos.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 9.1 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 12.8 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/Identificacao.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 5.5 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/InformacoesComplementares.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 7.6 KB
- **Exports:** default

#### `src/components/emenda/EmendaForm/sections/InformacoesFinais.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 8.5 KB
- **Exports:** default

#### `src/components/emenda/ModalExclusaoEmenda.jsx`
- **Descrição:** src/components/emenda/ModalExclusaoEmenda.jsx
- **Tamanho:** 7.3 KB
- **Exports:** default

#### `src/components/relatorios/RelatoriosCards.jsx`
- **Descrição:** src/components/relatorios/RelatoriosCards.jsx
- **Tamanho:** 949 bytes
- **Exports:** default

#### `src/components/relatorios/RelatoriosConfig.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 0 bytes
- **Exports:** nenhum

#### `src/components/relatorios/RelatoriosFiltros.jsx`
- **Descrição:** src/components/relatorios/RelatoriosFiltros.jsx
- **Tamanho:** 4.4 KB
- **Exports:** default

#### `src/components/relatorios/RelatoriosHeader.jsx`
- **Descrição:** Sem descrição
- **Tamanho:** 0 bytes
- **Exports:** nenhum

#### `src/components/relatorios/geradores/BaseRelatorio.js`
- **Descrição:** src/components/relatorios/geradores/BaseRelatorio.js
- **Tamanho:** 1.7 KB
- **Exports:** BaseRelatorio

#### `src/components/relatorios/geradores/RelatorioAnalitico.js`
- **Descrição:** src/components/relatorios/geradores/RelatorioAnalitico.js
- **Tamanho:** 8.3 KB
- **Exports:** RelatorioAnalitico

#### `src/components/relatorios/geradores/RelatorioConsolidado.js`
- **Descrição:** src/components/relatorios/geradores/RelatorioConsolidado.js
- **Tamanho:** 11.7 KB
- **Exports:** RelatorioConsolidado

#### `src/components/relatorios/geradores/RelatorioDespesas.js`
- **Descrição:** src/components/relatorios/geradores/RelatorioDespesas.js
- **Tamanho:** 9.0 KB
- **Exports:** RelatorioDespesas

#### `src/components/relatorios/geradores/RelatorioExecucao.js`
- **Descrição:** src/components/relatorios/geradores/RelatorioExecucao.js
- **Tamanho:** 4.3 KB
- **Exports:** RelatorioExecucao

#### `src/components/relatorios/geradores/RelatorioPrestacao.js`
- **Descrição:** src/components/relatorios/geradores/RelatorioPrestacao.js
- **Tamanho:** 6.0 KB
- **Exports:** RelatorioPrestacao


### 🎣 Hooks (10)

#### `src/hooks/useDashboardData.js`
- **Descrição:** src/hooks/useDashboardData.js
- **Tamanho:** 9.7 KB

#### `src/hooks/useEmendaDespesa.js`
- **Descrição:** src/hooks/useEmendaDespesa.js - VERSÃO CORRIGIDA v2.0
- **Tamanho:** 18.1 KB

#### `src/hooks/useEmendaFormData.js`
- **Descrição:** Sem descrição
- **Tamanho:** 0 bytes

#### `src/hooks/useEmendaFormNavigation.js`
- **Descrição:** src/hooks/useEmendaFormNavigation.js
- **Tamanho:** 5.2 KB

#### `src/hooks/useNavigationProtection.js`
- **Descrição:** hooks/useNavigationProtection.js - Hook Completo para Proteção de Navegação
- **Tamanho:** 8.9 KB

#### `src/hooks/usePageTitle.js`
- **Descrição:** src/hooks/usePageTitle.js
- **Tamanho:** 927 bytes

#### `src/hooks/usePagination.js`
- **Descrição:** src/hooks/usePagination.js
- **Tamanho:** 10.1 KB

#### `src/hooks/usePermissions.js`
- **Descrição:** src/hooks/usePermissions.js - HOOK CENTRALIZADO DE PERMISSÕES
- **Tamanho:** 6.2 KB

#### `src/hooks/useRelatoriosData.js`
- **Descrição:** src/hooks/useRelatoriosData.js
- **Tamanho:** 3.9 KB

#### `src/hooks/useValidation.js`
- **Descrição:** src/hooks/useValidation.js - VERSÃO COMPLETA COM FIX
- **Tamanho:** 15.6 KB


### 🛠️ Utilitários (13)

#### `src/utils/DisableConsole.jsx`
- **Descrição:** Arquivo: src/utils/DisableConsole.jsx
- **Tamanho:** 6.8 KB

#### `src/utils/cnpjUtils.js`
- **Descrição:** ✅ UTILITÁRIOS PARA CNPJ - VALIDAÇÃO CORRIGIDA
- **Tamanho:** 4.9 KB

#### `src/utils/despesaValidators.js`
- **Descrição:** src/components/despesa/DespesaFormHeader.jsx
- **Tamanho:** 2.3 KB

#### `src/utils/errorHandlers.js`
- **Descrição:** Sem descrição
- **Tamanho:** 5.2 KB

#### `src/utils/exportImport.js`
- **Descrição:** Sem descrição
- **Tamanho:** 0 bytes

#### `src/utils/firebaseCollections.js`
- **Descrição:** src/utils/firebaseCollections.js - ATUALIZADO CONFORME PRINTS
- **Tamanho:** 7.8 KB

#### `src/utils/formStyles.js`
- **Descrição:** ✅ ESTILOS UNIVERSAIS PARA FORMS - COM DARK MODE COMPLETO
- **Tamanho:** 14.7 KB

#### `src/utils/formatters.js`
- **Descrição:** ✅ FORMATADORES MONETÁRIOS PRECISOS - src/utils/formatters.js - VERSÃO COMPLETA
- **Tamanho:** 5.2 KB

#### `src/utils/pdfHelpers.js`
- **Descrição:** src/utils/pdfHelpers.js
- **Tamanho:** 4.7 KB

#### `src/utils/printUtils.js`
- **Descrição:** src/utils/printUtils.js
- **Tamanho:** 6.3 KB

#### `src/utils/relatoriosConstants.js`
- **Descrição:** src/utils/relatoriosConstants.js
- **Tamanho:** 1.7 KB

#### `src/utils/validators.js`
- **Descrição:** src/utils/validators.js - VALIDAÇÕES CENTRALIZADAS DO SISTEMA
- **Tamanho:** 14.4 KB

#### `src/utils/versionControl.js`
- **Descrição:** src/utils/versionControl.js
- **Tamanho:** 8.3 KB


### 🔧 Serviços (4)

#### `src/services/auditService.js`
- **Descrição:** src/services/auditService.js
- **Tamanho:** 11.0 KB

#### `src/services/createAdminUser.js`
- **Descrição:** src/services/createAdminUser.js - Criar usuário admin diretamente no Firebase
- **Tamanho:** 3.9 KB

#### `src/services/emendasService.js`
- **Descrição:** src/services/emendasService.js
- **Tamanho:** 1.6 KB

#### `src/services/userService.js`
- **Descrição:** src/services/userService.js - VERSÃO CORRIGIDA COM CRIAÇÃO ATÔMICA
- **Tamanho:** 29.1 KB


---

## 📋 ARQUIVOS IMPORTANTES

### vite.config.js
- **Propósito:** Configuração do build e desenvolvimento
- **Tamanho:** 2.7 KB
- **Modificado:** 08/08/2025

### switch-env.sh
- **Propósito:** Script para alternar entre ambientes dev/prod
- **Tamanho:** 3.8 KB
- **Modificado:** 07/08/2025

### .gitignore
- **Propósito:** Arquivos ignorados pelo Git
- **Tamanho:** 2.0 KB
- **Modificado:** 08/03/2024

### README.md
- **Propósito:** Documentação principal do projeto
- **Tamanho:** 842 bytes
- **Modificado:** 30/04/2024


---

## 🔄 MUDANÇAS RECENTES (Últimos 7 dias)

- `src/utils/versionControl.js` (Utilitário) - 09/08/2025
- `src/components/Administracao.jsx` (Componente) - 09/08/2025
- `src/services/userService.js` (Serviço) - 09/08/2025
- `src/components/UserForm.jsx` (Componente) - 09/08/2025
- `src/components/DespesasTable.jsx` (Componente) - 09/08/2025
- `src/components/Home.jsx` (Componente) - 09/08/2025
- `src/components/Login.jsx` (Componente) - 09/08/2025
- `src/components/Sobre.jsx` (Componente) - 09/08/2025
- `src/components/Despesas.jsx` (Componente) - 09/08/2025
- `src/components/ContextPanel.jsx` (Componente) - 09/08/2025
- `src/components/emenda/EmendaForm/sections/DadosBasicos.jsx` (Componente) - 09/08/2025
- `src/components/emenda/EmendaForm/sections/Identificacao.jsx` (Componente) - 09/08/2025
- `src/components/CNPJInput.jsx` (Componente) - 09/08/2025
- `src/utils/cnpjUtils.js` (Utilitário) - 09/08/2025
- `src/components/CNPJTester.jsx` (Componente) - 09/08/2025
- `src/components/emenda/EmendaForm/sections/DadosBeneficiario.jsx` (Componente) - 09/08/2025
- `src/components/emenda/EmendaForm/index.jsx` (Componente) - 09/08/2025
- `src/utils/validators.js` (Utilitário) - 09/08/2025
- `src/utils/formatters.js` (Utilitário) - 09/08/2025
- `src/utils/formStyles.js` (Utilitário) - 09/08/2025
- `src/components/DespesaForm.jsx` (Componente) - 09/08/2025
- `src/components/ErrorBoundary.jsx` (Componente) - 09/08/2025
- `src/utils/DisableConsole.jsx` (Utilitário) - 09/08/2025
- `src/components/DataManager.jsx` (Componente) - 09/08/2025
- `src/components/EmendasTable.jsx` (Componente) - 09/08/2025
- `src/components/emenda/EmendaForm/components/EmendaFormActions.jsx` (Componente) - 09/08/2025
- `src/components/Emendas.jsx` (Componente) - 09/08/2025
- `src/components/despesa/DespesaFormActions.jsx` (Componente) - 09/08/2025
- `src/components/LoadingOverlay.jsx` (Componente) - 09/08/2025
- `src/components/DespesasList.jsx` (Componente) - 09/08/2025
- `src/services/auditService.js` (Serviço) - 08/08/2025
- `src/components/EnvironmentIndicator.jsx` (Componente) - 08/08/2025
- `src/components/UpdateNotification.jsx` (Componente) - 07/08/2025
- `src/components/emenda/ModalExclusaoEmenda.jsx` (Componente) - 06/08/2025
- `src/components/relatorios/geradores/RelatorioConsolidado.js` (Componente) - 06/08/2025
- `src/components/relatorios/geradores/RelatorioPrestacao.js` (Componente) - 06/08/2025
- `src/components/relatorios/geradores/RelatorioAnalitico.js` (Componente) - 06/08/2025
- `src/components/relatorios/geradores/RelatorioDespesas.js` (Componente) - 06/08/2025
- `src/components/Relatorios.jsx` (Componente) - 06/08/2025
- `src/components/relatorios/geradores/BaseRelatorio.js` (Componente) - 06/08/2025
- `src/utils/pdfHelpers.js` (Utilitário) - 06/08/2025
- `src/components/relatorios/geradores/RelatorioExecucao.js` (Componente) - 06/08/2025
- `src/hooks/useRelatoriosData.js` (Hook) - 06/08/2025
- `src/utils/relatoriosConstants.js` (Utilitário) - 06/08/2025
- `src/components/relatorios/RelatoriosCards.jsx` (Componente) - 06/08/2025
- `src/components/relatorios/RelatoriosFiltros.jsx` (Componente) - 06/08/2025
- `src/components/relatorios/RelatoriosConfig.jsx` (Componente) - 06/08/2025
- `src/components/relatorios/RelatoriosHeader.jsx` (Componente) - 06/08/2025
- `src/hooks/useDashboardData.js` (Hook) - 06/08/2025
- `src/components/Dashboard.jsx` (Componente) - 06/08/2025
- `src/components/despesa/DespesasStats.jsx` (Componente) - 06/08/2025
- `src/components/despesa/DespesasListHeader.jsx` (Componente) - 06/08/2025
- `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx` (Componente) - 06/08/2025
- `src/components/emenda/EmendaForm/components/EmendaFormHeader.jsx` (Componente) - 06/08/2025
- `src/components/EmendasFilters.jsx` (Componente) - 06/08/2025
- `src/components/AdminPanel.jsx` (Componente) - 05/08/2025
- `src/components/DashboardComponents/MetricsGrid.jsx` (Componente) - 04/08/2025
- `src/components/DashboardComponents/CronogramaWidget.jsx` (Componente) - 04/08/2025
- `src/hooks/usePermissions.js` (Hook) - 04/08/2025
- `src/components/Sidebar.jsx` (Componente) - 04/08/2025
- `src/components/UsersTable.jsx` (Componente) - 04/08/2025
- `src/components/PrivateRoute.jsx` (Componente) - 04/08/2025
- `src/components/PrintButton.jsx` (Componente) - 04/08/2025
- `src/components/despesa/DespesaFormDateFields.jsx` (Componente) - 04/08/2025
- `src/components/despesa/DespesaFormBasicFields.jsx` (Componente) - 04/08/2025

---

## 🚀 GUIA RÁPIDO

### Para Desenvolver
1. `./switch-env.sh dev` - Mudar para desenvolvimento
2. `npm run dev` - Iniciar servidor local
3. Fazer alterações
4. Testar no navegador

### Para Deploy
1. `./switch-env.sh prod` - Mudar para produção
2. `npm run build:prod` - Gerar build
3. Clicar em "Redeploy" no Replit
4. `./switch-env.sh dev` - Voltar para dev

### URLs
- **Desenvolvimento:** http://localhost:5173
- **Produção:** https://sicefsus.replit.app/

---

## 📊 ESTATÍSTICAS

- **Total de Componentes:** 81
- **Total de Hooks:** 10
- **Total de Utilitários:** 13
- **Total de Serviços:** 4
- **Arquivos Importantes:** 4
- **Mudanças Recentes:** 65

---

**🔄 Para atualizar esta documentação:** `node scripts/generateHandover.js`
