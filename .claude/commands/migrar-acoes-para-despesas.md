# Migração: acoesServicos → despesas (PLANEJADA)

Converte as entradas `acoesServicos` dentro das emendas para documentos na coleção `despesas` com `status: PLANEJADA` e remove o campo antigo.

## ATENÇÃO
- ⚠️ Script atual usa config hardcoded (não .env). Revise antes de rodar.
- ⚠️ Faça backup antes (veja `backup-emenda.js` ou export via Console)
- ⚠️ Teste em ambiente DEV primeiro

## Executar (após parametrizar com .env)
```bash
node scripts/migrarAcoesServicosParaDespesas.js
```

## O que faz
- Itera todas as emendas, cria despesas planejadas baseadas em cada ação/serviço
- Remove o campo `acoesServicos` da emenda
- Gera logs por emenda

## Sugestões de melhoria
- Usar variáveis `.env` (`VITE_FIREBASE_*`) em vez de config hardcoded
- Adicionar `DRY_RUN=true` para simular sem gravar
- Gerar relatório `.md` com resumo por emenda
