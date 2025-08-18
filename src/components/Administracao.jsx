
// 🔧 CORREÇÕES CRÍTICAS para src/components/Administracao.jsx

// ✅ CORREÇÃO 1: Imports corretos
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { auditService } from "../services/auditService";

// 🔧 CORREÇÃO: Import correto do userService
import userService from "../services/userService"; // ✅ Import default

// 🔧 CORREÇÃO: Remover imports de componentes inexistentes e usar UserForm
import UserForm from "./UserForm"; // ✅ UserForm existe
import Toast from "./Toast";
import ConfirmationModal from "./ConfirmationModal";
import { UserContext } from "../context/UserContext";

const Administracao = () => {
  const { currentUser } = useContext(UserContext);
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFilter, setUserFilter] = useState("");
  const [logFilters, setLogFilters] = useState({
    usuario: "",
    acao: "",
    dataInicio: "",
    dataFim: "",
  });
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false });

  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    role: "operador",
    municipio: "",
    uf: "",
    status: "ativo",
    departamento: "",
    telefone: "",
  });

  const [toast, setToast] = useState({ isVisible: false });

  const showToast = ({ tipo, titulo, mensagem, duracao = 5000 }) => {
    setToast({
      isVisible: true,
      tipo,
      titulo,
      mensagem,
      duracao,
    });
  };

  const carregarUsuarios = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Erro ao carregar usuários",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const carregarLogs = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "audit_logs"));
      const logsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(logsData.sort((a, b) => {
        const dateA = a.timestamp?.seconds || 0;
        const dateB = b.timestamp?.seconds || 0;
        return dateB - dateA;
      }));
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Erro ao carregar logs",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarUsuarios();
    carregarLogs();
  }, [carregarUsuarios, carregarLogs]);

  const handleNovoUsuario = () => {
    setFormData({
      nome: "",
      email: "",
      role: "operador",
      municipio: "",
      uf: "",
      status: "ativo",
      departamento: "",
      telefone: "",
    });
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setFormData({
      nome: usuario.nome || "",
      email: usuario.email || "",
      role: usuario.role || usuario.tipo || "operador",
      municipio: usuario.municipio || "",
      uf: usuario.uf || "",
      status: usuario.status || "ativo",
      departamento: usuario.departamento || "",
      telefone: usuario.telefone || "",
    });
    setEditingUser(usuario);
    setShowUserModal(true);
  };

  // ✅ CORREÇÃO 2: Função handleSalvarUsuario
  const handleSalvarUsuario = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      console.log("💾 Salvando usuário:", formData);

      if (editingUser) {
        // ✅ USAR userService.updateUser
        await userService.updateUser(
          editingUser.id,
          {
            nome: formData.nome,
            email: formData.email,
            role: formData.role === "admin" ? "admin" : "operador",
            municipio: formData.role === "admin" ? "" : formData.municipio,
            uf: formData.role === "admin" ? "" : formData.uf,
            status: formData.status,
            departamento: formData.departamento,
            telefone: formData.telefone,
          },
          editingUser.email,
        );

        showToast({
          tipo: "success",
          titulo: "Sucesso",
          mensagem: "Usuário atualizado com sucesso!",
        });
      } else {
        // ✅ USAR userService.createUser
        const resultado = await userService.createUser({
          email: formData.email,
          nome: formData.nome,
          role: formData.role === "admin" ? "admin" : "operador",
          municipio: formData.role === "admin" ? "" : formData.municipio,
          uf: formData.role === "admin" ? "" : formData.uf,
          status: formData.status,
          departamento: formData.departamento,
          telefone: formData.telefone,
        });

        if (resultado.success) {
          showToast({
            tipo: "success",
            titulo: "Sucesso",
            mensagem:
              "Usuário criado com sucesso! Email de configuração enviado.",
          });
        }
      }

      setShowUserModal(false);
      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao salvar usuário:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: error.message || "Erro ao salvar usuário",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const novoStatus = usuario.status === "ativo" ? "inativo" : "ativo";
      
      await userService.updateUser(
        usuario.id,
        { status: novoStatus },
        usuario.email,
      );

      showToast({
        tipo: "success",
        titulo: "Status Atualizado",
        mensagem: `Usuário ${novoStatus === "ativo" ? "ativado" : "desativado"} com sucesso!`,
      });

      await carregarUsuarios();
    } catch (error) {
      console.error("❌ Erro ao alterar status:", error);
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Erro ao alterar status do usuário",
      });
    }
  };

  // ✅ CORREÇÃO 3: Função handleDelete
  const handleDelete = async (usuario) => {
    console.log("🗑️ === EXCLUSÃO VIA CLOUD RUN ===");
    console.log("🗑️ Dados do usuário:", usuario);

    // Validações básicas
    if (!usuario?.id) {
      showToast({
        tipo: "error",
        titulo: "Erro",
        mensagem: "Dados do usuário incompletos",
      });
      return;
    }

    if (usuario.status === "ativo") {
      showToast({
        tipo: "warning",
        titulo: "Usuário Ativo",
        mensagem: "Desative o usuário primeiro para poder excluir",
      });
      return;
    }

    // ✅ USAR MODAL DE CONFIRMAÇÃO
    setConfirmationModal({
      isOpen: true,
      title: "🔥 Exclusão Completa via Cloud Run",
      message: (
        <div style={{ textAlign: 'left' }}>
          <p><strong>Usuário:</strong> {usuario.nome}</p>
          <p><strong>Email:</strong> {usuario.email}</p>
          <hr style={{ margin: '10px 0', opacity: 0.3 }} />
          <p style={{ marginBottom: '10px' }}>✅ <strong>Será removido de:</strong></p>
          <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
            <li>Firebase Firestore (dados)</li>
            <li>Firebase Auth (login)</li>
          </ul>
          <p style={{ fontSize: '14px', color: '#666' }}>
            ⚡ Usando Cloud Run Function com Admin SDK<br />
            🎯 Email ficará disponível para reutilização
          </p>
          <p style={{ 
            marginTop: '15px', 
            padding: '10px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7',
            borderRadius: '5px',
            color: '#856404',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            ⚠️ Esta ação NÃO pode ser desfeita!
          </p>
        </div>
      ),
      confirmText: "Sim, Excluir Permanentemente",
      cancelText: "Cancelar",
      type: "danger",
      onConfirm: async () => {
        setConfirmationModal({ isOpen: false });
        
        // Continuar com a exclusão
        try {
          setLoading(true);
          console.log("🔥 Executando exclusão via Cloud Run...");

          // ✅ USAR userService.deleteUserById
          const resultado = await userService.deleteUserById(
            usuario.id,
            usuario.uid || usuario.id,
          );

          console.log("📊 Resultado:", resultado);

          // ✅ MENSAGEM BASEADA NO RESULTADO
          let tipo = "success";
          let titulo = "Exclusão Completa";
          let mensagem = "Usuário excluído com sucesso!";

          if (resultado.method === "cloud_run") {
            if (resultado.details.firestore && resultado.details.auth) {
              mensagem =
                "🎉 EXCLUSÃO COMPLETA!\n\n✅ Removido do Firestore\n✅ Removido do Firebase Auth\n✅ Email liberado para reutilização\n\n⚡ Processado via Cloud Run";
            } else if (resultado.details.firestore) {
              tipo = "warning";
              titulo = "Exclusão Parcial";
              mensagem =
                "⚠️ Usuário removido do Firestore.\nProblema ao remover do Auth.\n\nVerifique os logs da Cloud Function.";
            }
          } else if (resultado.method === "firestore_fallback") {
            tipo = "warning";
            titulo = "Exclusão Parcial";
            mensagem =
              "⚠️ Cloud Run indisponível.\nUsuário removido apenas do Firestore.\n\nEmail permanece no Auth.";
          }

          showToast({
            tipo: tipo,
            titulo: titulo,
            mensagem: mensagem,
            duracao: 10000,
          });

          await carregarUsuarios();
        } catch (error) {
          console.error("❌ Erro na exclusão:", error);
          showToast({
            tipo: "error",
            titulo: "Erro na Exclusão",
            mensagem: `Erro: ${error.message}`,
          });
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        console.log("❌ Exclusão cancelada");
        setConfirmationModal({ isOpen: false });
      },
    });
  };

  const getFilteredUsers = () => {
    return usuarios.filter((usuario) =>
      usuario.nome?.toLowerCase().includes(userFilter.toLowerCase()) ||
      usuario.email?.toLowerCase().includes(userFilter.toLowerCase())
    );
  };

  const getFilteredLogs = () => {
    return logs.filter((log) => {
      const matchUsuario = !logFilters.usuario || 
        log.userEmail?.toLowerCase().includes(logFilters.usuario.toLowerCase());
      const matchAcao = !logFilters.acao || 
        log.action?.toLowerCase().includes(logFilters.acao.toLowerCase());
      
      let matchDataInicio = true;
      let matchDataFim = true;
      
      if (logFilters.dataInicio || logFilters.dataFim) {
        const logDate = new Date(log.timestamp?.seconds * 1000 || log.timestamp);
        if (logFilters.dataInicio) {
          matchDataInicio = logDate >= new Date(logFilters.dataInicio);
        }
        if (logFilters.dataFim) {
          matchDataFim = logDate <= new Date(logFilters.dataFim + "T23:59:59");
        }
      }
      
      return matchUsuario && matchAcao && matchDataInicio && matchDataFim;
    });
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🛡️ Administração do Sistema</h1>

      {/* SEÇÃO TEMPORÁRIA - Substituir por básica até criar componentes */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleNovoUsuario}
          disabled={loading}
        >
          ➕ Novo Usuário
        </button>
        
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white", 
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={carregarLogs}
          disabled={loading}
        >
          🔄 Atualizar Logs
        </button>
      </div>

      {/* TABS SIMPLIFICADAS */}
      <div style={{ borderBottom: "1px solid #ddd", marginBottom: "20px" }}>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "users" ? "2px solid #007bff" : "none",
            backgroundColor: activeTab === "users" ? "#f8f9fa" : "transparent",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("users")}
        >
          👥 Usuários ({usuarios.length})
        </button>
        <button
          style={{
            padding: "10px 20px",
            border: "none",
            borderBottom: activeTab === "logs" ? "2px solid #007bff" : "none",
            backgroundColor: activeTab === "logs" ? "#f8f9fa" : "transparent",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("logs")}
        >
          📋 Logs ({logs.length})
        </button>
      </div>

      {/* CONTEÚDO BÁSICO - Substituir componentes inexistentes */}
      {activeTab === "users" ? (
        <div>
          {/* FILTRO BÁSICO */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Filtrar usuários..."
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "300px",
              }}
            />
          </div>

          {/* TABELA BÁSICA DE USUÁRIOS */}
          {loading ? (
            <div>Carregando usuários...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8f9fa" }}>
                  <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>
                    Nome
                  </th>
                  <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>
                    Email
                  </th>
                  <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>
                    Tipo
                  </th>
                  <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>
                    Status
                  </th>
                  <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredUsers().map((usuario) => (
                  <tr key={usuario.id}>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {usuario.nome}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {usuario.email}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      {(usuario.tipo || usuario.role) === "admin" ? "👑 Admin" : "👤 Operador"}
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: usuario.status === "ativo" ? "#d4edda" : "#f8d7da",
                          color: usuario.status === "ativo" ? "#155724" : "#721c24",
                        }}
                      >
                        {usuario.status === "ativo" ? "✅ Ativo" : "⏸️ Inativo"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", border: "1px solid #ddd", textAlign: "center" }}>
                      <button
                        style={{
                          padding: "4px 8px",
                          margin: "0 2px",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        onClick={() => handleEditarUsuario(usuario)}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        style={{
                          padding: "4px 8px",
                          margin: "0 2px",
                          backgroundColor: usuario.status === "ativo" ? "#ffc107" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                        onClick={() => handleToggleStatus(usuario)}
                      >
                        {usuario.status === "ativo" ? "⏸️ Inativar" : "▶️ Ativar"}
                      </button>
                      {usuario.status !== "ativo" && (
                        <button
                          style={{
                            padding: "4px 8px",
                            margin: "0 2px",
                            backgroundColor: "#dc3545",
                            color: "white",
                            border: "none",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          onClick={() => handleDelete(usuario)}
                        >
                          🗑️ Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div>
          {/* SEÇÃO DE LOGS BÁSICA */}
          <div style={{ marginBottom: "20px" }}>
            <h3>📋 Logs de Auditoria</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="Filtrar por usuário..."
                value={logFilters.usuario}
                onChange={(e) => setLogFilters({...logFilters, usuario: e.target.value})}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
              <input
                type="text"
                placeholder="Filtrar por ação..."
                value={logFilters.acao}
                onChange={(e) => setLogFilters({...logFilters, acao: e.target.value})}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
              <input
                type="date"
                placeholder="Data início"
                value={logFilters.dataInicio}
                onChange={(e) => setLogFilters({...logFilters, dataInicio: e.target.value})}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
              <input
                type="date"
                placeholder="Data fim"
                value={logFilters.dataFim}
                onChange={(e) => setLogFilters({...logFilters, dataFim: e.target.value})}
                style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "4px" }}
              />
            </div>
          </div>

          {loading ? (
            <div>Carregando logs...</div>
          ) : (
            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
              {getFilteredLogs().map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    {log.action} - {log.userEmail}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    {new Date(log.timestamp?.seconds * 1000 || log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ✅ CORREÇÃO 4: Seção de renderização do modal */}
      {showUserModal && (
        <UserForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSalvarUsuario}
          onCancel={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          editingUser={editingUser}
          saving={saving}
          usuario={currentUser} // ✅ ADICIONAR: Prop usuario necessária
        />
      )}

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmationModal.isOpen && (
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText={confirmationModal.confirmText}
          cancelText={confirmationModal.cancelText}
          type={confirmationModal.type}
          onConfirm={confirmationModal.onConfirm}
          onCancel={confirmationModal.onCancel}
        />
      )}

      {/* TOAST */}
      {toast.isVisible && (
        <Toast
          tipo={toast.tipo}
          titulo={toast.titulo}
          mensagem={toast.mensagem}
          isVisible={toast.isVisible}
          onClose={() => setToast({ isVisible: false })}
          duracao={toast.duracao}
        />
      )}
    </div>
  );
};

export default Administracao;
