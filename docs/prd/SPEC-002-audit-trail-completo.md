# SPEC-002: Audit Trail Completo para Operacoes

**Baseado em:** Requisitos identificados durante SPEC-001
**Data:** 18/01/2026
**Autor:** Claude Code

---

## Resumo Executivo

**Objetivo:** Implementar audit trail completo para todas as operacoes de despesas (CREATE/UPDATE), permitir que Gestor visualize logs do seu municipio, e garantir rastreabilidade com campos "como era", "alterado por", "como ficou".

**Arquivos Afetados:** 5 arquivos
**Complexidade:** 2/5

---

## Contexto

O sistema ja possui:
- `src/services/auditService.js` - Servico completo com `dataBefore`, `dataAfter`, `userEmail`, `userRole`
- `src/components/admin/LogsSection.jsx` - Componente de visualizacao de logs
- Logs em DELETE de despesas, emendas, naturezas e operacoes de usuarios

**Gaps identificados:**
1. CREATE despesa nao gera log
2. UPDATE despesa nao gera log
3. Gestor nao consegue ver logs (rota `/administracao` requer `admin`)

---

## Arquivos Afetados

### Modificar (arquivos existentes)

```
src/
├─ components/
│  ├─ DespesaForm.jsx                (~20 linhas) -> Adicionar audit logs
│  │  Responsabilidade: Logar CREATE e UPDATE de despesas
│  │
│  ├─ Sidebar.jsx                    (~5 linhas)  -> Adicionar link para Gestor
│  │  Responsabilidade: Menu de navegacao
│  │
│  └─ admin/LogsSection.jsx          (~10 linhas) -> Adicionar badge GESTOR
│     Responsabilidade: Exibir badge para tipo gestor
│
├─ App.jsx                           (~15 linhas) -> Nova rota /logs
│  Responsabilidade: Roteamento
│
└─ hooks/usePermissions.js           (~5 linhas)  -> Flag podeVerLogs
   Responsabilidade: Adicionar permissao para ver logs
```

### Criar (novos arquivos)

```
src/
└─ components/
   └─ logs/
      └─ LogsPage.jsx                (150 linhas) -> Pagina de logs para Gestor
         Responsabilidade: Wrapper que filtra logs por municipio do usuario
```

---

## Implementacao Detalhada

### 1. src/components/DespesaForm.jsx (MODIFICAR)

**Adicionar import no topo:**

```javascript
import { auditService } from "../services/auditService";
```

**Na funcao de salvar despesa (CREATE), adicionar apos sucesso:**

```javascript
// Apos criar despesa com sucesso
await auditService.logAction({
  action: "CREATE_DESPESA",
  resourceType: "despesa",
  resourceId: novaDespesaId,
  dataBefore: null,
  dataAfter: {
    valor: formData.valor,
    descricao: formData.descricao,
    fornecedor: formData.fornecedor,
    naturezaDespesa: formData.naturezaDespesa,
    status: formData.status,
    emendaId: formData.emendaId,
    municipio: formData.municipio,
    uf: formData.uf
  },
  user: usuario,
  metadata: {
    emendaNumero: emenda?.numero,
    naturezaCodigo: formData.naturezaDespesa
  }
});
```

**Na funcao de salvar despesa (UPDATE), adicionar apos sucesso:**

```javascript
// Apos atualizar despesa com sucesso
await auditService.logAction({
  action: "UPDATE_DESPESA",
  resourceType: "despesa",
  resourceId: despesaId,
  dataBefore: {
    valor: despesaOriginal.valor,
    descricao: despesaOriginal.descricao,
    fornecedor: despesaOriginal.fornecedor,
    status: despesaOriginal.status
  },
  dataAfter: {
    valor: formData.valor,
    descricao: formData.descricao,
    fornecedor: formData.fornecedor,
    status: formData.status
  },
  user: usuario,
  metadata: {
    emendaNumero: emenda?.numero,
    camposAlterados: Object.keys(changedFields)
  }
});
```

---

### 2. src/config/permissions.js (MODIFICAR)

**Adicionar flag `podeVerLogs` na matriz:**

```javascript
// Em superAdmin e admin
podeVerLogs: true,

// Em gestor
podeVerLogs: true,  // Pode ver logs do seu municipio

// Em operador
podeVerLogs: false, // Nao pode ver logs
```

---

### 3. src/components/logs/LogsPage.jsx (CRIAR - 150 linhas)

