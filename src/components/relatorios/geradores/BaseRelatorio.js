// src/components/relatorios/geradores/BaseRelatorio.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    addHeader(this.doc, titulo, this.logoBase64, subtitulo);
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
