#!/bin/bash

# Script de Verificação da Configuração do MCP Firebase Server
# =============================================================

echo "🔍 Verificando configuração do Firebase MCP Server..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Função para verificar
check() {
    local name="$1"
    local command="$2"
    
    echo -n "Verificando: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
        ((SUCCESS++))
        return 0
    else
        echo -e "${RED}✗ FALHOU${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Função para aviso
warn() {
    echo -e "${YELLOW}⚠ AVISO: $1${NC}"
    ((WARNINGS++))
}

# Função para info
info() {
    echo -e "${BLUE}ℹ INFO: $1${NC}"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. VERIFICANDO ESTRUTURA DE ARQUIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Pasta firebase-mcp-server existe" "[ -d '/home/runner/workspace/firebase-mcp-server' ]"
check "package.json existe" "[ -f '/home/runner/workspace/firebase-mcp-server/package.json' ]"
check "src/index.ts existe" "[ -f '/home/runner/workspace/firebase-mcp-server/src/index.ts' ]"
check "tsconfig.json existe" "[ -f '/home/runner/workspace/firebase-mcp-server/tsconfig.json' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. VERIFICANDO BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if check "Pasta dist/ existe" "[ -d '/home/runner/workspace/firebase-mcp-server/dist' ]"; then
    check "dist/index.js existe" "[ -f '/home/runner/workspace/firebase-mcp-server/dist/index.js' ]"
    
    if [ -f '/home/runner/workspace/firebase-mcp-server/dist/index.js' ]; then
        SIZE=$(stat -f%z "/home/runner/workspace/firebase-mcp-server/dist/index.js" 2>/dev/null || stat -c%s "/home/runner/workspace/firebase-mcp-server/dist/index.js" 2>/dev/null)
        info "Tamanho do dist/index.js: $SIZE bytes"
        
        if [ "$SIZE" -lt 100 ]; then
            warn "Arquivo dist/index.js muito pequeno. Execute 'npm run build'"
        fi
    fi
else
    warn "Pasta dist/ não encontrada. Execute 'npm run build'"
fi

check "node_modules/ existe" "[ -d '/home/runner/workspace/firebase-mcp-server/node_modules' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. VERIFICANDO CREDENCIAIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if check ".env existe" "[ -f '/home/runner/workspace/firebase-mcp-server/.env' ]"; then
    # Verificar se tem conteúdo
    if grep -q "FIREBASE_DEV_PROJECT_ID=" "/home/runner/workspace/firebase-mcp-server/.env" 2>/dev/null; then
        
        # Verificar cada variável DEV
        if grep -q "^FIREBASE_DEV_PROJECT_ID=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_DEV_PROJECT_ID configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${RED}✗ FIREBASE_DEV_PROJECT_ID vazio ou não configurado${NC}"
            ((ERRORS++))
        fi
        
        if grep -q "^FIREBASE_DEV_CLIENT_EMAIL=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_DEV_CLIENT_EMAIL configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${RED}✗ FIREBASE_DEV_CLIENT_EMAIL vazio ou não configurado${NC}"
            ((ERRORS++))
        fi
        
        if grep -q "^FIREBASE_DEV_PRIVATE_KEY=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_DEV_PRIVATE_KEY configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${RED}✗ FIREBASE_DEV_PRIVATE_KEY vazio ou não configurado${NC}"
            ((ERRORS++))
        fi
        
        # Verificar cada variável PROD
        if grep -q "^FIREBASE_PROD_PROJECT_ID=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_PROD_PROJECT_ID configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠ FIREBASE_PROD_PROJECT_ID vazio (opcional)${NC}"
            ((WARNINGS++))
        fi
        
        if grep -q "^FIREBASE_PROD_CLIENT_EMAIL=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_PROD_CLIENT_EMAIL configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠ FIREBASE_PROD_CLIENT_EMAIL vazio (opcional)${NC}"
            ((WARNINGS++))
        fi
        
        if grep -q "^FIREBASE_PROD_PRIVATE_KEY=.\+$" "/home/runner/workspace/firebase-mcp-server/.env"; then
            echo -e "${GREEN}✓ FIREBASE_PROD_PRIVATE_KEY configurado${NC}"
            ((SUCCESS++))
        else
            echo -e "${YELLOW}⚠ FIREBASE_PROD_PRIVATE_KEY vazio (opcional)${NC}"
            ((WARNINGS++))
        fi
        
    else
        warn ".env existe mas parece estar vazio. Consulte CONFIGURAR_ENV.md"
    fi
else
    warn ".env não encontrado. Execute: cp .env.example .env"
fi

check ".env.example existe" "[ -f '/home/runner/workspace/firebase-mcp-server/.env.example' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. VERIFICANDO CONFIGURAÇÃO DO CLAUDE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar workspace config
if check ".claude/settings.json existe" "[ -f '/home/runner/workspace/.claude/settings.json' ]"; then
    if grep -q "mcpServers" "/home/runner/workspace/.claude/settings.json"; then
        echo -e "${GREEN}✓ mcpServers configurado em .claude/settings.json${NC}"
        ((SUCCESS++))
        
        if grep -q "firebase-mcp-server" "/home/runner/workspace/.claude/settings.json"; then
            echo -e "${GREEN}✓ Servidor firebase configurado${NC}"
            ((SUCCESS++))
        else
            warn "mcpServers existe mas não tem configuração 'firebase'"
        fi
    else
        warn "mcpServers não encontrado em .claude/settings.json"
    fi
fi

# Verificar global config
if [ -f "$HOME/.claude.json" ]; then
    echo -e "${BLUE}ℹ ~/.claude.json existe (configuração global)${NC}"
    
    if grep -q "mcpServers" "$HOME/.claude.json"; then
        info "mcpServers encontrado em ~/.claude.json"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. VERIFICANDO DEPENDÊNCIAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "Node.js instalado" "command -v node"
check "NPM instalado" "command -v npm"

if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    info "Versão do Node.js: $NODE_VERSION"
fi

if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    info "Versão do NPM: $NPM_VERSION"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. VERIFICANDO DOCUMENTAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check "CONFIGURAR_ENV.md existe" "[ -f '/home/runner/workspace/firebase-mcp-server/CONFIGURAR_ENV.md' ]"
check "CONFIGURAR_CLAUDE.md existe" "[ -f '/home/runner/workspace/firebase-mcp-server/CONFIGURAR_CLAUDE.md' ]"
check "README.md existe" "[ -f '/home/runner/workspace/firebase-mcp-server/README.md' ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${GREEN}✓ Sucessos: $SUCCESS${NC}"
echo -e "${YELLOW}⚠ Avisos: $WARNINGS${NC}"
echo -e "${RED}✗ Erros: $ERRORS${NC}"

echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 CONFIGURAÇÃO COMPLETA E VÁLIDA!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Próximos passos:"
    echo "1. Reinicie o Claude Code"
    echo "2. Teste: 'Verifique o status do Firebase'"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  CONFIGURAÇÃO OK, MAS COM AVISOS${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Revise os avisos acima."
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ CONFIGURAÇÃO INCOMPLETA${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Corrija os erros acima antes de continuar."
    echo ""
    echo "Consulte:"
    echo "  - CONFIGURAR_ENV.md (para credenciais)"
    echo "  - CONFIGURAR_CLAUDE.md (para configuração do MCP)"
    exit 1
fi

