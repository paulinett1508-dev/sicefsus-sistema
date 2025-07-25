
# 📚 Como Gerar a Documentação do Projeto

Este documento explica como usar os scripts para regenerar a documentação completa do sistema.

## 🚀 Métodos Disponíveis

### 1. Script Node.js (Recomendado)
```bash
# Gerar documentação (só se houver mudanças)
node gerar-docs.js

# Forçar geração mesmo sem mudanças
node gerar-docs.js --force

# Ver ajuda
node gerar-docs.js --help
```

### 2. Script Shell (Linux/macOS)
```bash
# Tornar executável (primeira vez)
chmod +x scripts/docs.sh

# Gerar documentação
./scripts/docs.sh

# Forçar geração
./scripts/docs.sh --force

# Modo verboso
./scripts/docs.sh --verbose
```

### 3. Script Windows
```cmd
# Gerar documentação
scripts\docs.bat

# Forçar geração
scripts\docs.bat --force

# Modo verboso
scripts\docs.bat --verbose
```

### 4. Comando Direto
```bash
# Usar o gerador original diretamente
node generate-full-docs.cjs
```

## 📁 Arquivos Gerados

- `DOCUMENTACAO_COMPLETA.html` - Documentação principal
- `doc-version.json` - Controle de versão e cache

## 🔧 Quando Usar Cada Método

### Geração Automática (Padrão)
- Analisa se houve mudanças no projeto
- Só regenera se necessário
- Mais rápido para uso cotidiano

```bash
node gerar-docs.js
```

### Geração Forçada
- Ignora cache de versão
- Sempre regenera tudo
- Use quando suspeitar de problemas

```bash
node gerar-docs.js --force
```

### Modo Verboso
- Mostra todo o processo detalhadamente
- Útil para debugar problemas
- Mostra estatísticas completas

```bash
./scripts/docs.sh --verbose
```

## 🐛 Solução de Problemas

### Erro: "Arquivo gerador não encontrado"
```bash
# Verificar se está na raiz do projeto
ls -la generate-full-docs.cjs

# Se não existir, usar o script original existe
ls -la *.cjs
```

### Erro: "Node.js não encontrado"
```bash
# Verificar instalação do Node.js
node --version
npm --version
```

### Documentação não abre no navegador
1. Localizar o arquivo `DOCUMENTACAO_COMPLETA.html`
2. Clicar duas vezes ou arrastar para o navegador
3. Ou usar comando: `open DOCUMENTACAO_COMPLETA.html` (macOS)

### Cache de versão corrompido
```bash
# Remover cache e forçar regeneração
rm doc-version.json
node gerar-docs.js
```

## 📊 O que é Analisado

A documentação inclui análise completa de:

- **Arquivos JavaScript/JSX**: Funções, classes, imports
- **Componentes React**: Props, hooks, dependências
- **Hooks customizados**: Parâmetros, retorno, uso
- **Rotas**: Endpoints, middlewares, métodos HTTP
- **Configurações**: package.json, .replit, etc.
- **Estrutura**: Organização de pastas e arquivos

## 🔄 Automação

### Integrar no Workflow de Desenvolvimento
Adicione ao `package.json`:

```json
{
  "scripts": {
    "docs": "node gerar-docs.js",
    "docs:force": "node gerar-docs.js --force"
  }
}
```

Então use:
```bash
npm run docs
npm run docs:force
```

### Git Hooks (Opcional)
Para regenerar automaticamente antes de commits:

```bash
# .git/hooks/pre-commit
#!/bin/sh
node gerar-docs.js --force
git add DOCUMENTACAO_COMPLETA.html
```

## 💡 Dicas

1. **Performance**: Use geração normal no dia a dia, force apenas quando necessário
2. **Controle**: O arquivo `doc-version.json` evita regenerações desnecessárias
3. **Backup**: A documentação HTML é autocontida e pode ser arquivada
4. **Compartilhamento**: O arquivo HTML pode ser enviado ou hospedado facilmente

## 🎯 Casos de Uso

### Desenvolvimento Diário
```bash
# Verificar se precisa atualizar docs
node gerar-docs.js
```

### Antes de Deploy/Release
```bash
# Garantir documentação atualizada
node gerar-docs.js --force
```

### Debug de Problemas
```bash
# Ver processo completo
./scripts/docs.sh --verbose
```

### Apresentação/Reunião
```bash
# Gerar versão fresca
node gerar-docs.js --force
# Abrir no navegador
open DOCUMENTACAO_COMPLETA.html
```
