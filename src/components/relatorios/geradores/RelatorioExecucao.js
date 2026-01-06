// src/components/relatorios/geradores/RelatorioExecucao.js
// Design Moderno - Clean, Compacto, Elegante
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
  createManualTable,
} from "../../../utils/pdfHelpers";

export class RelatorioExecucao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // Período para subtítulo
    let subtitulo = null;
    if (filtros.dataInicio || filtros.dataFim) {
      const inicio = filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início";
      const fim = filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual";
      subtitulo = `Período: ${inicio} a ${fim}`;
    }

    // HEADER
    this.addHeader("Execução Orçamentária", subtitulo);

    let yPosition = 55;

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
    const percentualExecutado = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    // KPI CARDS (valores completos, sem abreviação)
    const kpis = [
      { label: "Total Emendas", value: totalEmendas.toString() },
      { label: "Valor Total", value: this.formatCurrency(valorTotal) },
      { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualExecutado.toFixed(1)}%` },
      { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // DETALHAMENTO POR EMENDA
    yPosition = addSectionTitle(this.doc, "Detalhamento por Emenda", yPosition);

    // Preparar dados para a tabela
    const tabelaEmendas = this.emendas.map((emenda) => {
      const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      const valorTotalNormalizado = isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda;

      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id && d.status !== "PLANEJADA",
      );
      const valorExecutadoEmenda = despesasEmenda.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);

      const saldoEmenda = valorTotalNormalizado - valorExecutadoEmenda;
      const percentualEmenda = valorTotalNormalizado > 0
        ? (valorExecutadoEmenda / valorTotalNormalizado) * 100
        : 0;

      return [
        emenda.numero || "-",
        (emenda.autor || "-").substring(0, 25),
        this.formatCurrency(valorTotalNormalizado),
        this.formatCurrency(valorExecutadoEmenda),
        this.formatCurrency(saldoEmenda),
        `${percentualEmenda.toFixed(0)}%`,
      ];
    });

    // Usar autoTable com estilos modernos
    const headers = ["Emenda", "Parlamentar", "Total", "Executado", "Saldo", "%"];

    try {
      if (this.doc.autoTable) {
        const modernStyles = getModernTableStyles();

        this.doc.autoTable({
          startY: yPosition,
          head: [headers],
          body: tabelaEmendas,
          ...modernStyles,
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 'auto' },
            2: { halign: "right", cellWidth: 32 },
            3: { halign: "right", cellWidth: 32 },
            4: { halign: "right", cellWidth: 32 },
            5: { halign: "center", cellWidth: 14 },
          },
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              // Header compacto para continuação
              this.doc.setFillColor(...PDF_COLORS.ACCENT);
              this.doc.rect(0, 0, this.pageWidth, 1.5, "F");
              this.doc.setTextColor(...PDF_COLORS.SLATE_700);
              this.doc.setFontSize(9);
              this.doc.setFont("helvetica", "bold");
              this.doc.text("Execução Orçamentária", 15, 10);
              this.doc.setTextColor(...PDF_COLORS.SLATE_400);
              this.doc.setFontSize(8);
              this.doc.text("(continuação)", 55, 10);
            }
            this.addFooter();
          },
        });
      } else {
        // Fallback: tabela manual
        createManualTable(this.doc, headers, tabelaEmendas, yPosition);
      }
    } catch (error) {
      console.warn("Erro ao criar tabela automática, usando tabela manual:", error);
      createManualTable(this.doc, headers, tabelaEmendas, yPosition);
    }

    // Rodapé
    this.addFooter();
  }
}
