#!/usr/bin/env node

/**
 * Firebase MCP Server - SICEFSUS
 * 
 * Gerencia ambientes Dev e Prod do Firebase para o sistema SICEFSUS.
 * 
 * Tools disponíveis:
 * - firebase_status: Mostra status das conexões
 * - firebase_switch: Troca entre dev e prod
 * - firebase_query: Consulta documentos
 * - firebase_get_document: Busca documento por ID
 * - firebase_compare: Compara dev vs prod
 * - firebase_backup: Exporta coleção para JSON
 * - firebase_search: Busca por campo/valor
 * - firebase_collections: Lista coleções
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { firebaseService } from './services/firebase.js';
import { registerTools } from './tools/index.js';
import 'dotenv/config';

// Configuração via variáveis de ambiente
const DEV_CONFIG = {
  projectId: process.env.FIREBASE_DEV_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_DEV_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_DEV_PRIVATE_KEY || '',
  databaseURL: process.env.FIREBASE_DEV_DATABASE_URL
};

const PROD_CONFIG = {
  projectId: process.env.FIREBASE_PROD_PROJECT_ID || '',
  clientEmail: process.env.FIREBASE_PROD_CLIENT_EMAIL || '',
  privateKey: process.env.FIREBASE_PROD_PRIVATE_KEY || '',
  databaseURL: process.env.FIREBASE_PROD_DATABASE_URL
};

// Inicializar servidor MCP
const server = new McpServer({
  name: 'firebase-mcp-server',
  version: '1.0.0'
});

// Registrar tools
registerTools(server);

// Inicializar conexões Firebase
function initializeFirebase(): void {
  try {
    if (DEV_CONFIG.projectId && DEV_CONFIG.privateKey) {
      firebaseService.initDev(DEV_CONFIG);
      console.error('🟢 Firebase DEV conectado');
    } else {
      console.error('⚠️ Firebase DEV não configurado (faltam variáveis de ambiente)');
    }

    if (PROD_CONFIG.projectId && PROD_CONFIG.privateKey) {
      firebaseService.initProd(PROD_CONFIG);
      console.error('🔴 Firebase PROD conectado');
    } else {
      console.error('⚠️ Firebase PROD não configurado (faltam variáveis de ambiente)');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
  }
}

// Executar com stdio (para Claude Code)
async function runStdio(): Promise<void> {
  initializeFirebase();
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('🚀 Firebase MCP Server iniciado (stdio)');
}

// Executar com HTTP (para outros clientes)
async function runHTTP(): Promise<void> {
  initializeFirebase();

  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'firebase-mcp-server' });
  });

  app.post('/mcp', async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true
    });
    
    res.on('close', () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || '3001');
  app.listen(port, () => {
    console.error(`🚀 Firebase MCP Server rodando em http://localhost:${port}/mcp`);
  });
}

// Escolher transporte baseado em variável de ambiente
const transport = process.env.MCP_TRANSPORT || 'stdio';

if (transport === 'http') {
  runHTTP().catch(error => {
    console.error('❌ Erro no servidor:', error);
    process.exit(1);
  });
} else {
  runStdio().catch(error => {
    console.error('❌ Erro no servidor:', error);
    process.exit(1);
  });
}
