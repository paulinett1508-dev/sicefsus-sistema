#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

class ProjectAnalyzer {
  constructor() {
    this.fileExtensions = {
      ".js": "JavaScript",
      ".jsx": "React Component",
      ".ts": "TypeScript",
      ".tsx": "TypeScript React",
      ".css": "Stylesheet",
      ".scss": "Sass Stylesheet",
      ".json": "Configuration",
      ".env": "Environment Variables",
      ".md": "Documentation",
      ".html": "HTML Template",
      ".py": "Python Script",
      ".php": "PHP Script",
      ".java": "Java Class",
      ".cpp": "C++ Source",
      ".c": "C Source",
      ".go": "Go Source",
    };

    this.ignoreDirs = [
      "node_modules",
      ".git",
      ".next",
      "build",
      "dist",
      ".cache",
      "coverage",
      ".nyc_output",
      "tmp",
      "temp",
      ".replit",
      "__pycache__",
      ".pytest_cache",
      "scripts",
    ];

    this.ignoreFiles = [
      ".DS_Store",
      "Thumbs.db",
      ".gitignore",
      ".gitkeep",
      "yarn.lock",
      "package-lock.json",
      ".npmrc",
    ];

    this.relationships = [];
    this.allFiles = [];
    this.markdownContent = "";
  }

  // Conta linhas de código (excluindo vazias e comentários)
  countCodeLines(filePath) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      let codeLines = 0;
      let inBlockComment = false;

      for (let line of lines) {
        line = line.trim();

        // Pular linhas vazias
        if (!line) continue;

        // Detectar comentários em bloco
        if (line.includes("/*")) inBlockComment = true;
        if (line.includes("*/")) {
          inBlockComment = false;
          continue;
        }
        if (inBlockComment) continue;

        // Pular comentários de linha
        if (
          line.startsWith("//") ||
          line.startsWith("#") ||
          line.startsWith("<!--")
        )
          continue;

        codeLines++;
      }

