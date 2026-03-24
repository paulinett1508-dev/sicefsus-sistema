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

    // HEADER com subtítulo do período
    this.addHeader("Prestação de Contas", this.getSubtituloPeriodo(filtros));

    let yPosition = 58;

    // Usar métodos utilitários da BaseRelatorio
    const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalDespesas } = this.calcularMetricas();
    const despesasExecutadas = this.getDespesasExecutadas();

    const kpis = [
      { label: "Recurso Total", value: this.formatCurrency(valorTotal) },
      { label: "Utilizado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo Disponível", value: this.formatCurrency(saldoDisponivel) },
      { label: "Despesas", value: totalDespesas.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    yPosition = addSectionTitle(this.doc, "Resumo da Prestação de Contas", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    // Usar método utilitário para cálculos por emenda
    const emendasCalculadas = this.calcularExecucaoPorEmenda();
    const emendasComExecucaoCount = emendasCalculadas.filter(e => e.despesasCount > 0).length;
    const emendas100Count = emendasCalculadas.filter(e => e.percentual >= 100).length;

    const resumoItems = [
      `Período de Referência: ${this.getSubtituloPeriodo(filtros)}`,
      `Emendas com Execução: ${emendasComExecucaoCount} de ${this.emendas.length}`,
      `Emendas 100% Executadas: ${emendas100Count}`,
      `Percentual Geral: ${percentualGeral.toFixed(1)}%`,
      `Saldo a Executar: ${this.formatCurrency(saldoDisponivel)}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Demonstrativo por Emenda", yPosition);

    // Usar método utilitário, ordenado por valor executado
    const demonstrativo = emendasCalculadas.sort((a, b) => b.valorExecutado - a.valorExecutado);

    const tabelaDemonstrativo = demonstrativo.map((e) => {
      const parlamentar = e.parlamentar || "-";
      return [
        e.numero || "-",
        parlamentar.length > 20 ? parlamentar.substring(0, 17) + "..." : parlamentar,
        this.formatCurrency(e.valorTotal),
        this.formatCurrency(e.valorExecutado),
        this.formatCurrency(e.saldo),
        `${e.percentual.toFixed(0)}%`,
      ];
    });

    if (tabelaDemonstrativo.length > 0) {
      try {
        const modernStyles = getModernTableStyles();
        this.createTable({
          startY: yPosition,
          head: [["Emenda", "Parlamentar", "Valor Total", "Executado", "Saldo", "%"]],
          body: tabelaDemonstrativo,
          ...modernStyles,
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

    // DESPESAS AGRUPADAS POR EMENDA (melhor para auditoria)
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Despesas por Emenda", yPosition);

    // Filtra emendas que têm despesas executadas
    const emendasComDespesas = demonstrativo.filter(e => {
      const despesasEmenda = despesasExecutadas.filter(d => d.emendaId === e.id);
      return despesasEmenda.length > 0;
    });

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
        const parlamentarEmenda = emenda.parlamentar || "-";
        this.doc.text(`Parlamentar: ${parlamentarEmenda} | Executado: ${this.formatCurrency(emenda.valorExecutado)} de ${this.formatCurrency(emenda.valorTotal)} (${emenda.percentual.toFixed(0)}%)`, 15, yPosition + 4);
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
            d.numeroNota || "-",
            this.formatCurrency(d.valor || 0),
          ];
        });

        if (tabelaDespesasEmenda.length > 0) {
          try {
            const modernStyles = getModernTableStyles();
            this.createTable({
              startY: yPosition,
              head: [["Data", "Descrição", "Fornecedor", "Nota Fiscal", "Valor"]],
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
                2: { cellWidth: 45, halign: "left" },
                3: { cellWidth: 22, halign: "center" },
                4: { cellWidth: 26, halign: "right" },
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
      this.doc.text("Nenhuma despesa executada no período.", 15, yPosition);
      yPosition += 8;
    }

    yPosition = this.checkNewPage(yPosition, 40);
    yPosition = addSectionTitle(this.doc, "Totalizadores", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const totais = [
      `Total de Recursos Recebidos: ${this.formatCurrency(valorTotal)}`,
      `Total de Despesas Realizadas: ${this.formatCurrency(valorExecutado)}`,
      `Saldo em Caixa: ${this.formatCurrency(saldoDisponivel)}`,
      `Percentual de Utilização: ${percentualGeral.toFixed(1)}%`,
    ];
    
    totais.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (totais.length * 4) + 10;

    // Assinatura: garante que não sobrepõe o conteúdo acima
    yPosition = this.checkNewPage(yPosition, 30);
    const assinaturaY = yPosition + 4;

    this.doc.setTextColor(...PDF_COLORS.SLATE_700);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");

    this.doc.text("_____________________________________", 105, assinaturaY, { align: "center" });
    this.doc.text("Responsável pela Prestação de Contas", 105, assinaturaY + 5, { align: "center" });
    this.doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 105, assinaturaY + 10, { align: "center" });

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Documento gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