```javascript
// src/components/logs/LogsPage.jsx
// Pagina de logs acessivel para Admin e Gestor

import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import usePermissions from "../../hooks/usePermissions";
import { auditService } from "../../services/auditService";
import LogsSection from "../admin/LogsSection";

const LogsPage = () => {
  const { usuario } = useUser();
  const permissions = usePermissions(usuario);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: ""
  });

  // Carregar logs filtrados por municipio (para gestor)
  const carregarLogs = async () => {
    setLoading(true);
    try {
      const filtros = {};

      // Se for gestor, filtrar por municipio
      if (usuario.tipo === "gestor") {
        filtros.municipio = usuario.municipio;
        filtros.uf = usuario.uf;
      }

      const logsData = await auditService.getLogs({
        ...filtros,
        limit: 500
      });

      setLogs(logsData);
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLogs();
  }, [usuario]);

  // Verificar permissao
  if (!permissions.permissoes?.podeVerLogs) {
    return (
      <div style={styles.accessDenied}>
        <span className="material-symbols-outlined" style={{ fontSize: 48 }}>lock</span>
        <h2>Acesso Negado</h2>
        <p>Voce nao tem permissao para visualizar os logs do sistema.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, marginRight: 8 }}>assignment</span>
          Logs de Auditoria
        </h1>
        {usuario.tipo === "gestor" && (
          <div style={styles.filterBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>location_on</span>
            Filtrando: {usuario.municipio}/{usuario.uf?.toUpperCase()}
          </div>
        )}
      </div>

      <LogsSection
        logs={logs}
        logFilters={logFilters}
        setLogFilters={setLogFilters}
        onAtualizarLogs={carregarLogs}
        loading={loading}
      />
    </div>
  );
};

const styles = {
  container: {
    padding: "24px",
    maxWidth: "1400px",
    margin: "0 auto"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "var(--theme-text)",
    display: "flex",
    alignItems: "center",
    margin: 0
  },
  filterBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 16px",
    backgroundColor: "var(--warning-100)",
    color: "var(--warning-700)",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "500"
  },
  accessDenied: {
    textAlign: "center",
    padding: "80px 24px",
    color: "var(--theme-text-secondary)"
  }
};

export default LogsPage;
```

---

### 4. src/App.jsx (MODIFICAR)

**Adicionar import:**

```javascript
import LogsPage from "./components/logs/LogsPage";
```

**Adicionar rota (apos rota /administracao):**

```javascript
{/* Rota de Logs - Admin e Gestor */}
<Route
  path="/logs"
  element={
    <PrivateRoute usuario={usuario} requiredRole={["admin", "gestor"]}>
      <ProtectedRouteWrapper usuario={usuario}>
        <LogsPage />
      </ProtectedRouteWrapper>
    </PrivateRoute>
  }
/>
```

---

### 5. src/components/Sidebar.jsx (MODIFICAR)

**Adicionar item de menu para Gestor (apos Relatorios):**

```javascript
{/* Logs - visivel para Admin e Gestor */}
{(usuario?.tipo === "admin" || usuario?.tipo === "gestor") && (
  <NavItem
    to="/logs"
    icon="assignment"
    label="Logs"
    isActive={location.pathname === "/logs"}
  />
)}
```

---

### 6. src/components/admin/LogsSection.jsx (MODIFICAR)

**Adicionar badge GESTOR na coluna de usuario (linha ~441):**

```javascript
// Substituir a logica do badge
<span
  style={{
    fontSize: "10px",
    color: "var(--white)",
    backgroundColor:
      log.userRole === "admin" ? "var(--error)"
      : log.userRole === "gestor" ? "var(--warning)"
      : "var(--success)",
    padding: "4px 10px",
    borderRadius: "12px",
    textTransform: "uppercase",
    fontWeight: "bold",
    display: "inline-block"
  }}
>
  {log.userRole === "admin" ? (
    <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>workspace_premium</span> ADMIN</>
  ) : log.userRole === "gestor" ? (
    <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>supervised_user_circle</span> GESTOR</>
  ) : (
    <><span className="material-symbols-outlined" style={{ fontSize: 10, marginRight: 2, verticalAlign: "middle" }}>person</span> OPERADOR</>
  )}
</span>
```

---

## Checklist de Implementacao

### Fase 1: Audit em Despesas
- [ ] Adicionar import do auditService em DespesaForm.jsx
- [ ] Implementar log em CREATE despesa
- [ ] Implementar log em UPDATE despesa
- [ ] Testar criacao e edicao de despesa

