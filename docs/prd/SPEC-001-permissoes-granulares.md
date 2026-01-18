# SPEC-001: Sistema de Permissoes Granulares

**Baseado em:** PRD-001-permissoes-granulares.md
**Data:** 18/01/2026
**Autor:** Claude Code

---

## Resumo Executivo

**Objetivo:** Implementar RBAC com 4 perfis (SuperAdmin, Admin, Gestor, Operador), corrigir inconsistencias nas permissoes client-side e server-side, e usar Firebase Custom Claims.

**Arquivos Afetados:** 7 arquivos
**Complexidade:** 3/5

---

## Arquivos Afetados

### Criar (novos arquivos)

```
src/
└─ config/
   └─ permissions.js                 (80 linhas)  -> Constantes centralizadas
      Responsabilidade: Single source of truth para permissoes por perfil
      Exports: ROLES, PERMISSIONS, getPermissionsByRole()

scripts/
└─ sync-auth-claims.cjs              (100 linhas) -> Sincronizacao de claims
   Responsabilidade: Sincronizar custom claims do Firebase Auth
   Exports: syncUserClaims(), syncAllUsers()
```

### Modificar (arquivos existentes)

```
src/
├─ utils/validators.js               (+2 linhas)   -> Adicionar "gestor"
│  Linha 163: Adicionar "gestor" ao array
│  Linha 183: Sincronizar com validateUserTipo
│
├─ hooks/usePermissions.js           (~30 linhas)  -> Corrigir permissoes operador
│  Linha 106-127: Adicionar flags novas
│  Linha 115: Mudar podeDeletarDespesas para FALSE
│
├─ services/userService.js           (~10 linhas)  -> Padronizar tipo/role
│  Linha 161-166: Usar apenas "tipo"
│
└─ context/UserContext.jsx           (+5 linhas)   -> Propagar superAdmin
   (verificar propagacao de isSuperAdmin)

firestore.rules                      (~25 linhas)  -> Corrigir regras
│  Linha 73-76: Bloquear CREATE para operador em emendas
│  Linha 99-102: Adicionar filtro de localizacao em despesas
│  Linha 138-141: Bloquear CREATE para operador em naturezas
```

---

## Dependencias

### Instalar:
Nenhuma dependencia nova necessaria.

---

## Implementacao Detalhada

### 1. src/config/permissions.js (NOVO - 80 linhas)

**Responsabilidade:** Centralizar constantes de permissoes e roles

**Estrutura do Arquivo:**

```javascript
// Imports (linhas 1-5)
// Nenhum import necessario

// Roles disponiveis (linhas 7-15)
export const ROLES = {
  SUPER_ADMIN: 'superAdmin',
  ADMIN: 'admin',
  GESTOR: 'gestor',
  OPERADOR: 'operador'
};

// Tipos validos para validacao (linhas 17-20)
export const TIPOS_USUARIO_VALIDOS = ['admin', 'gestor', 'operador'];

// Matriz de permissoes por role (linhas 22-70)
export const PERMISSIONS = {
  superAdmin: {
    acessoTotal: true,
    acessoFerramentasDev: true,
    podeGerenciarUsuarios: true,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    filtroLocalizacao: false
  },
  admin: {
    acessoTotal: true,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: true,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    filtroLocalizacao: false
  },
  gestor: {
    acessoTotal: false,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: false,
    podeCriarEmendas: true,
    podeEditarEmendas: true,
    podeDeletarEmendas: true,
    podeCriarNaturezas: true,
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: true,
    filtroLocalizacao: true
  },
  operador: {
    acessoTotal: false,
    acessoFerramentasDev: false,
    podeGerenciarUsuarios: false,
    podeCriarEmendas: false,      // <-- BLOQUEADO
    podeEditarEmendas: true,
    podeDeletarEmendas: false,    // <-- BLOQUEADO
    podeCriarNaturezas: false,    // <-- BLOQUEADO
    podeCriarDespesas: true,
    podeEditarDespesas: true,
    podeDeletarDespesas: false,   // <-- BLOQUEADO
    filtroLocalizacao: true
  }
};

// Funcao helper (linhas 72-80)
export const getPermissionsByRole = (role) => {
  return PERMISSIONS[role] || PERMISSIONS.operador;
};

export default { ROLES, PERMISSIONS, TIPOS_USUARIO_VALIDOS, getPermissionsByRole };
```

