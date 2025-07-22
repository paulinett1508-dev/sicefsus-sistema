#!/usr/bin/env node

/**
 * 🔄 SCRIPT DE TRANSFORMAÇÃO SICEFSUS - ES MODULES
 * Substitui sistematicamente todas as referências de "Lançamento" por "Despesa"
 * 
 * USO: node transform-sicefsus.mjs
 * OU: node transform-sicefsus.js (se renomear)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para ES modules - equivalente ao __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 CONFIGURAÇÕES
const CONFIG = {
  // Pasta raiz do projeto (ajuste conforme necessário)
  projectRoot: './src',

  // Criar backup antes das transformações
  createBackup: true,
  backupFolder: './backup-antes-transformacao',

  // Extensões de arquivo para processar
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.html', '.css'],

  // Pastas para ignorar
  ignoreFolders: ['node_modules', '.git', 'dist', 'build', 'backup-antes-transformacao'],

  // Arquivos específicos para ignorar
  ignoreFiles: ['package-lock.json', '.gitignore'],

  // Log detalhado
  verbose: true
};

// 🔄 MAPEAMENTO DE SUBSTITUIÇÕES
const SUBSTITUICOES = [
  // Plural primeiro para evitar conflitos
  { de: /Lançamentos/g, para: 'Despesas' },
  { de: /lançamentos/g, para: 'despesas' },
  { de: /Lancamentos/g, para: 'Despesas' },
  { de: /lancamentos/g, para: 'despesas' },

  // Singular depois
  { de: /Lançamento/g, para: 'Despesa' },
  { de: /lançamento/g, para: 'despesa' },
  { de: /Lancamento/g, para: 'Despesa' },
  { de: /lancamento/g, para: 'despesa' },
];

// 🔄 RENOMEAÇÃO DE ARQUIVOS
const ARQUIVOS_RENOMEAR = [
  { de: 'Lancamentos.jsx', para: 'Despesas.jsx' },
  { de: 'LancamentoForm.jsx', para: 'DespesaForm.jsx' },
  { de: 'LancamentosTable.jsx', para: 'DespesasTable.jsx' },
  { de: 'LancamentosFilters.jsx', para: 'DespesasFilters.jsx' },
  { de: 'LancamentosList.jsx', para: 'DespesasList.jsx' },
];

// 📊 ESTATÍSTICAS
let stats = {
  arquivosProcessados: 0,
  arquivosModificados: 0,
  arquivosRenomeados: 0,
  substituicoesFeitas: 0,
  erros: 0
};

/**
 * 📝 Função de log com cores
 */
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    warning: '\x1b[33m', // Yellow
    error: '\x1b[31m',   // Red
    reset: '\x1b[0m'     // Reset
  };

  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
}

/**
 * 📁 Verificar se deve ignorar pasta
 */
function deveIgnorarPasta(pasta) {
  return CONFIG.ignoreFolders.some(ignore => pasta.includes(ignore));
}

/**
 * 📄 Verificar se deve ignorar arquivo
 */
function deveIgnorarArquivo(arquivo) {
  return CONFIG.ignoreFiles.some(ignore => arquivo.includes(ignore));
}

/**
 * 📂 Obter todos os arquivos recursivamente
 */
function obterArquivos(dir, arquivos = []) {
  if (!fs.existsSync(dir)) {
    log(`❌ Pasta não encontrada: ${dir}`, 'error');
    return arquivos;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.lstatSync(fullPath);

    if (stat.isDirectory()) {
      if (!deveIgnorarPasta(fullPath)) {
        obterArquivos(fullPath, arquivos);
      }
    } else {
      const ext = path.extname(item).toLowerCase();
      if (CONFIG.fileExtensions.includes(ext) && !deveIgnorarArquivo(item)) {
        arquivos.push(fullPath);
      }
    }
  }

  return arquivos;
}

/**
 * 💾 Criar backup do projeto
 */
function criarBackup() {
  if (!CONFIG.createBackup) return;

  log('📦 Criando backup do projeto...', 'info');

  try {
    // Criar pasta de backup
    if (fs.existsSync(CONFIG.backupFolder)) {
      fs.rmSync(CONFIG.backupFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(CONFIG.backupFolder, { recursive: true });

    // Copiar arquivos
    copiarPasta(CONFIG.projectRoot, CONFIG.backupFolder);
    log('✅ Backup criado com sucesso!', 'success');
  } catch (error) {
    log(`❌ Erro ao criar backup: ${error.message}`, 'error');
    process.exit(1);
  }
}

/**
 * 📁 Copiar pasta recursivamente
 */
function copiarPasta(origem, destino) {
  if (!fs.existsSync(origem)) return;

  if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino, { recursive: true });
  }

  const items = fs.readdirSync(origem);

  for (const item of items) {
    const origemPath = path.join(origem, item);
    const destinoPath = path.join(destino, item);
    const stat = fs.lstatSync(origemPath);

    if (stat.isDirectory()) {
      if (!deveIgnorarPasta(origemPath)) {
        copiarPasta(origemPath, destinoPath);
      }
    } else {
      fs.copyFileSync(origemPath, destinoPath);
    }
  }
}

/**
 * 🔄 Processar conteúdo do arquivo
 */
