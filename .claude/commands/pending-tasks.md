# Tarefas Pendentes para Proxima Sessao

## Atualizado em: 2026-01-10

---

## NOVO MODULO: Cadastro de Fornecedores

### Problema Atual
Atualmente, ao criar uma despesa, o usuario precisa informar todos os dados do fornecedor manualmente:
- CNPJ (com lookup automatico via ReceitaWS/BrasilAPI)
- Razao Social
- Nome Fantasia
- Endereco completo
- Telefone, Email
- Situacao Cadastral

**Problema:** Se o usuario precisar cadastrar outra despesa para o MESMO fornecedor, precisa preencher tudo novamente ou depender do lookup do CNPJ.

### Solucao Proposta

#### 1. Nova Colecao Firebase: `fornecedores`
```javascript
{
  id: "auto-generated",
  cnpj: "00.000.000/0001-00",        // Unico
  razaoSocial: "EMPRESA LTDA",
  nomeFantasia: "NOME FANTASIA",
  endereco: {
    logradouro: "RUA EXEMPLO",
    numero: "123",
    complemento: "",
    bairro: "CENTRO",
    cidade: "CIDADE",
    uf: "MA",
    cep: "00000-000"
  },
  contato: {
    telefone: "(00) 0000-0000",
    email: "contato@empresa.com"
  },
  situacaoCadastral: "ATIVA",
  dataUltimaConsulta: Timestamp,     // Ultima consulta na Receita
  // Metadados
  criadoPor: "userId",
  criadoEm: Timestamp,
  atualizadoPor: "userId",
  atualizadoEm: Timestamp,
  // Vinculo geografico (opcional)
  municipiosAtendidos: ["Passagem Franca", "Sucupira"],
  uf: "MA"
}
```

#### 2. Componentes Necessarios

| Componente | Descricao | Localizacao |
|------------|-----------|-------------|
| `FornecedoresList.jsx` | Lista de fornecedores com busca/filtros | `src/components/fornecedor/` |
| `FornecedorForm.jsx` | Formulario criar/editar fornecedor | `src/components/fornecedor/` |
| `FornecedorCard.jsx` | Card resumido do fornecedor | `src/components/fornecedor/` |
| `FornecedorSelect.jsx` | Dropdown para selecionar fornecedor existente | `src/components/fornecedor/` |
| `useFornecedoresData.js` | Hook CRUD fornecedores | `src/hooks/` |

#### 3. Integracao com Despesas

**Fluxo no formulario de despesa:**
1. Usuario clica em "Selecionar Fornecedor"
2. Modal abre com:
   - Campo de busca (por CNPJ, razao social ou nome fantasia)
   - Lista de fornecedores ja cadastrados
   - Botao "Cadastrar Novo Fornecedor"
3. Ao selecionar, preenche automaticamente todos os campos
4. Campo `fornecedorId` salvo na despesa para referencia

**Fallback:** Manter opcao de preencher manualmente (para casos unicos)

#### 4. Menu/Navegacao

Adicionar no Sidebar:
```
Emendas
Relatorios
Fornecedores  <- NOVO
Administracao (admin only)
```

#### 5. Permissoes

| Acao | Admin | Gestor | Operador |
|------|-------|--------|----------|
| Visualizar fornecedores | Sim | Sim (seu municipio) | Sim (seu municipio) |
| Criar fornecedor | Sim | Sim | Sim |
| Editar fornecedor | Sim | Sim (se criou) | Nao |
| Excluir fornecedor | Sim | Nao | Nao |

---

## Testes Completos do Sistema

### 1. Autenticacao e Usuarios

#### Login/Logout
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Login valido | Email + senha corretos | Redireciona para Dashboard |
| Login invalido | Senha incorreta | Mensagem de erro |
| Usuario inativo | Login com usuario status="inativo" | Bloqueia acesso |
| Primeiro acesso | Usuario com `primeiroLogin=true` | Solicita troca de senha |
| Logout | Clicar em Sair | Redireciona para Login |
| Sessao expirada | Aguardar timeout | Redireciona para Login |

#### Gestao de Usuarios (Admin)
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Criar usuario | Preencher form + salvar | Usuario criado no Firebase Auth + Firestore |
| Editar usuario | Alterar dados + salvar | Dados atualizados |
| Inativar usuario | Mudar status para inativo | Usuario nao consegue logar |
| Reativar usuario | Mudar status para ativo | Usuario consegue logar |
| Alterar tipo | Mudar de operador para gestor | Permissoes atualizadas |
| Resetar senha | Clicar em resetar | Email enviado ao usuario |

### 2. Dashboard

| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Admin - visao geral | Logar como admin | Ve todas emendas/despesas de todos municipios |
| Gestor - filtrado | Logar como gestor | Ve apenas emendas do seu municipio |
| Operador - filtrado | Logar como operador | Ve apenas emendas do seu municipio |
| KPIs corretos | Verificar totais | Valores batem com soma das emendas |
| Graficos | Verificar graficos | Dados consistentes |
| Alertas | Emendas proximas do vencimento | Aparecem no widget de alertas |
| Timeline | Ultimas movimentacoes | Ordenadas por data |

### 3. Emendas

#### Listagem
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Listar todas | Acessar /emendas | Lista paginada de emendas |
| Filtrar por status | Selecionar "Ativa" | Apenas emendas ativas |
| Filtrar por municipio | Selecionar municipio | Apenas emendas do municipio |
| Filtrar por parlamentar | Digitar nome | Emendas do parlamentar |
| Buscar por numero | Digitar numero | Encontra emenda especifica |
| Ordenar por valor | Clicar coluna valor | Ordena crescente/decrescente |
| Ordenar por validade | Clicar coluna validade | Ordena por data |

#### Criar Emenda
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Criar emenda completa | Preencher todos campos + salvar | Emenda criada no Firestore |
| Campos obrigatorios | Deixar campo vazio | Validacao bloqueia |
| CNPJ invalido | Digitar CNPJ incorreto | Mensagem de erro |
| CNPJ valido | Digitar CNPJ correto | Lookup preenche dados |
| Valor monetario | Digitar "1.500.000,00" | Salva como numero |
| Datas | Selecionar datas | Valida inicio < fim |
| Salvar rascunho | Preencher parcialmente + salvar | Salva como rascunho |

#### Editar Emenda
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Editar dados basicos | Alterar parlamentar + salvar | Dados atualizados |
| Editar valores | Alterar valor + salvar | Recalcula saldos |
| Adicionar acoes/servicos | Adicionar item na lista | Lista atualizada |
| Remover acoes/servicos | Remover item | Item removido |
| Historico | Verificar log | Alteracao registrada |

#### Excluir Emenda
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Excluir sem despesas | Excluir emenda vazia | Emenda removida |
| Excluir com despesas | Tentar excluir | Bloqueia ou confirma cascata |
| Permissao operador | Operador tenta excluir | Bloqueado |
| Permissao gestor | Gestor exclui | Permitido |

### 4. Naturezas (Envelopes Orcamentarios)

#### Criar Natureza
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Criar natureza | Selecionar codigo + valor | Natureza criada |
| Valor > saldo livre | Tentar alocar mais que disponivel | Bloqueia com aviso |
| Codigo duplicado | Tentar criar 339030 duas vezes | Bloqueia |

#### Naturezas Virtuais
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Exibicao | Emenda com despesas sem naturezaId | Aparecem agrupadas como virtuais |
| Visual | Natureza virtual | Borda laranja tracejada + badge "Pendente" |
| Regularizar | Clicar Regularizar + definir valor | Cria natureza real + vincula despesas |
| Valor minimo | Tentar valor < executado | Bloqueia |
| Regularizar todas | Clicar "Regularizar Todas" | Processa em lote |

#### Editar/Excluir Natureza
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Editar valor | Aumentar valor alocado | Atualiza saldo |
| Reduzir valor | Tentar valor < executado | Bloqueia |
| Excluir vazia | Natureza sem despesas | Permitido |
| Excluir com despesas | Natureza com despesas | Bloqueia |

### 5. Despesas

#### Criar Despesa Planejada
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Criar planejada | Preencher valor + natureza | Status = PLANEJADA |
| Valor > saldo natureza | Tentar valor maior | Aviso (nao bloqueia) |
| Sem natureza | Nao selecionar natureza | Bloqueia |

#### Executar Despesa
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Executar | Preencher todos campos obrigatorios | Status = EXECUTADA |
| CNPJ fornecedor | Digitar CNPJ | Lookup preenche dados |
| Nota fiscal | Informar numero | Campo salvo |
| Data empenho | Selecionar data | Validacao de datas |
| Campos faltando | Deixar obrigatorio vazio | Bloqueia |

#### Criar Despesa Executada Direta
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Criar executada | Preencher tudo + salvar como executada | Status = EXECUTADA direto |
| Todos campos | Verificar 33+ campos | Todos salvos corretamente |

#### Status de Pagamento
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Empenhado | Selecionar status | statusPagamento = empenhado |
| Liquidado | Selecionar status | statusPagamento = liquidado |
| Pago | Selecionar status | statusPagamento = pago |
| Filtrar por status | Filtrar na lista | Apenas do status selecionado |

#### Editar/Excluir Despesa
| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Editar planejada | Alterar valor | Atualizado |
| Editar executada | Alterar campos | Atualizado |
| Excluir planejada | Excluir | Removida |
| Excluir executada | Excluir | Removida (recalcula saldos) |

