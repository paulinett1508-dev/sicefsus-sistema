// src/components/relatorios/geradores/RelatorioDespesas.js
// ✅ CORRIGIDO 04/11/2025: Usando campos corretos do Firebase
import { BaseRelatorio } from "./BaseRelatorio";
import { createManualTable } from "../../../utils/pdfHelpers";

export class RelatorioDespesas extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    console.log("📊 Gerando Relatório de Despesas...");
    console.log("Emendas recebidas:", this.emendas.length);
    console.log("Despesas recebidas:", this.despesas.length);

    this.addHeader("Relatório de Despesas Detalhado");

    let yPosition = 70;

    // Resumo
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESUMO DAS DESPESAS", 20, yPosition);
    yPosition += 10;

    const totalDespesas = this.despesas.length;
    const valorTotal = this.despesas.reduce(
      (sum, d) => sum + (parseFloat(d.valor) || 0),
      0,
    );
    const ticketMedio = totalDespesas > 0 ? valorTotal / totalDespesas : 0;

    // Box de resumo
    this.doc.setFillColor(245, 247, 250);
    this.doc.roundedRect(20, yPosition, this.pageWidth - 40, 35, 3, 3, "F");

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Total de Despesas: ${totalDespesas}`, 25, yPosition + 10);
    this.doc.text(
      `Valor Total: ${this.formatCurrency(valorTotal)}`,
      25,
      yPosition + 20,
    );
    this.doc.text(
      `Ticket Médio: ${this.formatCurrency(ticketMedio)}`,
      25,
      yPosition + 30,
    );

    // Análise por período (se houver filtro de data)
    if (filtros.dataInicio || filtros.dataFim) {
      this.doc.text(
        `Período: ${filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Início"} a ${filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual"}`,
        this.pageWidth / 2,
        yPosition + 10,
      );
    }

    yPosition += 45;

    // Filtros aplicados
    const filtrosAtivos = [];
    if (filtros.municipio)
      filtrosAtivos.push(`Município: ${filtros.municipio}`);
    if (filtros.fornecedor)
      filtrosAtivos.push(`Fornecedor: ${filtros.fornecedor}`);
    if (filtros.parlamentar)
      filtrosAtivos.push(`Parlamentar: ${filtros.parlamentar}`);
    if (filtros.emenda) {
      const emenda = this.emendas.find((e) => e.id === filtros.emenda);
      if (emenda) {
        filtrosAtivos.push(`Emenda: ${emenda.numero || emenda.numeroEmenda}`);
      }
    }

    if (filtrosAtivos.length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.text("FILTROS APLICADOS", 20, yPosition);
      yPosition += 8;

      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      filtrosAtivos.forEach((filtro) => {
        this.doc.text(`• ${filtro}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Análise por Fornecedor
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("ANÁLISE POR FORNECEDOR", 20, yPosition);
    yPosition += 10;

    // Agrupar por fornecedor
    const porFornecedor = {};
    this.despesas.forEach((despesa) => {
      const fornecedor = despesa.fornecedor || "Não informado";
      if (!porFornecedor[fornecedor]) {
        porFornecedor[fornecedor] = {
          quantidade: 0,
          valorTotal: 0,
          ultimaCompra: null,
        };
      }

      porFornecedor[fornecedor].quantidade++;
      porFornecedor[fornecedor].valorTotal += parseFloat(despesa.valor) || 0;

      // ✅ CORRIGIDO: Buscar data correta
      const dataCompra = new Date(
        despesa.dataEmpenho || despesa.criadaEm || Date.now(),
      );
      if (
        !porFornecedor[fornecedor].ultimaCompra ||
        dataCompra > porFornecedor[fornecedor].ultimaCompra
      ) {
        porFornecedor[fornecedor].ultimaCompra = dataCompra;
      }
    });

    // Top 10 fornecedores
    const topFornecedores = Object.entries(porFornecedor)
      .sort(([, a], [, b]) => b.valorTotal - a.valorTotal)
      .slice(0, 10);

    const tabelaFornecedores = topFornecedores.map(([nome, dados], index) => [
      `${index + 1}º`,
      nome,
      dados.quantidade.toString(),
      this.formatCurrency(dados.valorTotal),
      this.formatCurrency(dados.valorTotal / dados.quantidade),
      this.formatDate(dados.ultimaCompra),
    ]);

    // Tentar usar autoTable se disponível, senão usar tabela manual
    try {
      if (this.doc.autoTable) {
        this.doc.autoTable({
          startY: yPosition,
          head: [
            [
              "Rank",
              "Fornecedor",
              "Qtd",
              "Valor Total",
              "Ticket Médio",
              "Última Compra",
            ],
          ],
          body: tabelaFornecedores,
          theme: "striped",
          headStyles: {
            fillColor: [243, 156, 18],
            fontSize: 10,
          },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { halign: "center", cellWidth: 15 },
            1: { cellWidth: 60 },
            2: { halign: "center", cellWidth: 15 },
            3: { halign: "right", cellWidth: 35 },
            4: { halign: "right", cellWidth: 30 },
            5: { halign: "center", cellWidth: 30 },
          },
          margin: { left: 20, right: 20 },
        });

        yPosition = this.doc.lastAutoTable.finalY + 20;
      } else {
        yPosition =
          createManualTable(
            this.doc,
            [
              "Rank",
              "Fornecedor",
              "Qtd",
              "Valor Total",
              "Ticket Médio",
              "Última Compra",
            ],
            tabelaFornecedores,
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
            "Rank",
            "Fornecedor",
            "Qtd",
            "Valor Total",
            "Ticket Médio",
            "Última Compra",
          ],
          tabelaFornecedores,
          yPosition,
        ) + 20;
    }

    // Tabela detalhada de despesas
    yPosition = this.checkNewPage(yPosition, 60);
    if (yPosition === 70) {
      this.addHeader("Relatório de Despesas Detalhado (continuação)");
      this.pageNum++;
    }

    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("LISTAGEM DETALHADA DE DESPESAS", 20, yPosition);
    yPosition += 10;

    // ✅ CORRIGIDO: Ordenar por data correta
    const despesasOrdenadas = [...this.despesas].sort((a, b) => {
      const dataA = new Date(a.dataEmpenho || a.criadaEm || 0);
      const dataB = new Date(b.dataEmpenho || b.criadaEm || 0);
      return dataB - dataA;
    });

    // ✅ CORRIGIDO: Mapear com campos corretos
    const tabelaDespesas = despesasOrdenadas.map((despesa) => {
      const emenda = this.emendas.find((e) => e.id === despesa.emendaId);
      const data = despesa.dataEmpenho || despesa.criadaEm;

      return [
        data ? this.formatDate(data) : "-",
        emenda?.numero || emenda?.numeroEmenda || "-",
        (despesa.discriminacao || despesa.descricao || "-").substring(0, 40) +
          ((despesa.discriminacao || despesa.descricao || "").length > 40
            ? "..."
            : ""),
        (despesa.fornecedor || "-").substring(0, 30) +
          ((despesa.fornecedor || "").length > 30 ? "..." : ""),
        despesa.cnpjFornecedor || "-",
        despesa.numeroNota || despesa.numeroEmpenho || "-",
        this.formatCurrency(parseFloat(despesa.valor) || 0),
      ];
    });

    console.log(
      "📋 Tabela de despesas preparada:",
      tabelaDespesas.length,
      "linhas",
    );

    // Adicionar tabela com paginação automática
    try {
      if (this.doc.autoTable) {
        this.doc.autoTable({
          startY: yPosition,
          head: [
            [
              "Data",
              "Emenda",
              "Discriminação",
              "Fornecedor",
              "CNPJ",
              "Documento",
              "Valor",
            ],
          ],
          body: tabelaDespesas,
          theme: "grid",
          headStyles: {
            fillColor: [243, 156, 18],
            fontSize: 9,
            cellPadding: 3,
          },
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 20 },
            2: { cellWidth: 45 },
            3: { cellWidth: 40 },
            4: { cellWidth: 25 },
            5: { cellWidth: 20 },
            6: { halign: "right", cellWidth: 20 },
          },
          margin: { left: 20, right: 20 },
          didDrawPage: (data) => {
            this.addFooter();
            if (data.pageNumber > 1) {
              this.pageNum++;
              this.addHeader("Relatório de Despesas Detalhado (continuação)");
            }
          },
        });

        console.log("✅ Tabela criada com sucesso!");
      } else {
        // Tabela manual simplificada - sem paginação automática
        createManualTable(
          this.doc,
          [
            "Data",
            "Emenda",
            "Discriminação",
            "Fornecedor",
            "CNPJ",
            "Documento",
            "Valor",
          ],
          tabelaDespesas.slice(0, 20), // Limitar para evitar overflow
          yPosition,
        );

        if (tabelaDespesas.length > 20) {
          this.doc.setFontSize(10);
          this.doc.setFont("helvetica", "italic");
          this.doc.text(
            `Mostrando 20 de ${tabelaDespesas.length} despesas. Para ver todas, exporte para Excel.`,
            20,
            this.pageHeight - 40,
          );
        }

        console.log("✅ Tabela manual criada!");
      }
    } catch (error) {
      console.error("❌ Erro ao criar tabela:", error);
      console.warn(
        "Erro ao criar tabela automática, usando tabela manual:",
        error,
      );
      createManualTable(
        this.doc,
        [
          "Data",
          "Emenda",
          "Discriminação",
          "Fornecedor",
          "CNPJ",
          "Documento",
          "Valor",
        ],
        tabelaDespesas.slice(0, 20),
        yPosition,
      );
    }

    // Adicionar rodapé na última página
    this.addFooter();

    console.log("✅ Relatório de Despesas gerado com sucesso!");
  }
}
