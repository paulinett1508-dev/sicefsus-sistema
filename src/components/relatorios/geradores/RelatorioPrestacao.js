// src/components/relatorios/geradores/RelatorioPrestacao.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioPrestacao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Prestação de Contas", this.getSubtituloPeriodo(filtros));
    let yPosition = 58;

    // Filtros aplicados
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs
    const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalDespesas } = this.calcularMetricas();

    yPosition = addKPICards(this.doc, [
      { label: "Recurso Total", value: this.formatCurrency(valorTotal) },
      { label: "Utilizado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo Disponível", value: this.formatCurrency(saldoDisponivel) },
      { label: "Despesas", value: totalDespesas.toString() },
    ], yPosition);

    // Resumo
    yPosition = addSectionTitle(this.doc, "Resumo da Prestação de Contas", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const emendasCalculadas = this.calcularExecucaoPorEmenda();
    const emendasComExecucaoCount = emendasCalculadas.filter(e => e.despesasCount > 0).length;
    const emendas100Count = emendasCalculadas.filter(e => e.percentual >= 100).length;

    [
      `Período de Referência: ${this.getSubtituloPeriodo(filtros)}`,
      `Emendas com Execução: ${emendasComExecucaoCount} de ${this.emendas.length}`,
      `Emendas 100% Executadas: ${emendas100Count}`,
      `Percentual Geral: ${percentualGeral.toFixed(1)}%`,
      `Saldo a Executar: ${this.formatCurrency(saldoDisponivel)}`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 26;

    // Demonstrativo: agrupado por parlamentar ou único
    if (filtros.emenda) {
      yPosition = this.addDemonstrativoUnico(filtros, yPosition);
    } else {
      yPosition = this.addDemonstrativoPorParlamentar(yPosition);
    }

    // Totalizadores
    yPosition = this.checkNewPage(yPosition, 40);
    yPosition = addSectionTitle(this.doc, "Totalizadores", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    [
      `Total de Recursos Recebidos: ${this.formatCurrency(valorTotal)}`,
      `Total de Despesas Realizadas: ${this.formatCurrency(valorExecutado)}`,
      `Saldo em Caixa: ${this.formatCurrency(saldoDisponivel)}`,
      `Percentual de Utilização: ${percentualGeral.toFixed(1)}%`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 22;

    // Assinaturas + rodapé
    this.addBlocoAssinaturas(yPosition);
    this.addFooterTodasPaginas();
  }

  addDemonstrativoUnico(filtros, yPosition) {
    yPosition = addSectionTitle(this.doc, "Demonstrativo por Emenda", yPosition);

    const emendasCalculadas = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.valorExecutado - a.valorExecutado);

    yPosition = this.renderTabelaDemonstrativo(emendasCalculadas, yPosition);

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);
    yPosition = this.renderDespesasPorEmenda(emendasCalculadas, yPosition);

    return yPosition;
  }

  addDemonstrativoPorParlamentar(yPosition) {
    yPosition = addSectionTitle(this.doc, "Demonstrativo por Parlamentar", yPosition);

    const parlamentares = this.agruparPorParlamentar();
    const despesasExecutadas = this.getDespesasExecutadas();

    for (const parlamentar of parlamentares) {
      if (parlamentar.emendas.length === 0) continue;

      yPosition = this.checkNewPage(yPosition, 40);
      yPosition = this.addParlamentarHeader(parlamentar, yPosition);

      // Tabela demonstrativo das emendas do parlamentar
      const emendasCalc = parlamentar.emendas.map((emenda) => {
        const valorEmenda = emenda.valorTotal || 0;
        const despesasEmenda = despesasExecutadas.filter(d => d.emendaId === emenda.id);
        const valorExec = despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0);
        return {
          ...emenda,
          parlamentar: emenda.autor || emenda.parlamentar || "-",
          valorTotal: valorEmenda,
          valorExecutado: valorExec,
          saldo: valorEmenda - valorExec,
          percentual: valorEmenda > 0 ? (valorExec / valorEmenda) * 100 : 0,
          despesasCount: despesasEmenda.length,
        };
      }).sort((a, b) => b.valorExecutado - a.valorExecutado);

      yPosition = this.renderTabelaDemonstrativo(emendasCalc, yPosition);

      // Despesas detalhadas por emenda do parlamentar
      yPosition = this.renderDespesasPorEmenda(emendasCalc, yPosition);
    }

    return yPosition;
  }

  renderTabelaDemonstrativo(emendas, yPosition) {
    const tabela = emendas.map((e) => [
      e.numero || "-",
      e.parlamentar || "-",
      this.formatCurrency(e.valorTotal),
      this.formatCurrency(e.valorExecutado),
      this.formatCurrency(e.saldo),
      `${e.percentual.toFixed(0)}%`,
    ]);

    if (tabela.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Parlamentar", "Valor Total", "Executado", "Saldo", "%"]],
          body: tabela,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 22, halign: "left" },
            1: { cellWidth: 'auto', halign: "left" },
            2: { cellWidth: 28, halign: "right" },
            3: { cellWidth: 28, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
            5: { cellWidth: 16, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de demonstrativo: ${error.message}`);
      }
    }
    return yPosition;
  }

  renderDespesasPorEmenda(emendasCalc, yPosition) {
    const despesasExecutadas = this.getDespesasExecutadas();
    const emendasComDespesas = emendasCalc.filter(e => e.despesasCount > 0);

    if (emendasComDespesas.length === 0) {
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "italic");
      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.text("Nenhuma despesa executada no período.", 15, yPosition);
      return yPosition + 8;
    }

    for (const emenda of emendasComDespesas) {
      yPosition = this.checkNewPage(yPosition, 40);

      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(...PDF_COLORS.SLATE_700);
      this.doc.text(`Emenda: ${emenda.numero || emenda.id} — ${emenda.parlamentar}`, 15, yPosition);

      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      this.doc.text(`Executado: ${this.formatCurrency(emenda.valorExecutado)} de ${this.formatCurrency(emenda.valorTotal)} (${emenda.percentual.toFixed(0)}%)`, 15, yPosition + 4);
      yPosition += 10;

      const despesasEmenda = despesasExecutadas
        .filter(d => d.emendaId === emenda.id)
        .sort((a, b) => {
          const dataA = this.parseData(a.dataPagamento || a.dataLiquidacao || a.dataEmpenho);
          const dataB = this.parseData(b.dataPagamento || b.dataLiquidacao || b.dataEmpenho);
          return dataB - dataA;
        });

      const tabela = despesasEmenda.map(d => [
        this.formatarData(d.dataPagamento || d.dataLiquidacao || d.dataEmpenho),
        d.discriminacao || d.descricao || "-",
        d.fornecedor || "-",
        d.numeroNota || "-",
        this.formatCurrency(d.valor || 0),
      ]);

      if (tabela.length > 0) {
        try {
          const modernStyles = getModernTableStyles();
          this.createTable({
            startY: yPosition,
            head: [["Data", "Descrição", "Fornecedor", "Nota Fiscal", "Valor"]],
            body: tabela,
            ...modernStyles,
            styles: { ...modernStyles.styles, fontSize: 6 },
            headStyles: { ...modernStyles.headStyles, fontSize: 6 },
            columnStyles: {
              0: { cellWidth: 18, halign: "center" },
              1: { cellWidth: 'auto', halign: "left" },
              2: { cellWidth: 45, halign: "left" },
              3: { cellWidth: 22, halign: "center" },
              4: { cellWidth: 26, halign: "right" },
            },
          });
          yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 8;
        } catch (error) {
          this.addWarning(`Erro tabela despesas emenda ${emenda.numero}: ${error.message}`);
        }
      }
    }

    return yPosition;
  }
}
