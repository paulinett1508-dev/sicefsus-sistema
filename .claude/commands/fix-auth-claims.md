# Corrigir Custom Claims (Firebase Admin)

Atualiza `custom claims` dos usuários no Firebase Auth com base na coleção `usuarios`.

## ATENÇÃO
- ⚠️ Usa credenciais de produção em `firebase-migration/prod-credentials.json`
- ⚠️ Rodar somente com autorização e em janela de manutenção
- ⚠️ Pede que usuários façam logout/login após execução

## Executar
```bash
node scripts/fix-auth-claims.cjs
```

## O que faz
- Lê `usuarios` no Firestore
- Define claims: `tipo`, `municipio`, `uf`, `status`
- Loga sucesso/erros por usuário

## Resultado
- ✅ Claims atualizados
- ❌ Logs de erros para investigar

## Pós-execução
- Solicitar `logout/login` para todos os usuários
- Validar permissões em `usePermissions`
