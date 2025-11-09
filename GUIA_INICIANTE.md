
# 📘 GUIA RÁPIDO - SICEFSUS (Primeira Utilização)

## 🎯 O que é o SICEFSUS?
Sistema para **gerenciar emendas parlamentares** e suas despesas de forma simples e organizada.

---

## 🚀 PASSO A PASSO COMPLETO

### **1️⃣ FAZER LOGIN**
1. Acesse o sistema
2. Digite seu **e-mail** e **senha**
3. Clique em **"Entrar"**

---

### **2️⃣ CADASTRAR UMA EMENDA** 📝

**Onde?** Menu lateral → **"Emendas"** → Botão **"➕ Nova Emenda"**

**Preencha os campos principais:**

#### **Aba: Dados Básicos**
- **Número da Emenda**: Ex: `E2025001`
- **Emenda Parlamentar**: Ex: `EMD-30460003`
- **Tipo**: Escolha (Individual, Bancada, etc.)
- **Parlamentar**: Nome do deputado/senador
- **Município**: Sua cidade
- **UF**: Seu estado
- **CNPJ**: CNPJ do beneficiário
- **Valor Total**: Quanto a emenda vale (Ex: R$ 200.000,00)
- **Objeto da Proposta**: Descrição do que será feito
- **Data de Validade**: Até quando a emenda é válida

#### **Aba: Execução Orçamentária** (Opcional)
- Aqui você pode **planejar** quanto vai gastar em cada tipo de despesa
- **OU** deixar em branco e cadastrar despesas direto depois

**Finalize:** Clique em **"✓ Cadastrar Emenda"**

---

### **3️⃣ OPÇÃO A: PLANEJAR DESPESAS** (Antes de Executar)

**Quando usar?** Quando você quer organizar quanto vai gastar em cada coisa ANTES de fazer o gasto.

**Como fazer:**
1. Na **aba "Execução Orçamentária"** da emenda
2. Clique em **"➕ Adicionar Despesa Planejada"**
3. Preencha:
   - **Natureza**: Tipo da despesa (Material, Serviço, etc.)
   - **Valor**: Quanto pretende gastar
   - **Discriminação**: Descrição breve
4. Clique em **"Adicionar"**

**Resultado:** Aparece uma lista amarela de despesas planejadas

---

### **4️⃣ OPÇÃO B: EXECUTAR UMA DESPESA PLANEJADA**

**Quando usar?** Quando você JÁ planejou e agora vai CONFIRMAR que gastou.

**Como fazer:**
1. Na lista de despesas planejadas (cor **amarela**)
2. Clique em **"▶️ Executar"**
3. Preencha os dados REAIS:
   - **Fornecedor**: Nome da empresa/pessoa
   - **CNPJ do Fornecedor**: CNPJ de quem recebeu
   - **Número do Empenho**: Ex: `2025NE000123`
   - **Número da Nota Fiscal**: Ex: `NF-456789`
   - **Data do Empenho**: Quando foi empenhado
   - **Data da Liquidação**: Quando foi liquidado
   - **Data do Pagamento**: Quando foi pago
4. Clique em **"✅ Confirmar Execução"**

**Resultado:** 
- Despesa planejada **some**
- Nova despesa **executada** aparece (cor **verde**)
- Saldo da emenda **diminui** automaticamente

---

### **5️⃣ OPÇÃO C: CADASTRAR DESPESA EXECUTADA DIRETO** (Sem Planejar)

**Quando usar?** Quando você JÁ gastou e quer lançar direto no sistema.

**Como fazer:**
1. Menu lateral → **"Despesas"** → **"➕ Nova Despesa"**
2. **OU** dentro da emenda → Aba **"Execução"** → **"➕ Nova Despesa Executada"**
3. Preencha:
   - **Emenda**: Escolha qual emenda
   - **Natureza da Despesa**: Tipo do gasto
   - **Valor**: Quanto gastou
   - **Discriminação**: O que foi comprado/pago
   - **Fornecedor**: Nome da empresa
   - **CNPJ do Fornecedor**: CNPJ
   - **Número do Empenho**: Código do empenho
   - **Número da Nota**: NF
   - **Datas**: Empenho, Liquidação e Pagamento
