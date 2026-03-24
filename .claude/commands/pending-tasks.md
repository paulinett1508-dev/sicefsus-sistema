# Tarefas Pendentes para Proxima Sessao

## Atualizado em: 2026-03-24

---

## Sem pendencias ativas

Todas as tarefas foram resolvidas na sessao de 24/03/2026.

---

## Sessao 24/03/2026 - Concluido

Auditoria completa do modulo de relatorios (4 rodadas: firebase, design/ui-ux, bugs-react-async, sistema).
Total: 13 bugs/problemas corrigidos.

| Tarefa | Commits |
|--------|---------|
| fix(P2 firebase): filtro de status para emendas inativas + indexes compostos | `eaf4437` (sessao anterior) |
| fix(design): 8 correcoes UI/UX (focus-visible, touch targets, reduced-motion, etc.) | sessao anterior |
| fix(async): 5 correcoes bugs React/async (Math.max spread, Set sem filter(Boolean), etc.) | sessao anterior |
| fix(relatorios): filtro de data em despesas detalhadas esvaziava PDF (bug cascade) | `75bdf67` |
| fix(relatorios): consolidado-mensal nao filtrava por mes/ano selecionado | `7aaa2f8` |
| fix(relatorios): assinatura RelatorioPrestacao sobrepunha conteudo (posicao fixa) | `7aaa2f8` |
| fix(relatorios): acento ausente no rodape RelatorioExecucao | `7aaa2f8` |
| chore(relatorios): remover codigo morto (filtro UF, campo status) | `88f7e67` |
| chore(relatorios): padronizar DESPESA_STATUS nos geradores PDF | `88f7e67` |
| docs: corrigir CLAUDE.md (RelatoriosConfig -> RelatoriosCards) | `88f7e67` |

### Detalhes do bug principal corrigido
Relatorio Despesas Detalhadas: ao aplicar filtro de data, tela mostrava dados
mas PDF exibia apenas cabecalhos. Causa: cascade emendas->despesas ocorria
APOS filtro temporal, eliminando despesas cujas emendas nao tinham data no
periodo. Fix: separar cascade (usa emendas sem filtro temporal) do filtro
de data em despesas (independente, hierarquia alinhada com PDFs).

---

## Sessao 13/03/2026 - Concluido

| Tarefa | Commits |
|--------|---------|
| CPF no cadastro de fornecedores (toggle PF/PJ) | `c2fc7eb` |
| Busca automatica de endereco por CEP (ViaCEP) | `56f6a96` |
| CPF expandido para despesas e modais de emenda | `a58a81e` |
| Dashboard: card Execucao por Tipo evoluido (detalhes por emenda + naturezas) | `358c295` |
| Dashboard: tipos lado a lado, timeline abaixo | `743abed` |
| Dashboard: collapse por tipo, limite 5 emendas | `961fcdb` |
| Dashboard: Proximos 30 Dias unificado no Acompanhamento de Prazos | `243c838` |
| Copyright dinamico com `new Date().getFullYear()` | `cc5dced` |
| Login: botao mostrar/ocultar senha | `d9372b2` |
| Auditoria de calculos: 11 bugs P0 corrigidos (parseFloat -> parseValorMonetario) | `0a13e5c` |
| Auditoria de calculos: 6 bugs P1 corrigidos (saldo, filtro UF, status) | `d24d98f` |
| Auditoria de calculos: 6 P2 corrigidos (constantes DESPESA_STATUS, formatarMoedaBRL) | `eaf4437` |

---

## Checklist de Testes (Referencia Permanente)

### Autenticacao
- Login valido/invalido, usuario inativo, primeiro acesso, logout

### Dashboard
- Admin ve tudo, gestor/operador filtrado, KPIs corretos, alertas

### Emendas
- CRUD completo, filtros, validacoes, exclusao com/sem despesas

### Naturezas
- Criar/editar/excluir, validacao saldo, naturezas virtuais, regularizar

### Despesas
- Planejada vs executada, validacao saldo natureza, CNPJ/CPF lookup, status pagamento

### Fornecedores
- CRUD, lookup CNPJ/CPF, CEP auto-fill, integracao com despesas, FornecedorSelect

### Relatorios
- PDF (5 tipos): filtro de data, filtro de mes/ano (consolidado), assinatura prestacao
- Verificar que PDFs nao ficam com apenas cabecalhos ao filtrar por data

### Permissoes
- Admin: acesso total | Gestor: municipio + CRUD | Operador: municipio + sem exclusao

---

## Historico Resumido

- **24/03/2026**: Auditoria completa modulo relatorios — 13 bugs/problemas corrigidos
- **13/03/2026**: CPF fornecedores, CEP auto-fill, dashboard evoluido, auditoria 23 bugs corrigidos
- **08/03/2026**: Auditoria seguranca (21 vulns), integracao agnostic-core, /security-review
- **19/01/2026**: Toggle senha login, logo login, testes PDF pendentes
- **16/01/2026**: Despesas sem municipio corrigidas, despesas orfas deletadas
- **13/01/2026**: Logica orcamentaria, cards simplificados, modulo relatorios
- **12/01/2026**: Modulo fornecedores, correcao saldo negativo
- **10/01/2026**: Firebase MCP Server, testes completos
- **08/01/2026**: Naturezas unificadas, execucao orcamentaria