### Fase 2: Acesso de Gestor
- [ ] Adicionar flag `podeVerLogs` em permissions.js
- [ ] Criar componente LogsPage.jsx
- [ ] Adicionar rota /logs em App.jsx
- [ ] Adicionar item no Sidebar.jsx
- [ ] Atualizar badge em LogsSection.jsx

### Fase 3: Validacao
- [ ] Testar como Admin - deve ver todos os logs
- [ ] Testar como Gestor - deve ver apenas logs do seu municipio
- [ ] Testar como Operador - nao deve ter acesso a /logs
- [ ] Verificar que CREATE/UPDATE despesa gera log com dataBefore/dataAfter

---

## Casos de Teste

### 1. Operador cria despesa

**Entrada:**
```javascript
usuario = { tipo: 'operador', municipio: 'Fortaleza', uf: 'CE' }
acao = 'criar despesa de R$ 1.000'
```

**Saida Esperada:**
```javascript
// Log gerado:
{
  action: "CREATE_DESPESA",
  userEmail: "operador@test.com",
  userRole: "operador",
  dataBefore: null,
  dataAfter: { valor: 1000, descricao: "...", ... }
}
```

### 2. Gestor visualiza logs

**Entrada:**
```javascript
usuario = { tipo: 'gestor', municipio: 'Fortaleza', uf: 'CE' }
rota = '/logs'
```

**Saida Esperada:**
- Pagina carrega com sucesso
- Apenas logs de Fortaleza/CE sao exibidos
- Badge "Filtrando: Fortaleza/CE" visivel

### 3. Operador tenta acessar /logs

**Entrada:**
```javascript
usuario = { tipo: 'operador' }
rota = '/logs'
```

**Saida Esperada:**
- Mensagem "Acesso Negado"
- Nao exibe logs

---

## Criterios de Aceitacao

### Funcionalidade
- [ ] Toda criacao de despesa gera log com dataAfter
- [ ] Toda edicao de despesa gera log com dataBefore e dataAfter
- [ ] Admin ve todos os logs do sistema
- [ ] Gestor ve apenas logs do seu municipio
- [ ] Operador nao tem acesso a pagina de logs
- [ ] Sidebar mostra link "Logs" para Admin e Gestor

### Qualidade
- [ ] Codigo segue padroes do projeto
- [ ] Sem duplicacao de codigo
- [ ] Arquivos respeitam limite de 200 linhas

### Seguranca
- [ ] Gestor nao consegue ver logs de outros municipios
- [ ] Operador nao consegue acessar rota /logs

---

## Metricas de Qualidade

### Arquitetura:
- **Arquivos novos:** 1 (LogsPage.jsx)
- **Arquivos modificados:** 5
- **Total de linhas:** ~200 novas/alteradas
- **Maior arquivo:** LogsPage.jsx (150 linhas)

### Complexidade:
- **Complexidade ciclomatica:** Baixa
- **Acoplamento:** Baixo (reutiliza LogsSection existente)
- **Coesao:** Alta

---

## Pontos de Atencao

### 1. Performance
- **Atencao:** Gestor pode ter muitos logs se municipio for grande
- **Mitigacao:** Manter limite de 500 logs, adicionar paginacao futura

### 2. DespesaForm
- **Desafio:** Identificar onde esta a logica de CREATE vs UPDATE
- **Abordagem:** Buscar por `addDoc` e `updateDoc` no componente

### 3. PrivateRoute com array
- **Verificar:** Se PrivateRoute aceita `requiredRole={["admin", "gestor"]}`
- **Alternativa:** Criar `requiredRoles` como prop separada

---

## Fluxo de Implementacao Recomendado

### Ordem Sugerida:

1. **Modificar permissions.js primeiro**
   - Adicionar flag `podeVerLogs`
   - Baixo risco, nao quebra nada

2. **Criar LogsPage.jsx**
   - Componente isolado
   - Pode testar independentemente

3. **Modificar App.jsx e Sidebar.jsx**
   - Adicionar rota e menu
   - Testar navegacao

4. **Modificar DespesaForm.jsx**
   - Adicionar audit logs
   - Testar CREATE e UPDATE

5. **Modificar LogsSection.jsx**
   - Adicionar badge GESTOR
   - Ajuste visual apenas

---

## Referencias

- **SPEC-001:** `docs/prd/SPEC-001-permissoes-granulares.md`
- **auditService:** `src/services/auditService.js`
- **LogsSection:** `src/components/admin/LogsSection.jsx`

---

## Proximo Passo

Abra NOVA SESSAO no Claude Code e execute:

```
"Implemente SPEC-002-audit-trail-completo.md"
```

**Tempo estimado:** 20-30 minutos