function processarConteudo(conteudo, nomeArquivo) {
  let conteudoModificado = conteudo;
  let modificacoes = 0;

  for (const substituicao of SUBSTITUICOES) {
    const matches = conteudoModificado.match(substituicao.de);
    if (matches) {
      conteudoModificado = conteudoModificado.replace(substituicao.de, substituicao.para);
      modificacoes += matches.length;

      if (CONFIG.verbose && matches.length > 0) {
        log(`  🔄 ${matches.length}x "${substituicao.de.source}" → "${substituicao.para}"`, 'info');
      }
    }
  }

  return { conteudo: conteudoModificado, modificacoes };
}

/**
 * 📄 Processar arquivo individual
 */
function processarArquivo(caminhoArquivo) {
  try {
    const conteudoOriginal = fs.readFileSync(caminhoArquivo, 'utf8');
    const { conteudo: conteudoModificado, modificacoes } = processarConteudo(conteudoOriginal, caminhoArquivo);

    stats.arquivosProcessados++;

    if (modificacoes > 0) {
      fs.writeFileSync(caminhoArquivo, conteudoModificado, 'utf8');
      stats.arquivosModificados++;
      stats.substituicoesFeitas += modificacoes;

      log(`✅ ${path.basename(caminhoArquivo)} - ${modificacoes} substituições`, 'success');
    } else if (CONFIG.verbose) {
      log(`⏭️  ${path.basename(caminhoArquivo)} - sem alterações`, 'info');
    }

  } catch (error) {
    log(`❌ Erro ao processar ${caminhoArquivo}: ${error.message}`, 'error');
    stats.erros++;
  }
}

/**
 * 🏷️ Renomear arquivos específicos
 */
function renomearArquivos() {
  log('\n📝 Renomeando arquivos específicos...', 'info');

  const todosArquivos = obterArquivos(CONFIG.projectRoot);

  for (const renomeacao of ARQUIVOS_RENOMEAR) {
    const arquivosEncontrados = todosArquivos.filter(arquivo => 
      path.basename(arquivo) === renomeacao.de
    );

    for (const arquivoOriginal of arquivosEncontrados) {
      const pasta = path.dirname(arquivoOriginal);
      const novoArquivo = path.join(pasta, renomeacao.para);

      try {
        fs.renameSync(arquivoOriginal, novoArquivo);
        stats.arquivosRenomeados++;
        log(`🏷️  ${renomeacao.de} → ${renomeacao.para}`, 'success');
      } catch (error) {
        log(`❌ Erro ao renomear ${arquivoOriginal}: ${error.message}`, 'error');
        stats.erros++;
      }
    }
  }
}

/**
 * 📊 Exibir estatísticas finais
 */
function exibirEstatisticas() {
  log('\n📊 RELATÓRIO DE TRANSFORMAÇÃO', 'info');
  log('═'.repeat(50), 'info');
  log(`📄 Arquivos processados: ${stats.arquivosProcessados}`, 'info');
  log(`✅ Arquivos modificados: ${stats.arquivosModificados}`, 'success');
  log(`🏷️ Arquivos renomeados: ${stats.arquivosRenomeados}`, 'success');
  log(`🔄 Total de substituições: ${stats.substituicoesFeitas}`, 'success');
  log(`❌ Erros encontrados: ${stats.erros}`, stats.erros > 0 ? 'error' : 'success');
  log('═'.repeat(50), 'info');

  if (stats.erros === 0) {
    log('🎉 TRANSFORMAÇÃO CONCLUÍDA COM SUCESSO!', 'success');
    log('🚀 Sistema SICEFSUS pronto com módulo Despesas!', 'success');
    log(`💾 Backup disponível em: ${CONFIG.backupFolder}`, 'info');
  } else {
    log('⚠️  Transformação concluída com alguns erros.', 'warning');
    log('📋 Verifique os logs acima para detalhes.', 'warning');
  }
}

/**
 * 🎯 FUNÇÃO PRINCIPAL
 */
function main() {
  console.clear();
  log('🔄 INICIANDO TRANSFORMAÇÃO SICEFSUS', 'info');
  log('🎯 Lançamentos → Despesas', 'info');
  log('📦 Versão ES Modules', 'info');
  log('═'.repeat(50), 'info');

  // Verificar se a pasta do projeto existe
  if (!fs.existsSync(CONFIG.projectRoot)) {
    log(`❌ Pasta do projeto não encontrada: ${CONFIG.projectRoot}`, 'error');
    log('💡 Ajuste a variável CONFIG.projectRoot no script', 'warning');
    process.exit(1);
  }

  // Criar backup
  criarBackup();

  // Obter lista de arquivos
  log('\n🔍 Buscando arquivos para processar...', 'info');
  const arquivos = obterArquivos(CONFIG.projectRoot);
  log(`📄 ${arquivos.length} arquivos encontrados`, 'info');

  // Processar conteúdo dos arquivos
  log('\n🔄 Processando conteúdo dos arquivos...', 'info');
  for (const arquivo of arquivos) {
    processarArquivo(arquivo);
  }

  // Renomear arquivos específicos
  renomearArquivos();

  // Exibir estatísticas
  exibirEstatisticas();
}

// 🚀 EXECUTAR SCRIPT
main();