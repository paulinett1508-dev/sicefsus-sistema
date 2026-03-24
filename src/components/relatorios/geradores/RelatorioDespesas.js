// src/components/relatorios/geradores/RelatorioDespesas.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";
import { DESPESA_STATUS } from "../../../config/constants";

export class RelatorioDespesas extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // Subtítulo com período + filtros ativos
    const subtitulo = this.buildSubtitulo(filtros);
    this.addHeader("Relatório de Despesas Detalhadas", subtitulo);

    let yPosition = 58;

    // Bloco de filtros aplicados (abaixo do header)
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs gerais
    const despesasExecutadas = this.getDespesasExecutadas();
    const despesasPlanejadas = this.despesas.filter(d => d.status === DESPESA_STATUS.PLANEJADA);
    const totalDespesas = this.despesas.length;
    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const valorPlanejado = despesasPlanejadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const fornecedoresUnicos = new Set(this.despesas.map(d => d.fornecedor).filter(Boolean)).size;

    const kpis = [
      { label: "Total Despesas", value: totalDespesas.toString() },
      { label: "Valor Executado", value: this.formatCurrency(valorExecutado) },
      { label: "Planejado", value: this.formatCurrency(valorPlanejado) },
      { label: "Fornecedores", value: fornecedoresUnicos.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // Resumo geral
    yPosition = addSectionTitle(this.doc, "Resumo das Despesas", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const mediaValor = totalDespesas > 0 ? (valorExecutado + valorPlanejado) / totalDespesas : 0;
    const maiorDespesa = this.despesas.reduce((max, d) => Math.max(max, d.valor || 0), 0);

    const resumoItems = [
      `Despesas Executadas: ${despesasExecutadas.length}`,
      `Despesas Planejadas: ${despesasPlanejadas.length}`,
      `Valor Médio por Despesa: ${this.formatCurrency(mediaValor)}`,
      `Maior Despesa: ${this.formatCurrency(isNaN(maiorDespesa) ? 0 : maiorDespesa)}`,
      `Fornecedores Distintos: ${fornecedoresUnicos}`,
    ];

    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    // Tabela por status
    yPosition = this.addTabelaStatus(yPosition);

    // LISTAGEM DETALHADA — decisão por filtro
    const temFiltroParlamentar = !!filtros.parlamentar;
    const temFiltroEmenda = !!filtros.emenda;

    if (temFiltroParlamentar || temFiltroEmenda) {
      // Filtro específico: tabela única com todas despesas
      yPosition = this.addListagemUnica(yPosition);
    } else {
      // Sem filtro de parlamentar: agrupar por parlamentar → emendas → despesas
      yPosition = this.addListagemPorParlamentar(yPosition);
    }

    // Top 5 Fornecedores
    yPosition = this.addTopFornecedores(yPosition);

    // Bloco de encerramento profissional com assinaturas
    this.addBlocoAssinaturas(yPosition);

    // Rodapé em TODAS as páginas com número de página
    this.addFooterTodasPaginas();
  }

  // =============================================
  // SUBTÍTULO E FILTROS
  // =============================================

  buildSubtitulo(filtros) {
    const partes = [];
    const periodo = this.getSubtituloPeriodo(filtros);
    if (periodo) partes.push(periodo);
    return partes.join(" | ") || null;
  }

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

    // Fundo cinza claro para o bloco de filtros
    const boxHeight = 6 + (tags.length * 5);
    this.doc.setFillColor(...PDF_COLORS.SLATE_50);
    this.doc.roundedRect(margins.left, yPosition - 2, this.pageWidth - margins.left - margins.right, boxHeight, 1.5, 1.5, "F");
    this.doc.setDrawColor(...PDF_COLORS.SLATE_200);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(margins.left, yPosition - 2, this.pageWidth - margins.left - margins.right, boxHeight, 1.5, 1.5, "S");

    // Título "Filtros Aplicados"
    this.doc.setTextColor(...PDF_COLORS.SLATE_700);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("Filtros Aplicados:", margins.left + 3, yPosition + 2);
    yPosition += 5;

    // Cada filtro
    tags.forEach((tag) => {
      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(7);
      this.doc.setTextColor(...PDF_COLORS.SLATE_600);
      this.doc.text(`${tag.label}: `, margins.left + 5, yPosition + 1);

      const labelWidth = this.doc.getTextWidth(`${tag.label}: `);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...PDF_COLORS.SLATE_900);
      this.doc.text(tag.value, margins.left + 5 + labelWidth, yPosition + 1);
      yPosition += 4;
    });

    return yPosition + 6;
  }

  // =============================================
  // TABELA POR STATUS
  // =============================================

  addTabelaStatus(yPosition) {
    yPosition = addSectionTitle(this.doc, "Despesas por Status", yPosition);

    const porStatus = {};
    const totalDespesas = this.despesas.length;
    this.despesas.forEach((d) => {
      const status = d.status || "Não definido";
      if (!porStatus[status]) porStatus[status] = { quantidade: 0, valor: 0 };
      porStatus[status].quantidade++;
      porStatus[status].valor += d.valor || 0;
    });

    const tabelaStatus = Object.entries(porStatus)
      .sort(([, a], [, b]) => b.valor - a.valor)
      .map(([status, dados]) => [
        status,
        dados.quantidade.toString(),
        this.formatCurrency(dados.valor),
        `${totalDespesas > 0 ? ((dados.quantidade / totalDespesas) * 100).toFixed(0) : 0}%`,
      ]);

    if (tabelaStatus.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["Status", "Quantidade", "Valor Total", "% do Total"]],
          body: tabelaStatus,
          ...modernStyles,
          columnStyles: {
            0: { cellWidth: 'auto', halign: "left" },
            1: { cellWidth: 24, halign: "right" },
            2: { cellWidth: 35, halign: "right" },
            3: { cellWidth: 24, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de status: ${error.message}`);
      }
    }

    return yPosition;
  }

  // =============================================
  // LISTAGEM ÚNICA (com filtro específico)
  // =============================================

  addListagemUnica(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Listagem Detalhada", yPosition);

    const despesasOrdenadas = [...this.despesas]
      .sort((a, b) => (b.valor || 0) - (a.valor || 0));

    const tabelaDespesas = this.buildTabelaDespesas(despesasOrdenadas);

    if (tabelaDespesas.length > 0) {
      yPosition = this.renderTabelaDespesas(tabelaDespesas, yPosition);
    }

    return yPosition;
  }

  // =============================================
  // LISTAGEM AGRUPADA POR PARLAMENTAR
  // =============================================

  addListagemPorParlamentar(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Despesas Detalhadas por Parlamentar", yPosition);

    // Agrupar emendas por parlamentar
    const parlamentarMap = new Map();
    this.emendas.forEach((emenda) => {
      const nome = emenda.autor || emenda.parlamentar || "Não identificado";
      if (!parlamentarMap.has(nome)) {
        parlamentarMap.set(nome, { emendas: [], despesas: [] });
      }
      parlamentarMap.get(nome).emendas.push(emenda);
    });

    // Vincular despesas a cada parlamentar via emendaId
    const emendaIdToParlamentar = new Map();
    this.emendas.forEach((emenda) => {
      const nome = emenda.autor || emenda.parlamentar || "Não identificado";
      emendaIdToParlamentar.set(emenda.id, nome);
    });

    this.despesas.forEach((d) => {
      const nome = emendaIdToParlamentar.get(d.emendaId) || "Não identificado";
      if (!parlamentarMap.has(nome)) {
        parlamentarMap.set(nome, { emendas: [], despesas: [] });
      }
      parlamentarMap.get(nome).despesas.push(d);
    });

    // Ordenar parlamentares por valor total executado (desc)
    const parlamentaresOrdenados = [...parlamentarMap.entries()]
      .map(([nome, dados]) => {
        const valorTotal = dados.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
        return { nome, ...dados, valorTotal };
      })
      .sort((a, b) => b.valorTotal - a.valorTotal);

    parlamentaresOrdenados.forEach((parlamentar) => {
      if (parlamentar.despesas.length === 0) return;

      yPosition = this.checkNewPage(yPosition, 40);

      // Cabeçalho do parlamentar
      yPosition = this.addParlamentarHeader(parlamentar, yPosition);

      // Tabela de despesas do parlamentar
      const despesasOrdenadas = [...parlamentar.despesas]
        .sort((a, b) => (b.valor || 0) - (a.valor || 0));

      const tabelaDespesas = this.buildTabelaDespesas(despesasOrdenadas);

      if (tabelaDespesas.length > 0) {
        yPosition = this.renderTabelaDespesas(tabelaDespesas, yPosition);
      }
    });

    return yPosition;
  }

  addParlamentarHeader(parlamentar, yPosition) {
    const margins = { left: 15, right: 15 };
    const contentWidth = this.pageWidth - margins.left - margins.right;

    // Fundo com cor accent para seção do parlamentar
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

    // Emendas e valores (linha de detalhe)
    const emendasNums = parlamentar.emendas
      .map(e => e.numero || e.numeroEmenda)
      .filter(Boolean)
      .join(", ");

    const municipios = [...new Set(parlamentar.emendas.map(e => e.municipio).filter(Boolean))].join(", ");

    this.doc.setTextColor(...PDF_COLORS.SLATE_600);
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

  // =============================================
  // HELPERS COMPARTILHADOS
  // =============================================

  buildTabelaDespesas(despesas) {
    return despesas.map((d) => {
      const emenda = this.emendas.find(e => e.id === d.emendaId);
      const dataRaw = d.dataPagamento || d.dataLiquidacao || d.dataEmpenho;
      const dataFormatada = this.formatarData(dataRaw);
      const descricao = d.discriminacao || d.descricao || "-";

      return [
        dataFormatada,
        descricao,
        d.fornecedor || "-",
        emenda?.numero || "-",
        this.formatCurrency(d.valor || 0),
        d.status || "-",
      ];
    });
  }

  renderTabelaDespesas(tabelaDespesas, yPosition) {
    try {
      const modernStyles = getModernTableStyles();
      this.createTable({
        startY: yPosition,
        head: [["Data", "Descrição", "Fornecedor", "Emenda", "Valor", "Status"]],
        body: tabelaDespesas,
        ...modernStyles,
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 'auto', halign: "left" },
          2: { cellWidth: 38, halign: "left" },
          3: { cellWidth: 22, halign: "left" },
          4: { cellWidth: 28, halign: "right" },
          5: { cellWidth: 26, halign: "center" },
        },
      });
      yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
    } catch (error) {
      this.addWarning(`Erro ao criar tabela de despesas: ${error.message}`);
    }
    return yPosition;
  }

  // =============================================
  // TOP FORNECEDORES
  // =============================================

  addTopFornecedores(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

    const porFornecedor = this.calcularPorFornecedor(true);

    const tabelaFornecedores = Object.entries(porFornecedor)
      .sort(([, a], [, b]) => b.valor - a.valor)
      .slice(0, 5)
      .map(([fornecedor, dados], idx) => [
        `${idx + 1}`,
        fornecedor,
        dados.quantidade.toString(),
        this.formatCurrency(dados.valor),
      ]);

    if (tabelaFornecedores.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["#", "Fornecedor", "Despesas", "Valor Total"]],
          body: tabelaFornecedores,
          ...modernStyles,
          columnStyles: {
            0: { cellWidth: 14, halign: "center" },
            1: { cellWidth: 'auto', halign: "left" },
            2: { cellWidth: 20, halign: "right" },
            3: { cellWidth: 35, halign: "right" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de fornecedores: ${error.message}`);
      }
    }

    return yPosition;
  }

  // =============================================
  // BLOCO DE ASSINATURAS
  // =============================================

  addBlocoAssinaturas(yPosition) {
    const margins = { left: 15, right: 15 };
    const pageWidth = this.pageWidth;
    const contentWidth = pageWidth - margins.left - margins.right;

    yPosition = this.checkNewPage(yPosition, 120);

    // Linha separadora
    this.doc.setDrawColor(...PDF_COLORS.SLATE_300);
    this.doc.setLineWidth(0.5);
    this.doc.line(margins.left, yPosition, pageWidth - margins.right, yPosition);
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

    const declaracao = "Declaro(amos), para os devidos fins de prestação de contas, que as despesas acima relacionadas " +
      "foram realizadas em conformidade com a legislação vigente, em especial a Lei Complementar nº 141/2012, " +
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
      day: "2-digit",
      month: "long",
      year: "numeric",
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

    // Nota legal
    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text(
      "Documento gerado eletronicamente pelo SICEFSUS - Sistema de Controle de Execuções Financeiras do SUS.",
      pageWidth / 2, yPosition, { align: "center" }
    );
    this.doc.text(
      "A autenticidade deste relatório pode ser verificada junto ao órgão emissor.",
      pageWidth / 2, yPosition + 3.5, { align: "center" }
    );
  }
}