---

### 2. src/utils/validators.js (MODIFICAR - +2 linhas)

**Linha 163:** Adicionar "gestor" ao array

```javascript
// ANTES (linha 163)
  const tiposValidos = ["admin", "operador"]; // APENAS DOIS TIPOS VALIDOS

// DEPOIS (linha 163)
  const tiposValidos = ["admin", "gestor", "operador"]; // TRES TIPOS VALIDOS
```

**Linha 183:** Sincronizar com validateUserTipo

```javascript
// ANTES (linha 183)
  const rolesValidos = ["admin", "user", "operador"];

// DEPOIS (linha 183)
  const rolesValidos = ["admin", "gestor", "operador"];
```

---

### 3. src/hooks/usePermissions.js (MODIFICAR - ~30 linhas)

**Linha 1-9:** Adicionar import

```javascript
// ANTES (linha 4)
import {

// DEPOIS (linha 4)
import { PERMISSIONS, getPermissionsByRole } from '../config/permissions';
import {
```

**Linha 106-127:** Adicionar novas flags e corrigir valores OPERADOR

```javascript
// ANTES (linha 106-124)
      const permissoesOperador = {
        acessoTotal: false,
        filtroAplicado: true,
        semAcesso: false,
        temAcessoSistema: true,
        podeGerenciarUsuarios: false,
        podeGerenciarDespesas: true,
        podeCriarDespesas: true,
        podeEditarDespesas: true,
        podeDeletarDespesas: true,          // <-- ERRADO
        podeExecutarDespesas: true,
        podeEditarEmendas: true,
        podeDeletarEmendas: false,
        // ... resto

// DEPOIS (linha 106-130)
      const basePermissions = getPermissionsByRole('operador');
      const permissoesOperador = {
        acessoTotal: false,
        filtroAplicado: true,
        semAcesso: false,
        temAcessoSistema: true,
        podeGerenciarUsuarios: false,
        podeGerenciarDespesas: true,
        podeCriarDespesas: basePermissions.podeCriarDespesas,      // true
        podeEditarDespesas: basePermissions.podeEditarDespesas,    // true
        podeDeletarDespesas: basePermissions.podeDeletarDespesas,  // FALSE
        podeExecutarDespesas: true,
        podeCriarEmendas: basePermissions.podeCriarEmendas,        // FALSE (NOVO)
        podeEditarEmendas: basePermissions.podeEditarEmendas,      // true
        podeDeletarEmendas: basePermissions.podeDeletarEmendas,    // false
        podeCriarNaturezas: basePermissions.podeCriarNaturezas,    // FALSE (NOVO)
        // ... resto
```

**Linha 58-77:** Adicionar novas flags para GESTOR

```javascript
// ANTES (linha 58-74)
        const permissoesGestor = {
          acessoTotal: false,
          filtroAplicado: true,
          // ...

// DEPOIS (linha 58-78)
        const basePermissions = getPermissionsByRole('gestor');
        const permissoesGestor = {
          acessoTotal: false,
          filtroAplicado: true,
          semAcesso: false,
          temAcessoSistema: true,
          podeGerenciarUsuarios: basePermissions.podeGerenciarUsuarios,  // false
          podeGerenciarDespesas: true,
          podeCriarDespesas: basePermissions.podeCriarDespesas,          // true
          podeEditarDespesas: basePermissions.podeEditarDespesas,        // true
          podeDeletarDespesas: basePermissions.podeDeletarDespesas,      // true
          podeExecutarDespesas: true,
          podeCriarEmendas: basePermissions.podeCriarEmendas,            // true (NOVO)
          podeEditarEmendas: basePermissions.podeEditarEmendas,          // true
          podeDeletarEmendas: basePermissions.podeDeletarEmendas,        // true
          podeCriarNaturezas: basePermissions.podeCriarNaturezas,        // true (NOVO)
          // ... resto
```

---

### 4. firestore.rules (MODIFICAR - ~25 linhas)

**Linha 73-76:** Bloquear CREATE para operador em emendas