### 6. Relatorios

| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Gerar PDF geral | Selecionar periodo + gerar | PDF com todas emendas |
| Filtrar por municipio | Selecionar municipio | PDF filtrado |
| Filtrar por parlamentar | Selecionar parlamentar | PDF filtrado |
| Exportar Excel | Clicar exportar | Download .xlsx |
| Guia de emenda | Selecionar emenda especifica | PDF detalhado da emenda |

### 7. Administracao

| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Acesso admin | Logar como admin | Menu visivel |
| Acesso nao-admin | Logar como operador | Menu oculto |
| Logs de auditoria | Acessar logs | Lista de acoes |
| Backup manual | Clicar backup | Exporta dados |

### 8. Navegacao e UX

| Cenario | Passos | Resultado Esperado |
|---------|--------|-------------------|
| Navegacao teclado | Tab pelos elementos | Foco visivel e logico |
| Responsivo mobile | Acessar pelo celular | Layout adaptado |
| Responsivo tablet | Acessar pelo tablet | Layout adaptado |
| Loading states | Aguardar carregamento | Spinners/skeletons visiveis |
| Mensagens erro | Provocar erro | Toast com mensagem clara |
| Mensagens sucesso | Salvar com sucesso | Toast de confirmacao |
| Confirmacao exclusao | Tentar excluir | Modal de confirmacao |
| Breadcrumbs | Navegar em profundidade | Caminho visivel |
| Voltar | Clicar voltar | Retorna pagina anterior |

### 9. Permissoes por Tipo de Usuario

#### Admin
- [x] Acesso total ao sistema
- [x] Ve todos municipios
- [x] Gerencia usuarios
- [x] Acessa ferramentas dev
- [x] Pode excluir qualquer registro

#### Gestor
- [x] Ve apenas seu municipio
- [x] Pode criar/editar emendas
- [x] Pode criar/editar despesas
- [x] Pode excluir emendas do seu municipio
- [x] NAO gerencia usuarios

#### Operador
- [x] Ve apenas seu municipio
- [x] Pode criar/editar emendas
- [x] Pode criar/editar despesas
- [x] NAO pode excluir emendas
- [x] NAO gerencia usuarios

---

## Concluido - Refatoracao Execucao Orcamentaria (2026-01-08)

### Mudancas Implementadas

1. **Unificacao de Secoes (ExecucaoOrcamentaria.jsx)**
   - Removida secao separada "Despesas Executadas"
   - Tudo agora aparece dentro de "Execucao Orcamentaria"
   - Naturezas virtuais criadas automaticamente das despesas existentes

2. **Sistema de Naturezas Consolidadas**
   - Despesas sem `naturezaId` sao agrupadas por codigo (ex: 339030)
   - Naturezas virtuais tem borda tracejada laranja e badge "Pendente"
   - Botao "Regularizar" para definir valor alocado

3. **Melhorias de Acessibilidade (P0)**
   - NaturezaCard: role="button", tabIndex, aria-expanded
   - NaturezaForm: htmlFor/id nos labels/inputs
   - Feedback de validacao com role="status"

4. **Consistencia Design System (P1)**
   - ~60 cores hardcoded substituidas por variaveis CSS
   - Padronizacao de border-radius, font-size, font-weight

---

## Concluido - Firebase MCP Server (2026-01-10)

### Correcao Implementada
- Problema: dotenv procurava .env no diretorio de trabalho errado
- Solucao: Usar caminho absoluto baseado em `__dirname`
- Documentacao adicionada ao CLAUDE.md

### Tools Disponiveis
- `firebase_status` - Status das conexoes
- `firebase_switch` - Trocar ambiente (dev/prod)
- `firebase_query` - Consultar colecao
- `firebase_get_document` - Buscar por ID
- `firebase_search` - Buscar por campo
- `firebase_compare` - Comparar dev vs prod
- `firebase_backup` - Exportar colecao
- `firebase_collections` - Listar colecoes

---

## Bugs Conhecidos

| Bug | Severidade | Status |
|-----|------------|--------|
| ~~Botao Excluir Despesa nao funciona~~ | ~~Alta~~ | CORRIGIDO (2026-01-12) |
| Saldo negativo em algumas emendas PROD | Media | Investigar |

---

## Historico

- **2026-01-12**: Correcao bug Excluir Despesa (props erradas no ConfirmationModal: isOpen->isVisible, onClose->onCancel)
- **2026-01-10**: Correcao MCP Server + plano modulo Fornecedores + testes completos
- **2026-01-08**: Unificacao de naturezas + despesas executadas
- **2026-01-07**: Auditoria Firebase completa
- **2026-01-06**: Criacao do arquivo de tarefas pendentes
