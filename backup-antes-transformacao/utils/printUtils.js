// src/utils/printUtils.js

export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
};

export const formatDate = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toLocaleDateString("pt-BR");
  } catch {
    return date;
  }
};

export const printReport = async (reportId, title) => {
  // Encontra o container do relatório
  const reportElement = document.getElementById(reportId);

  if (!reportElement) {
    alert("Relatório não encontrado");
    return;
  }

  // Cria janela de impressão
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    alert("Pop-up bloqueado. Permita pop-ups para imprimir.");
    return;
  }

  // Clone o conteúdo para não afetar a página original
  const contentClone = reportElement.cloneNode(true);

  // Remove elementos que não devem ser impressos
  const elementsToRemove = contentClone.querySelectorAll(
    ".no-print, button, input, select",
  );
  elementsToRemove.forEach((el) => el.remove());

  // HTML estruturado para impressão
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - SICEFSUS</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background: white;
          padding: 20px;
        }

        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }

        .print-header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          color: #154360;
        }

        .print-header h2 {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }

        .print-info {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #666;
          margin-top: 10px;
        }

        .print-content {
          width: 100%;
        }

        .print-content h2 {
          color: #154360;
          font-size: 16px;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ccc;
        }

        .print-content h3 {
          color: #154360;
          font-size: 14px;
          margin: 15px 0 10px 0;
        }

        /* Tabelas */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 10px;
        }

        th, td {
          border: 1px solid #000;
          padding: 6px 4px;
          text-align: left;
        }

        th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
          color: #154360;
        }

        .number, .currency {
          text-align: right;
        }

        .center {
          text-align: center;
        }

        /* Cards KPI */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin: 20px 0;
        }

        .kpi-card {
          border: 1px solid #ccc;
          padding: 15px;
          text-align: center;
          border-radius: 5px;
          background: #f9f9f9;
        }

        .kpi-value {
          font-size: 16px;
          font-weight: bold;
          color: #154360;
          margin-bottom: 5px;
        }

        .kpi-label {
          font-size: 10px;
          color: #666;
        }

        /* Alertas de vencimento */
        .alert-container {
          margin: 20px 0;
        }

        .alert-card {
          border: 1px solid #ccc;
          padding: 15px;
          margin-bottom: 10px;
          border-radius: 5px;
          border-left: 4px solid #F39C12;
        }

        .alert-urgent {
          border-left-color: #E74C3C;
        }

        .alert-title {
          font-weight: bold;
          color: #154360;
          margin-bottom: 5px;
        }

        .alert-details {
          font-size: 10px;
          color: #666;
        }

        /* Gráficos - substituir por texto */
        .recharts-wrapper {
          display: none;
        }

        .chart-replacement {
          border: 1px solid #ccc;
          padding: 20px;
          text-align: center;
          background: #f9f9f9;
          margin: 20px 0;
        }

        .print-footer {
          position: fixed;
          bottom: 10px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 8px;
          color: #666;
          border-top: 1px solid #ccc;
          padding: 5px;
          background: white;
        }

        /* Quebras de página */
        .page-break {
          page-break-before: always;
        }

        @media print {
          body { 
            margin: 0;
            padding: 15px;
          }
          .no-print { 
            display: none !important; 
          }
          .page-break { 
            page-break-before: always; 
          }
        }

        @page {
          size: A4;
          margin: 1.5cm;
        }
      </style>
    </head>
    <body>
      <div class="print-header">
        <h1>SICEFSUS -Sistema de Controle de Execuções Financeiras do SUS</h1>
        <h2>${title}</h2>
        <div class="print-info">
          <span>Data: ${formatDate(new Date())}</span>
          <span>Usuário: ${window.usuarioLogado || "Sistema"}</span>
          <span>Horário: ${new Date().toLocaleTimeString("pt-BR")}</span>
        </div>
      </div>

      <div class="print-content">
        ${contentClone.innerHTML}
      </div>

      <div class="print-footer">
        <p>SICEFSUS -Sistema de Controle de Execuções Financeiras do SUS | Relatório gerado em ${formatDate(new Date())} às ${new Date().toLocaleTimeString("pt-BR")}</p>
      </div>
    </body>
    </html>
  `;

  // Escreve o conteúdo na nova janela
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Aguarda carregar e imprime
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Não fecha automaticamente para permitir visualização
      // printWindow.close();
    }, 1000);
  };

  return true;
};
