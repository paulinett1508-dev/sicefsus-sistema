// src/components/relatorios/geradores/RelatorioConsolidado.js
import { BaseRelatorio } from "./BaseRelatorio";
import { PDF_COLORS } from "../../../utils/relatoriosConstants";
import {
  addKPICards,
  addSectionTitle,
  getModernTableStyles,
} from "../../../utils/pdfHelpers";

export class RelatorioConsolidado extends BaseRelatorio {
  async gerar(filtros) {
    try {
      await this.inicializar();

      // HEADER com subtítulo do período
      this.addHeader("Relatório Consolidado Mensal", this.getSubtituloPeriodo(filtros));

      let yPosition = 58;

      // Usar métodos utilitários da BaseRelatorio
      const { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas } = this.calcularMetricas();
      const despesasExecutadas = this.getDespesasExecutadas();

      const kpis = [
        { label: "Emendas Ativas", value: totalEmendas.toString() },
        { label: "Valor Total", value: this.formatCurrency(valorTotal) },
        { label: "Executado", value: this.formatCurrency(valorExecutado), trend: `${percentualGeral.toFixed(1)}%` },
        { label: "Saldo", value: this.formatCurrency(saldoDisponivel) },
      ];

      yPosition = addKPICards(this.doc, kpis, yPosition);

      yPosition = addSectionTitle(this.doc, "Resumo Consolidado", yPosition);
      
      this.doc.setFontSize(7);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(...PDF_COLORS.SLATE_500);
      
      const fornecedoresUnicos = new Set(despesasExecutadas.map(d => d.fornecedor)).size;
      const parlamentaresUnicos = this.getParlamentares().length;
      
      const resumoItems = [
        `Emendas Cadastradas: ${totalEmendas}`,
        `Parlamentares com Emendas: ${parlamentaresUnicos}`,
        `Total de Despesas Executadas: ${totalDespesas}`,
        `Fornecedores Distintos: ${fornecedoresUnicos}`,
        `Média de Execução por Emenda: ${this.formatCurrency(totalEmendas > 0 ? valorExecutado / totalEmendas : 0)}`,
      ];
      
      resumoItems.forEach((item, i) => {
        this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
      });
      yPosition += (resumoItems.length * 4) + 6;

      yPosition = addSectionTitle(this.doc, "Distribuição por Tipo de Emenda", yPosition);

      const porTipo = {};
      this.emendas.forEach((emenda) => {
        const tipo = emenda.tipo || "Não definido";
        if (!porTipo[tipo]) {
          porTipo[tipo] = { quantidade: 0, valorTotal: 0, valorExecutado: 0 };
        }

        // Usa valorTotal já normalizado pelo hook
        porTipo[tipo].quantidade++;
        porTipo[tipo].valorTotal += emenda.valorTotal || 0;

        const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
        porTipo[tipo].valorExecutado += despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0);
      });

      const tabelaTipos = Object.entries(porTipo)
        .sort(([, a], [, b]) => b.valorExecutado - a.valorExecutado)
        .map(([tipo, dados]) => [
          tipo,
          dados.quantidade.toString(),
          this.formatCurrency(dados.valorTotal),
          this.formatCurrency(dados.valorExecutado),
          `${dados.valorTotal > 0 ? ((dados.valorExecutado / dados.valorTotal) * 100).toFixed(0) : 0}%`,
        ]);

      if (tabelaTipos.length > 0) {
        try {
          const modernStyles = getModernTableStyles();
          const resultTipos = this.createTable({
            startY: yPosition,
            head: [["Tipo", "Qtd", "Valor Total", "Executado", "%"]],
            body: tabelaTipos,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 'auto', halign: "left" },
              1: { cellWidth: 18, halign: "right" },
              2: { cellWidth: 32, halign: "right" },
              3: { cellWidth: 32, halign: "right" },
              4: { cellWidth: 16, halign: "center" },
            },
          });
          yPosition = resultTipos.finalY + 10;
        } catch (error) {
          this.addWarning(`Erro ao criar tabela de tipos: ${error.message}`);
        }
      }

      yPosition = this.checkNewPage(yPosition, 60);
      yPosition = addSectionTitle(this.doc, "Top 10 Emendas por Execução", yPosition);

      // Usar método utilitário, ordenado por valor executado, top 10
      const emendasComExecucao = this.calcularExecucaoPorEmenda()
        .sort((a, b) => b.valorExecutado - a.valorExecutado)
        .slice(0, 10);

      const tabelaTop10 = emendasComExecucao.map((e, idx) => [
        `${idx + 1}`,
        e.numero || "-",
        e.parlamentar || "-",
        this.formatCurrency(e.valorTotal),
        this.formatCurrency(e.valorExecutado),
        `${e.percentual.toFixed(0)}%`,
      ]);

      if (tabelaTop10.length > 0) {
        try {
          const modernStyles = getModernTableStyles();
          const resultTop10 = this.createTable({
            startY: yPosition,
            head: [["#", "Emenda", "Parlamentar", "Total", "Executado", "%"]],
            body: tabelaTop10,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 14, halign: "center" },
              1: { cellWidth: 22, halign: "left" },
              2: { cellWidth: 'auto', halign: "left" },
              3: { cellWidth: 28, halign: "right" },
              4: { cellWidth: 28, halign: "right" },
              5: { cellWidth: 14, halign: "center" },
            },
          });
          yPosition = resultTop10.finalY + 10;
        } catch (error) {
          this.addWarning(`Erro ao criar tabela Top 10: ${error.message}`);
        }
      }

      yPosition = this.checkNewPage(yPosition, 50);
      yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

      // Usar método utilitário para agregação por fornecedor
      const porFornecedor = this.calcularPorFornecedor(true);

      const tabelaFornecedores = Object.entries(porFornecedor)
        .sort(([, a], [, b]) => b.valor - a.valor)
        .slice(0, 5)
        .map(([fornecedor, dados], idx) => [
          `${idx + 1}`,
          fornecedor.length > 40 ? fornecedor.substring(0, 37) + "..." : fornecedor,
          dados.quantidade.toString(),
          this.formatCurrency(dados.valor),
        ]);

      if (tabelaFornecedores.length > 0) {
        try {
          const modernStyles = getModernTableStyles();
          const resultFornecedores = this.createTable({
            startY: yPosition,
            head: [["#", "Fornecedor", "Qtd", "Valor Total"]],
            body: tabelaFornecedores,
            ...modernStyles,
            columnStyles: {
              0: { cellWidth: 14, halign: "center" },
              1: { cellWidth: 'auto', halign: "left" },
              2: { cellWidth: 20, halign: "right" },
              3: { cellWidth: 32, halign: "right" },
            },
          });
          yPosition = resultFornecedores.finalY + 10;
        } catch (error) {
          this.addWarning(`Erro ao criar tabela de fornecedores: ${error.message}`);
        }
      }

      this.doc.setTextColor(...PDF_COLORS.SLATE_400);
      this.doc.setFontSize(6);
      this.doc.setFont("helvetica", "italic");
      this.doc.text("* Valores consolidados. Relatório gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

      this.addFooter();
    } catch (error) {
      this.addWarning(`Erro ao gerar relatório consolidado: ${error.message}`);
    }
  }
}