4. Clique em **"✓ Cadastrar Despesa"**

**Resultado:** Despesa cadastrada e saldo atualizado

---

## 📊 ACOMPANHAR O QUE FOI FEITO

### **Ver Emendas**
Menu → **"Emendas"**
- Lista todas as emendas
- Mostra saldo disponível de cada uma
- Verde = Tem saldo / Vermelho = Esgotada

### **Ver Despesas**
Menu → **"Despesas"**
- Amarelo = Planejadas (ainda não gastou)
- Verde = Executadas (já gastou)

### **Dashboard**
Menu → **"Dashboard"**
- Resumo geral
- Gráficos de execução
- Cronograma de vencimentos

---

## 🎨 CORES DO SISTEMA

| Cor | Significado |
|-----|-------------|
| 🟢 **Verde** | Despesa executada / Emenda ativa |
| 🟡 **Amarelo** | Despesa planejada (ainda vai executar) |
| 🔴 **Vermelho** | Emenda esgotada / Vencida |
| 🔵 **Azul** | Informações gerais |

---

## ⚠️ DICAS IMPORTANTES

### ✅ **Sempre verifique:**
- Se o **saldo disponível** é suficiente antes de cadastrar
- Se as **datas** estão corretas (empenho → liquidação → pagamento)
- Se o **CNPJ do fornecedor** é válido

### ❌ **Evite:**
- Cadastrar despesa com valor maior que o saldo
- Preencher datas fora do período da emenda
- Deixar campos obrigatórios vazios

---

## 🆘 PRECISA DE AJUDA?

### **Sistema bloqueou algo?**
- Verifique se há mensagem de erro em vermelho
- Confira se todos os campos obrigatórios estão preenchidos
- Veja se o saldo da emenda é suficiente

### **Não encontra uma opção?**
- Verifique se está na **aba correta** (Dados Básicos / Execução)
- Alguns botões só aparecem para **administradores**

---

## 📋 RESUMO DO FLUXO MAIS COMUM

```
1. LOGIN
   ↓
2. CADASTRAR EMENDA (Dados Básicos)
   ↓
3. ESCOLHA:
   A) Planejar despesas → Executar depois
   OU
   B) Cadastrar despesas executadas direto
   ↓
4. ACOMPANHAR no Dashboard
```

---

## 🎯 EXEMPLO PRÁTICO COMPLETO

**Situação:** Você recebeu uma emenda de R$ 100.000,00 para comprar medicamentos.

1. **Cadastre a emenda:**
   - Número: `E2025001`
   - Valor: `R$ 100.000,00`
   - Validade: `31/12/2025`

2. **Opção 1 - Planejar primeiro:**
   - Planeje: R$ 40.000 em medicamentos
   - Planeje: R$ 35.000 em equipamentos
   - Planeje: R$ 25.000 em serviços
   - **Depois**, execute cada uma conforme for gastando

3. **Opção 2 - Cadastrar direto:**
   - Comprou medicamentos por R$ 40.000
   - Cadastre a despesa executada com todos os dados
   - Saldo automaticamente fica R$ 60.000

---

## 💳 STATUS DE PAGAMENTO - O QUE SIGNIFICAM?

### **Entendendo o Ciclo Financeiro**

Cada despesa passa por **3 etapas obrigatórias** até estar completamente paga:

```
1️⃣ EMPENHADO → 2️⃣ LIQUIDADO → 3️⃣ PAGO
```

---

### **📋 Status: EMPENHADO**

**O que é?**
- Primeiro estágio do processo de pagamento
- É o momento em que você **reserva** o dinheiro para aquela compra
- O valor já foi comprometido, mas ainda não foi efetivamente gasto

**Quando usar?**
- Logo após fazer a compra ou contratar o serviço
- Quando você tem o número do empenho

**Exemplo prático:**
- Você comprou medicamentos por R$ 10.000
- O setor de compras emitiu o empenho nº 2025NE000123
- Status: **EMPENHADO** ✅

