// Tools do MCP Firebase Server

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { firebaseService } from '../services/firebase.js';
import { 
  SwitchEnvironmentSchema, 
  QuerySchema, 
  GetDocumentSchema,
  CompareSchema, 
  BackupSchema,
  SearchSchema,
  type SwitchEnvironmentInput,
  type QueryInput,
  type GetDocumentInput,
  type CompareInput,
  type BackupInput,
  type SearchInput
} from '../schemas/index.js';
import { ENVIRONMENT_INDICATORS, WARNING_MESSAGES } from '../constants.js';
import * as fs from 'fs';
import * as path from 'path';

export function registerTools(server: McpServer): void {
  
  // ============================================
  // TOOL: firebase_status
  // ============================================
  server.registerTool(
    'firebase_status',
    {
      title: 'Firebase Status',
      description: `Mostra o status atual das conexões Firebase.

Retorna:
- Ambiente ativo atual (dev ou prod)
- Status de conexão de cada ambiente
- Lista de coleções disponíveis com contagem de documentos

Use para verificar em qual ambiente você está antes de fazer operações.`,
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => {
      try {
        const currentEnv = firebaseService.getCurrentEnvironment();
        const { devConnected, prodConnected } = firebaseService.getConnectionStatus();
        const collections = await firebaseService.getCollectionsInfo();

        const indicator = ENVIRONMENT_INDICATORS[currentEnv];
        
        const output = {
          currentEnvironment: currentEnv,
          indicator,
          devConnected,
          prodConnected,
          collections
        };

        const text = `
${indicator} Ambiente Ativo: ${currentEnv.toUpperCase()}

📊 Status das Conexões:
- DEV: ${devConnected ? '✅ Conectado' : '❌ Desconectado'}
- PROD: ${prodConnected ? '✅ Conectado' : '❌ Desconectado'}

📁 Coleções (${currentEnv}):
${collections.map(c => `  - ${c.name}: ${c.documentCount} documentos`).join('\n')}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: output
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro ao obter status: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_switch
  // ============================================
  server.registerTool(
    'firebase_switch',
    {
      title: 'Switch Firebase Environment',
      description: `Troca o ambiente Firebase ativo entre dev e prod.

⚠️ ATENÇÃO: Trocar para prod requer confirm: true

Args:
  - environment: 'dev' | 'prod'
  - confirm: boolean (obrigatório para prod)

Exemplo:
  { "environment": "prod", "confirm": true }`,
      inputSchema: SwitchEnvironmentSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: SwitchEnvironmentInput) => {
      try {
        if (params.environment === 'prod' && !params.confirm) {
          return {
            content: [{ 
              type: 'text', 
              text: `${WARNING_MESSAGES.switchToProd}\n\nPara confirmar, use: { "environment": "prod", "confirm": true }` 
            }]
          };
        }

        const newEnv = firebaseService.switchEnvironment(params.environment);
        const indicator = ENVIRONMENT_INDICATORS[newEnv];

        const warning = newEnv === 'prod' ? `\n\n${WARNING_MESSAGES.prodQuery}` : '';

        return {
          content: [{ 
            type: 'text', 
            text: `${indicator} Ambiente alterado para: ${newEnv.toUpperCase()}${warning}` 
          }],
          structuredContent: { environment: newEnv }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro ao trocar ambiente: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_query
  // ============================================
  server.registerTool(
    'firebase_query',
    {
      title: 'Query Firebase Collection',
      description: `Consulta documentos de uma coleção Firebase.

Args:
  - collection: Nome da coleção (emendas, despesas, usuarios, etc.)
  - limit: Número máximo de documentos (padrão: 50, máx: 500)
  - environment: Ambiente a consultar (opcional, usa atual)

Retorna lista de documentos com seus campos.`,
      inputSchema: QuerySchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: QueryInput) => {
      try {
        const env = params.environment || firebaseService.getCurrentEnvironment();
        const indicator = ENVIRONMENT_INDICATORS[env];
        
        const documents = await firebaseService.queryCollection(
          params.collection,
          params.limit,
          env
        );

        const warning = env === 'prod' ? `\n${WARNING_MESSAGES.prodQuery}\n` : '';

        const output = {
          collection: params.collection,
          environment: env,
          count: documents.length,
          documents
        };

        const text = `
${indicator} Query: ${params.collection}
${warning}
📊 Resultados: ${documents.length} documentos

${JSON.stringify(documents, null, 2)}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: output
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro na query: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_get_document
  // ============================================
  server.registerTool(
    'firebase_get_document',
    {
      title: 'Get Firebase Document',
      description: `Busca um documento específico por ID.

Args:
  - collection: Nome da coleção
  - documentId: ID do documento
  - environment: Ambiente (opcional)

Retorna o documento completo ou null se não existir.`,
      inputSchema: GetDocumentSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: GetDocumentInput) => {
      try {
        const env = params.environment || firebaseService.getCurrentEnvironment();
        const indicator = ENVIRONMENT_INDICATORS[env];
        
        const document = await firebaseService.getDocument(
          params.collection,
          params.documentId,
          env
        );

        if (!document) {
          return {
            content: [{ 
              type: 'text', 
              text: `${indicator} Documento não encontrado: ${params.collection}/${params.documentId}` 
            }]
          };
        }

        const text = `
${indicator} Documento: ${params.collection}/${params.documentId}

${JSON.stringify(document, null, 2)}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: document
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro ao buscar documento: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_compare
  // ============================================
  server.registerTool(
    'firebase_compare',
    {
      title: 'Compare Dev vs Prod',
      description: `Compara uma coleção entre os ambientes Dev e Prod.

Args:
  - collection: Nome da coleção a comparar

Retorna:
  - Contagem de documentos em cada ambiente
  - Campos presentes em cada ambiente
  - Diferenças identificadas`,
      inputSchema: CompareSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: CompareInput) => {
      try {
        const devCount = await firebaseService.countDocuments(params.collection, 'dev');
        const prodCount = await firebaseService.countDocuments(params.collection, 'prod');
        
        const devFields = await firebaseService.getSampleFields(params.collection, 'dev');
        const prodFields = await firebaseService.getSampleFields(params.collection, 'prod');

        const differences: string[] = [];

        // Diferença de contagem
        if (devCount !== prodCount) {
          differences.push(`Contagem diferente: DEV=${devCount}, PROD=${prodCount}`);
        }

        // Campos só em dev
        const onlyInDev = devFields.filter(f => !prodFields.includes(f));
        if (onlyInDev.length > 0) {
          differences.push(`Campos só em DEV: ${onlyInDev.join(', ')}`);
        }

        // Campos só em prod
        const onlyInProd = prodFields.filter(f => !devFields.includes(f));
        if (onlyInProd.length > 0) {
          differences.push(`Campos só em PROD: ${onlyInProd.join(', ')}`);
        }

        const output = {
          collection: params.collection,
          dev: { count: devCount, sampleFields: devFields },
          prod: { count: prodCount, sampleFields: prodFields },
          differences
        };

        const text = `
📊 Comparação: ${params.collection}

🟢 DEV:
  - Documentos: ${devCount}
  - Campos: ${devFields.join(', ') || 'nenhum'}

� PROD:
  - Documentos: ${prodCount}
  - Campos: ${prodFields.join(', ') || 'nenhum'}

${differences.length > 0 ? `⚠️ Diferenças:\n${differences.map(d => `  - ${d}`).join('\n')}` : '✅ Ambientes idênticos'}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: output
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro na comparação: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_backup
  // ============================================
  server.registerTool(
    'firebase_backup',
    {
      title: 'Backup Firebase Collection',
      description: `Exporta uma coleção completa para arquivo JSON.

Args:
  - collection: Nome da coleção a exportar
  - environment: Ambiente de onde exportar (opcional)

Retorna:
  - Caminho do arquivo de backup
  - Contagem de documentos exportados`,
      inputSchema: BackupSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false
      }
    },
    async (params: BackupInput) => {
      try {
        const env = params.environment || firebaseService.getCurrentEnvironment();
        const indicator = ENVIRONMENT_INDICATORS[env];
        
        const documents = await firebaseService.exportCollection(params.collection, env);
        
        // Criar diretório de backup se não existir
        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
          fs.mkdirSync(backupDir, { recursive: true });
        }

        // Nome do arquivo com timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${params.collection}_${env}_${timestamp}.json`;
        const filePath = path.join(backupDir, fileName);

        // Salvar arquivo
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));

        const output = {
          collection: params.collection,
          environment: env,
          documentCount: documents.length,
          backupPath: filePath,
          timestamp: new Date().toISOString()
        };

        const text = `
${indicator} Backup: ${params.collection}

✅ Backup concluído!
📁 Arquivo: ${filePath}
📊 Documentos: ${documents.length}
🕐 Timestamp: ${output.timestamp}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: output
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro no backup: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_search
  // ============================================
  server.registerTool(
    'firebase_search',
    {
      title: 'Search Firebase Documents',
      description: `Busca documentos por valor de campo.

Args:
  - collection: Nome da coleção
  - field: Campo a filtrar (ex: municipio, status, tipo)
  - value: Valor a buscar
  - limit: Limite de resultados (padrão: 50)
  - environment: Ambiente (opcional)

Exemplo:
  { "collection": "emendas", "field": "municipio", "value": "Fortaleza" }`,
      inputSchema: SearchSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async (params: SearchInput) => {
      try {
        const env = params.environment || firebaseService.getCurrentEnvironment();
        const indicator = ENVIRONMENT_INDICATORS[env];
        const db = firebaseService.getFirestore(env);

        const snapshot = await db.collection(params.collection)
          .where(params.field, '==', params.value)
          .limit(params.limit)
          .get();

        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const output = {
          collection: params.collection,
          filter: { field: params.field, value: params.value },
          environment: env,
          count: documents.length,
          documents
        };

        const text = `
${indicator} Busca: ${params.collection}
🔍 Filtro: ${params.field} = "${params.value}"

📊 Resultados: ${documents.length} documentos

${documents.length > 0 ? JSON.stringify(documents, null, 2) : 'Nenhum documento encontrado'}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: output
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro na busca: ${message}` }]
        };
      }
    }
  );

  // ============================================
  // TOOL: firebase_collections
  // ============================================
  server.registerTool(
    'firebase_collections',
    {
      title: 'List Firebase Collections',
      description: `Lista todas as coleções disponíveis no ambiente atual.

Retorna nome e contagem de documentos de cada coleção.`,
      inputSchema: {},
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false
      }
    },
    async () => {
      try {
        const env = firebaseService.getCurrentEnvironment();
        const indicator = ENVIRONMENT_INDICATORS[env];
        
        const collections = await firebaseService.listCollections();
        const collectionsInfo = await firebaseService.getCollectionsInfo();

        const text = `
${indicator} Coleções em ${env.toUpperCase()}:

${collectionsInfo.map(c => `📁 ${c.name}: ${c.documentCount} documentos`).join('\n')}

Outras coleções detectadas:
${collections.filter(c => !collectionsInfo.find(ci => ci.name === c)).map(c => `  - ${c}`).join('\n') || '  (nenhuma)'}
`;

        return {
          content: [{ type: 'text', text }],
          structuredContent: { environment: env, collections: collectionsInfo }
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido';
        return {
          content: [{ type: 'text', text: `❌ Erro ao listar coleções: ${message}` }]
        };
      }
    }
  );
}
