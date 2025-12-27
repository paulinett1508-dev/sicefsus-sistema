// Tipos para o MCP Firebase Server

export type Environment = 'dev' | 'prod';

export interface FirebaseConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  databaseURL?: string;
}

export interface EnvironmentConfig {
  dev: FirebaseConfig;
  prod: FirebaseConfig;
}

export interface QueryResult {
  collection: string;
  count: number;
  documents: Record<string, unknown>[];
  environment: Environment;
  timestamp: string;
}

export interface CompareResult {
  collection: string;
  dev: {
    count: number;
    sampleFields: string[];
  };
  prod: {
    count: number;
    sampleFields: string[];
  };
  differences: string[];
}

export interface BackupResult {
  collection: string;
  environment: Environment;
  documentCount: number;
  backupPath: string;
  timestamp: string;
}

export interface StatusResult {
  currentEnvironment: Environment;
  devConnected: boolean;
  prodConnected: boolean;
  collections: string[];
}

export interface CollectionInfo {
  name: string;
  documentCount: number;
}
