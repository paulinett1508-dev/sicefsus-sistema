// src/components/relatorios/geradores/BaseRelatorio.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  addHeader,
  addHeaderContinuacao,
  addFooter,
  formatCurrency,
  formatDate,
  getLogoBase64,
  gerarNomeArquivo,
} from "../../../utils/pdfHelpers";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import { parseFirestoreTimestamp } from "../../../utils/formatters";
import { DESPESA_STATUS } from "../../../config/constants";

export class BaseRelatorio {
  constructor(tipoRelatorio, emendasFiltradas, despesasFiltradas, usuario) {
    this.tipoRelatorio = tipoRelatorio;
    this.emendas = emendasFiltradas;
    this.despesas = despesasFiltradas;
    this.usuario = usuario;
    this.doc = new jsPDF();
    this.logoBase64 = null;
    this.warnings = []; // Armazena avisos de erros durante a geração
    this.tituloRelatorio = null; // Armazena título para cabeçalhos de continuação
    this.subtituloRelatorio = null; // Armazena subtítulo para cabeçalhos de continuação

    // Configurações da página
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margins = { top: 20, left: 20, right: 20, bottom: 30 };
  }

  /**
   * Adiciona um aviso de erro durante a geração
   * @param {string} message - Mensagem do aviso
   */
  addWarning(message) {
    this.warnings.push(message);
  }

  /**
   * Retorna os avisos acumulados
   * @returns {Array<string>}
   */
  getWarnings() {
    return this.warnings;
  }

  async inicializar() {
    try {
      this.logoBase64 = await getLogoBase64();
    } catch (error) {
      console.warn("Erro ao inicializar logoBase64:", error);
      this.logoBase64 = null;
    }
  }

  addHeader(titulo, subtitulo = null) {
    // Armazena título e subtítulo para uso em páginas de continuação
    this.tituloRelatorio = titulo;
    this.subtituloRelatorio = subtitulo;

    // Extrair informações do usuário para o cabeçalho
    const opcoes = {
      municipio: this.usuario?.municipio,
      uf: this.usuario?.uf,
      usuario: this.usuario?.nome || this.usuario?.email,
    };
    addHeader(this.doc, titulo, this.logoBase64, subtitulo, opcoes);
  }

  /**
   * Adiciona cabeçalho compacto para páginas de continuação
   */
  addHeaderContinuacao() {
    addHeaderContinuacao(this.doc, this.tituloRelatorio || "Relatório");
  }

  checkNewPage(yPosition, minSpace = 40) {
    if (yPosition + minSpace > this.pageHeight - this.margins.bottom) {
      this.doc.addPage();
      this.addHeaderContinuacao(); // Adiciona cabeçalho na nova página
      return 20; // Retorna nova posição Y após o cabeçalho de continuação
    }
    return yPosition;
  }

