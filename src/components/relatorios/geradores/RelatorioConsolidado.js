// src/components/relatorios/geradores/RelatorioConsolidado.js
// Design Moderno - Clean, Compacto, Elegante
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  addMiniTable,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioConsolidado extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // Período
    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });

    // HEADER
    this.addHeader("Relatório Consolidado", `${nomeMes} ${ano}`);

    let yPosition = 58;

    // Métricas
    const totalEmendas = this.emendas.length;
    const valorTotal = this.emendas.reduce((sum, e) => {
      const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    const valorExecutado = this.despesas
      .filter(d => d.status !== "PLANEJADA")
      .reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    // KPI CARDS (valores completos, sem abreviação)
    const kpis = [
      { label: "Emendas Ativas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // DISTRIBUIÇÃO POR TIPO
    yPosition = addSectionTitle(this.doc, "Distribuição por Tipo", yPosition);

    const porTipo = {};
    this.emendas.forEach((emenda) => {
      const tipo = emenda.tipo || "Não definido";
      if (!porTipo[tipo]) {
        porTipo[tipo] = { quantidade: 0, valorTotal: 0, valorExecutado: 0 };
      }

      const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      porTipo[tipo].quantidade++;
      porTipo[tipo].valorTotal += isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda;

      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id && d.status !== "PLANEJADA"
      );
      porTipo[tipo].valorExecutado += despesasEmenda.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
    });

    const dadosTipo = Object.entries(porTipo)
      .sort(([, a], [, b]) => b.valorExecutado - a.valorExecutado)
      .map(([tipo, dados]) => ({
        label: `${tipo} (${dados.quantidade})`,
        value: this.formatCurrency(dados.valorExecutado),
      }));

    if (dadosTipo.length > 0) {
      yPosition = addMiniTable(this.doc, dadosTipo.slice(0, 5), yPosition);
    }

    // TOP 5 EMENDAS
    yPosition = addSectionTitle(this.doc, "Top 5 Emendas por Execução", yPosition);

    const emendasComExecucao = this.emendas
      .map((emenda) => {
        const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
        const despesasEmenda = this.despesas.filter(
          (d) => d.emendaId === emenda.id && d.status !== "PLANEJADA"
        );
        const executado = despesasEmenda.reduce((sum, d) => {
          const valor = parseFloat(d.valor || 0);
          return sum + (isNaN(valor) ? 0 : valor);
        }, 0);
        return { ...emenda, valorTotal: isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda, executado };
      })
      .sort((a, b) => b.executado - a.executado)
      .slice(0, 5);

    const tabelaTop5 = emendasComExecucao.map((emenda) => [
      emenda.numero || "-",
      (emenda.autor || "-").substring(0, 25),
      this.formatCurrency(emenda.valorTotal),
      this.formatCurrency(emenda.executado),
      `${emenda.valorTotal > 0 ? ((emenda.executado / emenda.valorTotal) * 100).toFixed(0) : 0}%`,
    ]);

    if (tabelaTop5.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
            startY: yPosition,
            head: [["Emenda", "Parlamentar", "Total", "Executado", "%"]],
            body: tabelaTop5,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 25 },
              1: { cellWidth: 'auto' },
              2: { halign: "right", cellWidth: 32 },
              3: { halign: "right", cellWidth: 32 },
              4: { halign: "center", cellWidth: 18 },
            },
          });
          yPosition = this.doc.lastAutoTable.finalY + 15;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    // Nota de rodapé
    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Valores consolidados. Relatório gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
