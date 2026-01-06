# Tarefas Pendentes para Próxima Sessão

## Prioridade Alta

### 1. Auditoria do Sistema - Firebase Dev/Prod
**Skill a usar:** `@.claude/skills/auditoria-sistema.md`

**Escopo:**
- Usar o MCP do Firebase para analisar ambos os bancos de dados
- Ambiente DEV: verificar dados de teste, inconsistências
- Ambiente PROD: verificar integridade, documentos órfãos

**Checklist da auditoria:**
- [ ] Listar todas as coleções em DEV e PROD
- [ ] Comparar estrutura entre ambientes
- [ ] Identificar documentos órfãos (despesas sem emenda válida)
- [ ] Verificar usuários com claims desatualizados
- [ ] Buscar inconsistências de dados (valores, status)
- [ ] Identificar queries sem tratamento de erro no código
- [ ] Verificar listeners sem cleanup

**Comando MCP:**
```bash
# Verificar config do MCP
bash firebase-mcp-server/check-config.sh
```

---

## Anotações
- Data de criação: 2026-01-06
- Última sessão: correções de design (relatórios PDF + módulo usuários)
