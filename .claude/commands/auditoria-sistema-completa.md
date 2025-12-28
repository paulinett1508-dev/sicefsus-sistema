# Auditoria do Sistema

Analise o projeto e gere um relatório com:

## 1. Estrutura
- Liste todos os arquivos em `src/`
- Identifique componentes órfãos (não utilizados)
- Verifique imports não utilizados

## 2. Consistência
- Verifique se todos os hooks seguem o padrão use*
- Confirme que validadores estão sendo usados nos forms
- Cheque se formatters estão sendo usados para valores monetários

## 3. Firebase
- Liste todas as coleções referenciadas
- Verifique queries sem tratamento de erro
- Identifique listeners sem cleanup

## 4. Segurança
- Busque console.log com dados sensíveis
- Verifique se .env está no .gitignore
- Cheque permissões nos componentes

Gere relatório em formato markdown.