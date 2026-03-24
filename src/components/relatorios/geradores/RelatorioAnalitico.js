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

    // HEADER com subtítulo do período
    this.addHeader("Relatório Analítico por Parlamentar", this.getSubtituloPeriodo(filtros));

    let yPosition = 58;

    // Usar métodos utilitários da BaseRelatorio
    const { valorTotal, valorExecutado, percentualGeral, totalDespesas } = this.calcularMetricas();
    const despesasExecutadas = this.getDespesasExecutadas();
    const parlamentares = this.getParlamentares();

    const kpis = [
      { label: "Parlamentares", value: parlamentares.length.toString() },
      { label: "Emendas", value: this.emendas.length.toString() },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Despesas", value: totalDespesas.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    yPosition = addSectionTitle(this.doc, "Visão Geral", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const mediaPorParlamentar = parlamentares.length > 0 ? valorTotal / parlamentares.length : 0;
    const mediaExecPorParlamentar = parlamentares.length > 0 ? valorExecutado / parlamentares.length : 0;
    
    const resumoItems = [
      `Total de Parlamentares Ativos: ${parlamentares.length}`,
      `Média de Valor por Parlamentar: ${this.formatCurrency(mediaPorParlamentar)}`,
      `Média de Execução por Parlamentar: ${this.formatCurrency(mediaExecPorParlamentar)}`,
      `Percentual Geral de Execução: ${percentualGeral.toFixed(1)}%`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Análise por Parlamentar", yPosition);

    const analise = parlamentares.map((parlamentar) => {
      // Filtra por autor OU parlamentar
      const emendasParlamentar = this.emendas.filter((e) =>
        (e.autor || e.parlamentar) === parlamentar
      );

      // Usa valorTotal já normalizado pelo hook
      const valorTotalParlamentar = emendasParlamentar.reduce((sum, e) => sum + (e.valorTotal || 0), 0);

      const despesasParlamentar = despesasExecutadas.filter((d) =>
        emendasParlamentar.some((e) => e.id === d.emendaId)
      );

      const valorExecutadoParlamentar = despesasParlamentar.reduce((sum, d) => sum + (d.valor || 0), 0);

      const saldo = valorTotalParlamentar - valorExecutadoParlamentar;
      const percentual = valorTotalParlamentar > 0 ? (valorExecutadoParlamentar / valorTotalParlamentar) * 100 : 0;

      return {
        nome: parlamentar,
        emendas: emendasParlamentar.length,
        despesas: despesasParlamentar.length,
        valorTotal: valorTotalParlamentar,
        valorExecutado: valorExecutadoParlamentar,
        saldo,
        percentual,
      };
    }).sort((a, b) => b.valorExecutado - a.valorExecutado);

    const tabelaParlamentares = analise.map((p) => [
      p.nome.length > 25 ? p.nome.substring(0, 22) + "..." : p.nome,
      p.emendas.toString(),
      this.formatCurrency(p.valorTotal),
      this.formatCurrency(p.valorExecutado),
      this.formatCurrency(p.saldo),
      `${p.percentual.toFixed(0)}%`,
    ]);

    if (tabelaParlamentares.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["Parlamentar", "Emendas", "Total", "Executado", "Saldo", "%"]],
          body: tabelaParlamentares,
          ...modernStyles,
          columnStyles: {
            0: { cellWidth: 'auto', halign: "left" },
            1: { cellWidth: 18, halign: "right" },
            2: { cellWidth: 30, halign: "right" },
            3: { cellWidth: 30, halign: "right" },
            4: { cellWidth: 28, halign: "right" },
            5: { cellWidth: 16, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de parlamentares: ${error.message}`);
      }
    }

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Detalhamento de Emendas", yPosition);

    // Usar método utilitário, ordenado por percentual
    const emendasDetalhadas = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.percentual - a.percentual);

    const tabelaEmendas = emendasDetalhadas.map((e) => {
      const parlamentar = e.parlamentar || "-";
      return [
        e.numero || "-",
        parlamentar.length > 20 ? parlamentar.substring(0, 17) + "..." : parlamentar,
        e.tipo || "-",
        this.formatCurrency(e.valorTotal),
        this.formatCurrency(e.valorExecutado),
        `${e.percentual.toFixed(0)}%`,
      ];
    });

    if (tabelaEmendas.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Parlamentar", "Tipo", "Total", "Executado", "%"]],
          body: tabelaEmendas,
          ...modernStyles,
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

    // DETALHAMENTO DAS DESPESAS POR EMENDA
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);

    // Filtra emendas que têm despesas executadas
    const emendasComDespesas = emendasDetalhadas.filter(e => e.despesasCount > 0);

    if (emendasComDespesas.length > 0) {
      for (const emenda of emendasComDespesas) {
        yPosition = this.checkNewPage(yPosition, 40);

        // Cabeçalho da emenda
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...PDF_COLORS.SLATE_700);
        this.doc.text(`Emenda: ${emenda.numero || emenda.id}`, 15, yPosition);

        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...PDF_COLORS.SLATE_500);
        this.doc.text(`Parlamentar: ${emenda.parlamentar} | Executado: ${this.formatCurrency(emenda.valorExecutado)} de ${this.formatCurrency(emenda.valorTotal)} (${emenda.percentual.toFixed(0)}%)`, 15, yPosition + 4);
        yPosition += 10;

        // Despesas desta emenda
        const despesasEmenda = despesasExecutadas
          .filter(d => d.emendaId === emenda.id)
          .sort((a, b) => {
            const dataA = this.parseData(a.dataPagamento || a.dataLiquidacao || a.dataEmpenho);
            const dataB = this.parseData(b.dataPagamento || b.dataLiquidacao || b.dataEmpenho);
            return dataB - dataA;
          });

        const tabelaDespesasEmenda = despesasEmenda.map(d => {
          // Data: usa dataPagamento, dataLiquidacao ou dataEmpenho (nessa ordem)
          const dataRaw = d.dataPagamento || d.dataLiquidacao || d.dataEmpenho;
          const dataFormatada = this.formatarData(dataRaw);

          // Descrição: usa discriminacao (campo real) ou descricao como fallback
          const descricao = d.discriminacao || d.descricao || "-";
          const descricaoTruncada = descricao.length > 28 ? descricao.substring(0, 25) + "..." : descricao;

          return [
            dataFormatada,
            descricaoTruncada,
            d.fornecedor?.length > 22 ? d.fornecedor.substring(0, 19) + "..." : (d.fornecedor || "-"),
            this.formatCurrency(d.valor || 0),
          ];
        });

        if (tabelaDespesasEmenda.length > 0) {
          try {
            const modernStyles = getModernTableStyles();
            this.createTable({
              startY: yPosition,
              head: [["Data", "Descrição", "Fornecedor", "Valor"]],
              body: tabelaDespesasEmenda,
              ...modernStyles,
              styles: {
                ...modernStyles.styles,
                fontSize: 6,
              },
              headStyles: {
                ...modernStyles.headStyles,
                fontSize: 6,
              },
              columnStyles: {
                0: { cellWidth: 18, halign: "center" },
                1: { cellWidth: 'auto', halign: "left" },
                2: { cellWidth: 50, halign: "left" },
                3: { cellWidth: 28, halign: "right" },
              },
            });
            yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 8;
          } catch (error) {
            this.addWarning(`Erro ao criar tabela de despesas da emenda ${emenda.numero}: ${error.message}`);
          }
        }
      }
    } else {
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "italic");
      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.text("Nenhuma despesa executada encontrada.", 15, yPosition);
      yPosition += 8;
    }

    yPosition = this.checkNewPage(yPosition, 40);
    yPosition = addSectionTitle(this.doc, "Indicadores de Desempenho", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const emendasAcima50 = emendasDetalhadas.filter(e => e.percentual >= 50).length;
    const emendasAcima80 = emendasDetalhadas.filter(e => e.percentual >= 80).length;
    const emendas100 = emendasDetalhadas.filter(e => e.percentual >= 100).length;
    const emendasSemExecucao = emendasDetalhadas.filter(e => e.valorExecutado === 0).length;
    
    const indicadores = [
      `Emendas com 100% de execução: ${emendas100} (${this.emendas.length > 0 ? ((emendas100 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas acima de 80%: ${emendasAcima80} (${this.emendas.length > 0 ? ((emendasAcima80 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas acima de 50%: ${emendasAcima50} (${this.emendas.length > 0 ? ((emendasAcima50 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas sem execução: ${emendasSemExecucao} (${this.emendas.length > 0 ? ((emendasSemExecucao / this.emendas.length) * 100).toFixed(0) : 0}%)`,
    ];
    
    indicadores.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Análise detalhada por parlamentar. Relatório gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooterTodasPaginas();
  }
}
