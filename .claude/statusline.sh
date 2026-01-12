#!/bin/bash

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

# Extrair valores numéricos do JSON
extract_num() {
  echo "$input" | grep -o "\"$1\":[0-9.]*" | head -1 | sed 's/.*://'
}

# Modelo
model_name=$(echo "$input" | grep -o '"display_name":"[^"]*"' | head -1 | sed 's/.*:"//' | tr -d '"')
[ -z "$model_name" ] && model_name="Opus 4.5"

# Tokens
input_tokens=$(extract_num "total_input_tokens")
output_tokens=$(extract_num "total_output_tokens")
context_size=$(extract_num "context_window_size")

[ -z "$input_tokens" ] && input_tokens="0"
[ -z "$output_tokens" ] && output_tokens="0"
[ -z "$context_size" ] && context_size="200000"

total_tokens=$((input_tokens + output_tokens))

# Calcular porcentagem de memória
if [ "$total_tokens" -gt 0 ] 2>/dev/null; then
  mem_percent=$((total_tokens * 100 / context_size))
  tokens_k=$((total_tokens / 1000))
  context_k=$((context_size / 1000))
  tokens_display="${tokens_k}k/${context_k}k"
else
  mem_percent="0"
  tokens_display="0k/200k"
fi

# Cor da memória + alerta /compact
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
