
// src/components/relatorios/geradores/RelatorioAnalitico.js
import BaseRelatorio from "./BaseRelatorio";
import { createManualTable } from "../../../utils/pdfHelpers";

export class RelatorioAnalitico extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório Analítico por Parlamentar");

    let yPosition = 70;

    // Período do relatório
    if (filtros.dataInicio || filtros.dataFim) {
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Período: ${filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início"} a ${filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual"}`,
        20,
        yPosition,
      );
      yPosition += 15;
    }

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
        (d) => d.emendaId === emenda.id,
      );
      const executado = despesasEmenda.reduce(
        (sum, d) => sum + (d.valor || 0),
        0,
      );

      porParlamentar[autor].emendas.push({
        ...emenda,
        valorExecutado: executado,
        quantidadeDespesas: despesasEmenda.length,
      });
      porParlamentar[autor].valorTotal += emenda.valorTotal || 0;
      porParlamentar[autor].valorExecutado += executado;
      porParlamentar[autor].quantidadeDespesas += despesasEmenda.length;
    });

    // Ordenar por valor executado
    const parlamentaresOrdenados = Object.entries(porParlamentar).sort(
      ([, a], [, b]) => b.valorExecutado - a.valorExecutado,
    );

    // Gerar análise por parlamentar
    parlamentaresOrdenados.forEach(([parlamentar, dados], index) => {
      yPosition = this.checkNewPage(yPosition, 120);
      if (yPosition === 70) {
        this.addHeader("Relatório Analítico por Parlamentar (continuação)");
        this.pageNum++;
      }

      // Cabeçalho do parlamentar
      this.doc.setFillColor(245, 247, 250);
      this.doc.rect(20, yPosition - 5, this.pageWidth - 40, 25, "F");

      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`${index + 1}º - ${parlamentar}`, 25, yPosition + 5);
      yPosition += 15;

      // Estatísticas do parlamentar
      this.doc.setFontSize(11);
      this.doc.setFont("helvetica", "normal");
      const percentual =
        dados.valorTotal > 0
          ? (dados.valorExecutado / dados.valorTotal) * 100
          : 0;

      // Box de estatísticas
      const statsY = yPosition;
      this.doc.setDrawColor(200, 200, 200);
      this.doc.setLineWidth(0.5);
      this.doc.rect(20, statsY, this.pageWidth - 40, 35, "S");

      this.doc.text(
        `Total de Emendas: ${dados.emendas.length}`,
        25,
        statsY + 8,
      );
      this.doc.text(
        `Valor Total: ${this.formatCurrency(dados.valorTotal)}`,
        25,
        statsY + 16,
      );
      this.doc.text(
        `Valor Executado: ${this.formatCurrency(dados.valorExecutado)}`,
        25,
        statsY + 24,
      );
      this.doc.text(
        `Total de Despesas: ${dados.quantidadeDespesas}`,
        25,
        statsY + 32,
      );

      // Indicador de percentual
      this.doc.setFont("helvetica", "bold");
      const percentualColor =
        percentual >= 80
          ? [39, 174, 96]
          : percentual >= 50
            ? [243, 156, 18]
            : [231, 76, 60];
      this.doc.setTextColor(...percentualColor);
      this.doc.setFontSize(16);
      this.doc.text(
        `${percentual.toFixed(1)}%`,
        this.pageWidth - 50,
        statsY + 20,
      );
      this.doc.setTextColor(0, 0, 0);

      yPosition = statsY + 45;

      // Tabela de emendas do parlamentar
      if (dados.emendas.length > 0) {
        const tabelaEmendas = dados.emendas.map((emenda) => [
          emenda.numero || "-",
          emenda.tipo || "-",
          emenda.municipio || "-",
          this.formatCurrency(emenda.valorTotal || 0),
          this.formatCurrency(emenda.valorExecutado || 0),
          emenda.quantidadeDespesas.toString(),
          `${emenda.valorTotal > 0 ? ((emenda.valorExecutado / emenda.valorTotal) * 100).toFixed(1) : 0}%`,
        ]);

        // Tentar usar autoTable se disponível, senão usar tabela manual
        try {
          if (this.doc.autoTable) {
            this.doc.autoTable({
              startY: yPosition,
              head: [
                [
                  "Nº Emenda",
                  "Tipo",
                  "Município",
                  "Valor Total",
                  "Executado",
                  "Desp.",
                  "%",
                ],
              ],
              body: tabelaEmendas,
              theme: "grid",
              headStyles: {
                fillColor: [39, 174, 96],
                fontSize: 9,
                cellPadding: 3,
              },
              styles: {
                fontSize: 8,
                cellPadding: 2,
              },
              columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 35 },
                2: { cellWidth: 40 },
                3: { halign: "right", cellWidth: 30 },
                4: { halign: "right", cellWidth: 30 },
                5: { halign: "center", cellWidth: 15 },
                6: { halign: "center", cellWidth: 15 },
              },
              margin: { left: 20, right: 20 },
            });

            yPosition = this.doc.lastAutoTable.finalY + 20;
          } else {
            yPosition =
              createManualTable(
                this.doc,
                [
                  "Nº Emenda",
                  "Tipo",
                  "Município",
                  "Valor Total",
                  "Executado",
                  "Desp.",
                  "%",
                ],
                tabelaEmendas,
                yPosition,
              ) + 20;
          }
        } catch (error) {
          console.warn(
            "Erro ao criar tabela automática, usando tabela manual:",
            error,
          );
          yPosition =
            createManualTable(
              this.doc,
              [
                "Nº Emenda",
                "Tipo",
                "Município",
                "Valor Total",
                "Executado",
                "Desp.",
                "%",
              ],
              tabelaEmendas,
              yPosition,
            ) + 20;
        }
      }
    });

    // Resumo Geral
    yPosition = this.checkNewPage(yPosition, 100);
    if (yPosition === 70) {
      this.addHeader("Relatório Analítico por Parlamentar (continuação)");
      this.pageNum++;
    }

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESUMO GERAL", 20, yPosition);
    yPosition += 15;

    // Estatísticas gerais
    const totalGeral = Object.values(porParlamentar).reduce(
      (sum, p) => sum + p.valorTotal,
      0,
    );
    const executadoGeral = Object.values(porParlamentar).reduce(
      (sum, p) => sum + p.valorExecutado,
      0,
    );
    const percentualGeral =
      totalGeral > 0 ? (executadoGeral / totalGeral) * 100 : 0;

    this.doc.setFillColor(245, 247, 250);
    this.doc.rect(20, yPosition, this.pageWidth - 40, 40, "F");

    this.doc.setFontSize(12);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Total de Parlamentares: ${Object.keys(porParlamentar).length}`,
      25,
      yPosition + 10,
    );
    this.doc.text(
      `Total de Emendas: ${this.emendas.length}`,
      25,
      yPosition + 20,
    );
    this.doc.text(
      `Valor Total: ${this.formatCurrency(totalGeral)}`,
      25,
      yPosition + 30,
    );

    this.doc.text(
      `Total Executado: ${this.formatCurrency(executadoGeral)}`,
      this.pageWidth / 2,
      yPosition + 10,
    );
    this.doc.text(
      `Total de Despesas: ${this.despesas.length}`,
      this.pageWidth / 2,
      yPosition + 20,
    );
    this.doc.setFont("helvetica", "bold");
    this.doc.text(
      `Execução Geral: ${percentualGeral.toFixed(1)}%`,
      this.pageWidth / 2,
      yPosition + 30,
    );

    this.addFooter();
  }
}

export default RelatorioAnalitico;