  /**
   * Cria uma tabela no PDF usando autoTable
   * @param {Object} options - Configurações da tabela
   * @returns {Object} Resultado do autoTable (contém finalY)
   */
  createTable(options) {
    const self = this;
    let isFirstPage = true;

    return autoTable(this.doc, {
      ...options,
      showHead: 'everyPage', // Repete cabeçalho da tabela em cada página
      margin: {
        left: options.margin?.left || 15,
        right: options.margin?.right || 15,
        top: 20, // Espaço para cabeçalho de continuação
        bottom: 25, // Espaço para rodapé
      },
      didDrawPage: (data) => {
        // Adiciona cabeçalho de continuação em páginas após a primeira
        if (!isFirstPage) {
          self.addHeaderContinuacao();
        }
        isFirstPage = false;

        // Chama o didDrawPage original se existir
        if (options.didDrawPage) {
          options.didDrawPage(data);
        }
      },
    });
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  formatDate(date) {
    return formatDate(date);
  }

  /**
   * Converte diferentes formatos de data para timestamp (milissegundos)
   * Suporta: string "2025-09-24", Timestamp Firestore (JS SDK e Admin SDK), ISO string
   */
  parseData(dataRaw) {
    return parseFirestoreTimestamp(dataRaw) ?? 0;
  }

  /**
   * Formata data para exibição no formato brasileiro
   * Suporta: string "2025-09-24", Timestamp Firestore (JS SDK e Admin SDK), ISO string
   */
  formatarData(dataRaw) {
    const ts = parseFirestoreTimestamp(dataRaw);
    if (ts === null) return "-";
    return new Date(ts).toLocaleDateString("pt-BR");
  }

  // ========== MÉTODOS UTILITÁRIOS COMUNS ==========

  /**
   * Retorna apenas despesas executadas (status !== PLANEJADA)
   */
  getDespesasExecutadas() {
    return this.despesas.filter(d => d.status !== DESPESA_STATUS.PLANEJADA);
  }

  /**
   * Calcula métricas gerais do relatório
   * @returns {Object} { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas }
   */
  calcularMetricas() {
    const despesasExecutadas = this.getDespesasExecutadas();
    const valorTotal = this.emendas.reduce((sum, e) => sum + (e.valorTotal || 0), 0);
    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    return {
      valorTotal,
      valorExecutado,
      saldoDisponivel,
      percentualGeral,
      totalEmendas: this.emendas.length,
      totalDespesas: despesasExecutadas.length,
    };
  }

  /**
   * Calcula execução por emenda
   * @returns {Array} Lista de emendas com valorTotal, valorExecutado, saldo, percentual
   */
  calcularExecucaoPorEmenda() {
    const despesasExecutadas = this.getDespesasExecutadas();

    return this.emendas.map((emenda) => {
      const valorEmenda = emenda.valorTotal || 0;
      const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
      const valorExecutado = despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0);
      const saldo = valorEmenda - valorExecutado;
      const percentual = valorEmenda > 0 ? (valorExecutado / valorEmenda) * 100 : 0;

      return {
        ...emenda,
        parlamentar: emenda.autor || emenda.parlamentar || "-",
        valorTotal: valorEmenda,
        valorExecutado,
        saldo,
        percentual,
        despesasCount: despesasEmenda.length,
      };
    });
  }

  /**
   * Agrupa despesas por fornecedor
   * @param {boolean} apenasExecutadas - Se true, considera apenas despesas executadas
   * @returns {Object} { fornecedor: { quantidade, valor } }
   */
  calcularPorFornecedor(apenasExecutadas = true) {
    const despesas = apenasExecutadas ? this.getDespesasExecutadas() : this.despesas;
    const porFornecedor = {};

    despesas.forEach((d) => {
      const fornecedor = d.fornecedor || "Nao informado";
      if (!porFornecedor[fornecedor]) {
        porFornecedor[fornecedor] = { quantidade: 0, valor: 0 };
      }
      porFornecedor[fornecedor].quantidade++;
      porFornecedor[fornecedor].valor += d.valor || 0;
    });

    return porFornecedor;
  }

  /**
   * Obtém lista única de parlamentares
   * @returns {Array} Lista de nomes de parlamentares
   */
  getParlamentares() {
    return [...new Set(this.emendas.map(e => e.autor || e.parlamentar).filter(Boolean))].sort();
  }

