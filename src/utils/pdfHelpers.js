// src/utils/pdfHelpers.js
// Design System Moderno para PDFs - Clean, Compacto, Elegante
import logoSicefsus from "../images/logo-sicefsus-ver-modoclaro.png";
import { PDF_COLORS } from "./relatoriosConstants";

export const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);

// Formatar valor compacto (K, M)
export const formatCurrencyCompact = (value) => {
  const num = parseFloat(value) || 0;
  if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `R$ ${(num / 1000).toFixed(0)}K`;
  return formatCurrency(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  } catch {
    return dateStr;
  }
};

// Converter logo para base64
export const getLogoBase64 = async () => {
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
        resolve(canvas.toDataURL("image/png"));
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
// MINI TABLE - Tabela compacta para rankings
// ==========================================

export const addMiniTable = (doc, data, startY, options = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = { left: 15, right: 15 };
  const rowHeight = 7;
  let y = startY;

  data.forEach((row, index) => {
    // Linha alternada sutil
    if (index % 2 === 0) {
      doc.setFillColor(...PDF_COLORS.SLATE_50);
      doc.rect(margins.left, y - 4, pageWidth - margins.left - margins.right, rowHeight, "F");
    }

    // Número/Rank
    doc.setTextColor(...PDF_COLORS.SLATE_400);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`${index + 1}.`, margins.left, y);

    // Nome/Label
    doc.setTextColor(...PDF_COLORS.SLATE_700);
    doc.setFontSize(9);
    const label = row.label.length > 35 ? row.label.substring(0, 32) + "..." : row.label;
    doc.text(label, margins.left + 8, y);

    // Valor (direita)
    doc.setTextColor(...PDF_COLORS.SLATE_900);
    doc.setFont("helvetica", "bold");
    doc.text(row.value, pageWidth - margins.right, y, { align: "right" });

    y += rowHeight;
  });

  return y + 5;
};

// Função auxiliar para truncar texto com ellipsis
const truncateText = (text, maxLength) => {
  const str = String(text || "");
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + "...";
};

// Função auxiliar para criar tabelas manualmente - Design Moderno
export const createManualTable = (doc, headers, data, startY, options = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = options.margins || { left: 15, right: 15 };
  const cellPadding = 2;
  const fontSize = 7; // Fonte pequena e profissional
  const lineHeight = 3.5; // Altura de cada linha de texto

  let y = startY;
  const tableWidth = pageWidth - margins.left - margins.right;

  // Larguras de coluna otimizadas
  let columnWidths = options.columnWidths;
  if (!columnWidths) {
    columnWidths = headers.map((header) => {
      const h = header.toLowerCase();
      if (h === '%' || h.includes('%')) return 12;
      if (h.includes('data')) return 20;
      if (h.includes('valor') || h.includes('saldo') || h.includes('exec') || h.includes('total')) return 28;
      if (h.includes('emenda') || h.includes('número')) return 22;
      return 40; // Parlamentar, descrições
    });
    
    const totalWidth = columnWidths.reduce((a, b) => a + b, 0);
    const scale = tableWidth / totalWidth;
    columnWidths = columnWidths.map(w => w * scale);
  }

  const getColumnX = (colIndex) => {
    let x = margins.left;
    for (let i = 0; i < colIndex; i++) x += columnWidths[i];
    return x;
  };

  // Função para quebrar texto em múltiplas linhas
  const wrapText = (text, maxWidth) => {
    const str = String(text || "-");
    doc.setFontSize(fontSize);
    const words = str.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Calcular altura de cada linha de dados
  const calculateRowHeight = (row) => {
    let maxLines = 1;
    row.forEach((cell, i) => {
      const maxWidth = columnWidths[i] - (cellPadding * 2);
      const lines = wrapText(cell, maxWidth);
      if (lines.length > maxLines) maxLines = lines.length;
    });
    return Math.max(8, maxLines * lineHeight + 4);
  };

  // HEADER
  const headerHeight = 8;
  doc.setFillColor(...PDF_COLORS.SLATE_100);
  doc.rect(margins.left, y, tableWidth, headerHeight, "F");
  
  doc.setTextColor(...PDF_COLORS.SLATE_700);
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");

  headers.forEach((header, i) => {
    const x = getColumnX(i) + cellPadding;
    doc.text(header, x, y + 5.5);
  });

  doc.setDrawColor(...PDF_COLORS.SLATE_300);
  doc.setLineWidth(0.3);
  doc.line(margins.left, y + headerHeight, margins.left + tableWidth, y + headerHeight);
  y += headerHeight;

  // DADOS
  doc.setFont("helvetica", "normal");

  data.forEach((row, rowIndex) => {
    const rowHeight = calculateRowHeight(row);
    
    // Fundo alternado
    if (rowIndex % 2 === 0) {
      doc.setFillColor(...PDF_COLORS.SLATE_50);
      doc.rect(margins.left, y, tableWidth, rowHeight, "F");
    }

    // Células
    row.forEach((cell, i) => {
      const x = getColumnX(i) + cellPadding;
      const maxWidth = columnWidths[i] - (cellPadding * 2);
      const lines = wrapText(cell, maxWidth);
      
      const isNumber = /^R?\$?\s*-?[\d.,]+%?$/.test(String(cell).trim());
      doc.setTextColor(...PDF_COLORS.SLATE_700);
      doc.setFontSize(fontSize);

      // Alinhar valores monetários à direita
      if (isNumber) {
        doc.setFont("helvetica", "bold");
        const textX = getColumnX(i) + columnWidths[i] - cellPadding;
        lines.forEach((line, lineIndex) => {
          doc.text(line, textX, y + 4 + (lineIndex * lineHeight), { align: "right" });
        });
      } else {
        doc.setFont("helvetica", "normal");
        lines.forEach((line, lineIndex) => {
          doc.text(line, x, y + 4 + (lineIndex * lineHeight));
        });
      }
    });

    // Linha separadora
    doc.setDrawColor(...PDF_COLORS.SLATE_200);
    doc.setLineWidth(0.15);
    doc.line(margins.left, y + rowHeight, margins.left + tableWidth, y + rowHeight);

    y += rowHeight;
  });

  return y;
};

// ==========================================
// ESTILOS MODERNOS PARA AUTOTABLE
// ==========================================

export const getModernTableStyles = () => ({
  headStyles: {
    fillColor: PDF_COLORS.SLATE_100,
    textColor: PDF_COLORS.SLATE_700,
    fontStyle: 'bold',
    fontSize: 7,
    cellPadding: 2,
  },
  styles: {
    fontSize: 7,
    cellPadding: 2,
    textColor: PDF_COLORS.SLATE_700,
    lineColor: PDF_COLORS.SLATE_200,
    lineWidth: 0.15,
    overflow: 'linebreak', // Quebra de linha automática
    cellWidth: 'wrap',
  },
  alternateRowStyles: {
    fillColor: PDF_COLORS.SLATE_50,
  },
  margin: { left: 15, right: 15 },
});
