
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

**Versão:** 1.0 | **Data:** 2025-01-15
