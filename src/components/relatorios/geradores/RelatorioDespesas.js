// src/components/relatorios/geradores/RelatorioDespesas.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";
import { DESPESA_STATUS } from "../../../config/constants";

export class RelatorioDespesas extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório de Despesas Detalhadas", this.getSubtituloPeriodo(filtros));
    let yPosition = 58;

    // Filtros aplicados
    yPosition = this.addFiltrosAplicados(filtros, yPosition);

    // KPIs
    const despesasExecutadas = this.getDespesasExecutadas();
    const despesasPlanejadas = this.despesas.filter(d => d.status === DESPESA_STATUS.PLANEJADA);
    const totalDespesas = this.despesas.length;
    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const valorPlanejado = despesasPlanejadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const fornecedoresUnicos = new Set(this.despesas.map(d => d.fornecedor).filter(Boolean)).size;

    yPosition = addKPICards(this.doc, [
      { label: "Total Despesas", value: totalDespesas.toString() },
      { label: "Valor Executado", value: this.formatCurrency(valorExecutado) },
      { label: "Planejado", value: this.formatCurrency(valorPlanejado) },
      { label: "Fornecedores", value: fornecedoresUnicos.toString() },
    ], yPosition);

    // Resumo
    yPosition = addSectionTitle(this.doc, "Resumo das Despesas", yPosition);
    this.doc.setFontSize(7);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...PDF_COLORS.SLATE_500);

    const mediaValor = totalDespesas > 0 ? (valorExecutado + valorPlanejado) / totalDespesas : 0;
    const maiorDespesa = this.despesas.reduce((max, d) => Math.max(max, d.valor || 0), 0);

    [
      `Despesas Executadas: ${despesasExecutadas.length}`,
      `Despesas Planejadas: ${despesasPlanejadas.length}`,
      `Valor Médio por Despesa: ${this.formatCurrency(mediaValor)}`,
      `Maior Despesa: ${this.formatCurrency(isNaN(maiorDespesa) ? 0 : maiorDespesa)}`,
      `Fornecedores Distintos: ${fornecedoresUnicos}`,
    ].forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += 26;

    // Tabela por status
    yPosition = this.addTabelaStatus(yPosition);

    // Listagem: agrupada por parlamentar ou única
    if (filtros.parlamentar || filtros.emenda) {
      yPosition = this.addListagemUnica(yPosition);
    } else {
      yPosition = this.addListagemPorParlamentar(yPosition);
    }

    // Top 5 Fornecedores
    yPosition = this.addTopFornecedores(yPosition);

    // Assinaturas + rodapé
    this.addBlocoAssinaturas(yPosition);
    this.addFooterTodasPaginas();
  }

  addTabelaStatus(yPosition) {
    yPosition = addSectionTitle(this.doc, "Despesas por Status", yPosition);
    const porStatus = {};
    const totalDespesas = this.despesas.length;

    this.despesas.forEach((d) => {
      const status = d.status || "Não definido";
      if (!porStatus[status]) porStatus[status] = { quantidade: 0, valor: 0 };
      porStatus[status].quantidade++;
      porStatus[status].valor += d.valor || 0;
    });

    const tabelaStatus = Object.entries(porStatus)
      .sort(([, a], [, b]) => b.valor - a.valor)
      .map(([status, dados]) => [
        status, dados.quantidade.toString(), this.formatCurrency(dados.valor),
        `${totalDespesas > 0 ? ((dados.quantidade / totalDespesas) * 100).toFixed(0) : 0}%`,
      ]);

    if (tabelaStatus.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["Status", "Quantidade", "Valor Total", "% do Total"]],
          body: tabelaStatus,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 'auto', halign: "left" },
            1: { cellWidth: 24, halign: "right" },
            2: { cellWidth: 35, halign: "right" },
            3: { cellWidth: 24, halign: "center" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de status: ${error.message}`);
      }
    }
    return yPosition;
  }

  addListagemUnica(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Listagem Detalhada", yPosition);
    yPosition = this.renderDespesasAgrupadasPorNatureza(this.despesas, yPosition);
    return yPosition;
  }

  addListagemPorParlamentar(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Despesas Detalhadas por Parlamentar", yPosition);

    const parlamentares = this.agruparPorParlamentar();

    for (const parlamentar of parlamentares) {
      if (parlamentar.despesas.length === 0) continue;

      yPosition = this.checkNewPage(yPosition, 40);
      yPosition = this.addParlamentarHeader(parlamentar, yPosition);
      yPosition = this.renderDespesasAgrupadasPorNatureza(parlamentar.despesas, yPosition);
    }
    return yPosition;
  }

  renderDespesasAgrupadasPorNatureza(despesas, yPosition) {
    const grupos = this.agruparPorNatureza(despesas);

    for (const [natureza, despesasGrupo] of grupos) {
      yPosition = this.checkNewPage(yPosition, 30);
      yPosition = this.renderNaturezaHeader(natureza, despesasGrupo, yPosition);

      const tabelaDespesas = this.buildTabelaDespesasDetalhadas(despesasGrupo);
      if (tabelaDespesas.length > 0) {
        yPosition = this.renderTabelaDespesasDetalhadas(tabelaDespesas, yPosition);
      }
    }
    return yPosition;
  }

  buildTabelaDespesasDetalhadas(despesas) {
    return [...despesas]
      .sort((a, b) => (b.valor || 0) - (a.valor || 0))
      .map((d) => {
        const emenda = this.emendas.find(e => e.id === d.emendaId);
        const dataRaw = d.dataPagamento || d.dataLiquidacao || d.dataEmpenho;
        const fornecedorCell = this.formatFornecedorComCnpj(d);
        return [
          this.formatarData(dataRaw),
          d.discriminacao || d.descricao || "-",
          fornecedorCell,
          emenda?.numero || "-",
          this.formatCurrency(d.valor || 0),
          d.status || "-",
        ];
      });
  }

  renderTabelaDespesasDetalhadas(tabelaDespesas, yPosition) {
    try {
      this.createTable({
        startY: yPosition,
        head: [["Data", "Descrição", "Fornecedor", "Emenda", "Valor", "Status"]],
        body: tabelaDespesas,
        ...getModernTableStyles(),
        columnStyles: {
          0: { cellWidth: 20, halign: "center" },
          1: { cellWidth: 'auto', halign: "left" },
          2: { cellWidth: 40, halign: "left" },
          3: { cellWidth: 22, halign: "left" },
          4: { cellWidth: 28, halign: "right" },
          5: { cellWidth: 22, halign: "center" },
        },
      });
      yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
    } catch (error) {
      this.addWarning(`Erro ao criar tabela de despesas: ${error.message}`);
    }
    return yPosition;
  }

  addTopFornecedores(yPosition) {
    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

    const tabelaFornecedores = Object.entries(this.calcularPorFornecedor(true))
      .sort(([, a], [, b]) => b.valor - a.valor)
      .slice(0, 5)
      .map(([fornecedor, dados], idx) => [
        `${idx + 1}`, fornecedor, dados.quantidade.toString(), this.formatCurrency(dados.valor),
      ]);

    if (tabelaFornecedores.length > 0) {
      try {
        this.createTable({
          startY: yPosition,
          head: [["#", "Fornecedor", "Despesas", "Valor Total"]],
          body: tabelaFornecedores,
          ...getModernTableStyles(),
          columnStyles: {
            0: { cellWidth: 14, halign: "center" },
            1: { cellWidth: 'auto', halign: "left" },
            2: { cellWidth: 20, halign: "right" },
            3: { cellWidth: 35, halign: "right" },
          },
        });
        yPosition = (this.doc.lastAutoTable?.finalY ?? yPosition) + 10;
      } catch (error) {
        this.addWarning(`Erro ao criar tabela de fornecedores: ${error.message}`);
      }
    }
    return yPosition;
  }
}
