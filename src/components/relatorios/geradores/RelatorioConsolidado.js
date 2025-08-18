// src/components/relatorios/geradores/RelatorioConsolidado.js
import BaseRelatorio from "./BaseRelatorio";
import { COLORS } from "../../../utils/relatoriosConstants";
import { createManualTable } from "../../../utils/pdfHelpers";

class RelatorioConsolidado extends BaseRelatorio {
  async gerar(filtros) {
    await this.inicializar();

    this.addHeader("Relatório Consolidado Mensal");

    let yPosition = 70;

    // Período
    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(21, 67, 96);
    this.doc.text(`${nomeMes.toUpperCase()} / ${ano}`, 20, yPosition);
    this.doc.setTextColor(0, 0, 0);
    yPosition += 20;

    // Indicadores Principais
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("INDICADORES PRINCIPAIS", 20, yPosition);
    yPosition += 15;

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
    const percentualGeral =
      valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    // Cards de indicadores
    const cardWidth = 85;
    const cardHeight = 40;
    const cardGap = 10;

    // Card 1 - Total de Emendas
    this.doc.setFillColor(245, 247, 250);
    this.doc.roundedRect(20, yPosition, cardWidth, cardHeight, 3, 3, "F");
    this.doc.setDrawColor(21, 67, 96);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(20, yPosition, cardWidth, cardHeight, 3, 3, "S");

    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(21, 67, 96);
    this.doc.text(totalEmendas.toString(), 62.5, yPosition + 20, {
      align: "center",
    });

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100, 100, 100);
    this.doc.text("EMENDAS ATIVAS", 62.5, yPosition + 32, { align: "center" });

    // Card 2 - Percentual de Execução
    this.doc.setFillColor(245, 247, 250);
    this.doc.roundedRect(
      20 + cardWidth + cardGap,
      yPosition,
      cardWidth,
      cardHeight,
      3,
      3,
      "F",
    );
    this.doc.setDrawColor(39, 174, 96);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(
      20 + cardWidth + cardGap,
      yPosition,
      cardWidth,
      cardHeight,
      3,
      3,
      "S",
    );

    this.doc.setFontSize(24);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(39, 174, 96);
    this.doc.text(
      `${percentualGeral.toFixed(1)}%`,
      62.5 + cardWidth + cardGap,
      yPosition + 20,
      { align: "center" },
    );

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(100, 100, 100);
    this.doc.text("EXECUÇÃO", 62.5 + cardWidth + cardGap, yPosition + 32, {
      align: "center",
    });

    yPosition += cardHeight + 20;
    this.doc.setTextColor(0, 0, 0);

    // Resumo Financeiro
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("RESUMO FINANCEIRO", 20, yPosition);
    yPosition += 12;

    // Box de resumo financeiro
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(20, yPosition, this.pageWidth - 40, 50, "F");

    this.doc.setFontSize(11);
    this.doc.setFont("helvetica", "normal");

    const linhas = [
      {
        label: "Valor Total das Emendas:",
        value: this.formatCurrency(valorTotal),
      },
      {
        label: "Valor Executado no Mês:",
        value: this.formatCurrency(valorExecutado),
      },
      {
        label: "Saldo Disponível:",
        value: this.formatCurrency(saldoDisponivel),
      },
      { label: "Número de Despesas:", value: this.despesas.length.toString() },
      {
        label: "Ticket Médio:",
        value: this.formatCurrency(
          this.despesas.length > 0 ? valorExecutado / this.despesas.length : 0,
        ),
      },
    ];

    let lineY = yPosition + 10;
    linhas.forEach(({ label, value }) => {
      this.doc.text(label, 25, lineY);
      this.doc.text(value, this.pageWidth - 25, lineY, { align: "right" });
      lineY += 8;
    });

    yPosition += 60;

    // Análise por Tipo de Emenda
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("DISTRIBUIÇÃO POR TIPO DE EMENDA", 20, yPosition);
    yPosition += 12;

    // Agrupar por tipo
    const porTipo = {};
    this.emendas.forEach((emenda) => {
      const tipo = emenda.tipo || "Não definido";
      if (!porTipo[tipo]) {
        porTipo[tipo] = {
          quantidade: 0,
          valorTotal: 0,
          valorExecutado: 0,
        };
      }

      porTipo[tipo].quantidade++;
      porTipo[tipo].valorTotal += emenda.valorTotal || 0;

      const despesasEmenda = this.despesas.filter(
        (d) => d.emendaId === emenda.id,
      );
      porTipo[tipo].valorExecutado += despesasEmenda.reduce(
        (sum, d) => sum + (d.valor || 0),
        0,
      );
    });

    const dadosTipo = Object.entries(porTipo).map(([tipo, dados]) => [
      tipo,
      dados.quantidade.toString(),
      this.formatCurrency(dados.valorTotal),
      this.formatCurrency(dados.valorExecutado),
      `${dados.valorTotal > 0 ? ((dados.valorExecutado / dados.valorTotal) * 100).toFixed(1) : 0}%`,
    ]);

