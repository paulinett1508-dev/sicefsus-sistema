# Gerar Documentação (Handover)

Gera a documentação completa do sistema com estrutura, componentes, hooks, serviços, ambientes e scripts.

## Executar

```bash
npm --prefix scripts run handover
# ou
node scripts/generateHandover.cjs
```

## Saída
- 📄 Cria `HANDOVER_SICEFSUS.md` na raiz
- 📊 Lista componentes, hooks, utils, services
- 🔧 Mapeia ambientes `.env` e scripts do projeto

## Quando usar
- Antes de repassar o projeto
- Após grandes refatorações
- Para alinhar entendimento da arquitetura

## Observações
- Não altera código; apenas lê e documenta
- Evite rodar com repositório sujo para não documentar lixo temporário
