---
name: mapear-arquitetura
description: "Documenta estrutura do projeto, dependências e fluxos de dados"
---

# Skill: Mapeamento de Arquitetura

## Quando Usar
Esta skill é ativada quando o agente precisa entender ou documentar a estrutura do projeto, dependências entre componentes ou fluxos de dados.

## Competência
Mapear e documentar a arquitetura do sistema de forma clara, incluindo dependências, fluxos de dados e relacionamentos.

## Dimensões de Análise

### 1. Estrutura de Arquivos
- Árvore de diretórios com 3+ níveis
- Propósito de cada pasta
- Convenções de nomenclatura
- Arquivos críticos e suas responsabilidades

### 2. Grafo de Dependências
Para cada módulo principal:
- **Importa**: o que o módulo usa
- **Exporta**: o que o módulo fornece
- **Dependido por**: quem usa este módulo

### 3. Fluxos de Dados
Mapear caminhos críticos:
- Autenticação (Login → Session → Protected Routes)
- CRUD principal (List → Detail → Form → Save)
- Estado global (Context → Components → Updates)

### 4. Camadas da Aplicação
```
┌─────────────────────────────────────┐
│           Components (UI)           │
├─────────────────────────────────────┤
│         Hooks (Logic/State)         │
├─────────────────────────────────────┤
│       Services (API/Firebase)       │
├─────────────────────────────────────┤
│          Utils (Helpers)            │
├─────────────────────────────────────┤
│        Config (Constants)           │
└─────────────────────────────────────┘
```

### 5. Estado da Aplicação
- Contexts e seus dados
- Estados locais importantes
- Cache e persistência

## Processo de Mapeamento

1. **Identificar entry points**
   - `index.jsx` / `App.jsx`
   - Rotas principais
   - Providers

2. **Mapear componentes**
   - Hierarquia de componentes
   - Props flow
   - Shared components

3. **Traçar hooks**
   - Hooks customizados
   - Onde são usados
   - Dependências entre hooks

4. **Documentar services**
   - Endpoints/collections
   - Operações disponíveis
   - Tratamento de erros

5. **Visualizar fluxos**
   - User journey principal
   - Fluxos de dados
   - Side effects

## Formato de Saída

### Árvore de Arquivos
```
src/
├── components/     # UI Components
│   ├── common/     # Shared (Button, Modal)
│   ├── features/   # Feature-specific
│   └── layout/     # Layout (Sidebar, Header)
├── hooks/          # Custom hooks
├── services/       # API layer
├── utils/          # Pure functions
├── context/        # React contexts
└── config/         # Constants, env
```

### Diagrama de Dependências
```
App.jsx
├── UserContext (auth state)
├── Dashboard
│   ├── useDashboardData
│   │   └── Firebase queries
│   └── DashboardWidgets
└── Emendas
    ├── useEmendaFormData
    └── EmendasTable
```

### Fluxo de Dados
```
[User Action] → [Component] → [Hook] → [Service] → [Firebase]
                    ↑                                  │
                    └────────── [State Update] ←───────┘
```

## Checklist de Completude
- [ ] Todos os entry points mapeados
- [ ] Grafo de dependências completo
- [ ] Fluxos críticos documentados
- [ ] Estados identificados
- [ ] Integrações externas listadas
