// src/services/auditService.js
// 🔒 Serviço de Auditoria Centralizado - SICEFSUS
// ✅ Logs detalhados para todas as operações críticas
// ✅ Integração com padrões existentes do Firebase

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

class AuditService {
  constructor() {
    this.collectionName = "logs";
    // Log de inicialização apenas uma vez por sessão
    if (!sessionStorage.getItem('audit_service_logged')) {
      if (import.meta.env.DEV) console.log('🔒 AuditService inicializado');
      sessionStorage.setItem('audit_service_logged', 'true');
    }
  }

  /**
   * 📝 Registrar ação no log de auditoria
   * @param {Object} params - Parâmetros da ação
   * @param {string} params.action - Tipo da ação (CREATE_EMENDA, DELETE_DESPESA, etc.)
   * @param {string} params.resourceType - Tipo do recurso (emenda, despesa, usuario)
   * @param {string} params.resourceId - ID do recurso afetado
   * @param {Object} params.dataBefore - Dados antes da alteração (opcional)
   * @param {Object} params.dataAfter - Dados após a alteração (opcional)
   * @param {Object} params.user - Dados do usuário que executou a ação
   * @param {Object} params.metadata - Metadados adicionais (opcional)
   * @param {Object} params.relatedResources - Recursos relacionados (opcional)
   * @returns {Promise<string|null>} ID do log criado ou null se falhar
   */
  async logAction({
    action,
    resourceType,
    resourceId,
    dataBefore = null,
    dataAfter = null,
    user,
    metadata = {},
    relatedResources = {},
  }) {
    try {
      // Validações básicas
      if (!action || !resourceType || !resourceId) {
        console.error("❌ AuditService: Parâmetros obrigatórios ausentes", {
          action,
          resourceType,
          resourceId,
        });
        return null;
      }

      if (!user || !user.email) {
        console.error("❌ AuditService: Dados do usuário são obrigatórios");
        return null;
      }

      const logEntry = {
        // Timestamp do servidor (mais confiável que cliente)
        timestamp: serverTimestamp(),

        // Dados do usuário que executou a ação
        userId: user.uid || user.id || null,
        userEmail: user.email || "sistema@sicefsus.com",
        userName: user.nome || user.displayName || user.name || null,
        userRole: user.tipo || user.role || "operador",
        userMunicipio: user.municipio || null,
        userUf: user.uf || null,

        // Dados da ação
        action: action.toUpperCase(),
        resourceType: resourceType.toLowerCase(),
        resourceId: resourceId,

        // Dados antes e depois (se fornecidos)
        dataBefore: dataBefore || null,
        dataAfter: dataAfter || null,

        // Status da operação
        success: true,
        errorMessage: null,

        // Metadados técnicos
        metadata: {
          clientTimestamp: new Date().toISOString(),
          userAgent: navigator?.userAgent || "unknown",
          ...metadata,
        },

        // Recursos relacionados (para consultas)
        relatedResources: {
          municipio: user.municipio || null,
          uf: user.uf || null,
          ...relatedResources,
        },
      };

      // Registrar no Firestore
      const docRef = await addDoc(
        collection(db, this.collectionName),
        logEntry,
      );

      if (import.meta.env.DEV) console.log("📋 Audit log registrado com sucesso:", {
        logId: docRef.id,
        action,
        resourceType,
        resourceId,
        userEmail: user.email,
        userRole: user.tipo,
      });

      return docRef.id;
    } catch (error) {
      console.error("❌ Erro ao registrar audit log:", {
        error: error.message,
        action,
        resourceType,
        resourceId,
        userEmail: user?.email,
      });

      // IMPORTANTE: Não falhar a operação principal por causa do log
      return null;
    }
  }

  /**
   * 📝 Registrar erro de operação
   * @param {Object} params - Parâmetros do erro
   * @returns {Promise<string|null>} ID do log criado
   */
  async logError({
    action,
    resourceType,
    resourceId,
    error,
    user,
    metadata = {},
  }) {
    try {
      const logEntry = {
        timestamp: serverTimestamp(),
        action,
        resourceType,
        resourceId,

        // Dados do usuário
        userId: user?.uid || "unknown",
        userEmail: user?.email || "unknown",
        userRole: user?.tipo || "unknown",
        userMunicipio: user?.municipio || null,
        userUf: user?.uf || null,

        // Dados do erro
        dataBefore: null,
        dataAfter: null,
        success: false,
        errorMessage: error.message || "Erro desconhecido",

        // Metadados
        metadata: {
          clientTimestamp: new Date().toISOString(),
          errorStack: error.stack || null,
          ...metadata,
        },

        relatedResources: {
          municipio: user?.municipio || null,
          uf: user?.uf || null,
        },
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        logEntry,
      );

      if (import.meta.env.DEV) console.log("📋 Audit error log registrado:", {
        logId: docRef.id,
        action,
        error: error.message,
      });

      return docRef.id;
    } catch (logError) {
      console.error("❌ Erro ao registrar error log:", logError);
      return null;
    }
  }

