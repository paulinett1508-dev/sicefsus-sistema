
// src/components/relatorios/geradores/BaseRelatorio.js
import { formatarMoeda, formatarData } from "../../../utils/formatters";

class BaseRelatorio {
  constructor() {
    this.doc = null;
    this.emendas = [];
    this.despesas = [];
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.pageNum = 1;
  }

  async inicializar() {
    // Importar jsPDF dinamicamente
    const { jsPDF } = await import('jspdf');
    this.doc = new jsPDF();
  }

  addHeader(titulo) {
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(titulo, 20, 20);
    
    // Data de geração
    this.doc.setFontSize(10);
    this.doc.setFont("helvetica", "normal");
    this.doc.text(`Gerado em: ${this.formatDate(new Date())}`, 20, 30);
  }

  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth - 30,
        this.pageHeight - 10
      );
      this.doc.text(
        "SICEFSUS - Sistema de Controle de Execuções Financeiras do SUS",
        20,
        this.pageHeight - 10
      );
    }
  }

  checkNewPage(currentY, requiredSpace) {
    if (currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      return 70; // Nova posição Y após header
    }
    return currentY;
  }

  formatCurrency(value) {
    return formatarMoeda(value);
  }

  formatDate(date) {
    return formatarData(date);
  }

  async gerar(filtros) {
    throw new Error("Método gerar deve ser implementado pela classe filha");
  }

  save(filename) {
    if (!this.doc) {
      throw new Error("Documento não inicializado");
    }
    this.doc.save(filename);
  }
}

export default BaseRelatorio;
