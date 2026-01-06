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

    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });

    this.addHeader("Prestacao de Contas", `${nomeMes} ${ano}`);

    let yPosition = 58;

    const despesasExecutadas = this.despesas.filter(d => d.status !== "PLANEJADA");
    
    const valorTotal = this.emendas.reduce((sum, e) => {
      const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const valorExecutado = despesasExecutadas.reduce((sum, d) => {
      const valor = parseFloat(d.valor || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    const kpis = [
      { label: "Recurso Total", value: this.formatCurrency(valorTotal) },
      { label: "Utilizado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo Disponivel", value: this.formatCurrency(saldoDisponivel) },
      { label: "Despesas", value: despesasExecutadas.length.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    yPosition = addSectionTitle(this.doc, "Resumo da Prestacao de Contas", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const emendasComExecucao = this.emendas.filter(e => {
      const desp = despesasExecutadas.filter(d => d.emendaId === e.id);
      return desp.length > 0;
    }).length;
    
    const emendas100 = this.emendas.filter(e => {
      const valorEmenda = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      const exec = despesasExecutadas.filter(d => d.emendaId === e.id)
        .reduce((sum, d) => sum + parseFloat(d.valor || 0), 0);
      return valorEmenda > 0 && exec >= valorEmenda;
    }).length;
    
    const resumoItems = [
      `Periodo de Referencia: ${nomeMes} de ${ano}`,
      `Emendas com Execucao: ${emendasComExecucao} de ${this.emendas.length}`,
      `Emendas 100% Executadas: ${emendas100}`,
      `Percentual Geral: ${percentualGeral.toFixed(1)}%`,
      `Saldo a Executar: ${this.formatCurrency(saldoDisponivel)}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Demonstrativo por Emenda", yPosition);

    const demonstrativo = this.emendas.map((emenda) => {
      const valorEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
      const executado = despesasEmenda.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
      const saldo = valorEmenda - executado;
      const percentual = valorEmenda > 0 ? (executado / valorEmenda) * 100 : 0;

      return {
        numero: emenda.numero || "-",
        parlamentar: emenda.autor || "-",
        valorTotal: isNaN(valorEmenda) ? 0 : valorEmenda,
        executado,
        saldo,
        percentual,
      };
    }).sort((a, b) => b.executado - a.executado);

    const tabelaDemonstrativo = demonstrativo.map((d) => [
      d.numero,
      d.parlamentar.length > 20 ? d.parlamentar.substring(0, 17) + "..." : d.parlamentar,
      this.formatCurrency(d.valorTotal),
      this.formatCurrency(d.executado),
      this.formatCurrency(d.saldo),
      `${d.percentual.toFixed(0)}%`,
    ]);

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
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
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
        this.formatCurrency(parseFloat(d.valor || 0)),
      ];
    });

    if (tabelaDespesas.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
            startY: yPosition,
            head: [["Data", "Emenda", "Descricao", "Fornecedor", "Valor"]],
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
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
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
      `Percentual de Utilizacao: ${percentualGeral.toFixed(1)}%`,
    ];
    
    totais.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });

    this.doc.setTextColor(...PDF_COLORS.SLATE_600);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    
    const assinaturaY = this.pageHeight - 45;
    this.doc.text("_____________________________________", 105, assinaturaY, { align: "center" });
    this.doc.text("Responsavel pela Prestacao de Contas", 105, assinaturaY + 5, { align: "center" });
    this.doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 105, assinaturaY + 10, { align: "center" });

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Documento gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
