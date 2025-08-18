// src/components/relatorios/geradores/RelatorioPrestacao.js
import { BaseRelatorio } from "./BaseRelatorio";
import { createManualTable } from "../../../utils/pdfHelpers";

import BaseRelatorio from "./BaseRelatorio";

export class RelatorioPrestacao extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório de Prestação de Contas");

    let yPosition = 70;
    let pageNum = 1;

    // Identificação
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("IDENTIFICAÇÃO", 20, yPosition);
    yPosition += 10;

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(
      `Município: ${filtros.municipio || this.usuario?.municipio || "Todos"}`,
      20,
      yPosition,
    );
    yPosition += 7;
    this.doc.text(
      `UF: ${filtros.uf || this.usuario?.uf || "Todas"}`,
      20,
      yPosition,
    );
    yPosition += 7;
    this.doc.text(
      `Período: ${filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início"} a ${filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual"}`,
      20,
      yPosition,
    );
    yPosition += 15;

    // Execução Financeira
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("EXECUÇÃO FINANCEIRA", 20, yPosition);
    yPosition += 10;

    // Agrupar despesas por emenda
    const execucaoPorEmenda = {};
    this.emendas.forEach((emenda) => {
      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id,
      );
      if (despesasEmenda.length > 0) {
        execucaoPorEmenda[emenda.id] = {
          emenda,
          despesas: despesasEmenda,
          total: despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0),
        };
      }
    });

    // Gerar detalhamento por emenda
    Object.values(execucaoPorEmenda).forEach(({ emenda, despesas, total }) => {
      // Verificar se precisa nova página
      yPosition = this.checkNewPage(yPosition, 100);
      if (yPosition === 70) {
        this.addHeader("Relatório de Prestação de Contas (continuação)");
        pageNum++;
      }

      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(`Emenda ${emenda.numero} - ${emenda.autor}`, 20, yPosition);
      yPosition += 7;

      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Valor da Emenda: ${this.formatCurrency(emenda.valorTotal)}`,
        20,
        yPosition,
      );
      yPosition += 5;
      this.doc.text(
        `Total Executado: ${this.formatCurrency(total)}`,
        20,
        yPosition,
      );
      yPosition += 8;

      // Tabela de despesas da emenda
      const tabelaDespesas = despesas.map((d) => [
        this.formatDate(d.data),
        d.descricao || "-",
        d.fornecedor || "-",
        d.numeroDocumento || "-",
        this.formatCurrency(d.valor || 0),
      ]);

      // Tentar usar autoTable se disponível, senão usar tabela manual
      try {
        if (this.doc.autoTable) {
          this.doc.autoTable({
            startY: yPosition,
            head: [["Data", "Descrição", "Fornecedor", "Documento", "Valor"]],
            body: tabelaDespesas,
            theme: "plain",
            headStyles: { fillColor: [74, 144, 226], fontSize: 9 },
            styles: { fontSize: 9 },
            columnStyles: {
              4: { halign: "right" },
            },
            margin: { left: 20 },
          });

          yPosition = this.doc.lastAutoTable.finalY + 10;
        } else {
          yPosition =
            createManualTable(
              this.doc,
              ["Data", "Descrição", "Fornecedor", "Documento", "Valor"],
              tabelaDespesas,
              yPosition,
            ) + 10;
        }
      } catch (error) {
        console.warn(
          "Erro ao criar tabela automática, usando tabela manual:",
          error,
        );
        yPosition =
          createManualTable(
            this.doc,
            ["Data", "Descrição", "Fornecedor", "Documento", "Valor"],
            tabelaDespesas,
            yPosition,
          ) + 10;
      }
    });

    // Resumo Final
    yPosition = this.checkNewPage(yPosition, 80);
    if (yPosition === 70) {
      this.addHeader("Relatório de Prestação de Contas (continuação)");
      pageNum++;
    }

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESUMO FINAL", 20, yPosition);
    yPosition += 10;

    const totalGeral = Object.values(execucaoPorEmenda).reduce(
      (sum, item) => sum + item.total,
      0,
    );
    const totalEmendas = this.emendas.reduce(
      (sum, e) => sum + (e.valorTotal || 0),
      0,
    );

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Total de Emendas: ${this.emendas.length}`, 20, yPosition);
    yPosition += 7;
    this.doc.text(
      `Valor Total das Emendas: ${this.formatCurrency(totalEmendas)}`,
      20,
      yPosition,
    );
    yPosition += 7;
    this.doc.text(
      `Total Executado: ${this.formatCurrency(totalGeral)}`,
      20,
      yPosition,
    );
    yPosition += 7;
    this.doc.text(
      `Saldo Remanescente: ${this.formatCurrency(totalEmendas - totalGeral)}`,
      20,
      yPosition,
    );

    // Assinatura
    yPosition = 240;

    // Box de assinatura mais elaborado
    this.doc.setDrawColor(200, 200, 200);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, yPosition, 90, yPosition);
    this.doc.setFontSize(10);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text("Responsável pela Prestação de Contas", 55, yPosition + 5, {
      align: "center",
    });
    this.doc.text("CPF: ____________________", 55, yPosition + 12, {
      align: "center",
    });

    this.doc.line(120, yPosition, 190, yPosition);
    this.doc.text("Gestor Municipal de Saúde", 155, yPosition + 5, {
      align: "center",
    });
    this.doc.text("CPF: ____________________", 155, yPosition + 12, {
      align: "center",
    });

    this.addFooter();
  }
}

export default RelatorioPrestacao;
