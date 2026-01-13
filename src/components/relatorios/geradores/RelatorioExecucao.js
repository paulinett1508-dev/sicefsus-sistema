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

    // Periodo para subtitulo
    let subtitulo = null;
    if (filtros.dataInicio || filtros.dataFim) {
      const inicio = filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Inicio";
      const fim = filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual";
      subtitulo = `Periodo: ${inicio} a ${fim}`;
    }

    // HEADER
    this.addHeader("Execucao Orcamentaria", subtitulo);

    let yPosition = 58;

    // Calcular metricas
    const totalEmendas = this.emendas.length;
    const despesasExecutadas = this.despesas.filter(d => d.status !== "PLANEJADA");
    const totalDespesas = despesasExecutadas.length;
    
    // Usa valorTotal já normalizado pelo hook useRelatoriosData
    const valorTotal = this.emendas.reduce((sum, e) => sum + (e.valorTotal || 0), 0);
    
    const valorExecutado = despesasExecutadas.reduce((sum, d) => {
      const valor = parseFloat(d.valor || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    // KPI CARDS
    const kpis = [
      { label: "Total Emendas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualExecutado.toFixed(1)}%` },
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
      `Valor Executado: ${this.formatCurrency(valorExecutado)} (${percentualExecutado.toFixed(1)}%)`,
      `Saldo Disponivel: ${this.formatCurrency(saldoDisponivel)}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    // DETALHAMENTO POR EMENDA
    yPosition = addSectionTitle(this.doc, "Detalhamento por Emenda", yPosition);

    const emendasComExecucao = this.emendas.map((emenda) => {
      // Usa valorTotal já normalizado pelo hook
      const valorEmenda = emenda.valorTotal || 0;
      const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
      const valorExec = despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0);
      const saldo = valorEmenda - valorExec;
      const percentual = valorEmenda > 0 ? (valorExec / valorEmenda) * 100 : 0;

      return {
        numero: emenda.numero || "-",
        tipo: emenda.tipo || "-",
        parlamentar: emenda.autor || emenda.parlamentar || "-",
        valorTotal: valorEmenda,
        valorExecutado: valorExec,
        saldo,
        percentual,
      };
    }).sort((a, b) => b.percentual - a.percentual);

    const tabelaEmendas = emendasComExecucao.map((e) => [
      e.numero,
      e.tipo.length > 12 ? e.tipo.substring(0, 10) + ".." : e.tipo,
      e.parlamentar.length > 18 ? e.parlamentar.substring(0, 15) + "..." : e.parlamentar,
      this.formatCurrency(e.valorTotal),
      this.formatCurrency(e.valorExecutado),
      this.formatCurrency(e.saldo),
      `${e.percentual.toFixed(0)}%`,
    ]);

    if (tabelaEmendas.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela de emendas:", error);
      }
    }

    // ANALISE POR STATUS DE EXECUCAO
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Analise por Status de Execucao", yPosition);

    const statusExecucao = {
      "100% executado": emendasComExecucao.filter(e => e.percentual >= 100).length,
      "50-99%": emendasComExecucao.filter(e => e.percentual >= 50 && e.percentual < 100).length,
      "1-49%": emendasComExecucao.filter(e => e.percentual > 0 && e.percentual < 50).length,
      "Sem execucao": emendasComExecucao.filter(e => e.percentual === 0).length,
    };

    const valorPorStatus = {
      "100% executado": emendasComExecucao.filter(e => e.percentual >= 100).reduce((sum, e) => sum + e.valorExecutado, 0),
      "50-99%": emendasComExecucao.filter(e => e.percentual >= 50 && e.percentual < 100).reduce((sum, e) => sum + e.valorExecutado, 0),
      "1-49%": emendasComExecucao.filter(e => e.percentual > 0 && e.percentual < 50).reduce((sum, e) => sum + e.valorExecutado, 0),
      "Sem execucao": 0,
    };

    const tabelaStatus = Object.entries(statusExecucao).map(([status, qtd]) => [
      status,
      this.formatCurrency(valorPorStatus[status]),
      `${totalEmendas > 0 ? ((qtd / totalEmendas) * 100).toFixed(0) : 0}%`,
    ]);

    try {
      if (this.doc.autoTable) {
        const modernStyles = getModernTableStyles();
        this.doc.autoTable({
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
        yPosition = this.doc.lastAutoTable.finalY + 10;
      }
    } catch (error) {
      console.warn("Erro ao criar tabela de status:", error);
    }

    // Nota de rodape
    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Valores atualizados. Relatorio gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
