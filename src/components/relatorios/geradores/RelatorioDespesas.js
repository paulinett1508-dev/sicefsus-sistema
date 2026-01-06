// src/components/relatorios/geradores/RelatorioDespesas.js
// Design Moderno - Clean, Compacto, Elegante
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  addMiniTable,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioDespesas extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    // Filtrar apenas despesas executadas
    const despesasExecutadas = this.despesas.filter(d => d.status !== "PLANEJADA");

    // Calcular métricas
    const totalDespesas = despesasExecutadas.length;
    const valorTotal = despesasExecutadas.reduce((sum, d) => {
      const valor = parseFloat(d.valor || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    const ticketMedio = totalDespesas > 0 ? valorTotal / totalDespesas : 0;

    // Período para subtítulo
    let subtitulo = null;
    if (filtros.dataInicio || filtros.dataFim) {
      const inicio = filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início";
      const fim = filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual";
      subtitulo = `Período: ${inicio} a ${fim}`;
    }

    // HEADER MODERNO
    this.addHeader("Relatório de Despesas", subtitulo);

    let yPosition = 55;

    // KPI CARDS (valores completos, sem abreviação)
    const kpis = [
      {
        label: "Despesas Executadas",
        value: totalDespesas.toString(),
      },
      {
        label: "Valor Total",
        value: this.formatCurrency(valorTotal),
      },
      {
        label: "Ticket Médio",
        value: this.formatCurrency(ticketMedio),
      },
      {
        label: "Fornecedores",
        value: new Set(despesasExecutadas.map(d => d.fornecedor)).size.toString(),
      },
    ];

    yPosition = addKPICards(this.doc, kpis, yPosition);

    // FILTROS APLICADOS (se houver)
    const filtrosAtivos = [];
    if (filtros.municipio) filtrosAtivos.push(filtros.municipio);
    if (filtros.fornecedor) filtrosAtivos.push(filtros.fornecedor);
    if (filtros.parlamentar) filtrosAtivos.push(filtros.parlamentar);

    if (filtrosAtivos.length > 0) {
      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.setFontSize(8);
      this.doc.text(`Filtros: ${filtrosAtivos.join(" • ")}`, 15, yPosition);
      yPosition += 8;
    }

    // TOP FORNECEDORES
    yPosition = addSectionTitle(this.doc, "Top 10 Fornecedores", yPosition);

    // Agrupar por fornecedor
    const porFornecedor = {};
    despesasExecutadas.forEach((despesa) => {
      const fornecedor = despesa.fornecedor || "Não informado";
      if (!porFornecedor[fornecedor]) {
        porFornecedor[fornecedor] = { quantidade: 0, valorTotal: 0 };
      }
      porFornecedor[fornecedor].quantidade++;
      const valor = parseFloat(despesa.valor || 0);
      porFornecedor[fornecedor].valorTotal += isNaN(valor) ? 0 : valor;
    });

    const topFornecedores = Object.entries(porFornecedor)
      .sort(([, a], [, b]) => b.valorTotal - a.valorTotal)
      .slice(0, 10)
      .map(([nome, dados]) => ({
        label: nome,
        value: this.formatCurrency(dados.valorTotal),
      }));

    if (topFornecedores.length > 0) {
      yPosition = addMiniTable(this.doc, topFornecedores, yPosition);
    }

    // TABELA DETALHADA
    yPosition = this.checkNewPage(yPosition, 60);
    if (yPosition < 30) {
      this.doc.addPage();
      this.pageNum++;
      yPosition = 20;
    }

    yPosition = addSectionTitle(this.doc, "Listagem Detalhada", yPosition);

    // Ordenar por data
    const despesasOrdenadas = [...despesasExecutadas].sort((a, b) => {
      const dataA = new Date(a.dataEmpenho || a.criadaEm || 0);
      const dataB = new Date(b.dataEmpenho || b.criadaEm || 0);
      return dataB - dataA;
    });

    // Preparar dados da tabela
    const tabelaDespesas = despesasOrdenadas.map((despesa) => {
      const emenda = this.emendas.find((e) => e.id === despesa.emendaId);
      const data = despesa.dataEmpenho || despesa.criadaEm;
      const discriminacao = despesa.discriminacao || despesa.descricao || "-";
      const fornecedor = despesa.fornecedor || "-";

      return [
        data ? this.formatDate(data) : "-",
        emenda?.numero || emenda?.numeroEmenda || "-",
        discriminacao.length > 40 ? discriminacao.substring(0, 37) + "..." : discriminacao,
        fornecedor.length > 30 ? fornecedor.substring(0, 27) + "..." : fornecedor,
        this.formatCurrency(parseFloat(despesa.valor) || 0),
      ];
    });

    // Usar autoTable com estilos modernos
    try {
      if (this.doc.autoTable) {
        const modernStyles = getModernTableStyles();

        this.doc.autoTable({
          startY: yPosition,
          head: [["Data", "Emenda", "Discriminação", "Fornecedor", "Valor"]],
          body: tabelaDespesas,
          ...modernStyles,
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 22 },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { halign: "right", cellWidth: 28, fontStyle: 'bold' },
          },
          didDrawPage: (data) => {
            if (data.pageNumber > 1) {
              // Header compacto para continuação
              this.doc.setFillColor(...PDF_COLORS.ACCENT);
              this.doc.rect(0, 0, this.pageWidth, 1.5, "F");
              this.doc.setTextColor(...PDF_COLORS.SLATE_700);
              this.doc.setFontSize(9);
              this.doc.setFont("helvetica", "bold");
              this.doc.text("Relatório de Despesas", 15, 10);
              this.doc.setTextColor(...PDF_COLORS.SLATE_400);
              this.doc.setFontSize(8);
              this.doc.text("(continuação)", 60, 10);
            }
            this.addFooter();
          },
        });
      }
    } catch (error) {
      console.warn("Erro ao criar tabela:", error);
    }

    // Rodapé
    this.addFooter();
  }
}
