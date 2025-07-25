
#!/bin/bash

# Script para gerar documentação do projeto
# Uso: ./scripts/docs.sh [opcoes]

set -e  # Parar em caso de erro

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Função para logging colorido
log() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Função de ajuda
show_help() {
    log $CYAN "\n📚 Gerador de Documentação - Sistema de Emendas"
    log $CYAN "=================================================="
    echo ""
    log $BOLD "Uso:"
    echo "  ./scripts/docs.sh [opções]"
    echo ""
    log $BOLD "Opções:"
    echo "  -f, --force    Força regeneração mesmo sem mudanças"
    echo "  -h, --help     Mostra esta ajuda"
    echo "  -v, --verbose  Modo verboso"
    echo ""
    log $BOLD "Exemplos:"
    echo "  ./scripts/docs.sh              # Gera docs se houver mudanças"
    echo "  ./scripts/docs.sh --force      # Força geração"
    echo "  ./scripts/docs.sh --verbose    # Modo detalhado"
    echo ""
}

# Verificar se estamos no diretório correto
check_directory() {
    if [[ ! -f "package.json" ]] || [[ ! -f "generate-full-docs.cjs" ]]; then
        log $RED "❌ Erro: Execute este script a partir da raiz do projeto!"
        log $YELLOW "   Procurando: package.json e generate-full-docs.cjs"
        exit 1
    fi
}

# Verificar pré-requisitos
check_prerequisites() {
    log $BLUE "🔍 Verificando pré-requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log $RED "❌ Node.js não encontrado!"
        exit 1
    fi
    
    local node_version=$(node --version)
    log $GREEN "✅ Node.js $node_version"
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        log $RED "❌ npm não encontrado!"
        exit 1
    fi
    
    local npm_version=$(npm --version)
    log $GREEN "✅ npm $npm_version"
    
    # Verificar arquivo gerador
    if [[ ! -f "generate-full-docs.cjs" ]]; then
        log $RED "❌ Gerador de documentação não encontrado!"
        exit 1
    fi
    
    log $GREEN "✅ Gerador de documentação encontrado"
}

# Mostrar estatísticas do projeto
show_project_stats() {
    log $CYAN "\n📊 Estatísticas do Projeto"
    log $CYAN "============================="
    
    if [[ -d "src" ]]; then
        local total_files=$(find src -type f | wc -l)
        local js_files=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
        local components=$(find src/components -name "*.jsx" 2>/dev/null | wc -l)
        local hooks=$(find src/hooks -name "*.js" 2>/dev/null | wc -l)
        
        echo "📁 Total de arquivos: $total_files"
        echo "🟨 Arquivos JS/JSX: $js_files"
        echo "⚛️ Componentes React: $components"
        echo "🪝 Hooks customizados: $hooks"
    fi
    
    # Mostrar versão atual se existir
    if [[ -f "doc-version.json" ]]; then
        local version=$(grep '"version"' doc-version.json | cut -d'"' -f4)
        local timestamp=$(grep '"timestamp"' doc-version.json | cut -d'"' -f4)
        log $BLUE "📝 Última versão: $version"
        log $BLUE "🕒 Gerada em: $timestamp"
    fi
}

# Gerar documentação
generate_docs() {
    local force=$1
    local verbose=$2
    
    log $CYAN "\n🔄 Gerando documentação..."
    
    # Se force, remover arquivo de versão
    if [[ "$force" == "true" ]] && [[ -f "doc-version.json" ]]; then
        rm -f doc-version.json
        log $YELLOW "🗑️ Arquivo de versão removido (modo --force)"
    fi
    
    # Executar gerador
    local start_time=$(date +%s)
    
    if [[ "$verbose" == "true" ]]; then
        log $BLUE "📝 Executando gerador (modo verboso)..."
        node generate-full-docs.cjs
    else
        log $BLUE "📝 Executando gerador..."
        node generate-full-docs.cjs > /dev/null 2>&1
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Verificar se arquivo foi gerado
    if [[ -f "DOCUMENTACAO_COMPLETA.html" ]]; then
        local file_size=$(du -h DOCUMENTACAO_COMPLETA.html | cut -f1)
        log $GREEN "\n✅ Documentação gerada com sucesso!"
        log $GREEN "📄 Arquivo: DOCUMENTACAO_COMPLETA.html ($file_size)"
        log $GREEN "⏱️ Tempo: ${duration}s"
        
        # Mostrar instruções
        log $CYAN "\n💡 Como visualizar:"
        echo "  1. Abra o arquivo DOCUMENTACAO_COMPLETA.html no navegador"
        echo "  2. Ou use: open DOCUMENTACAO_COMPLETA.html (macOS)"
        echo "  3. Ou use: xdg-open DOCUMENTACAO_COMPLETA.html (Linux)"
    else
        log $RED "❌ Erro: Arquivo de documentação não foi gerado!"
        exit 1
    fi
}

# Função principal
main() {
    # Parse argumentos
    local force=false
    local verbose=false
    
    for arg in "$@"; do
        case $arg in
            -f|--force)
                force=true
                shift
                ;;
            -v|--verbose)
                verbose=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log $RED "❌ Argumento desconhecido: $arg"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Cabeçalho
    log $BOLD "\n📚 Gerador de Documentação do Sistema"
    log $CYAN "============================================="
    
    # Verificações
    check_directory
    check_prerequisites
    show_project_stats
    
    # Gerar documentação
    generate_docs $force $verbose
    
    log $GREEN "\n🎉 Processo concluído com sucesso!"
}

# Executar script
main "$@"
