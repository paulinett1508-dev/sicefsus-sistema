// src/components/relatorios/geradores/RelatorioExecucao.js
// Design Moderno - Clean, Compacto, Elegante
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

    // HEADER com subtítulo do período
    this.addHeader("Execução Orçamentária", this.getSubtituloPeriodo(filtros));

    let yPosition = 58;

    // Usar métodos utilitários da BaseRelatorio
    const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas } = this.calcularMetricas();

    // KPI CARDS
    const kpis = [
      { label: "Total Emendas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // RESUMO GERAL
    yPosition = addSectionTitle(this.doc, "Resumo Geral", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const resumoItems = [
      `Total de Emendas Cadastradas: ${totalEmendas}`,
      `Total de Despesas Executadas: ${totalDespesas}`,
      `Valor Total Alocado: ${this.formatCurrency(valorTotal)}`,
      `Valor Executado: ${this.formatCurrency(valorExecutado)} (${percentualGeral.toFixed(1)}%)`,
      `Saldo Disponível: ${this.formatCurrency(saldoDisponivel)}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    // DETALHAMENTO POR EMENDA
    yPosition = addSectionTitle(this.doc, "Detalhamento por Emenda", yPosition);

    // Usar método utilitário da BaseRelatorio
    const emendasComExecucao = this.calcularExecucaoPorEmenda()
      .sort((a, b) => b.percentual - a.percentual);

    const tabelaEmendas = emendasComExecucao.map((e) => {
      const tipo = e.tipo || "-";
      const parlamentar = e.parlamentar || "-";
      return [
        e.numero || "-",
        tipo.length > 12 ? tipo.substring(0, 10) + ".." : tipo,
        parlamentar.length > 18 ? parlamentar.substring(0, 15) + "..." : parlamentar,
        this.formatCurrency(e.valorTotal),
        this.formatCurrency(e.valorExecutado),
        this.formatCurrency(e.saldo),
        `${e.percentual.toFixed(0)}%`,
      ];
    });

    if (tabelaEmendas.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Tipo", "Parlamentar", "Total", "Executado", "Saldo", "%"]],
          body: tabelaEmendas,
          ...modernStyles,
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
        // Captura a posição final da tabela via lastAutoTable
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de emendas: ${error.message}`);
      }
    }

    // DETALHAMENTO DAS DESPESAS POR EMENDA
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);

    const despesasExecutadas = this.getDespesasExecutadas();

    // Para cada emenda que tem despesas, listar suas despesas
    const emendasComDespesas = emendasComExecucao.filter(e => e.despesasCount > 0);

    if (emendasComDespesas.length > 0) {
      for (const emenda of emendasComDespesas) {
        yPosition = this.checkNewPage(yPosition, 40);

        // Subtítulo da emenda
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
          .sort((a, b) => (b.valor || 0) - (a.valor || 0));

        const tabelaDespesasEmenda = despesasEmenda.map(d => {
          // Data: usa dataPagamento, dataLiquidacao ou dataEmpenho (nessa ordem)
          const dataRaw = d.dataPagamento || d.dataLiquidacao || d.dataEmpenho;
          const dataFormatada = this.formatarData(dataRaw);

          // Descrição: usa discriminacao (campo real) ou descricao como fallback
          const descricao = d.discriminacao || d.descricao || "-";
          const descricaoTruncada = descricao.length > 30 ? descricao.substring(0, 27) + "..." : descricao;

          return [
            dataFormatada,
            descricaoTruncada,
            d.fornecedor?.length > 25 ? d.fornecedor.substring(0, 22) + "..." : (d.fornecedor || "-"),
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

    // ANÁLISE POR STATUS DE EXECUÇÃO
    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Análise por Status de Execução", yPosition);

    const statusExecucao = {
      "100% executado": emendasComExecucao.filter(e => e.percentual >= 100).length,
      "50-99%": emendasComExecucao.filter(e => e.percentual >= 50 && e.percentual < 100).length,
      "1-49%": emendasComExecucao.filter(e => e.percentual > 0 && e.percentual < 50).length,
      "Sem execução": emendasComExecucao.filter(e => e.percentual === 0).length,
    };

    const valorPorStatus = {
      "100% executado": emendasComExecucao.filter(e => e.percentual >= 100).reduce((sum, e) => sum + e.valorExecutado, 0),
      "50-99%": emendasComExecucao.filter(e => e.percentual >= 50 && e.percentual < 100).reduce((sum, e) => sum + e.valorExecutado, 0),
      "1-49%": emendasComExecucao.filter(e => e.percentual > 0 && e.percentual < 50).reduce((sum, e) => sum + e.valorExecutado, 0),
      "Sem execução": 0,
    };

    const tabelaStatus = Object.entries(statusExecucao).map(([status, qtd]) => [
      status,
      this.formatCurrency(valorPorStatus[status]),
      `${totalEmendas > 0 ? ((qtd / totalEmendas) * 100).toFixed(0) : 0}%`,
    ]);

    try {
      const modernStyles = getModernTableStyles();
      this.createTable({
        startY: yPosition,
        head: [["Status", "Valor Executado", "% Emendas"]],
        body: tabelaStatus,
        ...modernStyles,
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

    // Nota de rodape
    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Valores atualizados. Relatório gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
