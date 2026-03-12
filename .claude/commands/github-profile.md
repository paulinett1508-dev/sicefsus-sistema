# GitHub Profile

Busca e exibe o perfil público de um usuário no GitHub via API REST.

## Uso

```bash
bash scripts/github-profile/fetch-profile.sh <github-username>
```

## Exemplos

```bash
# Perfil de um usuário qualquer
bash scripts/github-profile/fetch-profile.sh torvalds

# Com token para evitar rate-limit (60 req/h sem token, 5000 com token)
GITHUB_TOKEN=ghp_xxx bash scripts/github-profile/fetch-profile.sh torvalds
```

## O que exibe

| Campo | Descrição |
|-------|-----------|
| `login` | Username do GitHub |
| `name` | Nome público |
| `bio` | Biografia |
| `company` | Empresa |
| `location` | Localização |
| `blog` | Site/blog |
| `email` | E-mail público |
| `public_repos` | Repositórios públicos |
| `followers` | Seguidores |
| `following` | Seguindo |
| `created_at` | Data de criação da conta |
| `html_url` | URL do perfil |

## Dependências

- `curl` — obrigatório
- `jq` — opcional (se ausente, imprime JSON bruto)
- `GITHUB_TOKEN` — opcional (evita rate-limit de 60 req/h)

## Erros comuns

- **Usuário não encontrado:** verifique o username (case-insensitive, mas sem espaços)
- **Rate limit atingido:** defina `GITHUB_TOKEN` com um token pessoal válido
