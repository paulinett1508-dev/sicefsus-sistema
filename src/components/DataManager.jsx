import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useToast } from "./Toast";
import ConfirmationModal from "./ConfirmationModal";

const DataManager = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("export");
  const [exportOptions, setExportOptions] = useState({
    emendas: true,
    despesas: true,
    users: false,
    logs: false,
  });
  const [importData, setImportData] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [backups, setBackups] = useState([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);

  const fileInputRef = useRef(null);
  const showToast = useToast();

  useEffect(() => {
    loadBackups();
    checkAutoBackupSetting();
  }, []);

  const loadBackups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "backups"));
      const backupsData = querySnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());

      setBackups(backupsData);
    } catch (error) {
      console.error("Erro ao carregar backups:", error);
    }
  };

  const checkAutoBackupSetting = () => {
    const autoBackup = localStorage.getItem("autoBackupEnabled");
    setAutoBackupEnabled(autoBackup === "true");
  };

  const handleExport = async () => {
    setLoading(true);
    const exportData = {
      timestamp: new Date().toISOString(),
      collections: {},
    };

    try {
      // Exportar emendas
      if (exportOptions.emendas) {
        const emendasSnapshot = await getDocs(collection(db, "emendas"));
        exportData.collections.emendas = emendasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Converter Timestamps para strings com verificação
          dataCriacao: doc.data().dataCriacao?.toDate?.()?.toISOString() || doc.data().dataCriacao,
          dataVencimento: doc.data().dataVencimento?.toDate?.()?.toISOString() || doc.data().dataVencimento,
          dataModificacao: doc.data().dataModificacao?.toDate?.()?.toISOString() || doc.data().dataModificacao,
        }));
      }

      // Exportar despesas
      if (exportOptions.despesas) {
        const despesasSnapshot = await getDocs(collection(db, "despesas"));
        exportData.collections.despesas = despesasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dataCriacao: doc.data().dataCriacao?.toDate?.()?.toISOString() || doc.data().dataCriacao,
          dataVencimento: doc.data().dataVencimento?.toDate?.()?.toISOString() || doc.data().dataVencimento,
          dataModificacao: doc.data().dataModificacao?.toDate?.()?.toISOString() || doc.data().dataModificacao,
        }));
      }

      // Exportar usuários (apenas admins)
      if (exportOptions.users) {
        const usersSnapshot = await getDocs(collection(db, "users"));
        exportData.collections.users = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          dataCriacao: doc.data().dataCriacao?.toDate?.()?.toISOString() || doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().dataCriacao,
          ultimoAcesso: doc.data().ultimoAcesso?.toDate?.()?.toISOString() || doc.data().lastLogin?.toDate?.()?.toISOString() || doc.data().ultimoAcesso,
        }));
      }

      // Exportar logs
      if (exportOptions.logs) {
        const logsSnapshot = await getDocs(collection(db, "logs"));
        exportData.collections.logs = logsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate().toISOString(),
        }));
      }

      // Download do arquivo
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `sicefsus_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Dados exportados com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      showToast("Erro ao exportar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/json") {
      showToast("Por favor, selecione um arquivo JSON válido", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        setImportData(data);
        generateImportPreview(data);
        setShowImportModal(true);
      } catch (error) {
        showToast("Arquivo JSON inválido", "error");
      }
    };
    reader.readAsText(file);
  };

  const generateImportPreview = (data) => {
    const preview = [];

    if (data.collections?.emendas) {
      preview.push({
        collection: "emendas",
        count: data.collections.emendas.length,
        action: "Adicionar emendas",
      });
    }

    if (data.collections?.despesas) {
      preview.push({
        collection: "despesas",
        count: data.collections.despesas.length,
        action: "Adicionar despesas",
      });
    }

    if (data.collections?.users) {
      preview.push({
        collection: "users",
        count: data.collections.users.length,
        action: "Adicionar usuários",
      });
    }

    setImportPreview(preview);
  };

  const handleImport = async () => {
    if (!importData) return;

    setLoading(true);
    const batch = writeBatch(db);

    try {
      // Importar emendas
      if (importData.collections?.emendas) {
        for (const emenda of importData.collections.emendas) {
          const { id, ...emendaData } = emenda;

          // Converter strings de volta para Timestamps
          if (emendaData.dataCriacao) {
            emendaData.dataCriacao = Timestamp.fromDate(
              new Date(emendaData.dataCriacao),
            );
          }
          if (emendaData.dataVencimento) {
            emendaData.dataVencimento = Timestamp.fromDate(
              new Date(emendaData.dataVencimento),
            );
          }

          const docRef = doc(collection(db, "emendas"));
          batch.set(docRef, emendaData);
        }
      }

      // Importar despesas
      if (importData.collections?.despesas) {
        for (const despesa of importData.collections.despesas) {
          const { id, ...despesaData } = despesa;

          if (despesaData.dataCriacao) {
            despesaData.dataCriacao = Timestamp.fromDate(
              new Date(despesaData.dataCriacao),
            );
          }
          if (despesaData.dataVencimento) {
            despesaData.dataVencimento = Timestamp.fromDate(
              new Date(despesaData.dataVencimento),
            );
          }

          const docRef = doc(collection(db, "despesas"));
          batch.set(docRef, despesaData);
        }
      }

      await batch.commit();

      // Criar backup automático antes da importação
      await createBackup("Backup automático antes da importação");

      showToast("Dados importados com sucesso!", "success");
      setShowImportModal(false);
      setImportData(null);
      setImportPreview([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erro ao importar:", error);
      showToast("Erro ao importar dados", "error");
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (description = "Backup manual") => {
    setLoading(true);

    try {
      const backupData = {
        timestamp: Timestamp.now(),
        description,
        collections: {},
      };

      // Backup de todas as coleções
      const collections = ["emendas", "despesas", "users", "logs"];

      for (const collectionName of collections) {
        const snapshot = await getDocs(collection(db, collectionName));
        backupData.collections[collectionName] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      await addDoc(collection(db, "backups"), backupData);

      showToast("Backup criado com sucesso!", "success");
      loadBackups();
    } catch (error) {
      console.error("Erro ao criar backup:", error);
      showToast("Erro ao criar backup", "error");
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async (backup) => {
    try {
      const backupData = {
        ...backup,
        timestamp: backup.timestamp.toDate().toISOString(),
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_${backup.timestamp.toDate().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("Backup baixado com sucesso!", "success");
    } catch (error) {
      console.error("Erro ao baixar backup:", error);
      showToast("Erro ao baixar backup", "error");
    }
  };

  const deleteBackup = async (backupId) => {
    try {
      await deleteDoc(doc(db, "backups", backupId));
      showToast("Backup excluído com sucesso!", "success");
      loadBackups();
    } catch (error) {
      console.error("Erro ao excluir backup:", error);
      showToast("Erro ao excluir backup", "error");
    }
  };

  const toggleAutoBackup = () => {
    const newValue = !autoBackupEnabled;
    setAutoBackupEnabled(newValue);
    localStorage.setItem("autoBackupEnabled", newValue.toString());

    if (newValue) {
      showToast("Backup automático ativado (diário às 02:00)", "success");
    } else {
      showToast("Backup automático desativado", "info");
    }
  };

  const exportToCSV = async (collectionName) => {
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (data.length === 0) {
        showToast("Nenhum dado encontrado para exportar", "warning");
        return;
      }

      // Converter para CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          headers
            .map((header) => {
              let value = row[header];
              if (value && typeof value === "object" && value.toDate) {
                value = value.toDate().toISOString();
              }
              return `"${value || ""}"`;
            })
            .join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${collectionName}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(`${collectionName} exportado para CSV com sucesso!`, "success");
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
      showToast("Erro ao exportar CSV", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="data-manager">
      <div className="data-header">
        <h1>📊 Gerenciador de Dados</h1>
        <div className="auto-backup-toggle">
          <label>
            <input
              type="checkbox"
              checked={autoBackupEnabled}
              onChange={toggleAutoBackup}
            />
            Backup Automático Diário
          </label>
        </div>
      </div>

      <div className="data-tabs">
        <button
          className={`tab ${activeTab === "export" ? "active" : ""}`}
          onClick={() => setActiveTab("export")}
        >
          📤 Exportar Dados
        </button>
        <button
          className={`tab ${activeTab === "import" ? "active" : ""}`}
          onClick={() => setActiveTab("import")}
        >
          📥 Importar Dados
        </button>
        <button
          className={`tab ${activeTab === "backup" ? "active" : ""}`}
          onClick={() => setActiveTab("backup")}
        >
          💾 Backups
        </button>
      </div>

      {activeTab === "export" && (
        <div className="export-section">
          <div className="section-card">
            <h2>📤 Exportar Dados</h2>

            <div className="export-options">
              <h3>Selecione os dados para exportar:</h3>
              <div className="options-grid">
                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.emendas}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        emendas: e.target.checked,
                      })
                    }
                  />
                  <span>📄 Emendas Parlamentares</span>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.despesas}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        despesas: e.target.checked,
                      })
                    }
                  />
                  <span>💰 Despesas</span>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.users}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        users: e.target.checked,
                      })
                    }
                  />
                  <span>👥 Usuários (Somente Admin)</span>
                </label>

                <label className="option-item">
                  <input
                    type="checkbox"
                    checked={exportOptions.logs}
                    onChange={(e) =>
                      setExportOptions({
                        ...exportOptions,
                        logs: e.target.checked,
                      })
                    }
                  />
                  <span>📋 Logs de Auditoria</span>
                </label>
              </div>
            </div>

            <div className="export-actions">
              <button
                className="btn-primary"
                onClick={handleExport}
                disabled={
                  loading || !Object.values(exportOptions).some(Boolean)
                }
              >
                {loading ? "⏳ Exportando..." : "📤 Exportar JSON"}
              </button>
            </div>

            <div className="quick-exports">
              <h3>Exportações Rápidas (CSV):</h3>
              <div className="quick-buttons">
                <button
                  className="btn-secondary"
                  onClick={() => exportToCSV("emendas")}
                  disabled={loading}
                >
                  CSV Emendas
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => exportToCSV("despesas")}
                  disabled={loading}
                >
                  CSV Despesas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "import" && (
        <div className="import-section">
          <div className="section-card">
            <h2>📥 Importar Dados</h2>

            <div className="import-area">
              <div className="file-upload">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  style={{ display: "none" }}
                />
                <button
                  className="btn-upload"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Selecionar Arquivo JSON
                </button>
                <p>Selecione um arquivo JSON exportado do SICEFSUS</p>
              </div>
            </div>

            <div className="import-info">
              <h3>⚠️ Importante:</h3>
              <ul>
                <li>Apenas arquivos JSON do SICEFSUS são aceitos</li>
                <li>Os dados serão ADICIONADOS aos existentes</li>
                <li>Um backup automático será criado antes da importação</li>
                <li>Verifique o preview antes de confirmar</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "backup" && (
        <div className="backup-section">
          <div className="section-card">
            <h2>💾 Gerenciamento de Backups</h2>

            <div className="backup-actions">
              <button
                className="btn-primary"
                onClick={() => createBackup()}
                disabled={loading}
              >
                {loading ? "⏳ Criando..." : "💾 Criar Backup Manual"}
              </button>
            </div>

            <div className="backups-list">
              <h3>Backups Disponíveis:</h3>
              {backups.length === 0 ? (
                <p className="no-backups">Nenhum backup encontrado</p>
              ) : (
                <div className="backups-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Data/Hora</th>
                        <th>Descrição</th>
                        <th>Coleções</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {backups.map((backup) => (
                        <tr key={backup.id}>
                          <td>
                            {backup.timestamp?.toDate().toLocaleString("pt-BR")}
                          </td>
                          <td>{backup.description}</td>
                          <td>
                            {Object.keys(backup.collections || {}).join(", ")}
                          </td>
                          <td>
                            <div className="backup-actions-row">
                              <button
                                className="btn-download"
                                onClick={() => downloadBackup(backup)}
                                title="Baixar backup"
                              >
                                📥
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => deleteBackup(backup.id)}
                                title="Excluir backup"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showImportModal}
        onConfirm={handleImport}
        onCancel={() => {
          setShowImportModal(false);
          setImportData(null);
          setImportPreview([]);
        }}
        title="Confirmar Importação"
        message={
          <div>
            <p>Confirma a importação dos seguintes dados?</p>
            <ul>
              {importPreview.map((item, index) => (
                <li key={index}>
                  {item.action}: {item.count} registros
                </li>
              ))}
            </ul>
            <p>
              <strong>
                ⚠️ Um backup será criado automaticamente antes da importação.
              </strong>
            </p>
          </div>
        }
        confirmText="Importar"
        confirmButtonClass="btn-primary"
      />

      <style>{`
        .data-manager {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
        }

        .data-header {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .data-header h1 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.8em;
        }

        .auto-backup-toggle label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #2c3e50;
          cursor: pointer;
        }

        .auto-backup-toggle input[type="checkbox"] {
          transform: scale(1.2);
        }

        .data-tabs {
          display: flex;
          background: white;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .tab {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .tab.active {
          background: #007bff;
          color: white;
        }

        .tab:hover:not(.active) {
          background: #e9ecef;
        }

        .section-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .section-card h2 {
          margin: 0 0 25px 0;
          color: #2c3e50;
        }

        .export-options h3,
        .import-info h3,
        .backups-list h3,
        .quick-exports h3 {
          color: #2c3e50;
          margin-bottom: 15px;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .option-item:hover {
          background: #e9ecef;
        }

        .option-item input[type="checkbox"] {
          transform: scale(1.3);
        }

        .option-item span {
          font-weight: 500;
        }

        .export-actions {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
          font-size: 16px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .quick-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .file-upload {
          text-align: center;
          padding: 40px;
          border: 2px dashed #ced4da;
          border-radius: 8px;
          margin-bottom: 25px;
        }

        .btn-upload {
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          font-size: 16px;
          margin-bottom: 10px;
        }

        .btn-upload:hover {
          background: #218838;
        }

        .file-upload p {
          color: #6c757d;
          margin: 0;
        }

        .import-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 20px;
        }

        .import-info ul {
          margin: 0;
          padding-left: 20px;
          color: #856404;
        }

        .import-info li {
          margin-bottom: 5px;
        }

        .backup-actions {
          margin-bottom: 30px;
        }

        .backups-table {
          overflow-x: auto;
        }

        .backups-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }

        .backups-table th,
        .backups-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #dee2e6;
        }

        .backups-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }

        .backup-actions-row {
          display: flex;
          gap: 5px;
        }

        .btn-download,
        .btn-delete {
          background: none;
          border: none;
          font-size: 1.2em;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .btn-download:hover {
          background: #007bff;
          color: white;
        }

        .btn-delete:hover {
          background: #dc3545;
          color: white;
        }

        .no-backups {
          text-align: center;
          color: #6c757d;
          font-style: italic;
          margin: 20px 0;
        }

        @media (max-width: 768px) {
          .data-manager {
            padding: 10px;
          }

          .data-header {
            flex-direction: column;
            gap: 15px;
            align-items: stretch;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .export-actions {
            flex-direction: column;
          }

          .quick-buttons {
            justify-content: center;
          }

          .backups-table {
            font-size: 0.9em;
          }
        }
      `}</style>
    </div>
  );
};

export default DataManager;
