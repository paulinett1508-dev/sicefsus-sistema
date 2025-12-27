# Gerenciador de Ambiente Firebase

## Comandos Disponíveis

### Verificar ambiente atual
Qual banco está configurado? (dev ou prod)

### Listar coleções
Mostre as coleções disponíveis no ambiente atual.

### Comparar ambientes
Compare estrutura de dados entre dev e prod:
- Mesmas coleções?
- Mesmos campos?
- Quantidade de documentos?

### Query segura
Execute query somente leitura no ambiente especificado.

## Regras de Segurança
- ⚠️ NUNCA escrever em prod sem confirmação explícita
- ⚠️ SEMPRE mostrar qual ambiente está ativo
- ⚠️ Queries em prod devem ter LIMIT

## Indicador Visual
- 🟢 DEV - pode modificar livremente
- 🔴 PROD - somente leitura, cuidado máximo