
import jsPDF from "jspdf";
import { getLogoBase64, addHeader, addFooter } from "./pdfHelpers";

export const gerarGuiaPDF = async () => {
  const doc = new jsPDF();
  const logoBase64 = await getLogoBase64();
  
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margins = { left: 20, right: 20, top: 20, bottom: 30 };
  const maxWidth = pageWidth - margins.left - margins.right;
  
  let yPosition = 70;
  let pageNum = 1;

  // Função auxiliar para verificar nova página
  const checkNewPage = (currentY, minSpace = 40) => {
    if (currentY + minSpace > pageHeight - margins.bottom) {
      addFooter(doc, pageNum, { nome: "Sistema SICEFSUS" });
      doc.addPage();
      pageNum++;
      addHeader(doc, "Guia do Iniciante - SICEFSUS (continuação)", logoBase64);
      return 70;
    }
    return currentY;
  };

  // Adicionar cabeçalho inicial
  addHeader(doc, "Guia do Iniciante - SICEFSUS", logoBase64);

  // Título principal
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(21, 67, 96);
  doc.text("GUIA DO INICIANTE", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Controle de Execuções Financeiras do SUS", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 20;

  // Conteúdo do guia
  const conteudo = [
    {
      titulo: "BEM-VINDO AO SICEFSUS!",
      subtitulo: "O que você vai aprender",
      texto: [
        "✅ Entender o que é uma emenda parlamentar",
        "✅ Criar sua primeira emenda no sistema",
        "✅ Planejar despesas de forma organizada",
        "✅ Executar (cadastrar) uma despesa real",
        "✅ Acompanhar o saldo disponível",
        "✅ Entender os status de pagamento (EMPENHADO, LIQUIDADO, PAGO)",
        "✅ Interpretar os painéis financeiros",
        "✅ Usar o cadastro automático de fornecedor via CNPJ"
      ]
    },
    {
      titulo: "O QUE É UMA EMENDA PARLAMENTAR?",
      texto: [
        "É um recurso financeiro destinado por um deputado ou senador para investir em:",
        "• Saúde (hospitais, medicamentos, equipamentos)",
        "• Educação (escolas, materiais)",
        "• Infraestrutura (estradas, pontes)",
        "",
        "Exemplo prático:",
        "Deputado João destinou R$ 500.000 para comprar medicamentos para o Hospital Municipal de São Paulo.",
        "",
        "Neste caso:",
        "• Valor da Emenda: R$ 500.000",
        "• Destino: Saúde",
        "• Beneficiário: Hospital Municipal"
      ]
    },
    {
      titulo: "STATUS DE PAGAMENTO",
      subtitulo: "Entendendo o Ciclo Financeiro",
      texto: [
        "Cada despesa passa por 3 etapas obrigatórias:",
        "",
        "1️⃣ EMPENHADO → 2️⃣ LIQUIDADO → 3️⃣ PAGO",
        "",
        "📋 EMPENHADO:",
        "• Primeiro estágio do processo",
        "• Momento em que você reserva o dinheiro",
        "• Valor comprometido, mas ainda não gasto",
        "",
        "📝 LIQUIDADO:",
        "• Segundo estágio do processo",
        "• Confirma que recebeu o produto/serviço",
        "• Verifica se está tudo correto antes de pagar",
        "",
        "💵 PAGO:",
        "• Estágio final do processo",
        "• Dinheiro efetivamente transferido",
        "• Despesa totalmente concluída"
      ]
    },
    {
      titulo: "PAINEL FINANCEIRO",
      texto: [
        "Quando você abre uma emenda, verá 3 mini-cards coloridos:",
        "",
        "💵 Card PAGO (Verde):",
        "• Mostra quanto já foi pago completamente",
        "• Processo 100% finalizado",
        "",
        "📝 Card LIQUIDADO (Amarelo):",
        "• Produto/serviço recebido e conferido",
        "• Aguardando o setor financeiro fazer o pagamento",
        "",
        "📋 Card EMPENHADO (Azul):",
        "• Compra feita e reservada",
        "• Aguardando receber o produto/serviço"
      ]
    },
    {
      titulo: "CADASTRO AUTOMÁTICO DE FORNECEDOR",
      texto: [
        "O sistema busca automaticamente os dados do fornecedor quando você digita o CNPJ!",
        "",
        "Como funciona:",
        "1. Digite o CNPJ (apenas números ou com máscara)",
        "2. Aguarde a validação automática",
        "3. Clique no botão 🔍 ao lado do campo CNPJ",
        "4. Sistema preenche automaticamente:",
        "   ✅ Razão Social",
        "   ✅ Nome Fantasia",
        "   ✅ Endereço completo",
        "   ✅ Cidade/UF",
        "   ✅ CEP",
        "   ✅ Telefone",
        "   ✅ Situação Cadastral",
        "",
        "Vantagens:",
        "⚡ Economiza tempo",
        "📋 Evita erros de digitação",
        "🔍 Garante dados oficiais e atualizados"
      ]
    }
  ];

  // Renderizar conteúdo
  conteudo.forEach((secao) => {
    yPosition = checkNewPage(yPosition, 50);

    // Título da seção
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(21, 67, 96);
    doc.text(secao.titulo, margins.left, yPosition);
    yPosition += 10;

    // Subtítulo (se existir)
    if (secao.subtitulo) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(secao.subtitulo, margins.left, yPosition);
      yPosition += 8;
    }

    // Texto da seção
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    secao.texto.forEach((linha) => {
      yPosition = checkNewPage(yPosition, 10);
      
      if (linha === "") {
        yPosition += 5;
      } else {
        const linhas = doc.splitTextToSize(linha, maxWidth);
        linhas.forEach((l) => {
          yPosition = checkNewPage(yPosition, 10);
          doc.text(l, margins.left, yPosition);
          yPosition += 6;
        });
      }
    });

    yPosition += 10;
  });

  // Adicionar rodapé na última página
  addFooter(doc, pageNum, { nome: "Sistema SICEFSUS" });

  // Salvar PDF
  const nomeArquivo = `SICEFSUS_Guia_Iniciante_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(nomeArquivo);
  
  return nomeArquivo;
};
