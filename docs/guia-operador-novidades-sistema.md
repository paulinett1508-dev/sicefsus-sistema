# Guia do Operador: Novidades do Sistema

**SICEFSUS - Sistema de Gestão de Emendas Parlamentares**

---

# PARTE 1: Sistema de Execução Orçamentária

## 1. O que mudou?

O sistema agora organiza as despesas em **Naturezas de Despesa** (categorias orçamentárias). Cada natureza funciona como uma **caixa separada** dentro do orçamento total da emenda, agrupando despesas do mesmo tipo.

### Benefícios do novo sistema

- Melhor controle do saldo por categoria
- Visualização clara de quanto foi gasto em cada tipo de despesa
- Impossibilidade de gastar mais do que foi reservado
- Rastreamento completo de cada real gasto

---

## 2. Conceitos Principais

### Natureza de Despesa (Categoria)

É uma **caixa do orçamento** que agrupa despesas relacionadas.

**Exemplo prático:**
```
Emenda Total: R$ 100.000,00

├── Natureza 339030 (Consultoria): R$ 30.000,00
│   ├── Despesa: Consultoria Técnica - R$ 15.000
│   └── Despesa: Assessoria Jurídica - R$ 10.000
│   └── Saldo disponível: R$ 5.000
│
├── Natureza 339039 (Outros Serviços): R$ 20.000,00
│   └── Despesa: Manutenção - R$ 8.000
│   └── Saldo disponível: R$ 12.000
│
└── Saldo não alocado: R$ 50.000,00
```

### Como funciona o consumo de saldo

Toda despesa criada no sistema **consome automaticamente** o saldo da natureza em que está vinculada.

```
Natureza (R$ 30.000)
    │
    ├── Despesa criada: R$ 10.000  →  Saldo restante: R$ 20.000
    │
    └── Despesa criada: R$ 5.000   →  Saldo restante: R$ 15.000
```

> **Nota sobre despesas antigas:** Se você ver um aviso sobre "despesas planejadas", são registros do sistema antigo que precisam ser migrados. Clique em "Migrar Agora" para convertê-las ao novo formato.

---

## 3. Passo a Passo: Criar uma Despesa

### Passo 1: Acessar a Emenda

1. Faça login no sistema
2. Vá em **Emendas** no menu lateral
3. Clique na emenda desejada
4. Clique na aba **"Execução Orçamentária"**

### Passo 2: Criar uma Natureza (se necessário)

Se a natureza que você precisa ainda não existe:

1. Clique no botão **"Nova Natureza"**
2. Selecione o código da natureza (ex: 339030 - Serviços de Consultoria)
3. Informe o **valor a reservar** para esta categoria
4. Clique em **Salvar**

> **Dica:** O valor reservado deve ser suficiente para cobrir todas as despesas previstas nesta categoria.

### Passo 3: Criar a Despesa

1. Localize a natureza desejada na lista
2. Clique no botão **"Nova Despesa"** dentro dela
3. Preencha todos os campos obrigatórios:

| Campo | O que preencher |
|-------|-----------------|
| Discriminação | Descrição clara da despesa |
| Valor | Valor em reais (R$) |
| Fornecedor | Nome da empresa/pessoa |
| CNPJ/CPF | Documento do fornecedor |
| Nota Fiscal | Número da NF |
| Data de Empenho | Quando foi empenhado |
| Status de Pagamento | Situação atual |

4. Clique em **Salvar**

### Passo 4: Acompanhar

Após salvar, a despesa aparece dentro da natureza e o saldo é atualizado automaticamente.

---

## 4. Naturezas Pendentes (Regularização)

> **Observação:** Esta seção só se aplica se você tiver despesas do sistema antigo. Se você está começando do zero, pode pular esta parte.

### O que são?

Se o sistema encontrar despesas antigas (do sistema anterior) que não estavam vinculadas a nenhuma natureza, ele cria automaticamente uma **natureza pendente** para agrupá-las.

### Como identificar?

- Aparecem com **borda tracejada amarela**
- Têm um selo **"Pendente"**
- Mostram o valor já gasto, mas sem valor reservado

### Como regularizar?

1. Clique no botão **"Regularizar"** na natureza pendente
2. O sistema mostra o valor mínimo (igual ao que já foi gasto)
3. Informe o valor que deseja reservar (pode ser maior)
4. Clique em **Confirmar**

> **Importante:** Enquanto a natureza estiver pendente, você NÃO pode criar novas despesas nela. Regularize primeiro!

---

## 5. Entendendo os Indicadores

### Cores da Barra de Progresso

| Cor | Significado | Ação |
|-----|-------------|------|
| **Verde** | Menos de 80% utilizado | Tudo normal |
| **Amarelo** | Entre 80% e 99% utilizado | Atenção ao saldo |
| **Vermelho** | 100% ou mais utilizado | Saldo esgotado |

### Ícones e Símbolos

| Símbolo | Significado |
|---------|-------------|
| Borda sólida | Natureza normal (pode criar despesas) |
| Borda tracejada | Natureza pendente (precisa regularizar) |
| Badge "Pendente" | Aguardando regularização |

