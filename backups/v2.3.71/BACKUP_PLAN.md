# 🔒 PLANO DE BACKUP - REFATORAÇÃO EMENDAS + DESPESAS
**Data:** 28/10/2025
**Versão do Sistema:** 2.3.71

---

## 📋 CHECKLIST PRÉ-IMPLEMENTAÇÃO

### ✅ BACKUP CRIADO
- [ ] Snapshot de todos arquivos originais
- [ ] Estrutura de pastas documentada
- [ ] Rotas atuais documentadas
- [ ] Banco de dados com backup
- [ ] Versão do Firebase documentada

### ✅ PONTO DE RESTAURAÇÃO
- [ ] Branch git criado: `backup-pre-unificacao-despesas`
- [ ] Arquivos versionados salvos em `/backups/v2.3.71/`
- [ ] Documentação de rollback criada

---

## 📂 ARQUIVOS ORIGINAIS (ANTES DA MODIFICAÇÃO)

### 1. Sidebar.jsx
- **Caminho:** `src/components/Sidebar.jsx`
- **Backup:** `BACKUP_Sidebar_v2.3.71.jsx`
- **Função:** Menu lateral com item "Despesas"

### 2. EmendaForm/index.jsx  
- **Caminho:** `src/components/emenda/EmendaForm/index.jsx`
- **Backup:** `BACKUP_EmendaForm_index_v2.3.71.jsx`
- **Função:** Formulário principal de emendas (6 abas)

### 3. AcoesServicos.jsx
- **Caminho:** `src/components/emenda/EmendaForm/sections/AcoesServicos.jsx`
- **Backup:** `BACKUP_AcoesServicos_v2.3.71.jsx`
- **Função:** Aba de planejamento de despesas

### 4. App.jsx
- **Caminho:** `src/App.jsx`
- **Backup:** `BACKUP_App_v2.3.71.jsx`
- **Função:** Rotas principais (inclui /despesas)

### 5. Despesas.jsx (módulo standalone)
- **Caminho:** `src/components/Despesas.jsx`
- **Backup:** `BACKUP_Despesas_v2.3.71.jsx`
- **Ação:** NÃO DELETAR! Manter como fallback

### 6. DespesaForm.jsx
- **Caminho:** `src/components/DespesaForm.jsx`
- **Backup:** `BACKUP_DespesaForm_v2.3.71.jsx`
- **Ação:** NÃO DELETAR! Usar como base para modal

---

## 🔄 PLANO DE ROLLBACK

### Se algo der errado:

**OPÇÃO 1: Rollback Rápido (5 minutos)**
```bash
# 1. Restaurar arquivos do backup
cp /backups/v2.3.71/BACKUP_Sidebar_v2.3.71.jsx src/components/Sidebar.jsx
cp /backups/v2.3.71/BACKUP_EmendaForm_index_v2.3.71.jsx src/components/emenda/EmendaForm/index.jsx
cp /backups/v2.3.71/BACKUP_AcoesServicos_v2.3.71.jsx src/components/emenda/EmendaForm/sections/AcoesServicos.jsx
cp /backups/v2.3.71/BACKUP_App_v2.3.71.jsx src/App.jsx

# 2. Deletar arquivos novos criados
rm src/components/emenda/EmendaForm/sections/DespesasTab.jsx
rm -rf src/components/emenda/despesas/

# 3. Reload da aplicação
# Sistema volta ao estado anterior
```

**OPÇÃO 2: Rollback via Git**
```bash
git checkout backup-pre-unificacao-despesas
```

---

## 📊 ESTRATÉGIA DE IMPLEMENTAÇÃO SEGURA

### FASE 1: Preparação (Não quebra nada)
- ✅ Criar novos componentes
- ✅ Adicionar nova aba "Despesas" (oculta por feature flag)
- ✅ Manter módulo antigo funcionando
- ✅ Testar em ambiente de dev

### FASE 2: Teste Piloto (Liberação controlada)
- ✅ Ativar nova aba para 1 usuário admin
- ✅ Verificar funcionamento por 24h
- ✅ Coletar feedback
- ✅ Manter módulo antigo ativo

### FASE 3: Migração Gradual
- ✅ Liberar para todos usuários
- ✅ Manter módulo antigo por 7 dias
- ✅ Monitorar logs de erro
- ✅ Suporte intensivo

### FASE 4: Finalização
- ✅ Remover módulo antigo do menu
- ✅ Manter código antigo comentado
- ✅ Documentar mudanças

---

## 🚨 CRITÉRIOS DE ROLLBACK

**Voltar atrás se:**
- ❌ Mais de 3 erros críticos reportados
- ❌ Perda de dados detectada
- ❌ Performance degradada >50%
- ❌ Usuários não conseguem cadastrar despesas
- ❌ Saldos calculados incorretamente

**Continuar se:**
- ✅ Erros são apenas de UX/layout
- ✅ Nenhuma perda de dados
- ✅ Performance igual ou melhor
- ✅ Feedback positivo dos usuários

---

## 📞 CONTATOS DE EMERGÊNCIA

**Desenvolvedor Principal:** [Nome]
**Suporte Técnico:** [Contato]
**Responsável pelo Sistema:** [Nome do dono]

---

## 📅 CRONOGRAMA COM CHECKPOINTS

**Dia 1: Backup e Preparação**
- [ ] 09:00 - Criar backup completo
- [ ] 10:00 - Documentar estado atual
- [ ] 11:00 - Criar branch de backup
- [ ] 14:00 - ✅ CHECKPOINT: Backup validado

**Dia 2-3: Desenvolvimento**
- [ ] Criar novos componentes
- [ ] Integrar com sistema existente
- [ ] Testes unitários
- [ ] ✅ CHECKPOINT: Testes passando

**Dia 4: Teste Piloto**
- [ ] Ativar para 1 usuário
- [ ] Monitorar por 24h
- [ ] ✅ CHECKPOINT: Sem erros críticos

**Dia 5-7: Liberação Geral**
- [ ] Liberar para todos
- [ ] Monitorar intensivamente
- [ ] ✅ CHECKPOINT: Sistema estável

**Dia 8-14: Observação**
- [ ] Manter módulo antigo disponível
- [ ] Coletar feedback
- [ ] ✅ CHECKPOINT: Aprovação para remoção

**Dia 15: Finalização**
- [ ] Remover módulo antigo
- [ ] Documentar lições aprendidas
- [ ] ✅ CHECKPOINT: Migração concluída

---

## ✅ APROVAÇÃO NECESSÁRIA

**Antes de começar:**
- [ ] Dono do sistema aprovou plano
- [ ] Backup completo realizado
- [ ] Equipe de suporte informada
- [ ] Cronograma acordado

**Assinatura:** _________________ **Data:** _________

---

**Documento de Backup e Restauração**
**Versão:** 1.0
**Criado em:** 28/10/2025