```javascript
// ANTES (linha 72-76)
      // CRIAR: Admin sem restricao, Gestor/Operador com validacao
      allow create: if isAuthenticated() && (
        isAdmin() ||
        ((isGestor() || isOperador()) && matchesUserLocation(request.resource.data))
      );

// DEPOIS (linha 72-76)
      // CRIAR: Admin e Gestor podem criar, Operador NAO
      allow create: if isAuthenticated() && (
        isAdmin() ||
        (isGestor() && matchesUserLocation(request.resource.data))
      );
```

**Linha 99-102:** Adicionar filtro de localizacao na leitura de despesas

```javascript
// ANTES (linha 99-102)
      // Gestor/Operador: Leitura permitida se autenticado
      allow read: if isAuthenticated() && (
        isGestor() || isOperador()
      );

// DEPOIS (linha 99-105)
      // Gestor/Operador: Leitura permitida apenas do seu municipio
      allow read: if isAuthenticated() && (
        (isGestor() || isOperador()) && (
          !resource.data.keys().hasAny(['municipio']) ||
          matchesUserLocation(resource.data)
        )
      );
```

**Linha 118-121:** Bloquear DELETE de despesas para operador

```javascript
// ANTES (linha 118-121)
      // Apenas Admin e Gestor podem excluir
      allow delete: if isAuthenticated() && (
        isAdmin() || isGestor()
      );

// DEPOIS (linha 118-122)
      // Apenas Admin e Gestor podem excluir (com validacao de localizacao)
      allow delete: if isAuthenticated() && (
        isAdmin() ||
        (isGestor() && matchesUserLocation(resource.data))
      );
```

**Linha 138-141:** Bloquear CREATE de naturezas para operador

```javascript
// ANTES (linha 137-141)
      // Criar natureza: Admin sem restricao, outros validam localizacao
      allow create: if isAuthenticated() && (
        isAdmin() ||
        ((isGestor() || isOperador()) && matchesUserLocation(request.resource.data))
      );

// DEPOIS (linha 137-141)
      // Criar natureza: Admin e Gestor podem criar, Operador NAO
      allow create: if isAuthenticated() && (
        isAdmin() ||
        (isGestor() && matchesUserLocation(request.resource.data))
      );
```

---

### 5. src/services/userService.js (MODIFICAR - ~10 linhas)

**Linha 161-166:** Padronizar para usar apenas "tipo"

```javascript
// ANTES (linha 161-166)
    const tipoUsuario = userData.role === "admin" ? "admin"
                      : userData.role === "gestor" ? "gestor"
                      : "operador";

    const userDoc = {
      // ...
      tipo: tipoUsuario,
      role: tipoUsuario,  // <-- DUPLICADO

// DEPOIS (linha 161-166)
    const tipoUsuario = userData.role === "admin" ? "admin"
                      : userData.role === "gestor" ? "gestor"
                      : "operador";

    const userDoc = {
      // ...
      tipo: tipoUsuario,
      // role: removido - usar apenas "tipo"
```

---

### 6. scripts/sync-auth-claims.cjs (NOVO - 100 linhas)

**Responsabilidade:** Sincronizar custom claims do Firebase Auth com dados do Firestore

