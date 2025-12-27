// Serviço de conexão Firebase para ambientes Dev/Prod

import admin from 'firebase-admin';
import type { Environment, FirebaseConfig, CollectionInfo } from '../types.js';
import { SICEFSUS_COLLECTIONS } from '../constants.js';

class FirebaseService {
  private devApp: admin.app.App | null = null;
  private prodApp: admin.app.App | null = null;
  private currentEnv: Environment = 'dev';

  /**
   * Inicializa conexão com ambiente Dev
   */
  initDev(config: FirebaseConfig): void {
    if (this.devApp) {
      return; // Já inicializado
    }

    this.devApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey.replace(/\\n/g, '\n')
      }),
      databaseURL: config.databaseURL
    }, 'dev');
  }

  /**
   * Inicializa conexão com ambiente Prod
   */
  initProd(config: FirebaseConfig): void {
    if (this.prodApp) {
      return; // Já inicializado
    }

    this.prodApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey.replace(/\\n/g, '\n')
      }),
      databaseURL: config.databaseURL
    }, 'prod');
  }

  /**
   * Retorna o Firestore do ambiente atual
   */
  getFirestore(env?: Environment): admin.firestore.Firestore {
    const targetEnv = env || this.currentEnv;
    const app = targetEnv === 'dev' ? this.devApp : this.prodApp;

    if (!app) {
      throw new Error(`Ambiente ${targetEnv.toUpperCase()} não está conectado`);
    }

    return app.firestore();
  }

  /**
   * Retorna ambiente atual
   */
  getCurrentEnvironment(): Environment {
    return this.currentEnv;
  }

  /**
   * Troca o ambiente ativo
   */
  switchEnvironment(env: Environment): Environment {
    if (env === 'prod' && !this.prodApp) {
      throw new Error('Ambiente PROD não está configurado');
    }
    if (env === 'dev' && !this.devApp) {
      throw new Error('Ambiente DEV não está configurado');
    }

    this.currentEnv = env;
    return this.currentEnv;
  }

  /**
   * Verifica status das conexões
   */
  getConnectionStatus(): { devConnected: boolean; prodConnected: boolean } {
    return {
      devConnected: this.devApp !== null,
      prodConnected: this.prodApp !== null
    };
  }

  /**
   * Lista coleções disponíveis
   */
  async listCollections(env?: Environment): Promise<string[]> {
    const db = this.getFirestore(env);
    const collections = await db.listCollections();
    return collections.map(col => col.id);
  }

  /**
   * Conta documentos em uma coleção
   */
  async countDocuments(collection: string, env?: Environment): Promise<number> {
    const db = this.getFirestore(env);
    const snapshot = await db.collection(collection).count().get();
    return snapshot.data().count;
  }

  /**
   * Busca documentos de uma coleção
   */
  async queryCollection(
    collection: string, 
    limit: number = 50,
    env?: Environment
  ): Promise<Record<string, unknown>[]> {
    const db = this.getFirestore(env);
    const snapshot = await db.collection(collection).limit(limit).get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Busca documento por ID
   */
  async getDocument(
    collection: string, 
    docId: string,
    env?: Environment
  ): Promise<Record<string, unknown> | null> {
    const db = this.getFirestore(env);
    const doc = await db.collection(collection).doc(docId).get();
    
    if (!doc.exists) {
      return null;
    }

    return {
      id: doc.id,
      ...doc.data()
    };
  }

  /**
   * Exporta coleção completa (para backup)
   */
  async exportCollection(
    collection: string,
    env?: Environment
  ): Promise<Record<string, unknown>[]> {
    const db = this.getFirestore(env);
    const snapshot = await db.collection(collection).get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * Obtém campos de amostra de uma coleção
   */
  async getSampleFields(collection: string, env?: Environment): Promise<string[]> {
    const db = this.getFirestore(env);
    const snapshot = await db.collection(collection).limit(1).get();
    
    if (snapshot.empty) {
      return [];
    }

    return Object.keys(snapshot.docs[0].data());
  }

  /**
   * Obtém informações de todas as coleções conhecidas
   */
  async getCollectionsInfo(env?: Environment): Promise<CollectionInfo[]> {
    const result: CollectionInfo[] = [];

    for (const collectionName of SICEFSUS_COLLECTIONS) {
      try {
        const count = await this.countDocuments(collectionName, env);
        result.push({ name: collectionName, documentCount: count });
      } catch {
        result.push({ name: collectionName, documentCount: 0 });
      }
    }

    return result;
  }
}

// Singleton
export const firebaseService = new FirebaseService();
