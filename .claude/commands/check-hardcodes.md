# Verificação de Hardcodes

Busque por valores hardcoded que deveriam ser configuráveis:

## 1. URLs e Endpoints
- URLs de API hardcoded (deve vir de .env)
- URLs do Firebase hardcoded
- Links externos fixos

## 2. Credenciais e IDs
- API keys no código
- IDs de projeto Firebase
- Tokens ou secrets

## 3. Valores de Negócio
- Percentuais fixos (taxas, limites)
- Valores monetários fixos
- Datas fixas
- Limites de quantidade

## 4. Textos
- Mensagens de erro hardcoded (deveria ser constants)
- Labels repetidos em vários lugares
- Nomes de município/UF fixos

## 5. Configurações
- Timeouts fixos
- Tamanhos de paginação
- Limites de upload

## Buscar padrões:
```javascript
// URLs
/(https?:\/\/[^\s"']+)/g

// IDs Firebase
/[a-zA-Z0-9-]+\.firebaseapp\.com/g
/[a-zA-Z0-9-]+\.firebasestorage\.app/g

// Valores monetários
/R\$\s*[\d.,]+/g

// Percentuais
/\d+(\.\d+)?%/g
```

## Resultado
Para cada hardcode encontrado:
- 📍 Arquivo:linha
- 🔴 Valor hardcoded
- 💡 Sugestão (variável de ambiente, constante, config)