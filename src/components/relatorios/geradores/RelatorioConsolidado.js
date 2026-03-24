// src/components/relatorios/geradores/RelatorioConsolidado.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioConsolidado extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório Consolidado Mensal", this.getSubtituloPeriodo(filtros));
    let yPosition = 58;

    // Filtros aplicados
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs
    const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas } = this.calcularMetricas();
    const despesasExecutadas = this.getDespesasExecutadas();

    yPosition = addKPICards(this.doc, [
      { label: "Emendas Ativas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
    ], yPosition);

    // Resumo
    yPosition = addSectionTitle(this.doc, "Resumo Consolidado", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const fornecedoresUnicos = new Set(despesasExecutadas.map(d => d.fornecedor).filter(Boolean)).size;
    const parlamentaresUnicos = this.getParlamentares().length;

    [
      `Emendas Cadastradas: ${totalEmendas}`,
      `Parlamentares com Emendas: ${parlamentaresUnicos}`,
      `Total de Despesas Executadas: ${totalDespesas}`,
      `Fornecedores Distintos: ${fornecedoresUnicos}`,
      `Média de Execução por Emenda: ${this.formatCurrency(totalEmendas > 0 ? valorExecutado / totalEmendas : 0)}`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 26;

    // Distribuição por tipo
    yPosition = this.addDistribuicaoPorTipo(yPosition, despesasExecutadas);

    // Top 10 emendas
    yPosition = this.addTop10Emendas(yPosition);

    // Top 5 fornecedores
    yPosition = this.addTopFornecedores(yPosition);

    // Detalhamento: agrupado por parlamentar ou único
    if (filtros.parlamentar || filtros.emenda) {
      yPosition = this.addDetalhamentoUnico(yPosition, despesasExecutadas);
    } else {
      yPosition = this.addDetalhamentoPorParlamentar(yPosition, despesasExecutadas);
    }

    // Assinaturas + rodapé
    this.addBlocoAssinaturas(yPosition);
    this.addFooterTodasPaginas();
  }

  addDistribuicaoPorTipo(yPosition, despesasExecutadas) {
    yPosition = addSectionTitle(this.doc, "Distribuição por Tipo de Emenda", yPosition);

    const porTipo = {};
    this.emendas.forEach((emenda) => {
      const tipo = emenda.tipo || "Não definido";
      if (!porTipo[tipo]) porTipo[tipo] = { quantidade: 0, valorTotal: 0, valorExecutado: 0 };
      porTipo[tipo].quantidade++;
      porTipo[tipo].valorTotal += emenda.valorTotal || 0;
      porTipo[tipo].valorExecutado += despesasExecutadas
        .filter(d => d.emendaId === emenda.id)
        .reduce((sum, d) => sum + (d.valor || 0), 0);
    });

    const tabela = Object.entries(porTipo)
      .sort(([, a], [, b]) => b.valorExecutado - a.valorExecutado)
      .map(([tipo, dados]) => [
        tipo, dados.quantidade.toString(), this.formatCurrency(dados.valorTotal),
        this.formatCurrency(dados.valorExecutado),
        `${dados.valorTotal > 0 ? ((dados.valorExecutado / dados.valorTotal) * 100).toFixed(0) : 0}%`,
      ]);

    if (tabela.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Tipo", "Emendas", "Valor Total", "Executado", "%"]],
          body: tabela,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 'auto', halign: "left" },
            1: { cellWidth: 18, halign: "right" },
            2: { cellWidth: 32, halign: "right" },
            3: { cellWidth: 32, halign: "right" },
            4: { cellWidth: 16, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de tipos: ${error.message}`);
      }
    }
    return yPosition;
  }

  addTop10Emendas(yPosition) {
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Top 10 Emendas por Execução", yPosition);

    const top10 = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.valorExecutado - a.valorExecutado)
      .slice(0, 10);

    const tabela = top10.map((e, idx) => [
      `${idx + 1}`, e.numero || "-", e.parlamentar || "-",
      this.formatCurrency(e.valorTotal), this.formatCurrency(e.valorExecutado),
      `${e.percentual.toFixed(0)}%`,
    ]);

    if (tabela.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["#", "Emenda", "Parlamentar", "Total", "Executado", "%"]],
          body: tabela,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 14, halign: "center" },
            1: { cellWidth: 22, halign: "left" },
            2: { cellWidth: 'auto', halign: "left" },
            3: { cellWidth: 28, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
            5: { cellWidth: 14, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela Top 10: ${error.message}`);
      }
    }
    return yPosition;
  }

  addTopFornecedores(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

    const tabelaFornecedores = Object.entries(this.calcularPorFornecedor(true))
      .sort(([, a], [, b]) => b.valor - a.valor)
      .slice(0, 5)
      .map(([fornecedor, dados], idx) => [
        `${idx + 1}`, fornecedor, dados.quantidade.toString(), this.formatCurrency(dados.valor),
      ]);

    if (tabelaFornecedores.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["#", "Fornecedor", "Despesas", "Valor Total"]],
          body: tabelaFornecedores,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 14, halign: "center" },
            1: { cellWidth: 'auto', halign: "left" },
            2: { cellWidth: 20, halign: "right" },
            3: { cellWidth: 32, halign: "right" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de fornecedores: ${error.message}`);
      }
    }
    return yPosition;
  }

  addDetalhamentoUnico(yPosition, despesasExecutadas) {
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Detalhamento das Despesas Executadas", yPosition);

    const emendasCalc = this.calcularExecucaoPorEmenda();
    yPosition = this.renderDespesasPorEmenda(emendasCalc, despesasExecutadas, yPosition);

    return yPosition;
  }

  addDetalhamentoPorParlamentar(yPosition, despesasExecutadas) {
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Despesas Executadas por Parlamentar", yPosition);

    const parlamentares = this.agruparPorParlamentar();

    for (const parlamentar of parlamentares) {
      if (parlamentar.despesas.length === 0) continue;

      yPosition = this.checkNewPage(yPosition, 40);
      yPosition = this.addParlamentarHeader(parlamentar, yPosition);

      // Emendas e despesas do parlamentar
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
      });

      yPosition = this.renderDespesasPorEmenda(emendasCalc, despesasExecutadas, yPosition);
    }

    return yPosition;
  }

  renderDespesasPorEmenda(emendasCalc, despesasExecutadas, yPosition) {
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

      // Agrupar por natureza de despesa
      const grupos = this.agruparPorNatureza(despesasEmenda);

      for (const [natureza, despesasGrupo] of grupos) {
        yPosition = this.checkNewPage(yPosition, 30);
        yPosition = this.renderNaturezaHeader(natureza, despesasGrupo, yPosition);

        const tabela = despesasGrupo.map(d => [
          this.formatarData(d.dataPagamento || d.dataLiquidacao || d.dataEmpenho),
          d.discriminacao || d.descricao || "-",
          this.formatFornecedorComCnpj(d),
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
    }

    return yPosition;
  }
}
