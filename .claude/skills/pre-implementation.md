# Pre-Implementation — 5 Perguntas Antes de Codar

Checklist essencial antes de escrever codigo novo.
Previne overengineering, duplicacao e monolitos.

Adaptado do agnostic-core (MIT). Fonte: skills/audit/pre-implementation.md

---

## AS 5 PERGUNTAS

### 1. Simplicidade — Existe solucao mais simples?
- [ ] A abordagem mais simples foi considerada?
- [ ] Cada abstracao serve multiplos propositos?
- [ ] A solucao corresponde ao escopo do problema?
- [ ] Um dev junior consegue manter este codigo?
- [ ] Menos de 3 dependencias novas?

### 2. Reusabilidade — Ja existe no projeto?
- [ ] Busquei funcao similar no codebase (`grep -rn "funcao" src/`)
- [ ] Verifiquei utils existentes (`src/utils/`)
- [ ] Verifiquei hooks existentes (`src/hooks/`)
- [ ] Nao existe duplicata do que vou criar

### 3. Documentacao — Consultei a documentacao?
- [ ] Li docs oficiais da linguagem/framework
- [ ] Verifiquei metodos nativos disponiveis
- [ ] Verifiquei libs ja instaladas que resolvem o problema
- [ ] Entendi o comportamento esperado

### 4. Modularidade — Arquivo nao vai ficar monolitico?
- [ ] Arquivo fica abaixo de 300 linhas
- [ ] Funcao/componente tem responsabilidade unica
- [ ] Logica separada: queries vs negocio vs apresentacao
- [ ] Testavel isoladamente

### 5. Impacto — Sei o que sera afetado?
- [ ] Identifiquei arquivos afetados (`grep -rn "import.*modulo" src/`)
- [ ] Testes existentes cobrem as mudancas
- [ ] Rollback e viavel (commits atomicos)

---

## PADROES SUSPEITOS

| Frase | Anti-pattern |
|-------|-------------|
| "Vou criar uma classe base generica..." | Overengineering |
| "Vou copiar e ajustar esse bloco..." | Duplicacao |
| "Vou testar depois..." | Risco de regressao |
| "Esse arquivo ta grande mas..." | Monolito |

---

## VERIFICACAO RAPIDA

```bash
# Buscar funcao similar
grep -rn "nomeFunc" src/

# Verificar tamanho do arquivo
wc -l src/arquivo.js

# Ver quem usa este modulo
grep -rn "import.*modulo" src/

# Verificar metodos nativos
# → MDN, React docs, Firebase docs
```

---

## Principios

- **YAGNI**: Nao implemente o que nao foi pedido
- **DRY**: Nao repita codigo existente
- **SRP**: Uma responsabilidade por funcao/componente
