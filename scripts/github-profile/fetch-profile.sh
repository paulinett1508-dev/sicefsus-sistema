#!/usr/bin/env bash
# fetch-profile.sh — Busca perfil público de um usuário no GitHub via API
# Uso: ./fetch-profile.sh <username>

set -euo pipefail

USERNAME="${1:-}"

if [[ -z "$USERNAME" ]]; then
  echo "Uso: $0 <github-username>" >&2
  exit 1
fi

API_URL="https://api.github.com/users/${USERNAME}"

# Usa GITHUB_TOKEN se disponível para evitar rate-limit
AUTH_HEADER=""
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_HEADER="-H \"Authorization: Bearer ${GITHUB_TOKEN}\""
fi

RESPONSE=$(curl -sf \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  ${GITHUB_TOKEN:+-H "Authorization: Bearer ${GITHUB_TOKEN}"} \
  "$API_URL") || {
  echo "Erro: usuário '${USERNAME}' não encontrado ou falha na requisição." >&2
  exit 1
}

# Extrai campos relevantes com jq se disponível, senão imprime JSON bruto
if command -v jq &>/dev/null; then
  echo "$RESPONSE" | jq '{
    login:       .login,
    name:        .name,
    bio:         .bio,
    company:     .company,
    location:    .location,
    blog:        .blog,
    email:       .email,
    public_repos:.public_repos,
    followers:   .followers,
    following:   .following,
    created_at:  .created_at,
    html_url:    .html_url
  }'
else
  echo "$RESPONSE"
fi
