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
    await this.inicializar();

    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });

    this.addHeader("Relatorio Consolidado", `${nomeMes} ${ano}`);

    let yPosition = 58;

    const despesasExecutadas = this.despesas.filter(d => d.status !== "PLANEJADA");
    const totalEmendas = this.emendas.length;
    const totalDespesas = despesasExecutadas.length;
    
    const valorTotal = this.emendas.reduce((sum, e) => {
      const valor = parseFloat(e.valor || e.valorRecurso || e.valorTotal || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const valorExecutado = despesasExecutadas.reduce((sum, d) => {
      const valor = parseFloat(d.valor || 0);
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);
    
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

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
    const parlamentaresUnicos = new Set(this.emendas.map(e => e.autor)).size;
    
    const resumoItems = [
      `Emendas Cadastradas: ${totalEmendas}`,
      `Parlamentares com Emendas: ${parlamentaresUnicos}`,
      `Total de Despesas Executadas: ${totalDespesas}`,
      `Fornecedores Distintos: ${fornecedoresUnicos}`,
      `Media de Execucao por Emenda: ${this.formatCurrency(totalEmendas > 0 ? valorExecutado / totalEmendas : 0)}`,
    ];
    
    resumoItems.forEach((item, i) => {
      this.doc.text(`- ${item}`, 15, yPosition + (i * 4));
    });
    yPosition += (resumoItems.length * 4) + 6;

    yPosition = addSectionTitle(this.doc, "Distribuicao por Tipo de Emenda", yPosition);

    const porTipo = {};
    this.emendas.forEach((emenda) => {
      const tipo = emenda.tipo || "Nao definido";
      if (!porTipo[tipo]) {
        porTipo[tipo] = { quantidade: 0, valorTotal: 0, valorExecutado: 0 };
      }

      const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
      porTipo[tipo].quantidade++;
      porTipo[tipo].valorTotal += isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda;

      const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
      porTipo[tipo].valorExecutado += despesasEmenda.reduce((sum, d) => {
        const valor = parseFloat(d.valor || 0);
        return sum + (isNaN(valor) ? 0 : valor);
      }, 0);
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
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    yPosition = this.checkNewPage(yPosition, 60);
    yPosition = addSectionTitle(this.doc, "Top 10 Emendas por Execucao", yPosition);

    const emendasComExecucao = this.emendas
      .map((emenda) => {
        const valorTotalEmenda = parseFloat(emenda.valor || emenda.valorRecurso || emenda.valorTotal || 0);
        const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
        const executado = despesasEmenda.reduce((sum, d) => {
          const valor = parseFloat(d.valor || 0);
          return sum + (isNaN(valor) ? 0 : valor);
        }, 0);
        return { ...emenda, valorTotal: isNaN(valorTotalEmenda) ? 0 : valorTotalEmenda, executado };
      })
      .sort((a, b) => b.executado - a.executado)
      .slice(0, 10);

    const tabelaTop10 = emendasComExecucao.map((emenda, idx) => [
      `${idx + 1}`,
      emenda.numero || "-",
      emenda.autor || "-",
      this.formatCurrency(emenda.valorTotal),
      this.formatCurrency(emenda.executado),
      `${emenda.valorTotal > 0 ? ((emenda.executado / emenda.valorTotal) * 100).toFixed(0) : 0}%`,
    ]);

    if (tabelaTop10.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    yPosition = this.checkNewPage(yPosition, 50);
    yPosition = addSectionTitle(this.doc, "Top 5 Fornecedores", yPosition);

    const porFornecedor = {};
    despesasExecutadas.forEach((d) => {
      const fornecedor = d.fornecedor || "Nao informado";
      if (!porFornecedor[fornecedor]) {
        porFornecedor[fornecedor] = { quantidade: 0, valorTotal: 0 };
      }
      porFornecedor[fornecedor].quantidade++;
      const valor = parseFloat(d.valor || 0);
      porFornecedor[fornecedor].valorTotal += isNaN(valor) ? 0 : valor;
    });

    const tabelaFornecedores = Object.entries(porFornecedor)
      .sort(([, a], [, b]) => b.valorTotal - a.valorTotal)
      .slice(0, 5)
      .map(([fornecedor, dados], idx) => [
        `${idx + 1}`,
        fornecedor.length > 40 ? fornecedor.substring(0, 37) + "..." : fornecedor,
        dados.quantidade.toString(),
        this.formatCurrency(dados.valorTotal),
      ]);

    if (tabelaFornecedores.length > 0) {
      try {
        if (this.doc.autoTable) {
          const modernStyles = getModernTableStyles();
          this.doc.autoTable({
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
          yPosition = this.doc.lastAutoTable.finalY + 10;
        }
      } catch (error) {
        console.warn("Erro ao criar tabela:", error);
      }
    }

    this.doc.setTextColor(...PDF_COLORS.SLATE_400);
    this.doc.setFontSize(6);
    this.doc.setFont("helvetica", "italic");
    this.doc.text("* Valores consolidados. Relatorio gerado automaticamente pelo SICEFSUS.", 15, this.pageHeight - 25);

    this.addFooter();
  }
}
