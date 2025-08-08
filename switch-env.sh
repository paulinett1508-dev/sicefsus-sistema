#!/bin/bash
# Script de Gestão de Ambientes SICEFSUS
# Uso: ./switch-env.sh [dev|prod|check]

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar ambiente atual
check_current_env() {
    if [ ! -f .env ]; then
        echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
        return 1
    fi

    if grep -q "emendas-parlamentares-60dbd" .env; then
        echo -e "${YELLOW}🔧 Ambiente atual: DESENVOLVIMENTO (Testes)${NC}"
        echo -e "   📊 Banco: emendas-parlamentares-60dbd"
    elif grep -q "emendas-parlamentares-prod" .env; then
        echo -e "${RED}🚀 Ambiente atual: PRODUÇÃO${NC}"
        echo -e "   📊 Banco: emendas-parlamentares-prod"
    else
        echo -e "${RED}⚠️  Ambiente não identificado${NC}"
    fi
}

# Função para trocar para desenvolvimento
switch_to_dev() {
    echo -e "${YELLOW}🔧 Mudando para ambiente de DESENVOLVIMENTO...${NC}"

    if [ ! -f .env.development ]; then
        echo -e "${RED}❌ Arquivo .env.development não encontrado!${NC}"
        exit 1
    fi

    # Backup do .env atual
    if [ -f .env ]; then
        cp .env .env.backup
    fi

    # Trocar
    cp .env.development .env

    echo -e "${GREEN}✅ Ambiente de desenvolvimento ativado!${NC}"
    echo -e "${BLUE}📊 Conectado ao banco: emendas-parlamentares-60dbd${NC}"
    echo -e "${YELLOW}⚠️  Este é o ambiente de TESTES${NC}"
}

# Função para trocar para produção
switch_to_prod() {
    echo -e "${RED}🚀 Mudando para ambiente de PRODUÇÃO...${NC}"

    if [ ! -f .env.production ]; then
        echo -e "${RED}❌ Arquivo .env.production não encontrado!${NC}"
        exit 1
    fi

    # Confirmação de segurança
    echo -e "${RED}⚠️  ATENÇÃO: Você está prestes a conectar ao banco de PRODUÇÃO!${NC}"
    read -p "Tem certeza? Digite 'sim' para confirmar: " confirm

    if [ "$confirm" != "sim" ]; then
        echo -e "${YELLOW}Operação cancelada.${NC}"
        exit 0
    fi

    # Backup do .env atual
    if [ -f .env ]; then
        cp .env .env.backup
    fi

    # Trocar
    cp .env.production .env

    echo -e "${GREEN}✅ Ambiente de produção ativado!${NC}"
    echo -e "${RED}📊 Conectado ao banco: emendas-parlamentares-prod${NC}"
    echo -e "${RED}🔴 CUIDADO: Alterações afetarão dados reais!${NC}"
}

# Função para mostrar status
show_status() {
    echo -e "${BLUE}=== Status dos Ambientes SICEFSUS ===${NC}"
    echo ""

    check_current_env
    echo ""

    echo -e "${BLUE}📁 Arquivos de configuração:${NC}"

    if [ -f .env.development ]; then
        echo -e "${GREEN}✅ .env.development${NC} (Testes)"
    else
        echo -e "${RED}❌ .env.development não encontrado${NC}"
    fi

    if [ -f .env.production ]; then
        echo -e "${GREEN}✅ .env.production${NC} (Produção)"
    else
        echo -e "${RED}❌ .env.production não encontrado${NC}"
    fi

    if [ -f .env.backup ]; then
        echo -e "${YELLOW}📦 .env.backup${NC} (Último backup)"
    fi
}

# Menu principal
case "$1" in
    "dev")
        switch_to_dev
        ;;
    "prod")
        switch_to_prod
        ;;
    "check")
        check_current_env
        ;;
    "status")
        show_status
        ;;
    *)
        echo -e "${GREEN}SICEFSUS - Gestão de Ambientes${NC}"
        echo ""
        echo "Comandos disponíveis:"
        echo -e "  ${YELLOW}./switch-env.sh dev${NC}     - Mudar para desenvolvimento (testes)"
        echo -e "  ${RED}./switch-env.sh prod${NC}    - Mudar para produção"
        echo -e "  ${BLUE}./switch-env.sh check${NC}   - Verificar ambiente atual"
        echo -e "  ${BLUE}./switch-env.sh status${NC}  - Ver status completo"
        echo ""
        echo "Ambiente atual:"
        check_current_env
        ;;
esac