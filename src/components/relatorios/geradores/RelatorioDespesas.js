// src/components/relatorios/geradores/RelatorioDespesas.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioDespesas extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // HEADER com subtítulo do período
    this.addHeader("Relatório de Despesas", this.getSubtituloPeriodo(filtros));

    let yPosition = 58;

    // Usar métodos utilitários da BaseRelatorio
    const despesasExecutadas = this.getDespesasExecutadas();
    const despesasPlanejadas = this.despesas.filter(d => d.status === "PLANEJADA");
    const totalDespesas = this.despesas.length;

    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const valorPlanejado = despesasPlanejadas.reduce((sum, d) => sum + (d.valor || 0), 0);

    const fornecedores = new Set(this.despesas.map(d => d.fornecedor)).size;

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
    const maiorDespesa = Math.max(...this.despesas.map(d => d.valor || 0), 0);
    
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

      // Descrição: usa discriminacao (campo real) ou descricao como fallback
      const descricao = d.discriminacao || d.descricao || "-";
      const descricaoTruncada = descricao.length > 25 ? descricao.substring(0, 22) + "..." : descricao;

      return [
        dataFormatada,
        descricaoTruncada,
        d.fornecedor?.length > 20 ? d.fornecedor.substring(0, 17) + "..." : (d.fornecedor || "-"),
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
        fornecedor.length > 40 ? fornecedor.substring(0, 37) + "..." : fornecedor,
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

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Listagem completa de despesas. Relatório gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
