import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";

const WorkflowManager = ({ despesa, onStatusChange, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [workflow, setWorkflow] = useState([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [comments, setComments] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const showToast = useToast();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (despesa) {
      loadWorkflowHistory();
    }
  }, [despesa]);

  const loadWorkflowHistory = async () => {
    try {
      const q = query(
        collection(db, "workflow"),
        where("despesaId", "==", despesa.id),
        orderBy("timestamp", "desc"),
      );

      const querySnapshot = await getDocs(q);
      const workflowData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWorkflow(workflowData);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  const createWorkflowEntry = async (action, status, comments = "") => {
    try {
      await addDoc(collection(db, "workflow"), {
        despesaId: despesa.id,
        despesaNumero: despesa.numero,
        action,
        status,
        comments,
        timestamp: Timestamp.now(),
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
        userName: currentUser?.displayName || currentUser?.email,
      });
    } catch (error) {
      console.error("Erro ao criar entrada do workflow:", error);
    }
  };

  const handleStatusChange = async (newStatus, action, comments = "") => {
    setLoading(true);

    try {
      // Atualizar status da despesa
      await updateDoc(doc(db, "despesas", despesa.id), {
        status: newStatus,
        ultimaAtualizacao: Timestamp.now(),
        aprovadoPor: newStatus === "aprovada" ? currentUser?.email : null,
        dataAprovacao: newStatus === "aprovada" ? Timestamp.now() : null,
        rejeitadoPor: newStatus === "rejeitada" ? currentUser?.email : null,
        dataRejeicao: newStatus === "rejeitada" ? Timestamp.now() : null,
        motivoRejeicao: newStatus === "rejeitada" ? comments : null,
      });

      // Criar entrada no workflow
      await createWorkflowEntry(action, newStatus, comments);

      // Recarregar histórico
      await loadWorkflowHistory();

      // Notificar componente pai
      if (onStatusChange) {
        onStatusChange(newStatus);
      }

      showToast(`Despesa ${action.toLowerCase()} com sucesso!`, "success");

      // Fechar modais
      setShowApprovalModal(false);
      setShowRejectModal(false);
      setComments("");
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showToast("Erro ao alterar status da despesa", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pendente":
        return "⏳";
      case "aprovada":
        return "✅";
      case "rejeitada":
        return "❌";
      case "paga":
        return "💳";
      case "cancelada":
        return "🚫";
      default:
        return "📄";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pendente":
        return "#ffc107";
      case "aprovada":
        return "#28a745";
      case "rejeitada":
        return "#dc3545";
      case "paga":
        return "#17a2b8";
      case "cancelada":
        return "#6c757d";
      default:
        return "#007bff";
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "CRIADA":
        return "📝";
      case "ENVIADA_APROVACAO":
        return "📤";
      case "APROVADA":
        return "✅";
      case "REJEITADA":
        return "❌";
      case "PAGA":
        return "💳";
      case "CANCELADA":
        return "🚫";
      case "EDITADA":
        return "✏️";
      default:
        return "📋";
    }
  };

  const canApprove = () => {
    return (
      despesa.status === "pendente" && currentUser?.email !== despesa.criadoPor
    );
  };

  const canReject = () => {
    return ["pendente", "aprovada"].includes(despesa.status);
  };

  const canMarkAsPaid = () => {
    return despesa.status === "aprovada";
  };

  const canCancel = () => {
    return ["pendente", "aprovada"].includes(despesa.status);
  };

  return (
    <div className="workflow-manager">
      <div className="workflow-header">
        <div className="header-info">
          <h2>📋 Workflow - {despesa.numero}</h2>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="current-status">
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(despesa.status) }}
          >
            {getStatusIcon(despesa.status)} {despesa.status?.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="workflow-actions">
        <h3>Ações Disponíveis:</h3>
        <div className="actions-grid">
          {canApprove() && (
            <button
              className="action-btn approve"
              onClick={() => {
                setNewStatus("aprovada");
                setShowApprovalModal(true);
              }}
              disabled={loading}
            >
              ✅ Aprovar
            </button>
          )}

          {canReject() && (
            <button
              className="action-btn reject"
              onClick={() => {
                setNewStatus("rejeitada");
                setShowRejectModal(true);
              }}
              disabled={loading}
            >
              ❌ Rejeitar
            </button>
          )}

          {canMarkAsPaid() && (
            <button
              className="action-btn paid"
              onClick={() =>
                handleStatusChange("paga", "PAGA", "Despesa marcada como paga")
              }
              disabled={loading}
            >
              💳 Marcar como Paga
            </button>
          )}

          {canCancel() && (
            <button
              className="action-btn cancel"
              onClick={() =>
                handleStatusChange(
                  "cancelada",
                  "CANCELADA",
                  "Despesa cancelada",
                )
              }
              disabled={loading}
            >
              🚫 Cancelar
            </button>
          )}
        </div>

        {!canApprove() && !canReject() && !canMarkAsPaid() && !canCancel() && (
          <p className="no-actions">
            Nenhuma ação disponível para o status atual.
          </p>
        )}
      </div>

      <div className="workflow-timeline">
        <h3>Histórico do Workflow:</h3>

        {workflow.length === 0 ? (
          <p className="no-history">Nenhum histórico de workflow encontrado.</p>
        ) : (
          <div className="timeline">
            {workflow.map((entry, index) => (
              <div key={entry.id} className="timeline-item">
                <div className="timeline-marker">
                  <span className="timeline-icon">
                    {getActionIcon(entry.action)}
                  </span>
                </div>

                <div className="timeline-content">
                  <div className="timeline-header">
                    <h4>{entry.action.replace("_", " ")}</h4>
                    <span className="timeline-date">
                      {entry.timestamp?.toDate().toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className="timeline-details">
                    <p>
                      <strong>Status:</strong> {entry.status}
                    </p>
                    <p>
                      <strong>Usuário:</strong>{" "}
                      {entry.userName || entry.userEmail}
                    </p>
                    {entry.comments && (
                      <p>
                        <strong>Comentários:</strong> {entry.comments}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Aprovação */}
      <ConfirmationModal
        isOpen={showApprovalModal}
        onConfirm={() => handleStatusChange("aprovada", "APROVADA", comments)}
        onCancel={() => {
          setShowApprovalModal(false);
          setComments("");
        }}
        title="Aprovar Despesa"
        message={
          <div>
            <p>Confirma a aprovação desta despesa?</p>
            <div className="comments-section">
              <label>Comentários (opcional):</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Adicione comentários sobre a aprovação..."
                rows={3}
              />
            </div>
          </div>
        }
        confirmText="Aprovar"
        confirmButtonClass="btn-success"
      />

      {/* Modal de Rejeição */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onConfirm={() => handleStatusChange("rejeitada", "REJEITADA", comments)}
        onCancel={() => {
          setShowRejectModal(false);
          setComments("");
        }}
        title="Rejeitar Despesa"
        message={
          <div>
            <p>Confirma a rejeição desta despesa?</p>
            <div className="comments-section">
              <label>Motivo da rejeição (obrigatório):</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Descreva o motivo da rejeição..."
                rows={3}
                required
              />
            </div>
          </div>
        }
        confirmText="Rejeitar"
        confirmButtonClass="btn-danger"
        disabled={!comments.trim()}
      />

      <style>{`
        .workflow-manager {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
        }

        .workflow-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px 25px;
        }

        .header-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .header-info h2 {
          margin: 0;
          font-size: 1.5em;
        }

        .btn-close {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2em;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-close:hover {
          background: rgba(255,255,255,0.3);
        }

        .current-status {
          text-align: center;
        }

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          color: white;
          font-weight: 600;
          font-size: 0.9em;
        }

        .workflow-actions {
          padding: 25px;
          border-bottom: 1px solid #dee2e6;
        }

        .workflow-actions h3 {
          margin: 0 0 15px 0;
          color: #1E293B;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
        }

        .action-btn {
          padding: 12px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          font-size: 0.9em;
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .action-btn.approve {
          background: #28a745;
          color: white;
        }

        .action-btn.approve:hover:not(:disabled) {
          background: #218838;
        }

        .action-btn.reject {
          background: #dc3545;
          color: white;
        }

        .action-btn.reject:hover:not(:disabled) {
          background: #c82333;
        }

        .action-btn.paid {
          background: #17a2b8;
          color: white;
        }

        .action-btn.paid:hover:not(:disabled) {
          background: #138496;
        }

        .action-btn.cancel {
          background: #6c757d;
          color: white;
        }

        .action-btn.cancel:hover:not(:disabled) {
          background: #545b62;
        }

        .no-actions {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          margin: 20px 0;
        }

        .workflow-timeline {
          padding: 25px;
        }

        .workflow-timeline h3 {
          margin: 0 0 20px 0;
          color: #1E293B;
        }

        .no-history {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          margin: 20px 0;
        }

        .timeline {
          position: relative;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 25px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #dee2e6;
        }

        .timeline-item {
          position: relative;
          padding-left: 60px;
          margin-bottom: 30px;
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          height: 50px;
          background: white;
          border: 3px solid #007bff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }

        .timeline-icon {
          font-size: 1.2em;
        }

        .timeline-content {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          border-left: 4px solid #007bff;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .timeline-header h4 {
          margin: 0;
          color: #1E293B;
          font-size: 1.1em;
        }

        .timeline-date {
          color: #6c757d;
          font-size: 0.9em;
        }

        .timeline-details p {
          margin: 5px 0;
          color: #495057;
          font-size: 0.9em;
        }

        .comments-section {
          margin-top: 15px;
        }

        .comments-section label {
          display: block;
          font-weight: 500;
          margin-bottom: 5px;
          color: #1E293B;
        }

        .comments-section textarea {
          width: 100%;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 10px;
          font-family: inherit;
          resize: vertical;
          min-height: 80px;
        }

        .comments-section textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
        }

        .btn-success {
          background: #28a745;
          color: white;
        }

        .btn-success:hover {
          background: #218838;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .workflow-manager {
            margin: 10px;
          }

          .workflow-header {
            padding: 15px 20px;
          }

          .header-info {
            flex-direction: column;
            gap: 10px;
            align-items: stretch;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .workflow-actions,
          .workflow-timeline {
            padding: 20px;
          }

          .timeline-item {
            padding-left: 50px;
          }

          .timeline-marker {
            width: 40px;
            height: 40px;
          }

          .timeline-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkflowManager;
