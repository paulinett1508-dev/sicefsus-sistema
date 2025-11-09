import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import EnvironmentIndicator from "./EnvironmentIndicator";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [lembrarEmail, setLembrarEmail] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [sucessoReset, setSucessoReset] = useState(false);

  // Ao carregar, verifica se há e-mail salvo
  useEffect(() => {
    const emailSalvo = localStorage.getItem("sicefsus_email");
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarEmail(true);
    }
  }, []);

  // ✅ FUNÇÃO PARA BUSCAR DADOS DO USUÁRIO NO FIRESTORE
  const buscarDadosUsuario = async (uid, email) => {
    console.log("🔍 Buscando dados do usuário no Firestore...");
    console.log("📋 UID:", uid);
    console.log("📧 Email:", email);

    try {
      // 1. Primeiro tentar buscar por UID (método preferido)
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("✅ Usuário encontrado por UID:", userData);

        // Atualizar último acesso
        await updateDoc(userDocRef, {
          ultimoAcesso: Timestamp.now(),
          primeiroAcesso: false,
        });

        return {
          id: userDoc.id,
          ...userData,
        };
      }

      // 2. Se não encontrou por UID, buscar por email
      console.log("🔍 Não encontrado por UID, buscando por email...");
      const q = query(
        collection(db, "usuarios"),
        where("email", "==", email.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        console.log("✅ Usuário encontrado por email:", userData);

        // Atualizar último acesso e corrigir UID se necessário
        const updateData = {
          ultimoAcesso: Timestamp.now(),
          primeiroAcesso: false,
        };

        // Se UID estava incorreto, corrigir
        if (userData.uid !== uid) {
          console.log("🔧 Corrigindo UID no Firestore...");
          updateData.uid = uid;
        }

        await updateDoc(doc(db, "usuarios", userDoc.id), updateData);

        return {
          id: userDoc.id,
          ...userData,
          uid: uid, // Usar UID correto
        };
      }

      // 3. Se não encontrou de forma alguma
      console.error("❌ Usuário não encontrado no Firestore");
      throw new Error("Dados do usuário não encontrados no sistema");
    } catch (error) {
      console.error("❌ Erro ao buscar dados do usuário:", error);
      throw error;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // ✅ APENAS MODO LOGIN (cadastro removido)
      console.log("🔐 Iniciando processo de login...");
      console.log("📧 Email:", email);

      // 1. Autenticar no Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      console.log("✅ Autenticação Firebase Auth bem-sucedida");
      console.log("👤 UID:", cred.user.uid);

      // 2. Buscar dados completos no Firestore
      const dadosUsuario = await buscarDadosUsuario(cred.user.uid, email);
      console.log("✅ Dados do usuário carregados:", {
        nome: dadosUsuario.nome,
        tipo: dadosUsuario.tipo,
        status: dadosUsuario.status,
        municipio: dadosUsuario.municipio,
        uf: dadosUsuario.uf,
      });

      // 3. Verificar se usuário está ativo
      if (dadosUsuario.status !== "ativo") {
        throw new Error("Usuário inativo. Contate o administrador.");
      }

      // 4. Verificar se operador tem localização definida
      if (dadosUsuario.tipo === "operador") {
        if (!dadosUsuario.municipio || !dadosUsuario.uf) {
          throw new Error(
            "Operador sem localização definida. Contate o administrador para configurar município/UF.",
          );
        }
      }

      console.log("✅ Todas as validações passaram");

      // 5. Passar dados completos para o callback
      onLoginSuccess(dadosUsuario);

      // Gerenciar email salvo
      if (lembrarEmail) {
        localStorage.setItem("sicefsus_email", email);
      } else {
        localStorage.removeItem("sicefsus_email");
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);

      // Tratar diferentes tipos de erro
      let mensagemErro = "Erro inesperado no login";

      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            mensagemErro = "Usuário não encontrado";
            break;
          case "auth/wrong-password":
            mensagemErro = "Senha incorreta";
            break;
          case "auth/too-many-requests":
            mensagemErro = "Muitas tentativas. Tente novamente mais tarde";
            break;
          default:
            mensagemErro = err.message || "Erro de autenticação";
        }
      } else if (err.message) {
        mensagemErro = err.message;
      }

      setErro(mensagemErro);
    } finally {
      setCarregando(false);
    }
  }

  const traduzirErroFirebase = (erro) => {
    switch (erro.code) {
      case "auth/user-not-found":
        return "Usuário não encontrado. Verifique o e-mail.";
      case "auth/wrong-password":
        return "Senha incorreta. Tente novamente.";
      case "auth/invalid-email":
        return "E-mail inválido. Verifique o formato.";
      case "auth/user-disabled":
        return "Esta conta foi desabilitada. Entre em contato com o suporte.";
      case "auth/too-many-requests":
        return "Muitas tentativas de login. Tente novamente mais tarde.";
      case "auth/network-request-failed":
        return "Erro de conexão. Verifique sua internet.";
      case "auth/invalid-credential":
        return "Credenciais inválidas. Verifique e-mail e senha.";
      case "auth/account-exists-with-different-credential":
        return "Já existe uma conta com este e-mail usando outro método de login.";
      default:
        return `Erro no login: ${erro.message}`;
    }
  };

  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await sendPasswordResetEmail(auth, emailReset);
      setSucessoReset(true);
      setErro("");
    } catch (err) {
      console.error("❌ Erro ao enviar email:", err);
      if (err.code === "auth/user-not-found") {
        setErro("Email não encontrado no sistema.");
      } else if (err.code === "auth/invalid-email") {
        setErro("Email inválido.");
      } else {
        setErro("Erro ao enviar email. Tente novamente.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {modoEsqueciSenha ? "🔑 Recuperar Senha" : "🔐 Login SICEFSUS"}
          </h2>
        </div>

        {/* MODO NORMAL DE LOGIN */}
        {!modoEsqueciSenha && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>E-mail:</label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                autoFocus
                disabled={carregando}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Senha:</label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                style={styles.input}
                disabled={carregando}
              />
            </div>

            <div style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id="lembrarEmail"
                checked={lembrarEmail}
                onChange={(e) => setLembrarEmail(e.target.checked)}
                disabled={carregando}
              />
              <label htmlFor="lembrarEmail" style={styles.checkboxLabel}>
                Lembrar e-mail
              </label>
            </div>

            {/* ADICIONAR botão esqueci senha */}
            <div style={styles.forgotPasswordContainer}>
              <button
                type="button"
                onClick={() => {
                  setModoEsqueciSenha(true);
                  setEmailReset(email);
                  setErro("");
                }}
                style={styles.forgotPasswordButton}
                disabled={carregando}
              >
                Esqueci minha senha
              </button>
            </div>

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: carregando ? 0.6 : 1,
                cursor: carregando ? "not-allowed" : "pointer",
              }}
              disabled={carregando}
            >
              {carregando ? (
                <span style={styles.loadingText}>
                  <div style={styles.spinner}></div>
                  Entrando...
                </span>
              ) : (
                "🚀 Entrar"
              )}
            </button>
          </form>
        )}

        {/* MODO ESQUECI SENHA */}
        {modoEsqueciSenha && !sucessoReset && (
          <form onSubmit={handleEsqueciSenha} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Digite seu e-mail:</label>
              <input
                type="email"
                placeholder="Digite seu e-mail cadastrado"
                value={emailReset}
                onChange={(e) => setEmailReset(e.target.value)}
                required
                style={styles.input}
                autoFocus
                disabled={carregando}
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => {
                  setModoEsqueciSenha(false);
                  setErro("");
                  setSucessoReset(false);
                }}
                style={styles.cancelButton}
                disabled={carregando}
              >
                ← Voltar
              </button>

              <button
                type="submit"
                style={{
                  ...styles.button,
                  opacity: carregando ? 0.6 : 1,
                  cursor: carregando ? "not-allowed" : "pointer",
                }}
                disabled={carregando}
              >
                {carregando ? (
                  <span style={styles.loadingText}>
                    <div style={styles.spinner}></div>
                    Enviando...
                  </span>
                ) : (
                  "📧 Enviar Link"
                )}
              </button>
            </div>
          </form>
        )}

        {/* SUCESSO NO RESET */}
        {sucessoReset && (
          <div style={styles.form}>
            <div style={styles.successContainer}>
              <div style={styles.successIcon}>✅</div>
              <h3 style={styles.successTitle}>Email Enviado!</h3>
              <p style={styles.successText}>
                Enviamos um link de recuperação para{" "}
                <strong>{emailReset}</strong>
              </p>
              <p style={styles.successText}>
                Verifique sua caixa de entrada e spam.
              </p>
            </div>

            <button
              onClick={() => {
                setModoEsqueciSenha(false);
                setSucessoReset(false);
                setErro("");
                setEmailReset("");
              }}
              style={styles.button}
            >
              ← Voltar ao Login
            </button>
          </div>
        )}

        {erro && (
          <div style={styles.errorContainer}>
            <p style={styles.erro}>❌ {erro}</p>
          </div>
        )}

        <div style={styles.infoContainer}>
          <small style={styles.infoText}>
            💡 <strong>Dica:</strong> Se você é operador e não consegue fazer
            login, verifique se o administrador já configurou seu município/UF.
          </small>
        </div>
      </div>

      <EnvironmentIndicator />
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(135deg, rgba(52, 73, 94, 0.8), rgba(44, 62, 80, 0.9))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: 0,
    minWidth: 400,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    border: "2px solid #3498db",
    overflow: "hidden",
  },
  header: {
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "white",
    padding: 24,
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: "1.4em",
    fontWeight: "600",
  },
  form: {
    padding: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    display: "block",
    marginBottom: 8,
    fontWeight: "500",
    color: "#2c3e50",
    fontSize: "0.9em",
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "2px solid #e1e8ed",
    fontSize: 13,
    transition: "border-color 0.3s ease",
    boxSizing: "border-box",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#666",
    cursor: "pointer",
  },
  button: {
    width: "100%",
    padding: 14,
    background: "linear-gradient(135deg, #27ae60, #2ecc71)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  spinner: {
    width: 18,
    height: 18,
    border: "2px solid transparent",
    borderTop: "2px solid currentColor",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  link: {
    background: "none",
    border: "none",
    color: "#3498db",
    padding: "12px 32px",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 14,
    width: "100%",
  },
  errorContainer: {
    padding: "0 32px 16px",
  },
  erro: {
    color: "#e74c3c",
    margin: 0,
    padding: 12,
    backgroundColor: "#fdf2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    fontSize: 14,
  },
  infoContainer: {
    padding: "0 32px 32px",
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    lineHeight: "1.4",
  },

  forgotPasswordContainer: {
    textAlign: "center",
    marginBottom: 16,
  },

  forgotPasswordButton: {
    background: "none",
    border: "none",
    color: "#3498db",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: 14,
    padding: "4px 0",
  },

  buttonGroup: {
    display: "flex",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    padding: 14,
    background: "#95a5a6",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  successContainer: {
    textAlign: "center",
    padding: "20px 0",
  },

  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  successTitle: {
    color: "#27ae60",
    marginBottom: 16,
    fontSize: "1.2em",
  },

  successText: {
    color: "#666",
    marginBottom: 12,
    lineHeight: 1.4,
  },
};

// ✅ CSS ANIMATIONS
if (!document.getElementById("login-animations")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "login-animations";
  styleSheet.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}
