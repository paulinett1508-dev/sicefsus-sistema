---
name: revisao-texto-ptbr
description: "Revisao de textos em portugues BR — ortografia, concordancia, acentuacao e estilo. Use ao revisar apresentacoes, labels de UI, relatorios e documentacao do projeto."
---

# Skill: Revisao de Texto em Portugues BR

## Quando Usar
- Revisar textos user-facing (apresentacoes, labels, mensagens, titulos)
- Criar conteudo novo em portugues (documentacao, descricoes, tooltips)
- Auditar paginas inteiras em busca de erros gramaticais
- Validar concordancia e ortografia antes de deploy

## Arquivos com Texto User-Facing (Escopo)

| Tipo | Caminho | Conteudo |
|------|---------|----------|
| Apresentacoes HTML | `public/apresentacoes/*.html` | Institucional e Marketing |
| Pagina Sobre | `src/components/Sobre.jsx` | Descricao do sistema |
| Titulos de Relatorios | `src/utils/relatoriosConstants.js` | Nomes e descricoes dos 5 relatorios |
| Constantes | `src/config/constants.js` | Labels de status, programas, naturezas |
| Componentes JSX | `src/components/**/*.jsx` | Mensagens, tooltips, placeholders, empty states |

## Checklist de Revisao (Ordem de Prioridade)

### 1. Concordancia Nominal (genero + numero)
- [ ] Adjetivos concordam com o substantivo em genero e numero
- [ ] Numerais + substantivos no plural (ex: "5 modelos de **relatorios**", nao "relatorio")
- [ ] Artigos concordam com o substantivo (o/a, os/as)
- [ ] Pronomes demonstrativos concordam (este/esta, estes/estas)

### 2. Concordancia Verbal
- [ ] Verbo concorda com o sujeito em numero e pessoa
- [ ] Sujeito composto = verbo no plural
- [ ] Voz passiva sintetica (ex: "vendem-se casas", nao "vende-se casas")

### 3. Acentuacao e Crase
- [ ] Crase obrigatoria: "a" + artigo feminino (ex: "Do planejamento **a** prestacao" → "**a** prestacao")
- [ ] Acentos agudos em proparoxitonas (tecnico, memoria, relatorio)
- [ ] Acentos circunflexos (ele **ve**, **tem**, **vem** no singular; **veem**, **teem**, **veem** no plural)
- [ ] Acento diferencial (por/por, pode/pode)

### 4. Ortografia
- [ ] Palavras com acento grafico correto
- [ ] Uso correto de "ss", "c", "s" (ex: "excecao" vs "excessao")
- [ ] Hifen conforme novo acordo ortografico

### 5. Consistencia Factual
- [ ] Numeros citados batem com itens listados (ex: "5 estados" → listar exatamente 5)
- [ ] Nomes de features/modulos consistentes com o codigo-fonte
- [ ] Valores e estatisticas atualizados

### 6. Coesao e Coerencia
- [ ] Conectivos adequados entre frases
- [ ] Paralelismo sintatico em listas (todos os itens com mesma estrutura)
- [ ] Pronomes com referentes claros

### 7. Repeticao de Palavras
- [ ] Evitar repeticao do mesmo termo em frases consecutivas
- [ ] Sugerir sinonimos quando houver repeticao excessiva

### 8. Adequacao de Registro
- [ ] Textos institucionais: norma culta, formal
- [ ] Labels de UI: conciso, direto, sem jargao
- [ ] Mensagens de erro: claro, orientado a acao

## Erros Comuns no SICEFSUS (Referencia Rapida)

| Errado | Correto | Regra |
|--------|---------|-------|
| 5 modelos de relatorio | 5 modelos de relat**o**rios | Plural apos numeral |
| Despesas Detalhado | Despesas Detalhad**as** | Concordancia feminino plural |
| PDF profissional (com 5) | PDF profission**ais** | Plural do adjetivo |
| Do planejamento a prestacao | Do planejamento **a** prestacao | Crase obrigatoria |
| depende de memoria | depende de mem**o**ria | Acento proparoxitona |
| quem ve o que | quem v**e** o que | Acento monossilabo tonico |
| Cada tecnico | Cada t**e**cnico | Acento proparoxitona |
| 5 estados (lista 4) | 5 estados (listar 5) | Consistencia factual |

## Fluxo de Auditoria

### Passo 1 — Identificar arquivos
Usar `Grep` para localizar todos os arquivos com texto em portugues no escopo.

### Passo 2 — Ler conteudo textual
Extrair apenas o texto visivel (ignorar HTML/JSX markup, classes CSS, atributos).

### Passo 3 — Aplicar checklist
Percorrer o checklist item a item, registrando cada erro encontrado com:
- **Arquivo e linha**
- **Texto errado** (exato)
- **Correcao proposta**
- **Regra violada** (referencia ao checklist)

### Passo 4 — Verificar consistencia cross-file
- Nomes de relatorios em `relatoriosConstants.js` devem bater com apresentacoes
- Labels em `constants.js` devem bater com componentes que os usam
- Contagens (ex: "6 modulos", "5 relatorios") devem bater com a realidade

### Passo 5 — Apresentar relatorio
Formato de saida:

```
## Auditoria de Texto — [nome do arquivo]

| # | Linha | Erro | Correcao | Regra |
|---|-------|------|----------|-------|
| 1 | 1520 | "relatorio profissional" | "relatorios profissionais" | Concordancia plural |
| 2 | 1652 | "relatorio em PDF" | "relatorios em PDF" | Concordancia plural |

**Total:** X erros encontrados
```

### Passo 6 — Aplicar correcoes
Usar `Edit` para corrigir cada erro. Commitar com prefixo `fix:` e descricao clara.

## Dicas

- **Nomes proprios de relatorios** devem ser verificados em `relatoriosConstants.js` (fonte canonica)
- **Status de pagamento** estao definidos em `constants.js` (STATUS_PAGAMENTO_DESPESA)
- Ao criar texto novo, preferir frases curtas e diretas
- Evitar gerundismo ("estamos fazendo" → "fazemos")
- Em titulos e headings, usar caixa de frase (so primeira palavra maiuscula), exceto nomes proprios