    // Tentar usar autoTable se disponível, senão usar tabela manual
    try {
      if (this.doc.autoTable) {
        this.doc.autoTable({
          startY: yPosition,
          head: [["Tipo", "Qtd", "Valor Total", "Executado", "%"]],
          body: dadosTipo,
          theme: "grid",
          headStyles: {
            fillColor: [74, 144, 226],
            fontSize: 10,
          },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { halign: "center", cellWidth: 20 },
            2: { halign: "right", cellWidth: 40 },
            3: { halign: "right", cellWidth: 40 },
            4: { halign: "center", cellWidth: 20 },
          },
          margin: { left: 20, right: 20 },
        });
        yPosition = this.doc.lastAutoTable.finalY + 20;
      } else {
        yPosition =
          createManualTable(
            this.doc,
            ["Tipo", "Qtd", "Valor Total", "Executado", "%"],
            dadosTipo,
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
          ["Tipo", "Qtd", "Valor Total", "Executado", "%"],
          dadosTipo,
          yPosition,
        ) + 20;
    }

    // Top 5 Emendas por Execução
    yPosition = this.checkNewPage(yPosition, 80);
    if (yPosition === 70) {
      this.addHeader("Relatório Consolidado Mensal (continuação)");
      this.pageNum++;
    }

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("TOP 5 EMENDAS POR EXECUÇÃO", 20, yPosition);
    yPosition += 12;

    const emendasComExecucao = this.emendas
      .map((emenda) => {
        const despesasEmenda = this.despesas.filter(
          (d) => d.emendaId === emenda.id,
        );
        const executado = despesasEmenda.reduce(
          (sum, d) => sum + (d.valor || 0),
          0,
        );
        return { ...emenda, executado };
      })
      .sort((a, b) => b.executado - a.executado)
      .slice(0, 5);

    const tabelaTop5 = emendasComExecucao.map((emenda, index) => [
      (index + 1).toString(),
      emenda.numero || "-",
      emenda.autor || "-",
      this.formatCurrency(emenda.valorTotal || 0),
      this.formatCurrency(emenda.executado),
      `${emenda.valorTotal > 0 ? ((emenda.executado / emenda.valorTotal) * 100).toFixed(1) : 0}%`,
    ]);

    // Tentar usar autoTable se disponível, senão usar tabela manual
    try {
      if (this.doc.autoTable) {
        this.doc.autoTable({
          startY: yPosition,
          head: [
            ["#", "Emenda", "Parlamentar", "Valor Total", "Executado", "%"],
          ],
          body: tabelaTop5,
          theme: "striped",
          headStyles: {
            fillColor: [231, 76, 60],
            fontSize: 10,
          },
          styles: { fontSize: 9 },
          columnStyles: {
            0: { halign: "center", cellWidth: 10 },
            1: { cellWidth: 25 },
            2: { cellWidth: 50 },
            3: { halign: "right", cellWidth: 35 },
            4: { halign: "right", cellWidth: 35 },
            5: { halign: "center", cellWidth: 20 },
          },
          margin: { left: 20, right: 20 },
        });
        yPosition = this.doc.lastAutoTable.finalY + 20;
      } else {
        yPosition =
          createManualTable(
            this.doc,
            ["#", "Emenda", "Parlamentar", "Valor Total", "Executado", "%"],
            tabelaTop5,
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
          ["#", "Emenda", "Parlamentar", "Valor Total", "Executado", "%"],
          tabelaTop5,
          yPosition,
        ) + 20;
    }

    // Análise de Tendência
    yPosition = this.checkNewPage(yPosition, 60);
    if (yPosition === 70) {
      this.addHeader("Relatório Consolidado Mensal (continuação)");
      this.pageNum++;
    }

    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text("ANÁLISE DE TENDÊNCIA", 20, yPosition);
    yPosition += 12;

    // Calcular tendência dos últimos 3 meses (simplificado)
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    const tendencia = [];
    for (let i = 2; i >= 0; i--) {
      let mesAnalise = mesAtual - i;
      let anoAnalise = anoAtual;

      if (mesAnalise < 0) {
        mesAnalise += 12;
        anoAnalise--;
      }

      const nomeMesAnalise = new Date(
        anoAnalise,
        mesAnalise,
      ).toLocaleDateString("pt-BR", { month: "short" });

      // Filtrar despesas do mês (simplificado)
      const despesasMes = this.despesas.filter((d) => {
        const data = new Date(d.data);
        return (
          data.getMonth() === mesAnalise && data.getFullYear() === anoAnalise
        );
      });

      const valorMes = despesasMes.reduce((sum, d) => sum + (d.valor || 0), 0);

      tendencia.push({
        mes: nomeMesAnalise,
        valor: valorMes,
        quantidade: despesasMes.length,
      });
    }

    // Box de tendência
    this.doc.setFillColor(245, 247, 250);
    this.doc.rect(20, yPosition, this.pageWidth - 40, 40, "F");

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");

    let xPos = 30;
    tendencia.forEach(({ mes, valor, quantidade }) => {
      this.doc.text(mes.toUpperCase(), xPos, yPosition + 10);
      this.doc.setFont("helvetica", "bold");
      this.doc.text(this.formatCurrency(valor), xPos, yPosition + 20);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(`${quantidade} despesas`, xPos, yPosition + 30);
      xPos += 60;
    });

    // Observações finais
    yPosition += 50;

    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "italic");
    this.doc.setTextColor(100, 100, 100);
    this.doc.text(
      "* Este relatório foi gerado automaticamente pelo sistema SICEFSUS",
      20,
      yPosition,
    );

    this.addFooter();
  }
}

export default RelatorioConsolidado;
