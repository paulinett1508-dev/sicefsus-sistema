# Auditoria de HTML/JSX - Padronização de Telas

Analise todos os componentes React e verifique:

## 1. Estrutura de Páginas
- Todas as páginas têm header consistente?
- Breadcrumbs seguem mesmo padrão?
- Footers são padronizados?
- Espaçamentos entre seções são uniformes?

## 2. Componentes de UI
- Botões: mesmo estilo para mesma ação (salvar, cancelar, excluir)?
- Inputs: labels posicionados igualmente?
- Tabelas: headers e células com mesmo padding?
- Cards: bordas, sombras e cantos arredondados consistentes?
- Modais: tamanhos e posicionamentos padronizados?

## 3. Formulários
- Labels sempre acima ou ao lado (não misturado)?
- Campos obrigatórios marcados da mesma forma?
- Mensagens de erro no mesmo local?
- Botões de ação alinhados consistentemente?

## 4. Responsividade
- Breakpoints consistentes?
- Elementos colapsam da mesma forma?

## 5. Acessibilidade
- Todos os inputs têm labels?
- Imagens têm alt?
- Botões têm aria-labels quando necessário?

Gere relatório com:
- ✅ Padrões seguidos
- ⚠️ Inconsistências encontradas
- 📍 Arquivo e linha de cada problema
- 💡 Sugestão de padronização