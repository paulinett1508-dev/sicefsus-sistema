// src/components/relatorios/geradores/RelatorioAnalitico.js
// Design Moderno - Clean, Compacto, Elegante
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
  formatCurrencyCompact,
} from "../../../utils/pdfHelpers";

export class RelatorioAnalitico extends BaseRelatorio {
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
    this.addHeader("Analítico por Parlamentar", subtitulo);

    let yPosition = 55;

    // Agrupar por parlamentar
    const porParlamentar = {};
    this.emendas.forEach((emenda) => {
      const autor = emenda.autor || "Não informado";
      if (!porParlamentar[autor]) {
        porParlamentar[autor] = {
          emendas: [],
          valorTotal: 0,
          valorExecutado: 0,
          quantidadeDespesas: 0,
        };
      }

      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id && d.status !== "PLANEJADA"
      );
      const executado = despesasEmenda.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);

      const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      const valorTotalNormalizado = isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda;

      porParlamentar[autor].emendas.push({
        ...emenda,
        valorTotal: valorTotalNormalizado,
        valorExecutado: executado,
        quantidadeDespesas: despesasEmenda.length,
      });
      porParlamentar[autor].valorTotal += valorTotalNormalizado;
      porParlamentar[autor].valorExecutado += executado;
      porParlamentar[autor].quantidadeDespesas += despesasEmenda.length;
    });

    // KPIs gerais
    const totalParlamentares = Object.keys(porParlamentar).length;
    const totalGeral = Object.values(porParlamentar).reduce((sum, p) => sum + p.valorTotal, 0);
    const executadoGeral = Object.values(porParlamentar).reduce((sum, p) => sum + p.valorExecutado, 0);
    const percentualGeral = totalGeral > 0 ? (executadoGeral / totalGeral) * 100 : 0;

    const kpis = [
      { label: "Parlamentares", value: totalParlamentares.toString() },
      { label: "Total Emendas", value: this.emendas.length.toString() },
      { label: "Valor Total", value: formatCurrencyCompact(totalGeral) },
      { label: "Execução", value: `${percentualGeral.toFixed(1)}%` },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // Ordenar por valor executado
    const parlamentaresOrdenados = Object.entries(porParlamentar)
      .sort(([, a], [, b]) => b.valorExecutado - a.valorExecutado);

    // Gerar análise por parlamentar
    parlamentaresOrdenados.forEach(([parlamentar, dados], index) => {
      yPosition = this.checkNewPage(yPosition, 50);
      if (yPosition < 30) {
        this.doc.addPage();
        this.pageNum++;
        // Header compacto
        this.doc.setFillColor(...PDF_COLORS.ACCENT);
        this.doc.rect(0, 0, this.pageWidth, 1.5, "F");
        this.doc.setTextColor(...PDF_COLORS.SLATE_700);
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Analítico por Parlamentar", 15, 10);
        yPosition = 20;
      }

      // Card do parlamentar
      const cardHeight = 22;
      this.doc.setFillColor(...PDF_COLORS.SLATE_50);
      this.doc.roundedRect(15, yPosition, this.pageWidth - 30, cardHeight, 2, 2, "F");
      this.doc.setDrawColor(...PDF_COLORS.SLATE_200);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(15, yPosition, this.pageWidth - 30, cardHeight, 2, 2, "S");

      // Rank + Nome
      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.setFontSize(9);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${index + 1}º`, 20, yPosition + 8);

      this.doc.setTextColor(...PDF_COLORS.SLATE_900);
      this.doc.setFontSize(10);
      const nomeAbreviado = parlamentar.length > 35 ? parlamentar.substring(0, 32) + "..." : parlamentar;
      this.doc.text(nomeAbreviado, 32, yPosition + 8);

      // Métricas do parlamentar
      const percentual = dados.valorTotal > 0
        ? (dados.valorExecutado / dados.valorTotal) * 100
        : 0;

      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`${dados.emendas.length} emendas • ${dados.quantidadeDespesas} despesas`, 32, yPosition + 15);

      // Valor e percentual (direita)
      this.doc.setTextColor(...PDF_COLORS.SLATE_900);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(this.formatCurrency(dados.valorExecutado), this.pageWidth - 50, yPosition + 8, { align: "right" });

      // Percentual colorido
      const percentualColor = percentual >= 80 ? PDF_COLORS.EMERALD_500
        : percentual >= 50 ? PDF_COLORS.AMBER_500
        : PDF_COLORS.RED_500;
      this.doc.setTextColor(...percentualColor);
      this.doc.setFontSize(9);
      this.doc.text(`${percentual.toFixed(0)}%`, this.pageWidth - 20, yPosition + 8, { align: "right" });

      yPosition += cardHeight + 5;
    });

    // Rodapé
    this.addFooter();
  }
}
