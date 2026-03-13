# Tarefas Pendentes para Proxima Sessao

## Atualizado em: 2026-03-13

---

## Sem pendencias ativas

Todas as tarefas foram resolvidas na sessao de 13/03/2026.

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
| Auditoria de calculos: 11 bugs P0 corrigidos (parseFloat → parseValorMonetario) | `0a13e5c` |
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
- PDF (5 tipos), filtros, exportacao Excel, cabecalho continuacao

### Permissoes
- Admin: acesso total | Gestor: municipio + CRUD | Operador: municipio + sem exclusao

---

## Historico Resumido

- **13/03/2026**: CPF fornecedores, CEP auto-fill, dashboard evoluido, auditoria 23 bugs corrigidos
- **08/03/2026**: Auditoria seguranca (21 vulns), integracao agnostic-core, /security-review
- **19/01/2026**: Toggle senha login, logo login, testes PDF pendentes
- **16/01/2026**: Despesas sem municipio corrigidas, despesas orfas deletadas
- **13/01/2026**: Logica orcamentaria, cards simplificados, modulo relatorios
- **12/01/2026**: Modulo fornecedores, correcao saldo negativo
- **10/01/2026**: Firebase MCP Server, testes completos
- **08/01/2026**: Naturezas unificadas, execucao orcamentaria
