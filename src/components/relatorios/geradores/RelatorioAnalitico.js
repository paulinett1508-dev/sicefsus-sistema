// src/components/relatorios/geradores/RelatorioAnalitico.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioAnalitico extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório Analítico por Parlamentar", this.getSubtituloPeriodo(filtros));
    let yPosition = 58;

    // Filtros aplicados
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs
    const { valorTotal, valorExecutado, percentualGeral, totalDespesas } = this.calcularMetricas();
    const despesasExecutadas = this.getDespesasExecutadas();
    const parlamentares = this.getParlamentares();

    yPosition = addKPICards(this.doc, [
      { label: "Parlamentares", value: parlamentares.length.toString() },
      { label: "Emendas", value: this.emendas.length.toString() },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Despesas", value: totalDespesas.toString() },
    ], yPosition);

    // Visão Geral
    yPosition = addSectionTitle(this.doc, "Visão Geral", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const mediaPorParlamentar = parlamentares.length > 0 ? valorTotal / parlamentares.length : 0;
    const mediaExecPorParlamentar = parlamentares.length > 0 ? valorExecutado / parlamentares.length : 0;

    [
      `Total de Parlamentares Ativos: ${parlamentares.length}`,
      `Média de Valor por Parlamentar: ${this.formatCurrency(mediaPorParlamentar)}`,
      `Média de Execução por Parlamentar: ${this.formatCurrency(mediaExecPorParlamentar)}`,
      `Percentual Geral de Execução: ${percentualGeral.toFixed(1)}%`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 22;

    // Tabela resumo por parlamentar
    yPosition = addSectionTitle(this.doc, "Análise por Parlamentar", yPosition);
    const analise = this.calcularAnalisePorParlamentar(despesasExecutadas, parlamentares);
    yPosition = this.renderTabelaParlamentares(analise, yPosition);

    // Detalhamento: com filtro específico → tabela única, sem filtro → agrupado por parlamentar
    if (filtros.parlamentar || filtros.emenda) {
      yPosition = this.addDetalhamentoUnico(yPosition, despesasExecutadas);
    } else {
      yPosition = this.addDetalhamentoPorParlamentar(yPosition, analise, despesasExecutadas);
    }

    // Indicadores de desempenho
    yPosition = this.addIndicadores(yPosition);

    // Assinaturas + rodapé
    this.addBlocoAssinaturas(yPosition);
    this.addFooterTodasPaginas();
  }

  calcularAnalisePorParlamentar(despesasExecutadas, parlamentares) {
    return parlamentares.map((parlamentar) => {
      const emendasParlamentar = this.emendas.filter((e) =>
        (e.autor || e.parlamentar) === parlamentar
      );
      const valorTotalP = emendasParlamentar.reduce((sum, e) => sum + (e.valorTotal || 0), 0);
      const despesasP = despesasExecutadas.filter((d) =>
        emendasParlamentar.some((e) => e.id === d.emendaId)
      );
      const valorExecP = despesasP.reduce((sum, d) => sum + (d.valor || 0), 0);
      const municipios = [...new Set(emendasParlamentar.map(e => e.municipio).filter(Boolean))];

      return {
        nome: parlamentar,
        emendas: emendasParlamentar,
        emendasCount: emendasParlamentar.length,
        despesas: despesasP,
        despesasCount: despesasP.length,
        valorTotal: valorTotalP,
        valorExecutado: valorExecP,
        saldo: valorTotalP - valorExecP,
        percentual: valorTotalP > 0 ? (valorExecP / valorTotalP) * 100 : 0,
        municipios,
      };
    }).sort((a, b) => b.valorExecutado - a.valorExecutado);
  }

  renderTabelaParlamentares(analise, yPosition) {
    const tabela = analise.map((p) => [
      p.nome,
      p.municipios.join(", ") || "-",
      p.emendasCount.toString(),
      this.formatCurrency(p.valorTotal),
      this.formatCurrency(p.valorExecutado),
      this.formatCurrency(p.saldo),
      `${p.percentual.toFixed(0)}%`,
    ]);

    if (tabela.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Parlamentar", "Município(s)", "Emendas", "Total", "Executado", "Saldo", "%"]],
          body: tabela,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 'auto', halign: "left" },
            1: { cellWidth: 30, halign: "left" },
            2: { cellWidth: 16, halign: "right" },
            3: { cellWidth: 26, halign: "right" },
            4: { cellWidth: 26, halign: "right" },
            5: { cellWidth: 24, halign: "right" },
            6: { cellWidth: 14, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de parlamentares: ${error.message}`);
      }
    }
    return yPosition;
  }

  addDetalhamentoUnico(yPosition, despesasExecutadas) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Detalhamento de Emendas", yPosition);

    const emendasDetalhadas = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.percentual - a.percentual);

    yPosition = this.renderTabelaEmendasDetalhadas(emendasDetalhadas, yPosition);

    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);
    yPosition = this.renderDespesasPorEmenda(emendasDetalhadas, despesasExecutadas, yPosition);

    return yPosition;
  }

  addDetalhamentoPorParlamentar(yPosition, analise, despesasExecutadas) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Detalhamento por Parlamentar", yPosition);

    for (const parlamentar of analise) {
      if (parlamentar.despesasCount === 0 && parlamentar.emendasCount === 0) continue;

      yPosition = this.checkNewPage(yPosition, 40);

      // Usar addParlamentarHeader da base
      const headerData = {
        nome: parlamentar.nome,
        emendas: parlamentar.emendas,
        despesas: parlamentar.despesas,
        valorTotal: parlamentar.valorExecutado,
      };
      yPosition = this.addParlamentarHeader(headerData, yPosition);

      // Emendas deste parlamentar
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
      }).sort((a, b) => b.percentual - a.percentual);

      yPosition = this.renderTabelaEmendasDetalhadas(emendasCalc, yPosition);

      // Despesas por emenda
      yPosition = this.renderDespesasPorEmenda(emendasCalc, despesasExecutadas, yPosition);
    }

    return yPosition;
  }

  renderTabelaEmendasDetalhadas(emendas, yPosition) {
    const tabela = emendas.map((e) => [
      e.numero || "-",
      e.parlamentar || "-",
      e.tipo || "-",
      this.formatCurrency(e.valorTotal),
      this.formatCurrency(e.valorExecutado),
      `${e.percentual.toFixed(0)}%`,
    ]);

    if (tabela.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Parlamentar", "Tipo", "Total", "Executado", "%"]],
          body: tabela,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 22, halign: "left" },
            1: { cellWidth: 'auto', halign: "left" },
            2: { cellWidth: 28, halign: "left" },
            3: { cellWidth: 28, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
            5: { cellWidth: 16, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de emendas: ${error.message}`);
      }
    }
    return yPosition;
  }

  renderDespesasPorEmenda(emendasCalc, despesasExecutadas, yPosition) {
    const emendasComDespesas = emendasCalc.filter(e => e.despesasCount > 0);

    if (emendasComDespesas.length === 0) {
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "italic");
      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.text("Nenhuma despesa executada encontrada.", 15, yPosition);
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
        this.formatCurrency(d.valor || 0),
      ]);

      if (tabela.length > 0) {
        try {
          const modernStyles = getModernTableStyles();
          this.createTable({
            startY: yPosition,
            head: [["Data", "Descrição", "Fornecedor", "Valor"]],
            body: tabela,
            ...modernStyles,
            styles: { ...modernStyles.styles, fontSize: 6 },
            headStyles: { ...modernStyles.headStyles, fontSize: 6 },
            columnStyles: {
              0: { cellWidth: 18, halign: "center" },
              1: { cellWidth: 'auto', halign: "left" },
              2: { cellWidth: 50, halign: "left" },
              3: { cellWidth: 28, halign: "right" },
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

  addIndicadores(yPosition) {
    yPosition = this.checkNewPage(yPosition, 40);
    yPosition = addSectionTitle(this.doc, "Indicadores de Desempenho", yPosition);

    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const emendasDetalhadas = this.calcularExecucaoPorEmenda();
    const total = this.emendas.length;
    const pct = (n) => total > 0 ? ((n / total) * 100).toFixed(0) : 0;

    const emendas100 = emendasDetalhadas.filter(e => e.percentual >= 100).length;
    const acima80 = emendasDetalhadas.filter(e => e.percentual >= 80).length;
    const acima50 = emendasDetalhadas.filter(e => e.percentual >= 50).length;
    const semExecucao = emendasDetalhadas.filter(e => e.valorExecutado === 0).length;

    [
      `Emendas com 100% de execução: ${emendas100} (${pct(emendas100)}%)`,
      `Emendas acima de 80%: ${acima80} (${pct(acima80)}%)`,
      `Emendas acima de 50%: ${acima50} (${pct(acima50)}%)`,
      `Emendas sem execução: ${semExecucao} (${pct(semExecucao)}%)`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 22;

    return yPosition;
  }
}
