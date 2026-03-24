// src/utils/pdfHelpers.js
// Design System Moderno para PDFs - Clean, Compacto, Elegante
import logoSicefsus from "../images/logo-sicefsus-ver-modoclaro.png";
import { PDF_COLORS } from "./relatoriosConstants";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
};

// Cache do logo em base64 para evitar reconversões
let logoCache = null;

// Converter logo para base64 (com cache)
export const getLogoBase64 = async () => {
  // Retornar do cache se disponível
  if (logoCache) return logoCache;

  try {
    const img = new Image();
    img.src = logoSicefsus;

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        logoCache = canvas.toDataURL("image/png"); // Salvar no cache
        resolve(logoCache);
      };
      img.onerror = () => resolve(null);
    });
  } catch (error) {
    console.warn("Erro ao carregar logo:", error);
    return null;
  }
};

// Adicionar cabeçalho moderno aos PDFs - Design Clean
export const addHeader = (doc, titulo, logoBase64, subtitulo = null, opcoes = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = { left: 15, right: 15 };
  const { municipio, uf, usuario } = opcoes;

  // Fundo branco (clean)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 55, "F");

  // Linha accent no topo (fina e elegante)
  doc.setFillColor(...PDF_COLORS.ACCENT);
  doc.rect(0, 0, pageWidth, 2, "F");

  // Logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margins.left, 8, 25, 20);
    } catch (e) {
      console.warn("Erro ao adicionar logo:", e);
    }
  }

  // Nome do sistema
  const textX = logoBase64 ? 45 : margins.left;
  doc.setTextColor(...PDF_COLORS.SLATE_900);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SICEFSUS", textX, 15);

  doc.setTextColor(...PDF_COLORS.SLATE_500);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Controle de Execuções Financeiras do SUS", textX, 21);

  // Data e hora de geração (direita, superior)
  doc.setTextColor(...PDF_COLORS.SLATE_400);
  doc.setFontSize(8);
  const dataHoraGeracao = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(`Gerado em: ${dataHoraGeracao}`, pageWidth - margins.right, 12, { align: "right" });

  // Município/UF (direita, abaixo da data)
  if (municipio || uf) {
    doc.setTextColor(...PDF_COLORS.SLATE_500);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const localidade = [municipio, uf].filter(Boolean).join(" - ");
    doc.text(localidade, pageWidth - margins.right, 20, { align: "right" });
  }

  // Usuário (direita, abaixo do município)
  if (usuario) {
    doc.setTextColor(...PDF_COLORS.SLATE_400);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Por: ${usuario}`, pageWidth - margins.right, 26, { align: "right" });
  }

  // Título do relatório
  doc.setTextColor(...PDF_COLORS.SLATE_900);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titulo.toUpperCase(), margins.left, 38);

  // Linha decorativa abaixo do título
  doc.setDrawColor(...PDF_COLORS.SLATE_200);
  doc.setLineWidth(0.5);
  doc.line(margins.left, 42, margins.left + 60, 42);

  // Subtítulo (período, filtros)
  if (subtitulo) {
    doc.setTextColor(...PDF_COLORS.SLATE_500);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(subtitulo, margins.left, 48);
  }
};

// Header para continuação de páginas
export const addHeaderContinuacao = (doc, titulo) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = { left: 15, right: 15 };

  // Linha accent no topo
  doc.setFillColor(...PDF_COLORS.ACCENT);
  doc.rect(0, 0, pageWidth, 1.5, "F");

  // Título compacto
  doc.setTextColor(...PDF_COLORS.SLATE_700);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, margins.left, 12);

  // Indicador de continuação
  doc.setTextColor(...PDF_COLORS.SLATE_400);
  doc.setFontSize(8);
  doc.text("(continuação)", margins.left + doc.getTextWidth(titulo) + 3, 12);
};

// Adicionar rodapé moderno aos PDFs
export const addFooter = (doc, pageNum, usuario, totalPages = null) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margins = { left: 15, right: 15 };

  // Linha separadora fina
  doc.setDrawColor(...PDF_COLORS.SLATE_200);
  doc.setLineWidth(0.3);
  doc.line(margins.left, pageHeight - 15, pageWidth - margins.right, pageHeight - 15);

  doc.setFontSize(8);
  doc.setTextColor(...PDF_COLORS.SLATE_400);

  // Data e hora de geração
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(`Gerado: ${dataHora}`, margins.left, pageHeight - 8);

  // Número da página
  const pageText = totalPages ? `${pageNum} / ${totalPages}` : `${pageNum}`;
  doc.text(pageText, pageWidth - margins.right, pageHeight - 8, { align: "right" });

  // Usuário (centro)
  if (usuario?.nome || usuario?.email) {
    doc.text(usuario.nome || usuario.email, pageWidth / 2, pageHeight - 8, { align: "center" });
  }
};

// Gerar nome do arquivo
export const gerarNomeArquivo = (tipoRelatorio) => {
  const data = new Date().toISOString().split("T")[0];
  return `SICEFSUS_${tipoRelatorio}_${data}.pdf`;
};

// ==========================================
// KPI CARDS - Design Moderno
// ==========================================

/**
 * Adiciona cards de KPIs ao PDF
 * @param {jsPDF} doc - Documento PDF
 * @param {Array} kpis - Array de objetos { label, value, sublabel?, trend? }
 * @param {number} startY - Posição Y inicial
 * @returns {number} Nova posição Y após os cards
 */
export const addKPICards = (doc, kpis, startY) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = { left: 15, right: 15 };
  const availableWidth = pageWidth - margins.left - margins.right;

  const cardCount = Math.min(kpis.length, 4);
  const cardGap = 6;
  const cardWidth = (availableWidth - (cardGap * (cardCount - 1))) / cardCount;
  const cardHeight = 24; // Menor e mais elegante

  kpis.slice(0, 4).forEach((kpi, index) => {
    const x = margins.left + (index * (cardWidth + cardGap));
    const y = startY;

    // Card background
    doc.setFillColor(...PDF_COLORS.SLATE_50);
    doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "F");

    // Borda fina
    doc.setDrawColor(...PDF_COLORS.SLATE_200);
    doc.setLineWidth(0.2);
    doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, "S");

    // Valor principal (menor)
    doc.setTextColor(...PDF_COLORS.SLATE_900);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const valueText = String(kpi.value);
    doc.text(valueText, x + cardWidth / 2, y + 10, { align: "center" });

    // Label (pequeno)
    doc.setTextColor(...PDF_COLORS.SLATE_500);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.label, x + cardWidth / 2, y + 16, { align: "center" });

    // Sublabel ou trend (opcional)
    if (kpi.sublabel || kpi.trend) {
      const trendText = kpi.trend || kpi.sublabel;
      const trendColor = kpi.trend?.startsWith('+') || kpi.trend?.startsWith('▲')
        ? PDF_COLORS.EMERALD_500
        : kpi.trend?.startsWith('-') || kpi.trend?.startsWith('▼')
          ? PDF_COLORS.RED_500
          : PDF_COLORS.SLATE_400;

      doc.setTextColor(...trendColor);
      doc.setFontSize(6);
      doc.text(trendText, x + cardWidth / 2, y + 21, { align: "center" });
    }
  });

  return startY + cardHeight + 8;
};

// ==========================================
// SECTION TITLE - Título de Seção Elegante
// ==========================================

export const addSectionTitle = (doc, title, startY) => {
  const margins = { left: 15 };

  doc.setTextColor(...PDF_COLORS.SLATE_700);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(title.toUpperCase(), margins.left, startY);

  // Linha decorativa
  doc.setDrawColor(...PDF_COLORS.SLATE_300);
  doc.setLineWidth(0.3);
  doc.line(margins.left, startY + 2, margins.left + 40, startY + 2);

  return startY + 8;
};

// ==========================================
// ESTILOS MODERNOS PARA AUTOTABLE
// ==========================================

export const getModernTableStyles = () => ({
  headStyles: {
    fillColor: PDF_COLORS.SLATE_100,
    textColor: PDF_COLORS.BLACK,
    fontStyle: 'bold',
    fontSize: 7,
    cellPadding: 2,
  },
  styles: {
    fontSize: 7,
    cellPadding: 2,
    textColor: PDF_COLORS.BLACK,
    lineColor: PDF_COLORS.SLATE_300,
    lineWidth: 0.2,
    overflow: 'linebreak', // Quebra de linha automática
    cellWidth: 'wrap',
  },
  bodyStyles: {
    textColor: PDF_COLORS.BLACK,
  },
  alternateRowStyles: {
    fillColor: PDF_COLORS.SLATE_50,
  },
  margin: { left: 15, right: 15 },
});
