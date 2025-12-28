# SICEFSUS

Sistema de Gestão de Emendas Parlamentares e Despesas de Saúde.

## Início Rápido

```bash
npm install
npm run dev
```

## Documentação

- **[CLAUDE.md](CLAUDE.md)** - Documentação técnica completa do projeto
- **[.claude/docs/DESIGN_SYSTEM.md](.claude/docs/DESIGN_SYSTEM.md)** - Design system e padrões visuais
- **[.claude/docs/GUIA_INICIANTE.md](.claude/docs/GUIA_INICIANTE.md)** - Guia para novos desenvolvedores
- **[.claude/docs/RESUMO_SISTEMA.md](.claude/docs/RESUMO_SISTEMA.md)** - Resumo executivo do sistema

## Stack Tecnológica

- **Frontend:** React 18 + Vite
- **Backend:** Firebase (Firestore + Auth)
- **Estilo:** CSS Modules + Tailwind colors
- **Tipografia:** Inter font
- **Ícones:** Material Symbols Outlined

## Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── emenda/         # Gestão de emendas
│   ├── despesa/        # Gestão de despesas
│   ├── admin/          # Painel administrativo
│   └── DashboardComponents/  # Widgets do dashboard
├── hooks/              # Custom hooks
├── services/           # Serviços (Firebase, API)
├── utils/              # Utilitários (formatters, validators)
├── context/            # Contextos React
└── config/             # Configurações e constantes
```

## Tipos de Usuário

| Tipo | Acesso | Permissões |
|------|--------|------------|
| **Admin** | Total | Gerencia tudo |
| **Gestor** | Município/UF | Gerencia emendas do seu município |
| **Operador** | Município/UF | Visualiza e executa despesas |

## Ambientes

- **DEV:** Desenvolvimento local
- **PROD:** Produção (Firebase)

Variáveis de ambiente em `.env.development` e `.env.production`

## Comandos Claude Úteis

Execute na raiz do projeto:

- `@mapear-arquitetura-completa.md` - Mapeia toda estrutura do código
- `@auditoria-sistema-completa.md` - Auditoria completa
- `@detector-bugs-async-react.md` - Detecta bugs potenciais
- `@revisar-codigo-qualidade.md` - Code review

Ver todos os comandos em [.claude/commands/](.claude/commands/)

## Regras de Desenvolvimento

### SEMPRE
- Validar dados com `src/utils/validators.js`
- Usar `src/utils/formatters.js` para valores monetários
- Testar como Admin E como Operador
- Preservar código funcional - mudanças cirúrgicas

### NUNCA
- Reescrever código funcional sem necessidade
- Misturar strings e números em cálculos monetários
- Salvar dados sem validação prévia
- Commitar arquivos `.env`

## Suporte

Para dúvidas ou problemas, consulte:
1. [CLAUDE.md](CLAUDE.md) - Documentação completa
2. [.claude/docs/GUIA_INICIANTE.md](.claude/docs/GUIA_INICIANTE.md) - Guia detalhado
3. [.claude/reports/](.claude/reports/) - Relatórios de auditoria

---

**Última atualização:** 28/12/2025
