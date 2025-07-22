import React, { useState } from "react";

const styles = {
  container: {
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "20px",
    padding: "40px",
    marginBottom: "40px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    border: "1px solid #e9ecef",
    position: "relative",
    overflow: "hidden",
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    zIndex: 1,
  },
  headerContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: "30px",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    padding: "5px",
  },
  logo: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  logoFallback: {
    fontSize: "3rem",
    color: "#667eea",
    fontWeight: "bold",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: "2.2rem",
    fontWeight: "700",
    color: "#2c3e50",
    margin: "0 0 8px 0",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#6c757d",
    margin: 0,
    fontWeight: "400",
  },
  version: {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    display: "inline-block",
    marginTop: "10px",
  },
  content: {
    display: "grid",
    gap: "25px",
    gridTemplateColumns: "1fr",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  cardTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  text: {
    color: "#555",
    lineHeight: "1.7",
    fontSize: "1rem",
    marginBottom: "20px",
  },
  highlight: {
    background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
    border: "1px solid #bbdefb",
    borderRadius: "12px",
    padding: "20px",
    margin: "20px 0",
    fontSize: "1.05rem",
    fontWeight: "500",
    color: "#1565c0",
    textAlign: "center",
  },
  moduleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  moduleCard: {
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "25px",
    borderRadius: "12px",
    border: "1px solid #dee2e6",
    transition: "transform 0.2s ease",
  },
  moduleTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  moduleDesc: {
    fontSize: "0.95rem",
    color: "#666",
    lineHeight: "1.6",
  },
  stepsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  stepItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    padding: "15px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  stepNumber: {
    background: "linear-gradient(45deg, #667eea, #764ba2)",
    color: "white",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "600",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "0.98rem",
    color: "#555",
    lineHeight: "1.6",
  },
  tipBox: {
    background: "linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)",
    border: "1px solid #81c784",
    borderRadius: "12px",
    padding: "20px",
    margin: "20px 0",
  },
  tipTitle: {
    color: "#2e7d32",
    fontWeight: "600",
    fontSize: "0.95rem",
    marginBottom: "10px",
  },
  tipText: {
    color: "#2e7d32",
    fontSize: "0.9rem",
    lineHeight: "1.6",
  },
  developmentInfo: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    border: "2px solid #e9ecef",
    borderRadius: "16px",
    padding: "30px",
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    marginTop: "40px",
  },
  developmentTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: "20px",
  },
  companyInfo: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "25px",
    marginTop: "25px",
  },
  companyCard: {
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #dee2e6",
  },
  companyName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#495057",
    marginBottom: "8px",
  },
  companyRole: {
    fontSize: "0.9rem",
    color: "#6c757d",
    marginBottom: "15px",
  },
  contactInfo: {
    fontSize: "0.9rem",
    color: "#495057",
    lineHeight: "1.5",
  },
  contactLink: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
  },
  copyright: {
    fontSize: "0.85rem",
    color: "#6c757d",
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #dee2e6",
    textAlign: "center",
  },
};

// ✅ COMPONENTE INTELIGENTE PARA LOGO
function LogoInteligente() {
  const [logoEncontrada, setLogoEncontrada] = useState(false);
  const [caminhoAtual, setCaminhoAtual] = useState(0);

  // ✅ MÚLTIPLOS CAMINHOS PARA TENTAR
  const caminhosPossiveis = [
    "./src/images/logo-sicefsus.png",
    "/src/images/logo-sicefsus.png",
    "../images/logo-sicefsus.png",
    "../../images/logo-sicefsus.png",
    "/images/logo-sicefsus.png",
    "./images/logo-sicefsus.png",
    "/public/images/logo-sicefsus.png",
    "./public/images/logo-sicefsus.png",
  ];

  const tentarProximoCaminho = () => {
    if (caminhoAtual < caminhosPossiveis.length - 1) {
      setCaminhoAtual(caminhoAtual + 1);
    } else {
      // Todos os caminhos falharam, usar fallback
      setLogoEncontrada(false);
    }
  };

  if (logoEncontrada === false && caminhoAtual >= caminhosPossiveis.length) {
    // Usar fallback emoji
    return <div style={styles.logoFallback}>🏛️</div>;
  }

  return (
    <img
      src={caminhosPossiveis[caminhoAtual]}
      alt="SICEFSUS -Sistema de Controle de Execuções Financeiras do SUS"
      style={styles.logo}
      onLoad={() => {
        console.log(
          `Logo carregada com sucesso: ${caminhosPossiveis[caminhoAtual]}`,
        );
        setLogoEncontrada(true);
      }}
      onError={(e) => {
        console.log(`Falha ao carregar: ${caminhosPossiveis[caminhoAtual]}`);
        tentarProximoCaminho();
      }}
    />
  );
}

