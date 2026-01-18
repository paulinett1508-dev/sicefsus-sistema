#!/bin/bash

# Statusline para Claude Code
#
# LIMITAÇÃO CONHECIDA (Issue #13783, #5601):
# O Claude Code passa tokens CUMULATIVOS no JSON, não o uso atual do contexto.
# Isso significa que após um /compact, os valores não resetam.
# Este script tenta mitigar usando current_usage se disponível e
# ajustando o limite para 80% (quando auto-compact dispara).
#
# Se a porcentagem parecer incorreta comparada ao "Context left until auto-compact",
# é devido a esta limitação da API do Claude Code.

# Lê o JSON de entrada do Claude Code
input=$(cat 2>/dev/null || echo "{}")

# Cores ANSI
RESET="\033[0m"
DIM="\033[2m"
CYAN="\033[36m"
MAGENTA="\033[35m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RED="\033[31m"
WHITE="\033[97m"
BOLD="\033[1m"
BLINK="\033[5m"

# Extrair valores numéricos do JSON (suporta nested objects)
extract_num() {
  echo "$input" | grep -o "\"$1\":[0-9.]*" | head -1 | sed 's/.*://'
}

# Extrair valor de objeto nested (ex: context_window.current_usage)
extract_nested() {
  echo "$input" | grep -o "\"$1\":{[^}]*}" | grep -o "\"$2\":[0-9.]*" | head -1 | sed 's/.*://'
}

# Modelo
model_name=$(echo "$input" | grep -o '"display_name":"[^"]*"' | head -1 | sed 's/.*:"//' | tr -d '"')
[ -z "$model_name" ] && model_name="Opus 4.5"

# Tentar obter uso atual do contexto (campo mais preciso se disponível)
current_usage=$(extract_nested "context_window" "current_usage")
context_size=$(extract_nested "context_window" "context_window_size")

# Fallback para campos antigos se não encontrar nested
if [ -z "$current_usage" ]; then
  current_usage=$(extract_num "current_usage")
fi
if [ -z "$context_size" ]; then
  context_size=$(extract_num "context_window_size")
fi

# Se ainda não tiver current_usage, usar tokens cumulativos (menos preciso)
if [ -z "$current_usage" ] || [ "$current_usage" = "0" ]; then
  input_tokens=$(extract_num "total_input_tokens")
  output_tokens=$(extract_num "total_output_tokens")
  [ -z "$input_tokens" ] && input_tokens="0"
  [ -z "$output_tokens" ] && output_tokens="0"
  # NOTA: Isso é impreciso - tokens cumulativos não refletem contexto atual
  current_usage=$((input_tokens + output_tokens))
fi

[ -z "$context_size" ] && context_size="200000"

# Auto-compact dispara em ~80% do contexto (160k de 200k)
# Ajustar o limite efetivo para refletir isso
effective_limit=$((context_size * 80 / 100))

# Calcular porcentagem de memória em relação ao limite de auto-compact
if [ "$current_usage" -gt 0 ] 2>/dev/null; then
  # Porcentagem em relação ao limite de auto-compact (80%)
  mem_percent=$((current_usage * 100 / effective_limit))
  # Cap em 100% para não mostrar >100%
  [ "$mem_percent" -gt 100 ] && mem_percent=100

  tokens_k=$((current_usage / 1000))
  effective_k=$((effective_limit / 1000))
  tokens_display="${tokens_k}k/${effective_k}k"
else
  mem_percent="0"
  tokens_display="0k/160k"
fi

# Cor da memória + alerta /compact (baseado no limite de 80%)
if [ "$mem_percent" -lt 50 ] 2>/dev/null; then
  MEM_COLOR=$GREEN
  COMPACT_ALERT=""
elif [ "$mem_percent" -lt 75 ] 2>/dev/null; then
  MEM_COLOR=$YELLOW
  COMPACT_ALERT="${YELLOW}!${RESET}"
else
  MEM_COLOR=$RED
  COMPACT_ALERT="${RED}${BOLD}/compact${RESET}"
fi

# Tempo de sessão (converter ms para formato legível)
duration_ms=$(extract_num "total_duration_ms")
[ -z "$duration_ms" ] && duration_ms="0"

if [ "$duration_ms" -gt 0 ] 2>/dev/null; then
  duration_sec=$((duration_ms / 1000))
  duration_min=$((duration_sec / 60))
  duration_hr=$((duration_min / 60))
  
  if [ "$duration_hr" -gt 0 ]; then
    remaining_min=$((duration_min % 60))
    time_display="${duration_hr}h${remaining_min}m"
  elif [ "$duration_min" -gt 0 ]; then
    time_display="${duration_min}m"
  else
    time_display="${duration_sec}s"
  fi
else
  time_display="0m"
fi

# Cor do tempo (alerta se muito longo)
if [ "$duration_min" -lt 30 ] 2>/dev/null; then
  TIME_COLOR=$GREEN
elif [ "$duration_min" -lt 60 ] 2>/dev/null; then
  TIME_COLOR=$YELLOW
else
  TIME_COLOR=$RED
fi

# Arquivos modificados (linhas adicionadas/removidas)
lines_added=$(extract_num "total_lines_added")
lines_removed=$(extract_num "total_lines_removed")
[ -z "$lines_added" ] && lines_added="0"
[ -z "$lines_removed" ] && lines_removed="0"

files_display="+${lines_added}/-${lines_removed}"

# Diretório e branch
workspace_dir="/home/runner/workspace"
project_name=$(basename "$workspace_dir")
git_branch=$(cd "$workspace_dir" 2>/dev/null && git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")

# Ambiente Firebase
firebase_env="DEV"
if [ -f "$workspace_dir/.env" ]; then
  if grep -q "emendas-parlamentares-prod" "$workspace_dir/.env" 2>/dev/null; then
    firebase_env="PROD"
  fi
fi
[ "$firebase_env" = "PROD" ] && FB_COLOR=$RED || FB_COLOR=$YELLOW

# Output
printf "${DIM}[${RESET}"
printf "${MAGENTA}${BOLD}${model_name}${RESET}"
printf "${DIM} | ${RESET}"
printf "${MEM_COLOR}${mem_percent}%%${RESET}"
[ -n "$COMPACT_ALERT" ] && printf " ${COMPACT_ALERT}"
printf "${DIM} | ${RESET}"
printf "${CYAN}${tokens_display}${RESET}"
printf "${DIM} | ${RESET}"
printf "${TIME_COLOR}${time_display}${RESET}"
printf "${DIM} | ${RESET}"
printf "${WHITE}${files_display}${RESET}"
printf "${DIM} | ${RESET}"
printf "${BLUE}${project_name}${RESET}"
printf "${DIM}/${RESET}"
printf "${GREEN}${git_branch}${RESET}"
printf "${DIM} | ${RESET}"
printf "${FB_COLOR}${firebase_env}${RESET}"
printf "${DIM}]${RESET}"
