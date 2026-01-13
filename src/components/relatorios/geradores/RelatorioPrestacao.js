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
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        } else {
          this.addWarning("Tabela de demonstrativo não pôde ser gerada");
        }
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de demonstrativo: ${error.message}`);
      }
    }

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Despesas Executadas", yPosition);

    const despesasOrdenadas = [...despesasExecutadas]
      .sort((a, b) => {
        const dataA = a.data ? new Date(a.data).getTime() : 0;
        const dataB = b.data ? new Date(b.data).getTime() : 0;
        return dataB - dataA;
      });

    const tabelaDespesas = despesasOrdenadas.map((d) => {
      const emenda = this.emendas.find(e => e.id === d.emendaId);
      return [
        d.data ? new Date(d.data).toLocaleDateString("pt-BR") : "-",
        emenda?.numero || "-",
        d.descricao?.length > 25 ? d.descricao.substring(0, 22) + "..." : (d.descricao || "-"),
        d.fornecedor?.length > 18 ? d.fornecedor.substring(0, 15) + "..." : (d.fornecedor || "-"),
        this.formatCurrency(d.valor || 0),
      ];
    });

    if (tabelaDespesas.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
            startY: yPosition,
            head: [["Data", "Emenda", "Descrição", "Fornecedor", "Valor"]],
            body: tabelaDespesas,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 20, halign: "center" },
              1: { cellWidth: 22, halign: "left" },
              2: { cellWidth: 'auto', halign: "left" },
              3: { cellWidth: 38, halign: "left" },
              4: { cellWidth: 28, halign: "right" },
            },
          });
          yPosition = this.doc.lastAutoTable.finalY + 10;
        } else {
          this.addWarning("Tabela de despesas não pôde ser gerada");
        }
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de despesas: ${error.message}`);
      }
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

    this.doc.setTextColor(...PDF_COLORS.SLATE_600);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    
    const assinaturaY = this.pageHeight - 45;
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
