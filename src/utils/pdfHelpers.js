// src/utils/pdfHelpers.js
import logoSicefsus from "../images/logo-sicefsus-ver-modoclaro.png";

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

// Adicionar cabeçalho padrão aos PDFs
export const addHeader = (doc, titulo, logoBase64) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = { left: 20, right: 20 };

  // Fundo do cabeçalho
  doc.setFillColor(21, 67, 96);
  doc.rect(0, 0, pageWidth, 40, "F");

  // Adicionar logo se disponível
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, "PNG", margins.left, 8, 30, 24);
    } catch (e) {
      console.warn("Erro ao adicionar logo:", e);
    }
  }

  // Texto do cabeçalho
  const textX = logoBase64 ? 55 : margins.left;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("SICEFSUS", textX, 20);

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Controle de Execuções Financeiras do SUS", textX, 30);

  // Título do relatório
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(titulo, pageWidth / 2, 55, { align: "center" });
};

// Adicionar rodapé padrão aos PDFs
export const addFooter = (doc, pageNum, usuario) => {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margins = { left: 20, right: 20 };

  // Linha separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(
    margins.left,
    pageHeight - 20,
    pageWidth - margins.right,
    pageHeight - 20,
  );

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  // Data de geração
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    margins.left,
    pageHeight - 10,
  );

  // Número da página
  doc.text(`Página ${pageNum}`, pageWidth - margins.right, pageHeight - 10, {
    align: "right",
  });

  // Usuário que gerou
  if (usuario?.nome || usuario?.email) {
    doc.setFontSize(9);
    doc.text(
      `Por: ${usuario.nome || usuario.email}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
  }
};

// Gerar nome do arquivo
export const gerarNomeArquivo = (tipoRelatorio) => {
  const data = new Date().toISOString().split("T")[0];
  return `SICEFSUS_${tipoRelatorio}_${data}.pdf`;
};

// Função auxiliar para criar tabelas manualmente (caso autoTable não funcione)
export const createManualTable = (doc, headers, data, startY, options = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  const margins = options.margins || { left: 20, right: 20 };
  const cellPadding = options.cellPadding || 5;
  const rowHeight = options.rowHeight || 10;
  const fontSize = options.fontSize || 10;

  let y = startY;
  const tableWidth = pageWidth - margins.left - margins.right;
  const columnWidth = tableWidth / headers.length;

  // Desenhar cabeçalho
  doc.setFillColor(21, 67, 96);
  doc.rect(margins.left, y, tableWidth, rowHeight, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(fontSize);
  doc.setFont("helvetica", "bold");

  headers.forEach((header, i) => {
    const x = margins.left + i * columnWidth + cellPadding;
    doc.text(header, x, y + rowHeight - 3);
  });

  y += rowHeight;

  // Desenhar dados
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  data.forEach((row, rowIndex) => {
    // Alternar cor de fundo
    if (rowIndex % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margins.left, y, tableWidth, rowHeight, "F");
    }

    // Desenhar células
    row.forEach((cell, i) => {
      const x = margins.left + i * columnWidth + cellPadding;
      doc.text(String(cell), x, y + rowHeight - 3);
    });

    // Desenhar linha
    doc.setDrawColor(200, 200, 200);
    doc.line(
      margins.left,
      y + rowHeight,
      margins.left + tableWidth,
      y + rowHeight,
    );

    y += rowHeight;
  });

  return y;
};
