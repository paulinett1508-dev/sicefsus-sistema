# Skill: Auditoria Completa do Sistema

## Quando Usar
Esta skill é ativada para análises abrangentes do projeto, identificando problemas estruturais, código morto e inconsistências.

## Competência
Analisar o projeto de forma holística, identificando problemas de estrutura, consistência e manutenibilidade.

## Heurísticas de Análise

### 1. Estrutura de Arquivos
- Listar todos os arquivos em `src/`
- Identificar componentes órfãos (não importados em nenhum lugar)
- Buscar arquivos duplicados ou com nomes similares
- Verificar se estrutura de pastas faz sentido

### 2. Imports e Dependências
- Verificar imports não utilizados
- Identificar dependências circulares
- Buscar imports de paths absolutos vs relativos (consistência)
- Listar dependências do package.json não utilizadas

### 3. Consistência de Código
- Verificar se todos os hooks seguem padrão `use*`
- Confirmar que validadores estão sendo usados nos forms
- Checar se formatters estão sendo usados para valores monetários
- Verificar nomenclatura consistente (camelCase, PascalCase)

### 4. Código Morto
- Funções nunca chamadas
- Variáveis declaradas mas não usadas
- Componentes não renderizados
- CSS classes não aplicadas

### 5. Segurança
- Buscar console.log com dados sensíveis
- Verificar se `.env*` está no `.gitignore`
- Checar permissões nos componentes
- Identificar tokens ou secrets expostos

### 6. Firebase (overview)
- Listar todas as coleções referenciadas
- Verificar queries sem tratamento de erro
- Identificar listeners sem cleanup

## Processo de Análise
1. Mapear estrutura de arquivos
2. Construir grafo de dependências
3. Identificar nós isolados (código morto)
4. Verificar padrões de consistência
5. Scan de segurança
6. Gerar relatório priorizado

## Formato de Saída
Relatório em markdown com seções:
- **Resumo Executivo**: principais achados
- **Estrutura**: problemas organizacionais
- **Código Morto**: lista para remoção
- **Inconsistências**: padronizações necessárias
- **Segurança**: issues críticas
- **Recomendações**: ações priorizadas
