
import React, { useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const TesteUsuarios = () => {
  const [resultado, setResultado] = useState('');
  const [loading, setLoading] = useState(false);

  const testarLeituraUsuarios = async () => {
    setLoading(true);
    setResultado('🔍 Iniciando teste...\n');

    try {
      // Teste 1: Ler todos os usuários da coleção "usuarios"
      console.log("📋 Teste 1: Lendo coleção 'usuarios'...");
      setResultado(prev => prev + "📋 Teste 1: Lendo coleção 'usuarios'...\n");

      const usuariosRef = collection(db, "usuarios");
      const snapshot = await getDocs(usuariosRef);

      setResultado(prev => prev + `✅ Encontrados ${snapshot.size} documentos\n`);

      if (snapshot.empty) {
        setResultado(prev => prev + "⚠️ COLEÇÃO VAZIA! Nenhum usuário encontrado.\n");
      } else {
        setResultado(prev => prev + "\n📋 USUÁRIOS ENCONTRADOS:\n");
        
        snapshot.docs.forEach((doc, index) => {
          const data = doc.data();
          setResultado(prev => prev + `\n--- Usuário ${index + 1} ---\n`);
          setResultado(prev => prev + `ID: ${doc.id}\n`);
          setResultado(prev => prev + `UID: ${data.uid || 'Não informado'}\n`);
          setResultado(prev => prev + `Email: ${data.email || 'Não informado'}\n`);
          setResultado(prev => prev + `Nome: ${data.nome || data.name || 'Não informado'}\n`);
          setResultado(prev => prev + `Tipo: ${data.tipo || data.role || 'Não informado'}\n`);
          setResultado(prev => prev + `Status: ${data.status || 'Não informado'}\n`);
          setResultado(prev => prev + `Município: ${data.municipio || 'Não informado'}\n`);
          setResultado(prev => prev + `UF: ${data.uf || 'Não informado'}\n`);
          setResultado(prev => prev + `Campos disponíveis: ${Object.keys(data).join(', ')}\n`);
        });
      }

      // Teste 2: Verificar usuários ativos
      console.log("📋 Teste 2: Filtrando usuários ativos...");
      setResultado(prev => prev + "\n📋 Teste 2: Filtrando usuários ativos...\n");

      const ativosQuery = query(usuariosRef, where("status", "==", "ativo"));
      const ativosSnapshot = await getDocs(ativosQuery);

      setResultado(prev => prev + `✅ Usuários ativos: ${ativosSnapshot.size}\n`);

      // Teste 3: Verificar usuários admin
      console.log("📋 Teste 3: Filtrando usuários admin...");
      setResultado(prev => prev + "\n📋 Teste 3: Filtrando usuários admin...\n");

      const adminQuery = query(usuariosRef, where("tipo", "==", "admin"));
      const adminSnapshot = await getDocs(adminQuery);

      setResultado(prev => prev + `✅ Usuários admin (campo 'tipo'): ${adminSnapshot.size}\n`);

      // Teste 3b: Verificar usuários admin com campo 'role'
      const adminRoleQuery = query(usuariosRef, where("role", "==", "admin"));
      const adminRoleSnapshot = await getDocs(adminRoleQuery);

      setResultado(prev => prev + `✅ Usuários admin (campo 'role'): ${adminRoleSnapshot.size}\n`);

      setResultado(prev => prev + "\n🎉 TESTE COMPLETO!\n");

    } catch (error) {
      console.error("❌ Erro no teste:", error);
      setResultado(prev => prev + `❌ ERRO: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };

  const limparResultado = () => {
    setResultado('');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>🧪 Teste de Leitura de Usuários</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testarLeituraUsuarios}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Testando...' : '🧪 Executar Teste'}
        </button>
        
        <button 
          onClick={limparResultado}
          style={{
            padding: '10px 20px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Limpar
        </button>
      </div>

      <div style={{
        backgroundColor: '#1e1e1e',
        color: '#fff',
        padding: '15px',
        borderRadius: '4px',
        minHeight: '300px',
        whiteSpace: 'pre-line',
        overflow: 'auto',
        maxHeight: '500px'
      }}>
        {resultado || 'Clique em "Executar Teste" para verificar a leitura dos usuários...'}
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>O que este teste verifica:</strong><br/>
        • Se a coleção "usuarios" existe e tem dados<br/>
        • Quantos usuários estão cadastrados<br/>
        • Estrutura dos dados de cada usuário<br/>
        • Filtros por status e tipo<br/>
        • Compatibilidade entre campos (tipo vs role)
      </div>
    </div>
  );
};

export default TesteUsuarios;
