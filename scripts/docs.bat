
@echo off
REM Script para gerar documentação do projeto (Windows)
REM Uso: scripts\docs.bat [opcoes]

setlocal enabledelayedexpansion

:: Configurar variáveis
set "SCRIPT_NAME=%~nx0"
set "FORCE=false"
set "VERBOSE=false"

:: Função de ajuda
if "%1"=="--help" goto :show_help
if "%1"=="-h" goto :show_help

:: Parse argumentos
:parse_args
if "%1"=="--force" (
    set "FORCE=true"
    shift
    goto :parse_args
)
if "%1"=="-f" (
    set "FORCE=true"
    shift
    goto :parse_args
)
if "%1"=="--verbose" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if "%1"=="-v" (
    set "VERBOSE=true"
    shift
    goto :parse_args
)
if not "%1"=="" (
    echo [91mErro: Argumento desconhecido: %1[0m
    goto :show_help
)

:: Cabeçalho
echo.
echo [96m📚 Gerador de Documentação do Sistema[0m
echo [96m=======================================[0m

:: Verificar se estamos no diretório correto
if not exist "package.json" (
    echo [91m❌ Erro: Execute este script a partir da raiz do projeto![0m
    echo [93m   Procurando: package.json[0m
    exit /b 1
)

if not exist "generate-full-docs.cjs" (
    echo [91m❌ Erro: Gerador não encontrado![0m
    echo [93m   Procurando: generate-full-docs.cjs[0m
    exit /b 1
)

:: Verificar Node.js
echo [94m🔍 Verificando pré-requisitos...[0m
node --version >nul 2>&1
if errorlevel 1 (
    echo [91m❌ Node.js não encontrado![0m
    exit /b 1
)

for /f "tokens=*" %%a in ('node --version') do set "NODE_VERSION=%%a"
echo [92m✅ Node.js !NODE_VERSION![0m

:: Mostrar estatísticas do projeto
echo.
echo [96m📊 Estatísticas do Projeto[0m
echo [96m=========================[0m

if exist "src" (
    for /f %%a in ('dir /s /b src\*.js src\*.jsx 2^>nul ^| find /c /v ""') do set "JS_FILES=%%a"
    for /f %%a in ('dir /s /b src\components\*.jsx 2^>nul ^| find /c /v ""') do set "COMPONENTS=%%a"
    for /f %%a in ('dir /s /b src\hooks\*.js 2^>nul ^| find /c /v ""') do set "HOOKS=%%a"
    
    echo 🟨 Arquivos JS/JSX: !JS_FILES!
    echo ⚛️ Componentes React: !COMPONENTS!
    echo 🪝 Hooks customizados: !HOOKS!
)

:: Mostrar versão atual se existir
if exist "doc-version.json" (
    echo [94m📝 Versão atual encontrada[0m
)

:: Gerar documentação
echo.
echo [96m🔄 Gerando documentação...[0m

:: Se force, remover arquivo de versão
if "%FORCE%"=="true" (
    if exist "doc-version.json" (
        del "doc-version.json"
        echo [93m🗑️ Arquivo de versão removido (modo --force)[0m
    )
)

:: Executar gerador
echo [94m📝 Executando gerador...[0m

if "%VERBOSE%"=="true" (
    node generate-full-docs.cjs
) else (
    node generate-full-docs.cjs >nul 2>&1
)

if errorlevel 1 (
    echo [91m❌ Erro ao gerar documentação![0m
    exit /b 1
)

:: Verificar se arquivo foi gerado
if exist "DOCUMENTACAO_COMPLETA.html" (
    echo.
    echo [92m✅ Documentação gerada com sucesso![0m
    echo [92m📄 Arquivo: DOCUMENTACAO_COMPLETA.html[0m
    
    echo.
    echo [96m💡 Como visualizar:[0m
    echo   1. Clique duas vezes no arquivo DOCUMENTACAO_COMPLETA.html
    echo   2. Ou arraste para o navegador
) else (
    echo [91m❌ Erro: Arquivo de documentação não foi gerado![0m
    exit /b 1
)

echo.
echo [92m🎉 Processo concluído com sucesso![0m
exit /b 0

:show_help
echo.
echo [96m📚 Gerador de Documentação - Sistema de Emendas[0m
echo [96m=============================================[0m
echo.
echo [1mUso:[0m
echo   %SCRIPT_NAME% [opções]
echo.
echo [1mOpções:[0m
echo   -f, --force    Força regeneração mesmo sem mudanças
echo   -h, --help     Mostra esta ajuda
echo   -v, --verbose  Modo verboso
echo.
echo [1mExemplos:[0m
echo   %SCRIPT_NAME%              # Gera docs se houver mudanças
echo   %SCRIPT_NAME% --force      # Força geração
echo   %SCRIPT_NAME% --verbose    # Modo detalhado
echo.
exit /b 0
