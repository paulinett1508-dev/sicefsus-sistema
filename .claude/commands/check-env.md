# Verificação de Ambientes (Dev/Prod)

Analise a configuração de ambientes Firebase:

## 1. Arquivos de Ambiente
- Liste variáveis em .env.development
- Liste variáveis em .env.production
- Compare diferenças entre eles

## 2. Uso no Código
- Como o código diferencia dev de prod?
- Existe flag VITE_APP_ENV ou similar?
- Logs de debug são desabilitados em prod?

## 3. Firebase Config
- firebaseConfig usa variáveis de ambiente?
- Há risco de conectar em prod durante dev?

## 4. Segurança
- .env* estão no .gitignore?
- Há valores sensíveis commitados?

## 5. Consistência
- Mesmas variáveis em dev e prod?
- Valores de exemplo em .env.example?

Gere checklist de segurança de ambientes.