# Copilot Instructions for SICEFSUS

## Visão Geral
SICEFSUS é um sistema para gestão de emendas parlamentares e despesas de saúde, com arquitetura baseada em React (frontend) e Firebase (backend). O projeto possui um servidor MCP para acesso direto ao Firestore, facilitando operações administrativas e integrações.

## Estrutura do Projeto
- **src/**: Frontend React, dividido em componentes, hooks, contextos, serviços e utilitários.
- **firebase-mcp-server/**: Servidor MCP para manipulação dos ambientes Firebase DEV/PROD.
- **scripts/**: Scripts utilitários para migração, análise e manutenção de dados.
- **api/**: Backend Node.js para rotas customizadas.

## Fluxos e Convenções
- **Ambientes**: Sempre há DEV e PROD, alternáveis via MCP. Use os comandos MCP para verificar status e trocar ambientes.
- **Usuários**: Três tipos principais (Admin, Gestor, Operador) com permissões distintas. Veja README.md para detalhes.
- **Naturezas**: Despesas agrupadas por código de natureza (ex: 339030). Naturezas virtuais são criadas automaticamente.
- **Execução Orçamentária**: Todas as despesas são agrupadas e regularizadas via botão "Regularizar".

## Workflows Essenciais
- **Início rápido**: Execute `npm install` e `npm run dev` na raiz para iniciar o frontend.
- **MCP Server**: Para manipular Firestore diretamente, acesse `firebase-mcp-server/`, configure `.env` e rode `npm run build`. Use os comandos MCP listados em CLAUDE.md para operações administrativas.
- **Scripts**: Scripts em `scripts/` e raiz são usados para migrações, correções e análises. Execute via Node.js (`node scripts/nome-script.cjs`).

## Integrações e Dependências
- **Firebase**: Firestore e Auth são usados como backend principal. Configurações em `.env` e `firebase-mcp-server/.env`.
- **Replit/Vercel**: Deploys automatizados para ambientes de produção.
- **Design System**: Inter font, cores baseadas em Tailwind, ícones Material Symbols.

## Padrões Específicos
- **Componentização**: Componentes React são altamente modulares, organizados por domínio (emenda, despesa, admin, dashboard).
- **Serviços**: Toda comunicação com Firebase e APIs está centralizada em `src/services/`.
- **Contextos**: Estados globais e autenticação via React Context em `src/context/`.
- **Validação**: Utilitários de validação e formatação em `src/utils/`.

## Exemplos de Comandos MCP
- `firebase_status`: Verifica conexão DEV/PROD
- `firebase_switch`: Troca ambiente
- `firebase_query`: Consulta documentos
- `firebase_backup`: Exporta coleção

## Referências Importantes
- [README.md](../README.md): Visão geral e estrutura
- [CLAUDE.md](../CLAUDE.md): Documentação técnica e comandos MCP
- [firebase-mcp-server/README.md](../firebase-mcp-server/README.md): Setup do MCP Server

---

> Atualize este documento conforme novas convenções ou fluxos forem adotados. Consulte sempre os arquivos de documentação citados para detalhes atualizados.