---

## 6. Regras do Sistema

### O que o sistema PERMITE

- Criar várias naturezas na mesma emenda
- Criar várias despesas na mesma natureza
- Editar despesas ainda não finalizadas
- Regularizar naturezas pendentes

### O que o sistema BLOQUEIA

- Criar despesa com valor maior que o saldo da natureza
- Reservar mais do que o valor total da emenda
- Criar despesas em naturezas pendentes de regularização (despesas antigas)
- Operadores criando despesas de outros municípios

---

## 7. Fluxo Visual Resumido

```
┌─────────────────────────────────────────────────────────────┐
│                     EMENDA (R$ 100.000)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NATUREZA 339030 - Consultoria                       │   │
│  │ Reservado: R$ 30.000 | Gasto: R$ 25.000             │   │
│  │ Saldo: R$ 5.000                                     │   │
│  │ ████████████████████░░░░░░ 83%                      │   │
│  │                                                     │   │
│  │ ├─ Despesa: Consultoria Técnica      R$ 15.000     │   │
│  │ ├─ Despesa: Assessoria Jurídica      R$ 10.000     │   │
│  │                                                     │   │
│  │ [ + Nova Despesa ]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ NATUREZA 339039 - Outros Serviços                   │   │
│  │ Reservado: R$ 20.000 | Gasto: R$ 8.000              │   │
│  │ Saldo: R$ 12.000                                    │   │
│  │ ████████░░░░░░░░░░░░░░░░░░ 40%                      │   │
│  │                                                     │   │
│  │ ├─ Despesa: Manutenção Equipamentos  R$ 8.000      │   │
│  │                                                     │   │
│  │ [ + Nova Despesa ]                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Saldo não alocado: R$ 50.000                              │
│                                                             │
│  [ + Nova Natureza ]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Perguntas Frequentes

### "Posso criar uma despesa sem criar natureza?"

Não. Toda despesa executada precisa estar vinculada a uma natureza. Crie a natureza primeiro.

### "O que acontece se eu não regularizar as naturezas pendentes?"

As despesas antigas continuarão aparecendo agrupadas, mas você não poderá adicionar novas despesas naquela categoria até regularizar.

### "Posso alterar o valor reservado de uma natureza?"

Sim, desde que o novo valor seja:
- Maior ou igual ao que já foi gasto
- Menor ou igual ao saldo disponível da emenda

### "Por que não consigo criar despesa?"

Verifique:
1. A natureza está pendente? → Regularize primeiro
2. O saldo da natureza é suficiente? → Reserve mais valor
3. Você tem permissão para este município? → Verifique com o administrador

### "O que é o aviso de despesas planejadas?"

Se aparecer um banner amarelo mencionando "despesas planejadas", são registros do sistema antigo. Clique em **"Migrar Agora"** para convertê-las ao novo formato. Após a migração, elas passam a funcionar normalmente.

---

## 9. Resumo Rápido

| Ação | Como fazer |
|------|------------|
| Criar natureza | Execução Orçamentária → Nova Natureza |
| Criar despesa | Dentro da natureza → Nova Despesa |
| Ver saldo | Verificar barra de progresso da natureza |
| Migrar dados antigos | Clicar em "Migrar Agora" (se aparecer o aviso) |

---

# PARTE 2: Módulo de Fornecedores

## 10. O que é o Módulo de Fornecedores?

O sistema agora possui um **cadastro centralizado de fornecedores**. Em vez de digitar os dados do fornecedor toda vez que criar uma despesa, você pode:

- Cadastrar o fornecedor uma única vez
- Selecionar de uma lista nas próximas despesas
- Ter os dados preenchidos automaticamente

### Benefícios

- **Agilidade:** Não precisa digitar CNPJ, endereço e contato toda vez
- **Precisão:** Dados vêm direto da Receita Federal
- **Padronização:** Mesmo fornecedor em todas as despesas
- **Histórico:** Veja quantas despesas cada fornecedor tem

---

## 11. Acessando o Módulo de Fornecedores

1. No menu lateral, clique em **"Fornecedores"**
2. Você verá a lista de fornecedores cadastrados
3. No topo, cards mostram: Total, Ativos e Inativos

---

## 12. Cadastrando um Fornecedor

### Passo 1: Iniciar cadastro

Clique no botão **"Novo Fornecedor"** no canto superior direito.

### Passo 2: Buscar pelo CNPJ

1. Digite o **CNPJ** do fornecedor (só números ou formatado)
2. Clique no botão de **busca** (lupa) ao lado do campo
3. **Aguarde** - o sistema vai buscar os dados na Receita Federal

### Passo 3: Conferir dados

Se o CNPJ for válido, o sistema preenche automaticamente:

| Campo | Descrição |
|-------|-----------|
| Razão Social | Nome oficial da empresa |
| Nome Fantasia | Nome comercial |
| Endereço completo | Logradouro, número, bairro, cidade, UF, CEP |
| Telefone | Contato da empresa |
| Email | Email cadastrado |
| Situação | ATIVA, BAIXADA, SUSPENSA ou INAPTA |

### Passo 4: Salvar

Confira os dados e clique em **Salvar**.

> **Dica:** Se a busca não funcionar, você pode preencher os campos manualmente.

---

## 13. Usando Fornecedores nas Despesas

Ao criar uma despesa, você tem duas opções para informar o fornecedor:

### Opção 1: Selecionar da lista (recomendado)

1. No campo **Fornecedor**, clique para abrir a lista
2. Use a busca para encontrar (por CNPJ, nome ou cidade)
3. Clique no fornecedor desejado
4. **Todos os campos são preenchidos automaticamente!**

### Opção 2: Digitar manualmente

1. Mude para modo "Entrada Manual"
2. Digite o CNPJ
3. Clique no botão de busca
4. Os dados serão buscados na Receita Federal

### Cadastrar durante a despesa

Se o fornecedor não está na lista:

1. Clique em **"Cadastrar Novo Fornecedor"** no final da lista
2. Preencha os dados no formulário que abre
3. Ao salvar, o fornecedor é selecionado automaticamente

---

## 14. Situação Cadastral do Fornecedor

O sistema mostra a situação do fornecedor na Receita Federal:

| Situação | Cor | Significado |
|----------|-----|-------------|
| **ATIVA** | Verde | Empresa operando normalmente |
| **SUSPENSA** | Amarelo | Temporariamente impedida |
| **BAIXADA** | Vermelho | Empresa encerrada |
| **INAPTA** | Vermelho | Irregular perante a Receita |

> **Atenção:** Evite criar despesas com fornecedores que não estejam com situação ATIVA.

---

## 15. Visualizando Fornecedores

### Card do Fornecedor

Cada fornecedor aparece como um card compacto mostrando:

- **CNPJ** formatado
- **Razão Social**
- **Cidade/UF**
- **Quantidade de despesas** vinculadas
- **Situação** (badge colorido)

### Expandir para ver detalhes

Clique no card para expandir e ver:

- Dados completos da empresa
- Endereço completo
- Telefone e email
- Botões de Editar e Excluir

---

## 16. Editando e Excluindo

### Editar

1. Expanda o card do fornecedor
2. Clique em **"Editar"**
3. Faça as alterações necessárias
4. Clique em **"Salvar"**

> **Nota:** O CNPJ não pode ser alterado. Se digitou errado, exclua e cadastre novamente.

### Excluir

1. Expanda o card do fornecedor
2. Clique em **"Excluir"**
3. Confirme a exclusão

> **Importante:** Fornecedores com despesas vinculadas **NÃO podem ser excluídos**. O sistema mostra quantas despesas estão vinculadas.

---

## 17. Perguntas Frequentes - Fornecedores

### "A busca por CNPJ não está funcionando"

- Verifique se o CNPJ está correto (14 dígitos)
- A Receita Federal pode estar fora do ar temporariamente
- Você pode preencher os dados manualmente

### "Não encontro o fornecedor na lista"

- Use a busca por CNPJ (só números), razão social ou cidade
- Se realmente não existe, clique em "Cadastrar Novo Fornecedor"

### "Posso excluir um fornecedor que já usei?"

Não. Fornecedores com despesas vinculadas ficam protegidos. Isso garante a integridade do histórico.

### "O fornecedor está com situação BAIXADA, posso usar?"

O sistema permite, mas **não é recomendado**. Empresas baixadas não emitem notas fiscais válidas.

---

## 18. Resumo Rápido - Fornecedores

| Ação | Como fazer |
|------|------------|
| Acessar módulo | Menu lateral → Fornecedores |
| Cadastrar novo | Botão "Novo Fornecedor" → Digitar CNPJ → Buscar |
| Usar em despesa | Campo Fornecedor → Selecionar da lista |
| Cadastrar na despesa | Lista de fornecedores → "Cadastrar Novo" |
| Editar | Expandir card → Editar |
| Excluir | Expandir card → Excluir (se não tiver despesas) |

---

# PARTE 3: Resumo Geral

## 19. Fluxo Completo de uma Despesa

```
1. CADASTRAR FORNECEDOR (se ainda não existe)
   Menu → Fornecedores → Novo Fornecedor → Buscar CNPJ → Salvar

2. CRIAR NATUREZA (se ainda não existe)
   Emenda → Execução Orçamentária → Nova Natureza → Definir valor → Salvar

3. CRIAR DESPESA
   Dentro da natureza → Nova Despesa → Selecionar fornecedor → Preencher dados → Salvar

4. ACOMPANHAR
   Verificar saldo da natureza e status da despesa
```

---

## 20. Suporte

Em caso de dúvidas ou problemas:
- Consulte seu gestor municipal
- Entre em contato com o administrador do sistema

---

*Documento gerado em Janeiro/2026*
*SICEFSUS - Sistema de Gestão de Emendas Parlamentares*