```javascript
// ============================================
// scripts/sync-auth-claims.cjs
// Sincroniza custom claims do Firebase Auth
// ============================================

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const credPath = path.join(__dirname, '../firebase-migration/prod-credentials.json');
const serviceAccount = require(credPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

/**
 * Sincroniza claims de um usuario especifico
 */
async function syncUserClaims(uid) {
  try {
    const userDoc = await db.collection('usuarios').doc(uid).get();

    if (!userDoc.exists) {
      console.log(`Usuario ${uid} nao encontrado no Firestore`);
      return false;
    }

    const userData = userDoc.data();
    const claims = {
      tipo: userData.tipo || 'operador',
      superAdmin: userData.superAdmin === true,
      municipio: userData.municipio || null,
      uf: userData.uf || null
    };

    await auth.setCustomUserClaims(uid, claims);
    console.log(`Claims atualizados para ${userData.email}: ${JSON.stringify(claims)}`);
    return true;
  } catch (error) {
    console.error(`Erro ao sincronizar claims de ${uid}:`, error.message);
    return false;
  }
}

/**
 * Sincroniza claims de todos os usuarios
 */
async function syncAllUsers() {
  console.log('Iniciando sincronizacao de todos os usuarios...\n');

  const usersSnapshot = await db.collection('usuarios').get();
  let sucesso = 0;
  let falha = 0;

  for (const doc of usersSnapshot.docs) {
    const result = await syncUserClaims(doc.id);
    if (result) sucesso++;
    else falha++;
  }

  console.log(`\nSincronizacao concluida: ${sucesso} sucesso, ${falha} falha`);
}

// Executar se chamado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === '--uid' && args[1]) {
    syncUserClaims(args[1]).then(() => process.exit(0));
  } else if (args[0] === '--all') {
    syncAllUsers().then(() => process.exit(0));
  } else {
    console.log('Uso:');
    console.log('  node sync-auth-claims.cjs --uid <USER_ID>  # Sincronizar usuario especifico');
    console.log('  node sync-auth-claims.cjs --all            # Sincronizar todos');
    process.exit(1);
  }
}

module.exports = { syncUserClaims, syncAllUsers };
```

---

## Checklist de Implementacao

### Fase 1: Preparacao
- [ ] PRD-001 foi lido e compreendido
- [ ] Arquivos afetados foram identificados
- [ ] Backup do firestore.rules atual

### Fase 2: Criacao de Novos Arquivos
- [ ] Criar `src/config/permissions.js`
- [ ] Criar `scripts/sync-auth-claims.cjs`

### Fase 3: Modificacao de Arquivos Existentes
- [ ] Modificar `src/utils/validators.js` (adicionar "gestor")
- [ ] Modificar `src/hooks/usePermissions.js` (flags + valores)
- [ ] Modificar `src/services/userService.js` (remover "role")

### Fase 4: Firestore Rules (ALTO RISCO)
- [ ] Testar Rules em ambiente DEV primeiro
- [ ] Modificar `firestore.rules` (bloquear operador)
- [ ] Deploy em DEV e testar exaustivamente
- [ ] Aprovar e fazer deploy em PROD

### Fase 5: Custom Claims (Opcional)
- [ ] Executar `scripts/sync-auth-claims.cjs --all`
- [ ] Verificar claims no Firebase Console
- [ ] Atualizar Rules para usar `request.auth.token`

### Fase 6: Validacao
- [ ] Todos arquivos < 200 linhas
- [ ] Single responsibility respeitado
- [ ] Sem duplicacao de codigo
- [ ] Testar como Admin, Gestor e Operador

---

## Casos de Teste

### 1. Happy Path - Admin cria emenda

**Entrada:**
```javascript
usuario = { tipo: 'admin', email: 'admin@test.com' }
acao = 'criar emenda'
```

**Saida Esperada:**
```javascript
{ permitido: true, motivo: 'Admin tem acesso total' }
```

### 2. Operador tenta criar emenda (BLOQUEADO)

**Entrada:**
```javascript
usuario = { tipo: 'operador', municipio: 'Fortaleza', uf: 'CE' }
acao = 'criar emenda'
```

**Saida Esperada:**
```javascript
{ permitido: false, motivo: 'Operador nao pode criar emendas' }
// Firestore Rules: PERMISSION_DENIED
```

### 3. Operador tenta deletar despesa (BLOQUEADO)

**Entrada:**
```javascript
usuario = { tipo: 'operador', municipio: 'Fortaleza', uf: 'CE' }
acao = 'deletar despesa'
```

**Saida Esperada:**
```javascript
{ permitido: false, motivo: 'Operador nao pode deletar despesas' }
// Firestore Rules: PERMISSION_DENIED
```

### 4. Gestor deleta emenda do seu municipio (PERMITIDO)

**Entrada:**
```javascript
usuario = { tipo: 'gestor', municipio: 'Fortaleza', uf: 'CE' }
emenda = { municipio: 'Fortaleza', uf: 'CE' }
acao = 'deletar emenda'
```

**Saida Esperada:**
```javascript
{ permitido: true, motivo: 'Gestor pode deletar emendas do seu municipio' }
```

