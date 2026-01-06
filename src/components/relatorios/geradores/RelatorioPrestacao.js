// src/components/relatorios/geradores/RelatorioPrestacao.js
// Design Moderno - Clean, Compacto, Elegante
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
  formatCurrencyCompact,
} from "../../../utils/pdfHelpers";

export class RelatorioPrestacao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // Período para subtítulo
    const periodo = `${filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início"} a ${filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual"}`;
    const municipio = filtros.municipio || this.usuario?.municipio || "Todos";
    const subtitulo = `${municipio} • ${periodo}`;

    // HEADER
    this.addHeader("Prestação de Contas", subtitulo);

    let yPosition = 55;

    // Agrupar despesas por emenda
    const execucaoPorEmenda = {};
    this.emendas.forEach((emenda) => {
      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id && d.status !== "PLANEJADA",
      );
      if (despesasEmenda.length > 0) {
        const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
        const valorTotalNormalizado = isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda;

        execucaoPorEmenda[emenda.id] = {
          emenda: { ...emenda, valorTotal: valorTotalNormalizado },
          despesas: despesasEmenda,
          total: despesasEmenda.reduce((sum, d) => {
            const valor = parseFloat(d.valor || 0);
            return sum + (isNaN(valor) ? 0 : valor);
          }, 0),
        };
      }
    });

    // Métricas
    const totalGeral = Object.values(execucaoPorEmenda).reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const totalEmendas = this.emendas.reduce((sum, e) => {
      const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    const emendasComExecucao = Object.keys(execucaoPorEmenda).length;
    const percentualGeral = totalEmendas > 0 ? (totalGeral / totalEmendas) * 100 : 0;

    // KPI CARDS
    const kpis = [
      { label: "Emendas com Execução", value: emendasComExecucao.toString() },
      { label: "Valor Total", value: formatCurrencyCompact(totalEmendas) },
      { label: "Executado", value: formatCurrencyCompact(totalGeral), trend: `${percentualGeral.toFixed(1)}%` },
      { label: "Saldo", value: formatCurrencyCompact(totalEmendas - totalGeral) },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // EXECUÇÃO FINANCEIRA
    yPosition = addSectionTitle(this.doc, "Execução Financeira por Emenda", yPosition);

    // Gerar detalhamento por emenda
    Object.values(execucaoPorEmenda).forEach(({ emenda, despesas, total }) => {
      // Verificar se precisa nova página
      yPosition = this.checkNewPage(yPosition, 60);
      if (yPosition < 30) {
        this.doc.addPage();
        this.pageNum++;
        // Header compacto
        this.doc.setFillColor(...PDF_COLORS.ACCENT);
        this.doc.rect(0, 0, this.pageWidth, 1.5, "F");
        this.doc.setTextColor(...PDF_COLORS.SLATE_700);
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "bold");
        this.doc.text("Prestação de Contas", 15, 10);
        yPosition = 20;
      }

      // Card da emenda
      const cardHeight = 18;
      this.doc.setFillColor(...PDF_COLORS.SLATE_50);
      this.doc.roundedRect(15, yPosition, this.pageWidth - 30, cardHeight, 2, 2, "F");
      this.doc.setDrawColor(...PDF_COLORS.SLATE_200);
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(15, yPosition, this.pageWidth - 30, cardHeight, 2, 2, "S");

      // Info da emenda
      this.doc.setTextColor(...PDF_COLORS.SLATE_900);
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "bold");
      const titulo = `${emenda.numero || "-"} • ${(emenda.autor || "-").substring(0, 30)}`;
      this.doc.text(titulo, 20, yPosition + 7);

      // Valores
      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      const percentual = emenda.valorTotal > 0 ? (total / emenda.valorTotal) * 100 : 0;
      this.doc.text(`Valor: ${this.formatCurrency(emenda.valorTotal)} • Executado: ${this.formatCurrency(total)} (${percentual.toFixed(0)}%)`, 20, yPosition + 13);

      yPosition += cardHeight + 4;

      // Tabela de despesas da emenda
      const tabelaDespesas = despesas.map((d) => [
        this.formatDate(d.dataEmpenho || d.data || d.criadaEm),
        (d.discriminacao || d.descricao || "-").substring(0, 35),
        (d.fornecedor || "-").substring(0, 25),
        d.numeroEmpenho || d.numeroDocumento || "-",
        this.formatCurrency(parseFloat(d.valor) || 0),
      ]);

      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();

          this.doc.autoTable({
            startY: yPosition,
            head: [["Data", "Descrição", "Fornecedor", "Empenho", "Valor"]],
            body: tabelaDespesas,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 22 },
              1: { cellWidth: 'auto' },
              2: { cellWidth: 'auto' },
              3: { cellWidth: 25 },
              4: { halign: "right", cellWidth: 28, fontStyle: 'bold' },
            },
            margin: { left: 15, right: 15 },
          });

          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
        yPosition += 10;
      }
    });

    // RESUMO FINAL
    yPosition = this.checkNewPage(yPosition, 70);
    if (yPosition < 30) {
      this.doc.addPage();
      this.pageNum++;
      yPosition = 20;
    }

    yPosition = addSectionTitle(this.doc, "Resumo Final", yPosition);

    // Card de resumo
    const resumoHeight = 35;
    this.doc.setFillColor(...PDF_COLORS.SLATE_100);
    this.doc.roundedRect(15, yPosition, this.pageWidth - 30, resumoHeight, 2, 2, "F");

    const col1X = 25;
    const col2X = this.pageWidth / 2 + 10;

    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Total de Emendas", col1X, yPosition + 8);
    this.doc.text("Valor Total", col2X, yPosition + 8);

    this.doc.setTextColor(...PDF_COLORS.SLATE_900);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.emendas.length.toString(), col1X, yPosition + 16);
    this.doc.text(this.formatCurrency(totalEmendas), col2X, yPosition + 16);

    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Total Executado", col1X, yPosition + 24);
    this.doc.text("Saldo Remanescente", col2X, yPosition + 24);

    this.doc.setTextColor(...PDF_COLORS.EMERALD_500);
    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(this.formatCurrency(totalGeral), col1X, yPosition + 32);
    this.doc.setTextColor(...PDF_COLORS.SLATE_900);
    this.doc.text(this.formatCurrency(totalEmendas - totalGeral), col2X, yPosition + 32);

    yPosition += resumoHeight + 15;

    // Área de assinatura
    yPosition = Math.max(yPosition, 220);

    this.doc.setDrawColor(...PDF_COLORS.SLATE_300);
    this.doc.setLineWidth(0.5);

    // Assinatura 1
    this.doc.line(20, yPosition, 90, yPosition);
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.text("Responsável pela Prestação", 55, yPosition + 5, { align: "center" });

    // Assinatura 2
    this.doc.line(120, yPosition, 190, yPosition);
    this.doc.text("Gestor Municipal de Saúde", 155, yPosition + 5, { align: "center" });

    this.addFooter();
  }
}
