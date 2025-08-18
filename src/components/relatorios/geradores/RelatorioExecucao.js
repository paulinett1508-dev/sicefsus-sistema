// src/components/relatorios/geradores/RelatorioExecucao.js
import BaseRelatorio from "./BaseRelatorio";
import { createManualTable } from "../../../utils/pdfHelpers";

class RelatorioExecucao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório de Execução Orçamentária");

    let yPosition = 70;
    const lineHeight = 7;

    // Resumo Executivo
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESUMO EXECUTIVO", 20, yPosition);
    yPosition += 10;

    const totalEmendas = this.emendas.length;
    const valorTotal = this.emendas.reduce(
      (sum, e) => sum + (e.valorTotal || 0),
      0,
    );
    const valorExecutado = this.despesas.reduce(
      (sum, d) => sum + (d.valor || 0),
      0,
    );
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualExecutado =
      valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Total de Emendas: ${totalEmendas}`, 20, yPosition);
    yPosition += lineHeight;
    this.doc.text(
      `Valor Total: ${this.formatCurrency(valorTotal)}`,
      20,
      yPosition,
    );
    yPosition += lineHeight;
    this.doc.text(
      `Valor Executado: ${this.formatCurrency(valorExecutado)}`,
      20,
      yPosition,
    );
    yPosition += lineHeight;
    this.doc.text(
      `Saldo Disponível: ${this.formatCurrency(saldoDisponivel)}`,
      20,
      yPosition,
    );
    yPosition += lineHeight;
    this.doc.text(
      `Percentual Executado: ${percentualExecutado.toFixed(2)}%`,
      20,
      yPosition,
    );
    yPosition += 15;

    // Período do relatório
    if (filtros.dataInicio || filtros.dataFim) {
      this.doc.text(
        `Período: ${filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início"} a ${filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual"}`,
        20,
        yPosition,
      );
      yPosition += 15;
    }

    // Tabela de Emendas
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DETALHAMENTO POR EMENDA", 20, yPosition);
    yPosition += 10;

    // Preparar dados para a tabela
    const headers = [
      "Nº Emenda",
      "Parlamentar",
      "Valor Total",
      "Executado",
      "Saldo",
      "% Exec.",
    ];
    const tabelaEmendas = this.emendas.map((emenda) => {
      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id,
      );
      const valorExecutadoEmenda = despesasEmenda.reduce(
        (sum, d) => sum + (d.valor || 0),
        0,
      );
      const saldoEmenda = (emenda.valorTotal || 0) - valorExecutadoEmenda;
      const percentualEmenda =
        emenda.valorTotal > 0
          ? (valorExecutadoEmenda / emenda.valorTotal) * 100
          : 0;

      return [
        emenda.numero || "-",
        emenda.autor || "-",
        this.formatCurrency(emenda.valorTotal || 0),
        this.formatCurrency(valorExecutadoEmenda),
        this.formatCurrency(saldoEmenda),
        `${percentualEmenda.toFixed(1)}%`,
      ];
    });

    // Tentar usar autoTable se disponível, senão usar tabela manual
    try {
      if (this.doc.autoTable) {
        this.doc.autoTable({
          startY: yPosition,
          head: [headers],
          body: tabelaEmendas,
          theme: "striped",
          headStyles: { fillColor: [21, 67, 96] },
          styles: { fontSize: 10 },
          columnStyles: {
            2: { halign: "right" },
            3: { halign: "right" },
            4: { halign: "right" },
            5: { halign: "center" },
          },
          didDrawPage: (data) => {
            this.addFooter();
            if (data.pageNumber > 1) {
              this.pageNum++;
              this.addHeader(
                "Relatório de Execução Orçamentária (continuação)",
              );
            }
          },
        });
      } else {
        // Usar tabela manual se autoTable não estiver disponível
        createManualTable(this.doc, headers, tabelaEmendas, yPosition);
      }
    } catch (error) {
      console.warn(
        "Erro ao criar tabela automática, usando tabela manual:",
        error,
      );
      createManualTable(this.doc, headers, tabelaEmendas, yPosition);
    }

    this.addFooter();
  }
}

export default RelatorioExecucao;