### 5. Gestor tenta deletar emenda de OUTRO municipio (BLOQUEADO)

**Entrada:**
```javascript
usuario = { tipo: 'gestor', municipio: 'Fortaleza', uf: 'CE' }
emenda = { municipio: 'Sobral', uf: 'CE' }
acao = 'deletar emenda'
```

**Saida Esperada:**
```javascript
{ permitido: false, motivo: 'Gestor nao pode deletar emendas de outro municipio' }
// Firestore Rules: PERMISSION_DENIED
```

---

## Criterios de Aceitacao (do PRD)

### Funcionalidade
- [ ] SuperAdmin acessa ferramentas dev, admin nao
- [ ] Admin pode criar usuarios, gestor/operador nao
- [ ] Gestor pode deletar emendas/despesas do seu municipio
- [ ] Operador pode APENAS criar despesas e editar emendas do seu municipio
- [ ] Operador NAO pode criar emendas, naturezas ou deletar nada
- [ ] Filtro de localizacao funciona para gestor/operador
- [ ] Validacao server-side (Rules) consistente com client-side (hooks)

### Qualidade
- [ ] Codigo segue padroes do projeto
- [ ] Sem duplicacao de codigo (DRY)
- [ ] Arquivos respeitam limite de 200 linhas
- [ ] Single Responsibility por arquivo

### Seguranca
- [ ] Nenhum usuario consegue acessar dados fora do seu escopo
- [ ] Firestore Rules bloqueiam operacoes nao permitidas
- [ ] Testes de penetracao basicos passam

### Retrocompatibilidade
- [ ] Usuarios existentes continuam funcionando
- [ ] Dados existentes nao sao afetados
- [ ] Nenhum logout forcado durante migracao

---

## Metricas de Qualidade

### Arquitetura:
- **Arquivos novos:** 2
- **Arquivos modificados:** 5
- **Total de linhas:** ~180 novas/alteradas
- **Maior arquivo:** permissions.js (80 linhas)

### Complexidade:
- **Complexidade ciclomatica:** Media
- **Acoplamento:** Baixo (permissions.js e independente)
- **Coesao:** Alta

---

## Pontos de Atencao

### 1. firestore.rules
- **Atencao:** Alteracoes podem bloquear operacoes legitimas
- **Mitigacao:** Testar EXAUSTIVAMENTE em DEV antes de PROD. Manter backup.

### 2. Dados Existentes
- **Risco:** Usuarios com campo `role` mas sem `tipo`
- **Solucao:** userService.js ja normaliza, mas verificar dados antigos

### 3. Custom Claims
- **Desafio:** Claims nao atualizam automaticamente
- **Abordagem:** Executar script apos criar/atualizar usuarios

---

## Fluxo de Implementacao Recomendado

### Ordem Sugerida:

1. **Criar permissions.js primeiro**
   - Define constantes centralizadas
   - Nao tem dependencias
   - Pode ser testado isoladamente

2. **Atualizar validators.js**
   - Mudanca simples (2 linhas)
   - Baixo risco

3. **Atualizar usePermissions.js**
   - Importar de permissions.js
   - Corrigir valores de operador
   - Testar no frontend

4. **Atualizar userService.js**
   - Remover campo duplicado "role"
   - Baixo risco

5. **Atualizar firestore.rules (DEV)**
   - Testar todas as operacoes
   - Verificar bloqueios esperados

6. **Criar sync-auth-claims.cjs**
   - Script opcional para custom claims
   - Executar apos validacao

7. **Deploy firestore.rules (PROD)**
   - Apenas apos validacao completa em DEV

---

## Referencias

- **PRD-001:** `docs/prd/PRD-001-permissoes-granulares.md`
- **Guia Desenvolvedor:** `docs/GUIA_DESENVOLVEDOR.md`
- **Firebase Security Rules:** https://firebase.google.com/docs/rules
- **Firebase Custom Claims:** https://firebase.google.com/docs/auth/admin/custom-claims

---

## Proximo Passo

Abra NOVA SESSAO no Claude Code e execute:

```
"Implemente SPEC-001-permissoes-granulares.md seguindo a Fase 1"
```

**IMPORTANTE:** Implementar em fases incrementais para reduzir risco.
