# Deploy Checklist

Checklist de deploy para o SICEFSUS.

Adaptado do agnostic-core (MIT). Fonte: commands/workflows/deploy.md

---

## PRE-FLIGHT (Antes do Deploy)

### Codigo
- [ ] Todos os testes passam
- [ ] Build sem erros (`npm run build`)
- [ ] Sem `console.log` de debug no codigo
- [ ] Sem secrets hardcoded

### Seguranca
- [ ] `npm audit` sem vulnerabilidades criticas
- [ ] Firestore Rules (`firestore.rules`) atualizadas
- [ ] Sem credenciais expostas no historico git

### Banco de Dados (Firestore)
- [ ] Indices criados para queries novas
- [ ] Backup recente disponivel
- [ ] Campos calculados consistentes

### Ambiente
- [ ] Variaveis de ambiente corretas para producao
- [ ] Firebase Config apontando para projeto PROD

---

## DEPLOY (Replit)

1. [ ] Verificar branch correta (main/master)
2. [ ] Build local passa sem erros
3. [ ] Deploy via Replit
4. [ ] Aguardar deploy completar

---

## POS-DEPLOY (Verificacao)

### Smoke Tests (primeiros 15 minutos)
- [ ] Login funciona (admin + operador)
- [ ] Dashboard carrega com dados corretos
- [ ] Lista de emendas carrega
- [ ] Criacao de emenda funciona
- [ ] Criacao de despesa funciona
- [ ] Relatorios geram PDF
- [ ] Navegacao entre paginas sem erros

### Monitoramento
- [ ] Console do Firebase sem erros
- [ ] Firestore Rules nao bloqueando operacoes legitimas
- [ ] Performance aceitavel (carregamento < 3s)

---

## ROLLBACK

Se problemas encontrados:
1. Identificar commit estavel anterior
2. Reverter deploy no Replit
3. Notificar usuarios afetados
4. Investigar causa raiz (ver `skills/debugging-sistematico.md`)

---

## FORMATO DO RELATORIO

```markdown
## Deploy Report
- Versao: [commit hash]
- Ambiente: PROD
- Data: [data]
- Status: SUCESSO / FALHA
- Smoke Tests: PASS / FAIL
- Observacoes: [notas]
```