  /**
   * 📊 Buscar logs de auditoria (apenas para admins)
   * @param {Object} filters - Filtros de busca
   * @returns {Promise<Array>} Lista de logs
   */
  async getLogs({
    userId = null,
    resourceType = null,
    action = null,
    municipio = null,
    uf = null,
    startDate = null,
    endDate = null,
    limit = 100,
    onlyErrors = false,
  } = {}) {
    try {
      if (import.meta.env.DEV) console.log("📊 Buscando logs de auditoria:", {
        userId,
        resourceType,
        action,
        limit,
      });

      let q = collection(db, this.collectionName);

      // Aplicar filtros
      if (userId) {
        q = query(q, where("userId", "==", userId));
      }

      if (resourceType) {
        q = query(q, where("resourceType", "==", resourceType));
      }

      if (action) {
        q = query(q, where("action", "==", action));
      }

      if (municipio) {
        q = query(q, where("userMunicipio", "==", municipio));
      }

      if (uf) {
        q = query(q, where("userUf", "==", uf));
      }

      if (onlyErrors) {
        q = query(q, where("success", "==", false));
      }

      // Ordenar por timestamp descendente e limitar
      q = query(q, orderBy("timestamp", "desc"), firestoreLimit(limit));

      const snapshot = await getDocs(q);
      const logs = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          // Converter timestamp para Date se necessário
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
        });
      });

      if (import.meta.env.DEV) console.log(`✅ ${logs.length} logs carregados`);
      return logs;
    } catch (error) {
      console.error("❌ Erro ao buscar logs:", error);
      return [];
    }
  }

  /**
   * 📈 Gerar estatísticas de auditoria
   * @param {number} days - Número de dias para análise
   * @returns {Promise<Object>} Estatísticas compiladas
   */
  async getStats(days = 30) {
    try {
      if (import.meta.env.DEV) console.log(`📈 Gerando estatísticas dos últimos ${days} dias`);

      const logs = await this.getLogs({ limit: 1000 });

      // Filtrar por período se necessário
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentLogs = logs.filter((log) => {
        const logDate =
          log.timestamp instanceof Date
            ? log.timestamp
            : new Date(log.timestamp);
        return logDate >= cutoffDate;
      });

      const stats = {
        totalActions: recentLogs.length,
        period: `${days} dias`,

        // Estatísticas por categoria
        actionsByType: this._groupBy(recentLogs, "action"),
        resourcesByType: this._groupBy(recentLogs, "resourceType"),
        usersByRole: this._groupBy(recentLogs, "userRole"),
        municipiosByUf: this._groupBy(recentLogs, "userUf"),

        // Estatísticas de sucesso/erro
        successRate: {
          total: recentLogs.length,
          success: recentLogs.filter((log) => log.success).length,
          errors: recentLogs.filter((log) => !log.success).length,
        },

        // Atividade recente
        recentActivity: recentLogs.slice(0, 10),

        // Usuários mais ativos
        mostActiveUsers: this._getMostActive(recentLogs, "userEmail"),

        // Timestamp da análise
        generatedAt: new Date().toISOString(),
      };

      if (import.meta.env.DEV) console.log("✅ Estatísticas geradas:", {
        totalActions: stats.totalActions,
        successRate: `${((stats.successRate.success / stats.successRate.total) * 100).toFixed(1)}%`,
      });

      return stats;
    } catch (error) {
      console.error("❌ Erro ao gerar estatísticas:", error);
      return {
        error: error.message,
        totalActions: 0,
      };
    }
  }

  /**
   * 🔍 Buscar logs relacionados a um recurso específico
   * @param {string} resourceId - ID do recurso
   * @param {string} resourceType - Tipo do recurso
   * @returns {Promise<Array>} Logs relacionados
   */
  async getResourceHistory(resourceId, resourceType) {
    try {
      let q = query(
        collection(db, this.collectionName),
        where("resourceId", "==", resourceId),
        where("resourceType", "==", resourceType),
        orderBy("timestamp", "desc"),
      );

      const snapshot = await getDocs(q);
      const history = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || data.timestamp,
        });
      });

      return history;
    } catch (error) {
      console.error("❌ Erro ao buscar histórico do recurso:", error);
      return [];
    }
  }

  // 🛠️ Métodos auxiliares privados
  _groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || "unknown";
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }

  _getMostActive(logs, field) {
    const counts = this._groupBy(logs, field);
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([user, count]) => ({ user, count }));
  }

  // 🧪 Método de teste - APENAS para desenvolvimento interno
  async testConnection() {
    try {
      const testLog = await this.logAction({
        action: "TEST_CONNECTION",
        resourceType: "system",
        resourceId: "test",
        user: {
          email: "system@test.com",
          tipo: "admin",
          uid: "test",
        },
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });

      if (import.meta.env.DEV) console.log("✅ AuditService teste realizado com sucesso:", testLog);
      return true;
    } catch (error) {
      console.error("❌ Erro no teste do AuditService:", error);
      return false;
    }
  }
}

// Exportar instância singleton
export const auditService = new AuditService();
export default auditService;