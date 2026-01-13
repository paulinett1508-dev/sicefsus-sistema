// src/components/relatorios/geradores/BaseRelatorio.js
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  addHeader,
  addFooter,
  formatCurrency,
  formatDate,
  getLogoBase64,
  gerarNomeArquivo,
} from "../../../utils/pdfHelpers";

export class BaseRelatorio {
  constructor(tipoRelatorio, emendasFiltradas, despesasFiltradas, usuario) {
    this.tipoRelatorio = tipoRelatorio;
    this.emendas = emendasFiltradas;
    this.despesas = despesasFiltradas;
    this.usuario = usuario;
    this.doc = new jsPDF();
    this.pageNum = 1;
    this.logoBase64 = null;

    // Configurações da página
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margins = { top: 20, left: 20, right: 20, bottom: 30 };
  }

  async inicializar() {
    this.logoBase64 = await getLogoBase64();
  }

  addHeader(titulo, subtitulo = null) {
    // Extrair informações do usuário para o cabeçalho
    const opcoes = {
      municipio: this.usuario?.municipio,
      uf: this.usuario?.uf,
      usuario: this.usuario?.nome || this.usuario?.email,
    };
    addHeader(this.doc, titulo, this.logoBase64, subtitulo, opcoes);
  }

  addFooter() {
    addFooter(this.doc, this.pageNum, this.usuario);
  }

  checkNewPage(yPosition, minSpace = 40) {
    if (yPosition + minSpace > this.pageHeight - this.margins.bottom) {
      this.doc.addPage();
      this.pageNum++;
      return 70; // Retorna nova posição Y após adicionar página
    }
    return yPosition;
  }

  formatCurrency(value) {
    return formatCurrency(value);
  }

  formatDate(date) {
    return formatDate(date);
  }

  // ========== MÉTODOS UTILITÁRIOS COMUNS ==========

  /**
   * Retorna apenas despesas executadas (status !== "PLANEJADA")
   */
  getDespesasExecutadas() {
    return this.despesas.filter(d => d.status !== "PLANEJADA");
  }

  /**
   * Calcula métricas gerais do relatório
   * @returns {Object} { valorTotal, valorExecutado, saldoDisponivel, percentualGeral, totalEmendas, totalDespesas }
   */
  calcularMetricas() {
    const despesasExecutadas = this.getDespesasExecutadas();
    const valorTotal = this.emendas.reduce((sum, e) => sum + (e.valorTotal || 0), 0);
    const valorExecutado = despesasExecutadas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const saldoDisponivel = valorTotal - valorExecutado;
    const percentualGeral = valorTotal > 0 ? (valorExecutado / valorTotal) * 100 : 0;

    return {
      valorTotal,
      valorExecutado,
      saldoDisponivel,
      percentualGeral,
      totalEmendas: this.emendas.length,
      totalDespesas: despesasExecutadas.length,
    };
  }

  /**
   * Calcula execução por emenda
   * @returns {Array} Lista de emendas com valorTotal, valorExecutado, saldo, percentual
   */
  calcularExecucaoPorEmenda() {
    const despesasExecutadas = this.getDespesasExecutadas();

    return this.emendas.map((emenda) => {
      const valorEmenda = emenda.valorTotal || 0;
      const despesasEmenda = despesasExecutadas.filter((d) => d.emendaId === emenda.id);
      const valorExecutado = despesasEmenda.reduce((sum, d) => sum + (d.valor || 0), 0);
      const saldo = valorEmenda - valorExecutado;
      const percentual = valorEmenda > 0 ? (valorExecutado / valorEmenda) * 100 : 0;

      return {
        ...emenda,
        parlamentar: emenda.autor || emenda.parlamentar || "-",
        valorTotal: valorEmenda,
        valorExecutado,
        saldo,
        percentual,
        despesasCount: despesasEmenda.length,
      };
    });
  }

  /**
   * Agrupa despesas por fornecedor
   * @param {boolean} apenasExecutadas - Se true, considera apenas despesas executadas
   * @returns {Object} { fornecedor: { quantidade, valor } }
   */
  calcularPorFornecedor(apenasExecutadas = true) {
    const despesas = apenasExecutadas ? this.getDespesasExecutadas() : this.despesas;
    const porFornecedor = {};

    despesas.forEach((d) => {
      const fornecedor = d.fornecedor || "Nao informado";
      if (!porFornecedor[fornecedor]) {
        porFornecedor[fornecedor] = { quantidade: 0, valor: 0 };
      }
      porFornecedor[fornecedor].quantidade++;
      porFornecedor[fornecedor].valor += d.valor || 0;
    });

    return porFornecedor;
  }

  /**
   * Obtém lista única de parlamentares
   * @returns {Array} Lista de nomes de parlamentares
   */
  getParlamentares() {
    return [...new Set(this.emendas.map(e => e.autor || e.parlamentar).filter(Boolean))].sort();
  }

  /**
   * Formata subtítulo do período baseado nos filtros
   * @param {Object} filtros
   * @returns {string|null}
   */
  getSubtituloPeriodo(filtros) {
    if (filtros.dataInicio || filtros.dataFim) {
      const inicio = filtros.dataInicio ? this.formatDate(filtros.dataInicio) : "Inicio";
      const fim = filtros.dataFim ? this.formatDate(filtros.dataFim) : "Atual";
      return `Periodo: ${inicio} a ${fim}`;
    }

    // Fallback para mês/ano
    const mes = filtros.mes || new Date().getMonth() + 1;
    const ano = filtros.ano || new Date().getFullYear();
    const nomeMes = new Date(ano, mes - 1).toLocaleDateString("pt-BR", { month: "long" });
    return `${nomeMes} ${ano}`;
  }

  async gerar() {
    await this.inicializar();
    // Método a ser implementado pelas subclasses
    throw new Error("Método gerar() deve ser implementado pela subclasse");
  }

  salvar() {
    const nomeArquivo = gerarNomeArquivo(this.tipoRelatorio.id);
    this.doc.save(nomeArquivo);
    console.log(`Relatório ${nomeArquivo} gerado com sucesso!`);
  }
}