export default function Sobre() {
  return (
    <div style={styles.container}>
      {/* Header Elegante com Logo Inteligente */}
      <div style={styles.header}>
        <div style={styles.headerBackground}></div>
        <div style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <LogoInteligente />
          </div>
          <div style={styles.headerText}>
            <h1 style={styles.title}>SICEFSUS</h1>
            <p style={styles.subtitle}>
              Sistema de Controle de Execuções Financeiras do SUS
            </p>
            <span style={styles.version}>v5.3</span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={styles.content}>
        {/* O que é o SICEFSUS */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>🤔</span>O que é o SICEFSUS?
          </h2>
          <p style={styles.text}>
            O SICEFSUS é um sistema digital que facilita o controle e
            acompanhamento das emendas parlamentares e suas despesas. Ele foi criado para
            simplificar o trabalho de gestores públicos, permitindo que você
            organize, monitore e gere relatórios sobre todas as emendas de forma
            rápida e eficiente.
          </p>
          <div style={styles.highlight}>
            💡 Imagine ter todas as informações das emendas e despesas organizadas em um só
            lugar, com relatórios automáticos e controle total dos gastos!
          </div>
        </div>

        {/* Módulos do Sistema */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>📚</span>
            Módulos do Sistema
          </h2>
          <p style={styles.text}>
            O SICEFSUS é dividido em módulos especializados, cada um focado em uma
            parte específica do processo:
          </p>

          <div style={styles.moduleGrid}>
            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>📄</span>
                Gestão de Emendas
              </div>
              <div style={styles.moduleDesc}>
                Cadastre e gerencie todas as emendas parlamentares com
                informações completas: parlamentar, município, valores, prazos e
                status de execução.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>💸</span>
                Despesas Financeiras
              </div>
              <div style={styles.moduleDesc}>
                Registre todos os gastos relacionados às emendas, incluindo
                notas fiscais, fornecedores e controle de execução orçamentária.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>📊</span>
                Dashboard Executivo
              </div>
              <div style={styles.moduleDesc}>
                Visualize indicadores importantes em tempo real: total
                executado, prazos próximos ao vencimento e resumos financeiros.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>📈</span>
                Relatórios Gerenciais
              </div>
              <div style={styles.moduleDesc}>
                Gere relatórios profissionais para prestação de contas,
                acompanhamento de execução e análises estratégicas.
              </div>
            </div>
          </div>
        </div>

        {/* Como Usar o Sistema */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>🚀</span>
            Como Usar o Sistema
          </h2>
          <p style={styles.text}>
            Seguindo estes passos simples, você conseguirá usar o SICEFSUS de forma
            eficiente:
          </p>

          <ul style={styles.stepsList}>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>1</div>
              <div style={styles.stepText}>
                <strong>Cadastre as Emendas:</strong> Comece registrando todas
                as emendas parlamentares com informações como parlamentar
                responsável, município beneficiado, valor total e prazos.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>2</div>
              <div style={styles.stepText}>
                <strong>Registre os Gastos:</strong> À medida que os recursos
                são utilizados, cadastre os lançamentos financeiros com notas
                fiscais e documentos comprobatórios.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>3</div>
              <div style={styles.stepText}>
                <strong>Monitore o Progresso:</strong> Use o Dashboard para
                acompanhar o andamento das emendas, valores executados e prazos
                próximos ao vencimento.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>4</div>
              <div style={styles.stepText}>
                <strong>Gere Relatórios:</strong> Crie relatórios personalizados
                para prestação de contas, reuniões e análises de desempenho.
              </div>
            </li>
          </ul>

          <div style={styles.tipBox}>
            <div style={styles.tipTitle}>💡 Dica Importante:</div>
            <div style={styles.tipText}>
              Mantenha os dados sempre atualizados! O sistema funciona melhor
              quando as informações são inseridas regularmente, permitindo um
              controle mais preciso.
            </div>
          </div>
        </div>

        {/* Principais Vantagens */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>⭐</span>
            Principais Vantagens
          </h2>

          <div style={styles.moduleGrid}>
            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>⚡</span>
                Agilidade
              </div>
              <div style={styles.moduleDesc}>
                Reduz drasticamente o tempo gasto com planilhas e controles
                manuais, automatizando cálculos e organizando informações.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>🔍</span>
                Transparência
              </div>
              <div style={styles.moduleDesc}>
                Todas as informações ficam centralizadas e organizadas,
                facilitando auditorias e prestação de contas.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>📱</span>
                Facilidade de Uso
              </div>
              <div style={styles.moduleDesc}>
                Interface intuitiva que não requer conhecimento técnico
                avançado, permitindo que qualquer usuário opere o sistema.
              </div>
            </div>

            <div style={styles.moduleCard}>
              <div style={styles.moduleTitle}>
                <span>🛡️</span>
                Segurança
              </div>
              <div style={styles.moduleDesc}>
                Dados protegidos na nuvem com backup automático e controle de
                acesso por usuário.
              </div>
            </div>
          </div>
        </div>

        {/* Funcionalidades Especiais */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span>🎯</span>
            Funcionalidades Especiais
          </h2>
          <p style={styles.text}>
            O SICEFSUS oferece recursos avançados que facilitam ainda mais o seu
            trabalho:
          </p>

          <ul style={styles.stepsList}>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>🔢</div>
              <div style={styles.stepText}>
                <strong>Numeração Automática:</strong> O sistema gera
                automaticamente números únicos para emendas e lançamentos,
                evitando duplicações.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>🔍</div>
              <div style={styles.stepText}>
                <strong>Filtros Inteligentes:</strong> Encontre rapidamente
                qualquer informação usando mais de 25 filtros diferentes (por
                município, parlamentar, valor, etc.).
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>📎</div>
              <div style={styles.stepText}>
                <strong>Anexação de Arquivos:</strong> Anexe documentos como
                PDFs, planilhas e imagens diretamente nos lançamentos.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>📊</div>
              <div style={styles.stepText}>
                <strong>Gráficos e Indicadores:</strong> Visualize o progresso
                através de gráficos coloridos e indicadores de performance em
                tempo real.
              </div>
            </li>
            <li style={styles.stepItem}>
              <div style={styles.stepNumber}>🖨️</div>
              <div style={styles.stepText}>
                <strong>Impressão Profissional:</strong> Todos os relatórios
                podem ser impressos com formatação profissional para
                apresentações.
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* Informações de Desenvolvimento */}
      <div style={styles.developmentInfo}>
        <h3 style={styles.developmentTitle}>Suporte</h3>

            <div style={styles.companyCard}>
            <div style={styles.companyName}>Araújo Informática</div>
            <div style={styles.companyRole}>Suporte e Manutenção</div>
            <div style={styles.contactInfo}>
              Soluções em Cloud
              <br />
              📞{" "}
              <a href="tel:+5589994445244" style={styles.contactLink}>
                +55 89 99444-5244
              </a>
              <br />
              📱{" "}
              <a
                href="https://instagram.com/araujoinformatica.flo"
                style={styles.contactLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                @araujoinformatica.flo
              </a>
            </div>
          </div>
        </div>

        <div style={styles.copyright}>
          © 2025 DEVMídias® Soluções Corporativas - Todos os direitos
          reservados
        </div>
      </div>
    </div>
  );
}
