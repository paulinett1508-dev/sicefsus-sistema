# Auditoria Firebase

Analise todas as interações com Firebase:

## 1. Queries
- Liste todas as queries (getDocs, getDoc, onSnapshot)
- Verifique índices necessários
- Identifique queries sem filtro de município (segurança)

## 2. Escritas
- Liste todos os addDoc, setDoc, updateDoc, deleteDoc
- Verifique se há validação antes da escrita
- Confirme atualização de campos calculados (saldo, percentual)

## 3. Listeners
- Liste todos os onSnapshot
- Verifique se têm cleanup no useEffect
- Identifique listeners duplicados

## 4. Regras
- Compare firestore.rules com queries do código
- Identifique possíveis falhas de segurança