---
name: validation-checklist
description: "Checklist de validação pré-deploy"
---

# Validation Checklist — Pre-Deploy

Checklist de validacao antes de deploy ou entrega.

Adaptado do agnostic-core (MIT). Fonte: skills/audit/validation-checklist.md

---

## CHECK RAPIDO (Fase de Desenvolvimento)

### Seguranca
- [ ] Sem secrets no codigo (grep: password, api_key, secret, token)
- [ ] Dependencias auditadas (`npm audit`)
- [ ] Inputs validados (tipo, formato, tamanho)
- [ ] Headers de seguranca configurados

### Qualidade de Codigo
- [ ] Linting passa sem erros
- [ ] Sem warnings do compilador/bundler
- [ ] Sem `console.log` ou debug statements no commit
- [ ] Sem codigo comentado desnecessario

### Banco de Dados / Firestore
- [ ] Regras de seguranca (firestore.rules) atualizadas
- [ ] Indices criados para queries com where + orderBy
- [ ] Campos calculados consistentes

### Testes
- [ ] Suite de testes passa
- [ ] Cobertura minima 80% em logica de negocio
- [ ] Testes skipados com justificativa documentada

### UX / Acessibilidade
- [ ] Contraste WCAG AA (4.5:1 texto normal)
- [ ] Touch targets minimo 44x44px
- [ ] Feedback visual em acoes (loading, erro, sucesso)

---

## CHECK COMPLETO (Pre-Deploy)

### Performance
- [ ] Bundle size verificado (nao cresceu sem motivo)
- [ ] Lazy loading para componentes pesados
- [ ] Imagens otimizadas
- [ ] Sem N+1 queries no Firestore

### Responsividade
- [ ] Layout funciona de 320px a 1280px+
- [ ] Sem scroll horizontal
- [ ] Fonte minima 14px em mobile

### Infraestrutura
- [ ] Variaveis de ambiente configuradas
- [ ] Backup do banco verificado
- [ ] Rollback possivel (commits atomicos)

### Documentacao
- [ ] CLAUDE.md atualizado se interface mudou
- [ ] STATE.md atualizado com trabalho realizado

---

## Contexto SICEFSUS

- Deploy via Replit
- Firestore Rules: arquivo `firestore.rules` na raiz
- Validacao: `src/utils/validators.js`
- Formatacao: `src/utils/formatters.js`
- Indices Firestore: verificar no Firebase Console