**Campos obrigatórios:**
- ✅ Número do Empenho
- ✅ Data do Empenho
- ✅ Fornecedor
- ✅ CNPJ do Fornecedor

---

### **📝 Status: LIQUIDADO**

**O que é?**
- Segundo estágio do processo
- É quando você **confirma** que recebeu o produto/serviço
- Verifica se está tudo correto antes de pagar

**Quando usar?**
- Depois de receber os medicamentos/materiais
- Após verificar se está tudo conforme o pedido
- Quando a nota fiscal foi conferida

**Exemplo prático:**
- Os medicamentos chegaram
- Você conferiu: quantidade, validade, especificações
- Está tudo certo → pode marcar como **LIQUIDADO** ✅

**Campos obrigatórios:**
- ✅ Data da Liquidação
- ✅ Número da Nota Fiscal

---

### **💵 Status: PAGO**

**O que é?**
- Estágio final do processo
- O dinheiro foi **efetivamente transferido** para o fornecedor
- Despesa totalmente concluída

**Quando usar?**
- Depois que o pagamento foi feito pelo banco
- Quando você tem a comprovação bancária

**Exemplo prático:**
- O banco transferiu os R$ 10.000 para o fornecedor
- Data de pagamento: 15/01/2025
- Status: **PAGO** ✅ (Concluído)

**Campos obrigatórios:**
- ✅ Data do Pagamento

---

## 📊 PAINEL FINANCEIRO - COMO LER OS NÚMEROS

### **Localização**
- **Dashboard**: Visão geral de todas as emendas
- **Detalhes da Emenda**: Visão específica de cada emenda

---

### **📦 Painel "Status Financeiro" (Mini-Cards)**

Quando você abre uma emenda, verá **3 mini-cards coloridos**:

#### **💵 Card PAGO (Verde)**
```
💵 Pago
R$ 40.000,00
✅ Concluído
```

**Significado:**
- Mostra quanto **já foi pago completamente**
- Dinheiro que saiu da conta e foi para o fornecedor
- Processo 100% finalizado

---

#### **📝 Card LIQUIDADO (Amarelo)**
```
📝 Liquidado
R$ 25.000,00
⏳ Aguardando pagamento
```

**Significado:**
- Produto/serviço **recebido e conferido**
- Aguardando o setor financeiro fazer o pagamento
- Dinheiro ainda não saiu, mas está confirmado

---

#### **📋 Card EMPENHADO (Azul)**
```
📋 Empenhado
R$ 35.000,00
⏳ Aguardando recebimento
```

**Significado:**
- Compra **feita e reservada**
- Aguardando receber o produto/serviço
- Depois de receber → marcar como liquidado

---

### **💡 Interpretando o Painel Completo**

**Exemplo real:**

```
Valor Total da Emenda: R$ 100.000,00

Status Financeiro:
├─ 💵 Pago:       R$ 40.000 (40%)
├─ 📝 Liquidado:  R$ 25.000 (25%)
├─ 📋 Empenhado:  R$ 35.000 (35%)
└─ 💰 Disponível: R$ 0,00    (0%)
```

**O que isso significa?**
- ✅ **R$ 40.000** → Processo 100% concluído (pagos)
- 🕐 **R$ 25.000** → Próximo a ser pago (liquidados)
- 📦 **R$ 35.000** → Aguardando recebimento (empenhados)
- ✔️ **Emenda 100% executada** (nada disponível)

---

## 🏢 CADASTRO AUTOMÁTICO DE FORNECEDOR

### **🚀 Como Funciona**

O sistema **busca automaticamente** os dados do fornecedor quando você digita o CNPJ!

---

### **📝 Passo a Passo**

1. **Digite o CNPJ** (apenas números ou com máscara)
   ```
   Exemplo: 00.000.000/0001-00
   ```

2. **Aguarde a validação automática**
   - ✅ CNPJ válido → Ícone verde aparece
   - ❌ CNPJ inválido → Mensagem de erro

