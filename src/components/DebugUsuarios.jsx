
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const DebugUsuarios = () => {
  const [debugInfo, setDebugInfo] = useState({
    usuarios: [],
    colecoes: [],
    erros: [],
    loading: true
  });

  useEffect(() => {
    const debugarSistema = async () => {
      const info = {
        usuarios: [],
        colecoes: [],
        erros: [],
        loading: false
      };

      try {
        console.log("🔍 === DEBUG: INICIANDO ANÁLISE COMPLETA ===");

        // 1. Verificar coleções existentes
        try {
          const colecoesParaTestar = ['usuarios', 'users', 'user'];
          
          for (const nomeColecao of colecoesParaTestar) {
            try {
              const colRef = collection(db, nomeColecao);
              const snapshot = await getDocs(colRef);
              
              const dados = {
                nome: nomeColecao,
                existe: !snapshot.empty,
                quantidade: snapshot.size,
                documentos: []
              };

              if (!snapshot.empty) {
                snapshot.docs.forEach(doc => {
                  const data = doc.data();
                  dados.documentos.push({
                    id: doc.id,
                    uid: data.uid,
                    email: data.email,
                    nome: data.nome || data.name || 'Não informado',
                    tipo: data.tipo || data.role || 'Não informado',
                    status: data.status || 'Não informado',
                    municipio: data.municipio || 'Não informado',
                    uf: data.uf || 'Não informado',
                    camposOriginais: Object.keys(data)
                  });
                });
              }

              info.colecoes.push(dados);
              console.log(`📋 Coleção "${nomeColecao}":`, dados);
            } catch (error) {
              console.warn(`⚠️ Erro ao acessar coleção "${nomeColecao}":`, error);
              info.erros.push(`Coleção ${nomeColecao}: ${error.message}`);
            }
          }
        } catch (error) {
          console.error("❌ Erro ao verificar coleções:", error);
          info.erros.push("Erro geral ao verificar coleções: " + error.message);
        }

        // 2. Testar função de carregamento atual
        try {
          console.log("🔄 Testando função de carregamento atual...");
          const usuariosRef = collection(db, "usuarios");
          const snapshot = await getDocs(usuariosRef);

          const usuariosProcessados = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              uid: data.uid || doc.id,
              email: data.email,
              nome: data.nome || data.name || "Nome não informado",
              tipo: data.tipo || data.role || "operador",
              status: data.status || "ativo",
              departamento: data.departamento || "",
              telefone: data.telefone || "",
              municipio: data.municipio || "",
              uf: data.uf || "",
              ultimoAcesso: data.ultimoAcesso || data.ultimo_acesso,
              criadoEm: data.criadoEm || data.data_criacao,
              processamentoOk: true,
              camposOriginais: Object.keys(data),
              ...data,
            };
          });

          info.usuarios = usuariosProcessados;
          console.log(`✅ Processados ${usuariosProcessados.length} usuários com sucesso`);
        } catch (error) {
          console.error("❌ Erro na função de carregamento:", error);
          info.erros.push("Erro na função de carregamento: " + error.message);
        }

        // 3. Verificar usuários específicos do Auth
        try {
          console.log("🔐 Verificando integração com Auth...");
          // Aqui você pode adicionar verificações específicas se necessário
        } catch (error) {
          console.error("❌ Erro ao verificar Auth:", error);
          info.erros.push("Erro ao verificar Auth: " + error.message);
        }

      } catch (error) {
        console.error("❌ Erro geral no debug:", error);
        info.erros.push("Erro geral: " + error.message);
      }

      setDebugInfo(info);
      console.log("🔍 === DEBUG: ANÁLISE COMPLETA ===", info);
    };

    debugarSistema();
  }, []);

  if (debugInfo.loading) {
    return <div style={{padding: '20px'}}>🔍 Analisando sistema...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#f5f5f5' }}>
      <h2>🔍 Debug do Sistema de Usuários</h2>
      
      {/* Erros */}
      {debugInfo.erros.length > 0 && (
        <div style={{ backgroundColor: '#ffebee', padding: '10px', marginBottom: '20px', borderRadius: '4px' }}>
          <h3>❌ Erros Encontrados:</h3>
          {debugInfo.erros.map((erro, index) => (
            <div key={index} style={{ color: 'red', marginBottom: '5px' }}>
              • {erro}
            </div>
          ))}
        </div>
      )}

      {/* Coleções */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📋 Análise das Coleções:</h3>
        {debugInfo.colecoes.map((colecao, index) => (
          <div key={index} style={{ 
            backgroundColor: colecao.existe ? '#e8f5e8' : '#fff3e0', 
            padding: '10px', 
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            <strong>{colecao.nome}</strong>: 
            {colecao.existe ? (
              <span style={{ color: 'green' }}> ✅ {colecao.quantidade} documentos</span>
            ) : (
              <span style={{ color: 'orange' }}> ⚠️ Coleção vazia ou inexistente</span>
            )}
            
            {colecao.documentos.length > 0 && (
              <details style={{ marginTop: '10px' }}>
                <summary>Ver documentos ({colecao.documentos.length})</summary>
                {colecao.documentos.map((doc, docIndex) => (
                  <div key={docIndex} style={{ 
                    backgroundColor: 'white', 
                    padding: '8px', 
                    margin: '5px 0',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <div><strong>ID:</strong> {doc.id}</div>
                    <div><strong>UID:</strong> {doc.uid || 'Não informado'}</div>
                    <div><strong>Email:</strong> {doc.email || 'Não informado'}</div>
                    <div><strong>Nome:</strong> {doc.nome}</div>
                    <div><strong>Tipo:</strong> {doc.tipo}</div>
                    <div><strong>Status:</strong> {doc.status}</div>
                    <div><strong>Município:</strong> {doc.municipio}</div>
                    <div><strong>UF:</strong> {doc.uf}</div>
                    <div><strong>Campos originais:</strong> {doc.camposOriginais.join(', ')}</div>
                  </div>
                ))}
              </details>
            )}
          </div>
        ))}
      </div>

      {/* Usuários processados */}
      <div>
        <h3>👥 Usuários Processados pela Função Atual ({debugInfo.usuarios.length}):</h3>
        {debugInfo.usuarios.length === 0 ? (
          <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee' }}>
            ⚠️ Nenhum usuário foi carregado pela função atual!
          </div>
        ) : (
          <div>
            {debugInfo.usuarios.map((usuario, index) => (
              <div key={index} style={{ 
                backgroundColor: 'white', 
                padding: '10px', 
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <div><strong>ID:</strong> {usuario.id}</div>
                <div><strong>UID:</strong> {usuario.uid}</div>
                <div><strong>Email:</strong> {usuario.email}</div>
                <div><strong>Nome:</strong> {usuario.nome}</div>
                <div><strong>Tipo:</strong> {usuario.tipo}</div>
                <div><strong>Status:</strong> {usuario.status}</div>
                <div><strong>Município:</strong> {usuario.municipio}</div>
                <div><strong>UF:</strong> {usuario.uf}</div>
                <div><strong>Último Acesso:</strong> {usuario.ultimoAcesso ? 'Sim' : 'Não'}</div>
                <div><strong>Criado Em:</strong> {usuario.criadoEm ? 'Sim' : 'Não'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px' }}>
        <h4>📊 Resumo:</h4>
        <div>• Total de coleções verificadas: {debugInfo.colecoes.length}</div>
        <div>• Coleções com dados: {debugInfo.colecoes.filter(c => c.existe).length}</div>
        <div>• Usuários processados: {debugInfo.usuarios.length}</div>
        <div>• Erros encontrados: {debugInfo.erros.length}</div>
      </div>
    </div>
  );
};

export default DebugUsuarios;
