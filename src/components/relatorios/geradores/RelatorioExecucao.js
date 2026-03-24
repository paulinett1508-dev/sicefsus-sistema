// src/components/relatorios/geradores/RelatorioExecucao.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioExecucao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Execução Orçamentária", this.getSubtituloPeriodo(filtros));
    let yPosition = 58;

    // Filtros aplicados
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs
    const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas } = this.calcularMetricas();

    yPosition = addKPICards(this.doc, [
      { label: "Total Emendas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
    ], yPosition);

    // Resumo
    yPosition = addSectionTitle(this.doc, "Resumo Geral", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    [
      `Total de Emendas Cadastradas: ${totalEmendas}`,
      `Total de Despesas Executadas: ${totalDespesas}`,
      `Valor Total Alocado: ${this.formatCurrency(valorTotal)}`,
      `Valor Executado: ${this.formatCurrency(valorExecutado)} (${percentualGeral.toFixed(1)}%)`,
      `Saldo Disponível: ${this.formatCurrency(saldoDisponivel)}`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 26;

    // Detalhamento: agrupado por parlamentar ou tabela única
    if (filtros.parlamentar || filtros.emenda) {
      yPosition = this.addDetalhamentoUnico(yPosition);
    } else {
      yPosition = this.addDetalhamentoPorParlamentar(yPosition);
    }

    // Análise por status
    yPosition = this.addAnaliseStatus(yPosition);

    // Assinaturas + rodapé
    this.addBlocoAssinaturas(yPosition);
    this.addFooterTodasPaginas();
  }

  addDetalhamentoUnico(yPosition) {
    yPosition = addSectionTitle(this.doc, "Detalhamento por Emenda", yPosition);

    const emendasComExecucao = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.percentual - a.percentual);

    yPosition = this.renderTabelaEmendas(emendasComExecucao, yPosition);

    // Despesas por emenda
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);
    yPosition = this.renderDespesasPorEmenda(emendasComExecucao, yPosition);

    return yPosition;
  }

  addDetalhamentoPorParlamentar(yPosition) {
    yPosition = addSectionTitle(this.doc, "Execução por Parlamentar", yPosition);

    const parlamentares = this.agruparPorParlamentar();
    const despesasExecutadas = this.getDespesasExecutadas();

    for (const parlamentar of parlamentares) {
      const emendasParlamentar = parlamentar.emendas;
      if (emendasParlamentar.length === 0) continue;

      yPosition = this.checkNewPage(yPosition, 40);
      yPosition = this.addParlamentarHeader(parlamentar, yPosition);

      // Tabela de emendas do parlamentar
      const emendasCalc = emendasParlamentar.map((emenda) => {
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

      yPosition = this.renderTabelaEmendas(emendasCalc, yPosition);

      // Despesas de cada emenda do parlamentar
      yPosition = this.renderDespesasPorEmenda(emendasCalc, yPosition);
    }

    return yPosition;
  }

  renderTabelaEmendas(emendas, yPosition) {
    const tabelaEmendas = emendas.map((e) => [
      e.numero || "-",
      e.tipo || "-",
      e.parlamentar || "-",
      this.formatCurrency(e.valorTotal),
      this.formatCurrency(e.valorExecutado),
      this.formatCurrency(e.saldo),
      `${e.percentual.toFixed(0)}%`,
    ]);

    if (tabelaEmendas.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Tipo", "Parlamentar", "Total", "Executado", "Saldo", "%"]],
          body: tabelaEmendas,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 22, halign: "left" },
            1: { cellWidth: 24, halign: "left" },
            2: { cellWidth: 'auto', halign: "left" },
            3: { cellWidth: 26, halign: "right" },
            4: { cellWidth: 26, halign: "right" },
            5: { cellWidth: 26, halign: "right" },
            6: { cellWidth: 14, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de emendas: ${error.message}`);
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
      this.doc.text("Nenhuma despesa executada encontrada.", 15, yPosition);
      return yPosition + 8;
    }

    for (const emenda of emendasComDespesas) {
      yPosition = this.checkNewPage(yPosition, 40);

      // Subtítulo da emenda
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
        .sort((a, b) => (b.valor || 0) - (a.valor || 0));

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

  addAnaliseStatus(yPosition) {
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Análise por Status de Execução", yPosition);

    const emendasComExecucao = this.calcularExecucaoPorEmenda();
    const totalEmendas = emendasComExecucao.length;

    const faixas = [
      { label: "100% executado", filter: e => e.percentual >= 100 },
      { label: "50-99%", filter: e => e.percentual >= 50 && e.percentual < 100 },
      { label: "1-49%", filter: e => e.percentual > 0 && e.percentual < 50 },
      { label: "Sem execução", filter: e => e.percentual === 0 },
    ];

    const tabelaStatus = faixas.map(({ label, filter }) => {
      const emendas = emendasComExecucao.filter(filter);
      const valor = emendas.reduce((sum, e) => sum + e.valorExecutado, 0);
      return [
        label, this.formatCurrency(valor),
        `${totalEmendas > 0 ? ((emendas.length / totalEmendas) * 100).toFixed(0) : 0}%`,
      ];
    });

    try {
      this.createTable({
        startY: yPosition,
        head: [["Status", "Valor Executado", "% Emendas"]],
        body: tabelaStatus,
        ...getModernTableStyles(),
        columnStyles: {
          0: { cellWidth: 'auto', halign: "left" },
          1: { cellWidth: 30, halign: "right" },
          2: { cellWidth: 30, halign: "center" },
        },
      });
      yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
    } catch (error) {
      this.addWarning(`Erro ao criar tabela de status: ${error.message}`);
    }

    return yPosition;
  }
}