3. **Clique no botão 🔄 ao lado do campo CNPJ**
   - Botão aparece como: `🔍 Buscar Dados`

4. **Sistema preenche automaticamente:**
   - ✅ Razão Social (Nome da Empresa)
   - ✅ Nome Fantasia
   - ✅ Endereço completo
   - ✅ Cidade/UF
   - ✅ CEP
   - ✅ Telefone
   - ✅ Situação Cadastral

5. **Você só precisa conferir se está correto!**

---

### **🎯 Exemplo Prático**

**Antes:**
```
CNPJ: [           ] 🔍 Buscar Dados (botão desabilitado)
Fornecedor: [                    ]
Nome Fantasia: [                 ]
Endereço: [                      ]
```

**Você digita:** `06.597.801/0001-62`

**Depois (automático):**
```
CNPJ: 06.597.801/0001-62 ✅
Fornecedor: EMPRESA EXEMPLO LTDA (preenchido)
Nome Fantasia: EXEMPLO (preenchido)
Endereço: RUA EXEMPLO, 123 (preenchido)
Cidade/UF: SÃO PAULO/SP (preenchido)
CEP: 01234-567 (preenchido)
Telefone: (11) 98765-4321 (preenchido)
Situação: ATIVA (preenchido)
```

---

### **⚠️ Observações Importantes**

#### **✅ Vantagens:**
- ⚡ Economiza tempo (não precisa digitar tudo)
- 📋 Evita erros de digitação
- 🔍 Garante dados oficiais e atualizados

#### **⚠️ O que fazer se não funcionar:**
1. Verifique se o CNPJ está correto (14 dígitos)
2. Confira se tem conexão com internet
3. Se persistir, preencha manualmente os campos

#### **🔑 Campos que você ainda precisa preencher:**
- Número do Empenho
- Número da Nota Fiscal
- Datas (Empenho, Liquidação, Pagamento)
- Valor da despesa

---

## 🎨 CORES E BADGES DO SISTEMA

### **Status de Pagamento**

| Badge | Significado | Ação Necessária |
|-------|-------------|-----------------|
| 🟢 **PAGO** | Processo concluído | ✅ Nenhuma |
| 🟡 **LIQUIDADO** | Aguardando pagamento | 💵 Efetuar pagamento |
| 🔵 **EMPENHADO** | Aguardando recebimento | 📦 Receber e liquidar |
| ⚪ **PLANEJADO** | Ainda não executado | ▶️ Executar despesa |

### **Status da Emenda**

| Cor | Significado |
|-----|-------------|
| 🟢 **Verde** | Emenda ativa com saldo |
| 🟡 **Amarelo** | Emenda próxima do vencimento |
| 🔴 **Vermelho** | Emenda vencida ou sem saldo |

---

## 🔄 FLUXO COMPLETO: DO PLANEJAMENTO AO PAGAMENTO

```
1. PLANEJAR DESPESA
   ↓
2. EXECUTAR (Preencher CNPJ → Buscar dados → Confirmar)
   ↓
3. EMPENHAR (Status: EMPENHADO)
   ↓
4. RECEBER PRODUTO/SERVIÇO
   ↓
5. LIQUIDAR (Status: LIQUIDADO)
   ↓
6. PAGAR (Status: PAGO) ✅
```

---

## 📞 DÚVIDAS FREQUENTES

**P: Posso pular etapas do processo de pagamento?**
R: ❌ Não. O fluxo EMPENHADO → LIQUIDADO → PAGO deve ser seguido conforme a legislação.

**P: O que fazer se o fornecedor não for encontrado pelo CNPJ?**
R: Verifique se o CNPJ está correto. Se estiver, preencha os dados manualmente.

**P: Posso editar dados que foram preenchidos automaticamente?**
R: ✅ Sim! Todos os campos podem ser editados se necessário.

**P: Como sei em qual etapa está minha despesa?**
R: Verifique o badge colorido ao lado da despesa ou no painel Status Financeiro.

---

**Versão:** 1.1 | **Data:** 2025-01-15 | **Atualização:** Status de Pagamento e Cadastro Automático
