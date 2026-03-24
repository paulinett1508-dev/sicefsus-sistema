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

    // HEADER com subtítulo do período
    this.addHeader("Relatório de Despesas", this.getSubtituloPeriodo(filtros));

    let yPosition = 58;

    // Usar métodos utilitários da BaseRelatorio
    const despesasExecutadas = this.getDespesasExecutadas();
    const despesasPlanejadas = this.despesas.filter(d => d.status === DESPESA_STATUS.PLANEJADA);
    const totalDespesas = this.despesas.length;

    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const valorPlanejado = despesasPlanejadas.reduce((sum, d) => sum + (d.valor || 0), 0);

    const fornecedores = new Set(this.despesas.map(d => d.fornecedor).filter(Boolean)).size;

    const kpis = [
      { label: "Total Despesas", value: totalDespesas.toString() },
      { label: "Valor Executado", value: this.formatCurrency(valorExecutado) },
      { label: "Planejado", value: this.formatCurrency(valorPlanejado) },
      { label: "Fornecedores", value: fornecedores.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

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
      `Fornecedores Distintos: ${fornecedores}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Despesas por Status", yPosition);

    const porStatus = {};
    this.despesas.forEach((d) => {
      const status = d.status || "Não definido";
      if (!porStatus[status]) {
        porStatus[status] = { quantidade: 0, valor: 0 };
      }
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

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Listagem Detalhada", yPosition);

    // Valores já normalizados pelo hook
    const despesasOrdenadas = [...this.despesas]
      .sort((a, b) => (b.valor || 0) - (a.valor || 0));

    const tabelaDespesas = despesasOrdenadas.map((d) => {
      const emenda = this.emendas.find(e => e.id === d.emendaId);

      // Data: usa dataPagamento, dataLiquidacao ou dataEmpenho (nessa ordem)
      const dataRaw = d.dataPagamento || d.dataLiquidacao || d.dataEmpenho;
      const dataFormatada = this.formatarData(dataRaw);

      // Descrição e fornecedor sem truncamento — autoTable faz quebra de linha
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

    if (tabelaDespesas.length > 0) {
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
    }

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

    // Usar método utilitário para agregação por fornecedor
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

    // Bloco de encerramento profissional com assinaturas
    this.addBlocoAssinaturas(yPosition);

    // Rodapé em TODAS as páginas com número de página
    this.addFooterTodasPaginas();
  }

  /**
   * Adiciona bloco formal de encerramento com assinaturas
   * Baseado no padrão de prestação de contas do SUS (Portaria GM/MS)
   */
  addBlocoAssinaturas(yPosition) {
    const margins = { left: 15, right: 15 };
    const pageWidth = this.pageWidth;
    const contentWidth = pageWidth - margins.left - margins.right;

    // Garantir espaço suficiente (nova página se necessário)
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
    this.doc.setTextColor(...PDF_COLORS.SLATE_600);

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

      // Linha de assinatura
      this.doc.setDrawColor(...PDF_COLORS.SLATE_400);
      this.doc.setLineWidth(0.3);
      this.doc.line(centerX - lineLength / 2, yPosition, centerX + lineLength / 2, yPosition);

      // Cargo
      this.doc.setTextColor(...PDF_COLORS.SLATE_700);
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(assinatura.cargo, centerX, yPosition + 4, { align: "center" });

      // Subtítulo
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