      return codeLines;
    } catch (error) {
      return 0;
    }
  }

  // Determina o objetivo do arquivo baseado no nome e conteúdo
  getFilePurpose(filePath, fileName) {
    const ext = path.extname(fileName).toLowerCase();
    const baseName = path.basename(fileName, ext).toLowerCase();

    try {
      const content = fs.readFileSync(filePath, "utf8").toLowerCase();

      // Verificações específicas por nome
      if (fileName === "package.json")
        return "📦 Configuração de dependências do projeto";
      if (fileName === ".env") return "🔐 Variáveis de ambiente";
      if (fileName === "README.md")
        return "📖 Documentação principal do projeto";
      if (baseName === "index") return "🚪 Arquivo de entrada/exportação";
      if (baseName.includes("config")) return "⚙️ Arquivo de configuração";
      if (baseName.includes("test") || baseName.includes("spec"))
        return "🧪 Arquivo de testes";
      if (baseName.includes("route") || baseName.includes("router"))
        return "🛣️ Roteamento de navegação";
      if (baseName.includes("service")) return "🔧 Serviço/API de negócio";
      if (baseName.includes("util") || baseName.includes("helper"))
        return "🛠️ Funções utilitárias";
      if (baseName.includes("context"))
        return "🗃️ Contexto React (estado global)";
      if (baseName.includes("hook")) return "🪝 Hook customizado React";
      if (baseName.includes("component")) return "🧩 Componente React";
      if (baseName.includes("form")) return "📋 Formulário/entrada de dados";
      if (baseName.includes("modal")) return "🪟 Modal/popup de interface";
      if (baseName.includes("layout")) return "📐 Layout/estrutura de página";
      if (baseName.includes("theme")) return "🎨 Tema/estilos visuais";

      // Verificações por conteúdo
      if (
        content.includes("export default function") ||
        (content.includes("const") && content.includes("= () =>"))
      ) {
        if (content.includes("usestate") || content.includes("useeffect")) {
          return "⚛️ Componente React com estado";
        }
        return "🧩 Componente React funcional";
      }

      if (content.includes("class") && content.includes("extends component")) {
        return "🏗️ Componente React de classe";
      }

      if (content.includes("express") || content.includes("app.listen")) {
        return "🖥️ Servidor Express/API Backend";
      }

      if (content.includes("firebase") || content.includes("firestore")) {
        return "🔥 Integração com Firebase";
      }

      if (content.includes("axios") || content.includes("fetch(")) {
        return "📡 Cliente HTTP/API";
      }

      if (content.includes("router") && content.includes("route")) {
        return "🛣️ Configuração de rotas";
      }

      // Por extensão
      switch (ext) {
        case ".css":
        case ".scss":
          return "🎨 Estilos/aparência visual";
        case ".json":
          return "📄 Dados/configuração JSON";
        case ".md":
          return "📝 Documentação em Markdown";
        case ".html":
          return "📄 Página/template HTML";
        case ".env":
          return "🔐 Variáveis de ambiente";
        default:
          return `💻 ${this.fileExtensions[ext] || "Arquivo de código"}`;
      }
    } catch (error) {
      return `💻 ${this.fileExtensions[ext] || "Arquivo de código"}`;
    }
  }

  // Analisa relações entre arquivos (imports/exports)
  analyzeRelationships(filePath, fileName) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      const imports = [];

      // Regex para capturar imports
      const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
      const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;

      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }

      if (imports.length > 0) {
        this.relationships.push({
          file: fileName,
          imports: imports.filter(
            (imp) => !imp.startsWith("react") && !imp.startsWith("node:"),
          ),
        });
      }
    } catch (error) {
      // Ignorar erros de leitura
    }
  }

  // Percorre diretório recursivamente
  traverseDirectory(dirPath, depth = 0, maxDepth = 10) {
    if (depth > maxDepth) return [];

    const items = [];

    try {
      const entries = fs.readdirSync(dirPath);

      for (const entry of entries) {
        // Ignorar arquivos/pastas do sistema
        if (
          this.ignoreDirs.includes(entry) ||
          this.ignoreFiles.includes(entry)
        ) {
          continue;
        }

        // Incluir apenas .env e package.json dos ocultos
        if (
          entry.startsWith(".") &&
          !["package.json", ".env"].includes(entry)
        ) {
          continue;
        }

        const fullPath = path.join(dirPath, entry);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          items.push({
            type: "directory",
            name: entry,
            path: fullPath,
            depth,
            children: this.traverseDirectory(fullPath, depth + 1, maxDepth),
          });
        } else {
          const lines = this.countCodeLines(fullPath);
          const purpose = this.getFilePurpose(fullPath, entry);

          this.allFiles.push({
            name: entry,
            path: fullPath,
            lines,
            purpose,
          });

          this.analyzeRelationships(fullPath, entry);

          items.push({
            type: "file",
            name: entry,
            path: fullPath,
            lines,
            purpose,
            depth,
          });
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao ler diretório ${dirPath}: ${error.message}`);
    }

    return items;
  }

  // Gera markdown da árvore
  generateTreeMarkdown(items) {
    let markdown = "";

    for (const item of items) {
      const indent = "  ".repeat(item.depth);

      if (item.type === "directory") {
        markdown += `${indent}- 📁 **${item.name}/**\n`;
        markdown += this.generateTreeMarkdown(item.children);
      } else {
        const linesInfo = item.lines > 0 ? ` *(${item.lines} linhas)*` : "";
        markdown += `${indent}- 📄 \`${item.name}\`${linesInfo}\n`;
        markdown += `${indent}  - ${item.purpose}\n`;
      }
    }

    return markdown;
  }

  // Gera estatísticas em markdown
  generateStatsMarkdown() {
    const totalFiles = this.allFiles.length;
    const totalLines = this.allFiles.reduce((sum, file) => sum + file.lines, 0);
    const fileTypes = {};

    this.allFiles.forEach((file) => {
      const ext = path.extname(file.name) || "sem extensão";
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    });

    let markdown = `## 📊 Estatísticas do Projeto\n\n`;
    markdown += `| Métrica | Valor |\n`;
    markdown += `|---------|-------|\n`;
    markdown += `| 📁 Total de arquivos | ${totalFiles} |\n`;
    markdown += `| 📝 Total de linhas | ${totalLines.toLocaleString()} |\n`;
    markdown += `| 📈 Média de linhas por arquivo | ${Math.round(totalLines / totalFiles)} |\n\n`;

    markdown += `### 📂 Distribuição por Tipo de Arquivo\n\n`;
    markdown += `| Extensão | Quantidade |\n`;
    markdown += `|----------|------------|\n`;

    Object.entries(fileTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([ext, count]) => {
        markdown += `| \`${ext}\` | ${count} |\n`;
      });

    return markdown + "\n";
  }

  // Gera relações em markdown
  generateRelationshipsMarkdown() {
    let markdown = `## 🔗 Relações Entre Arquivos\n\n`;

    if (this.relationships.length === 0) {
      markdown += `*Nenhuma relação de import/export detectada.*\n\n`;
      return markdown;
    }

    this.relationships.forEach((rel) => {
      if (rel.imports.length > 0) {
        markdown += `### 📄 \`${rel.file}\`\n\n`;
        markdown += `**Importa:**\n`;
        rel.imports.forEach((imp) => {
          markdown += `- \`${imp}\`\n`;
        });
        markdown += "\n";
      }
    });

    return markdown;
  }

  // Gera arquivo completo em markdown
  generateMarkdownReport(projectPath) {
    const projectName = path.basename(path.resolve(projectPath));
    const currentDate = new Date().toLocaleString("pt-BR");

    let markdown = `# 🔍 Análise do Projeto: ${projectName}\n\n`;
    markdown += `**Data da análise:** ${currentDate}  \n`;
    markdown += `**Caminho analisado:** \`${path.resolve(projectPath)}\`\n\n`;
    markdown += `---\n\n`;

    // Índice
    markdown += `## 📋 Índice\n\n`;
    markdown += `1. [Estrutura de Arquivos](#-estrutura-de-arquivos)\n`;
    markdown += `2. [Estatísticas do Projeto](#-estatísticas-do-projeto)\n`;
    markdown += `3. [Relações Entre Arquivos](#-relações-entre-arquivos)\n\n`;
    markdown += `---\n\n`;

    // Estrutura de arquivos
    const tree = this.traverseDirectory(projectPath);
    markdown += `## 📁 Estrutura de Arquivos\n\n`;
    markdown += this.generateTreeMarkdown(tree);
    markdown += `\n---\n\n`;

    // Estatísticas
    markdown += this.generateStatsMarkdown();
    markdown += `---\n\n`;

    // Relações
    markdown += this.generateRelationshipsMarkdown();

    // Rodapé
    markdown += `---\n\n`;
    markdown += `*Relatório gerado automaticamente pelo **Analisador de Projeto Replit***\n`;

    return markdown;
  }

  // Salva arquivo markdown
  saveMarkdownReport(projectPath, outputPath = null) {
    const markdown = this.generateMarkdownReport(projectPath);

    if (!outputPath) {
      const projectName = path.basename(path.resolve(projectPath));
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, "-");
      outputPath = `analise-${projectName}-${timestamp}.md`;
    }

    try {
      fs.writeFileSync(outputPath, markdown, "utf8");
      console.log(`✅ Relatório salvo em: ${path.resolve(outputPath)}`);
      return outputPath;
    } catch (error) {
      console.error(`❌ Erro ao salvar arquivo: ${error.message}`);
      return null;
    }
  }

  // Método principal
  analyze(projectPath = "..", outputMarkdown = true) {
    console.log("🔍 ANALISADOR DE PROJETO REPLIT");
    console.log("=".repeat(60));
    console.log(`📂 Analisando: ${path.resolve(projectPath)}`);

    if (outputMarkdown) {
      const reportPath = this.saveMarkdownReport(projectPath);
      if (reportPath) {
        console.log(`📄 Relatório Markdown gerado: ${reportPath}`);
      }
    }

    console.log("\n✅ Análise concluída!");
  }
}

// Executar o analisador
if (require.main === module) {
  const analyzer = new ProjectAnalyzer();
  // Por padrão analisa a pasta pai (raiz do projeto) e gera markdown
  const projectPath = process.argv[2] || "..";
  const generateMarkdown = process.argv[3] !== "--no-markdown";

  analyzer.analyze(projectPath, generateMarkdown);
}

module.exports = ProjectAnalyzer;