  /**
   * Formata subtítulo do período baseado nos filtros
   * @param {Object} filtros
   * @returns {string|null}
   */
  getSubtituloPeriodo(filtros) {
    if (filtros.dataInicio || filtros.dataFim) {
      const inicio = filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Inicio";
      const fim = filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual";
      return `Periodo: ${inicio} a ${fim}`;
    }

    // Fallback para mês/ano — coerce explicitamente para number (onChange retorna string)
    const mes = Number(filtros.mes) || new Date().getMonth() + 1;
    const ano = Number(filtros.ano) || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });
    return `${nomeMes} ${ano}`;
  }

  /**
   * Adiciona rodapé com número de página em TODAS as páginas do documento.
   * Deve ser chamado como última etapa antes de salvar.
   */
  addFooterTodasPaginas() {
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      addFooter(this.doc, i, this.usuario, totalPages);
    }
  }

  // ========== MÉTODOS COMPARTILHADOS DE PDF ==========

  /**
   * Adiciona bloco visual com filtros ativos no topo do relatório
   */
  addFiltrosAplicados(filtros, yPosition) {
    const tags = [];

    if (filtros.parlamentar) {
      tags.push({ label: "Parlamentar", value: filtros.parlamentar });
    }
    if (filtros.emenda) {
      const emenda = this.emendas.find(e => e.id === filtros.emenda);
      if (emenda) {
        const parlamentar = emenda.autor || emenda.parlamentar || "";
        const desc = [emenda.numero || emenda.numeroEmenda, parlamentar, emenda.municipio]
          .filter(Boolean).join(" - ");
        tags.push({ label: "Emenda", value: desc });
      }
    }
    if (filtros.municipio) {
      tags.push({ label: "Município", value: filtros.municipio });
    }
    if (filtros.fornecedor) {
      tags.push({ label: "Fornecedor", value: filtros.fornecedor });
    }

    if (tags.length === 0) return yPosition;

    const margins = { left: 15, right: 15 };
    const boxHeight = 6 + (tags.length * 5);

    this.doc.setFillColor(...PDF_COLORS.SLATE_50);
    this.doc.roundedRect(margins.left, yPosition - 2, this.pageWidth - margins.left - margins.right, boxHeight, 1.5, 1.5, "F");
    this.doc.setDrawColor(...PDF_COLORS.SLATE_200);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(margins.left, yPosition - 2, this.pageWidth - margins.left - margins.right, boxHeight, 1.5, 1.5, "S");

    this.doc.setTextColor(...PDF_COLORS.SLATE_700);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Filtros Aplicados:", margins.left + 3, yPosition + 2);
    yPosition += 5;

    tags.forEach((tag) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      this.doc.text(`${tag.label}: `, margins.left + 5, yPosition + 1);

      const labelWidth = this.doc.getTextWidth(`${tag.label}: `);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...PDF_COLORS.SLATE_900);
      this.doc.text(tag.value, margins.left + 5 + labelWidth, yPosition + 1);
      yPosition += 4;
    });

    return yPosition + 6;
  }

  /**
   * Cabeçalho visual de seção de parlamentar com barra accent
   * @param {Object} parlamentar - { nome, emendas: [], despesas: [], valorTotal }
   */
  addParlamentarHeader(parlamentar, yPosition) {
    const margins = { left: 15, right: 15 };
    const contentWidth = this.pageWidth - margins.left - margins.right;

    this.doc.setFillColor(...PDF_COLORS.SLATE_100);
    this.doc.roundedRect(margins.left, yPosition - 1, contentWidth, 18, 1.5, 1.5, "F");

    // Barra lateral accent
    this.doc.setFillColor(...PDF_COLORS.ACCENT);
    this.doc.rect(margins.left, yPosition - 1, 2, 18, "F");

    // Nome do parlamentar
    this.doc.setTextColor(...PDF_COLORS.SLATE_900);
    this.doc.setFontSize(9);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(parlamentar.nome, margins.left + 6, yPosition + 5);

    // Emendas e municípios
    const emendasNums = parlamentar.emendas
      .map(e => e.numero || e.numeroEmenda)
      .filter(Boolean)
      .join(", ");
    const municipios = [...new Set(parlamentar.emendas.map(e => e.municipio).filter(Boolean))].join(", ");

    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    const infoLeft = [];
    if (emendasNums) infoLeft.push(`Emendas: ${emendasNums}`);
    if (municipios) infoLeft.push(`Município(s): ${municipios}`);
    this.doc.text(infoLeft.join("  |  "), margins.left + 6, yPosition + 11);

    // Totalizador (direita)
    this.doc.setTextColor(...PDF_COLORS.SLATE_900);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `${parlamentar.despesas.length} despesas — ${this.formatCurrency(parlamentar.valorTotal)}`,
      this.pageWidth - margins.right - 3, yPosition + 8,
      { align: "right" }
    );

    return yPosition + 22;
  }

  /**
   * Agrupa emendas e despesas por parlamentar
   * @returns {Array} Lista ordenada de { nome, emendas, despesas, valorTotal }
   */
  agruparPorParlamentar() {
    const parlamentarMap = new Map();

    this.emendas.forEach((emenda) => {
      const nome = emenda.autor || emenda.parlamentar || "Não identificado";
      if (!parlamentarMap.has(nome)) {
        parlamentarMap.set(nome, { emendas: [], despesas: [] });
      }
      parlamentarMap.get(nome).emendas.push(emenda);
    });

    const emendaIdToParlamentar = new Map();
    this.emendas.forEach((emenda) => {
      emendaIdToParlamentar.set(emenda.id, emenda.autor || emenda.parlamentar || "Não identificado");
    });

    const despesasExecutadas = this.getDespesasExecutadas();
    despesasExecutadas.forEach((d) => {
      const nome = emendaIdToParlamentar.get(d.emendaId) || "Não identificado";
      if (!parlamentarMap.has(nome)) {
        parlamentarMap.set(nome, { emendas: [], despesas: [] });
      }
      parlamentarMap.get(nome).despesas.push(d);
    });

    return [...parlamentarMap.entries()]
      .map(([nome, dados]) => ({
        nome,
        ...dados,
        valorTotal: dados.despesas.reduce((sum, d) => sum + (d.valor || 0), 0),
      }))
      .sort((a, b) => b.valorTotal - a.valorTotal);
  }

  /**
   * Bloco formal de encerramento com declaração de conformidade e assinaturas
   * Baseado no padrão de prestação de contas do SUS (LC 141/2012, Portaria GM/MS 828/2020)
   */
  addBlocoAssinaturas(yPosition) {
    const margins = { left: 15, right: 15 };
    const contentWidth = this.pageWidth - margins.left - margins.right;

    yPosition = this.checkNewPage(yPosition, 120);

    // Linha separadora
    this.doc.setDrawColor(...PDF_COLORS.SLATE_300);
    this.doc.setLineWidth(0.5);
    this.doc.line(margins.left, yPosition, this.pageWidth - margins.right, yPosition);
    yPosition += 8;

    // Declaração de conformidade
    this.doc.setTextColor(...PDF_COLORS.SLATE_700);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DECLARAÇÃO DE CONFORMIDADE", margins.left, yPosition);
    yPosition += 6;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(7);
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const declaracao = "Declaro(amos), para os devidos fins de prestação de contas, que os valores acima relacionados " +
      "foram realizados em conformidade com a legislação vigente, em especial a Lei Complementar nº 141/2012, " +
      "a Portaria GM/MS nº 828/2020 e demais normas aplicáveis ao financiamento e à transferência de recursos " +
      "do Sistema Único de Saúde (SUS), estando os documentos fiscais comprobatórios arquivados e disponíveis " +
      "para verificação pelos órgãos de controle interno e externo.";

    const linhasDeclaracao = this.doc.splitTextToSize(declaracao, contentWidth);
    this.doc.text(linhasDeclaracao, margins.left, yPosition);
    yPosition += (linhasDeclaracao.length * 3.5) + 8;

    // Local e data
    const municipio = this.usuario?.municipio || "________________";
    const uf = this.usuario?.uf || "__";
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit", month: "long", year: "numeric",
    });

    this.doc.setFontSize(8);
    this.doc.setTextColor(...PDF_COLORS.SLATE_700);
    this.doc.text(`${municipio} - ${uf}, ${dataAtual}.`, margins.left, yPosition);
    yPosition += 14;

    // Assinaturas (3 colunas)
    const colWidth = contentWidth / 3;
    const lineLength = colWidth - 10;

    const assinaturas = [
      { cargo: "Gestor(a) Municipal de Saúde", sub: "Secretário(a) Municipal de Saúde" },
      { cargo: "Ordenador(a) de Despesas", sub: "Responsável pela Execução Financeira" },
      { cargo: "Contador(a) / Responsável Técnico", sub: "CRC nº _______________" },
    ];

    assinaturas.forEach((assinatura, idx) => {
      const colX = margins.left + (idx * colWidth);
      const centerX = colX + colWidth / 2;

      this.doc.setDrawColor(...PDF_COLORS.SLATE_400);
      this.doc.setLineWidth(0.3);
      this.doc.line(centerX - lineLength / 2, yPosition, centerX + lineLength / 2, yPosition);

      this.doc.setTextColor(...PDF_COLORS.SLATE_700);
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(assinatura.cargo, centerX, yPosition + 4, { align: "center" });

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(6);
      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      this.doc.text(assinatura.sub, centerX, yPosition + 8, { align: "center" });
    });

    yPosition += 16;

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text(
      "Documento gerado eletronicamente pelo SICEFSUS - Sistema de Controle de Execuções Financeiras do SUS.",
      this.pageWidth / 2, yPosition, { align: "center" }
    );
    this.doc.text(
      "A autenticidade deste relatório pode ser verificada junto ao órgão emissor.",
      this.pageWidth / 2, yPosition + 3.5, { align: "center" }
    );
  }

  async gerar() {
    await this.inicializar();
    // Método a ser implementado pelas subclasses
    throw new Error("Método gerar() deve ser implementado pela subclasse");
  }

  salvar() {
    const nomeArquivo = gerarNomeArquivo(this.tipoRelatorio.id);
    this.doc.save(nomeArquivo);
  }
}
