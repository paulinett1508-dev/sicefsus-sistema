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

    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });

    this.addHeader("Relatorio Analitico", `${nomeMes} ${ano}`);

    let yPosition = 58;

    const despesasExecutadas = this.despesas.filter(d => d.status !== "PLANEJADA");
    const parlamentares = [...new Set(this.emendas.map(e => e.autor).filter(Boolean))];
    
    const valorTotal = this.emendas.reduce((sum, e) => {
      const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const valorExecutado = despesasExecutadas.reduce((sum, d) => {
      const valor = parseFloat(d.valor || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    const kpis = [
      { label: "Parlamentares", value: parlamentares.length.toString() },
      { label: "Emendas", value: this.emendas.length.toString() },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Despesas", value: despesasExecutadas.length.toString() },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    yPosition = addSectionTitle(this.doc, "Visao Geral", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const mediaPorParlamentar = parlamentares.length > 0 ? valorTotal / parlamentares.length : 0;
    const mediaExecPorParlamentar = parlamentares.length > 0 ? valorExecutado / parlamentares.length : 0;
    
    const resumoItems = [
      `Total de Parlamentares Ativos: ${parlamentares.length}`,
      `Media de Valor por Parlamentar: ${this.formatCurrency(mediaPorParlamentar)}`,
      `Media de Execucao por Parlamentar: ${this.formatCurrency(mediaExecPorParlamentar)}`,
      `Percentual Geral de Execucao: ${percentualGeral.toFixed(1)}%`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Analise por Parlamentar", yPosition);

    const analise = parlamentares.map((parlamentar) => {
      const emendasParlamentar = this.emendas.filter((e) => e.autor === parlamentar);
      
      const valorTotalParlamentar = emendasParlamentar.reduce((sum, e) => {
        const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);

      const despesasParlamentar = despesasExecutadas.filter((d) =>
        emendasParlamentar.some((e) => e.id === d.emendaId)
      );

      const valorExecutadoParlamentar = despesasParlamentar.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);

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
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Detalhamento de Emendas", yPosition);

    const emendasDetalhadas = this.emendas
      .map((emenda) => {
        const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
        const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
        const executado = despesasEmenda.reduce((sum, d) => {
          const valor = parseFloat(d.valor || 0);
          return sum + (isNaN(valor) ? 0 : valor);
        }, 0);
        const percentual = valorTotalEmenda > 0 ? (executado / valorTotalEmenda) * 100 : 0;
        return { ...emenda, valorTotal: isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda, executado, percentual };
      })
      .sort((a, b) => b.percentual - a.percentual);

    const tabelaEmendas = emendasDetalhadas.map((emenda) => [
      emenda.numero || "-",
      emenda.autor?.length > 20 ? emenda.autor.substring(0, 17) + "..." : (emenda.autor || "-"),
      emenda.tipo || "-",
      this.formatCurrency(emenda.valorTotal),
      this.formatCurrency(emenda.executado),
      `${emenda.percentual.toFixed(0)}%`,
    ]);

    if (tabelaEmendas.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    yPosition = this.checkNewPage(yPosition, 40);
    yPosition = addSectionTitle(this.doc, "Indicadores de Desempenho", yPosition);
    
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    
    const emendasAcima50 = emendasDetalhadas.filter(e => e.percentual >= 50).length;
    const emendasAcima80 = emendasDetalhadas.filter(e => e.percentual >= 80).length;
    const emendas100 = emendasDetalhadas.filter(e => e.percentual >= 100).length;
    const emendasSemExecucao = emendasDetalhadas.filter(e => e.executado === 0).length;
    
    const indicadores = [
      `Emendas com 100% de execucao: ${emendas100} (${this.emendas.length > 0 ? ((emendas100 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas acima de 80%: ${emendasAcima80} (${this.emendas.length > 0 ? ((emendasAcima80 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas acima de 50%: ${emendasAcima50} (${this.emendas.length > 0 ? ((emendasAcima50 / this.emendas.length) * 100).toFixed(0) : 0}%)`,
      `Emendas sem execucao: ${emendasSemExecucao} (${this.emendas.length > 0 ? ((emendasSemExecucao / this.emendas.length) * 100).toFixed(0) : 0}%)`,
    ];
    
    indicadores.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Analise detalhada por parlamentar. Relatorio gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
