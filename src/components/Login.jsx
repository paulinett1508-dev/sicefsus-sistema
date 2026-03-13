import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import EnvironmentIndicator from "./EnvironmentIndicator";
import logoSicefsusLight from "../images/logo-sicefsus-ver-modoclaro.png";
import logoSicefsusDark from "../images/logo-sicefsus-ver-mododark.png";
import { useTheme } from "../context/ThemeContext";
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
  const { isDark } = useTheme();
  const logoSicefsus = isDark ? logoSicefsusDark : logoSicefsusLight;
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [lembrarEmail, setLembrarEmail] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [sucessoReset, setSucessoReset] = useState(false);

  useEffect(() => {
    const emailSalvo = localStorage.getItem("sicefsus_email");
    if (emailSalvo) {
      setEmail(emailSalvo);
      setLembrarEmail(true);
    }
  }, []);

  const buscarDadosUsuario = async (uid, email) => {
    try {
      const userDocRef = doc(db, "usuarios", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        await updateDoc(userDocRef, {
          ultimoAcesso: Timestamp.now(),
          primeiroAcesso: false,
        });
        return { id: userDoc.id, ...userData };
      }

      const q = query(
        collection(db, "usuarios"),
        where("email", "==", email.toLowerCase().trim()),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const updateData = {
          ultimoAcesso: Timestamp.now(),
          primeiroAcesso: false,
        };
        if (userData.uid !== uid) {
          updateData.uid = uid;
        }
        await updateDoc(doc(db, "usuarios", userDoc.id), updateData);
        return { id: userDoc.id, ...userData, uid };
      }

      throw new Error("Dados do usuário não encontrados no sistema");
    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw error;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const dadosUsuario = await buscarDadosUsuario(cred.user.uid, email);

      if (dadosUsuario.status !== "ativo") {
        throw new Error("Usuário inativo. Contate o administrador.");
      }

      if (dadosUsuario.tipo === "operador") {
        if (!dadosUsuario.municipio || !dadosUsuario.uf) {
          throw new Error(
            "Operador sem localização definida. Contate o administrador.",
          );
        }
      }

      onLoginSuccess(dadosUsuario);

      if (lembrarEmail) {
        localStorage.setItem("sicefsus_email", email);
      } else {
        localStorage.removeItem("sicefsus_email");
      }
    } catch (err) {
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
          case "auth/invalid-credential":
            mensagemErro = "Credenciais inválidas. Verifique e-mail e senha.";
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

  const handleEsqueciSenha = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await sendPasswordResetEmail(auth, emailReset);
      setSucessoReset(true);
      setErro("");
    } catch (err) {
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
    <div className="login-container">
      <div className="login-card">
        {/* Header com gradiente */}
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src={logoSicefsus} alt="SICEFSUS" className="login-logo" />
          </div>
          <h1 className="login-title">
            {modoEsqueciSenha ? "Recuperar Senha" : "SICEFSUS"}
          </h1>
          <p className="login-subtitle">
            {modoEsqueciSenha
              ? "Digite seu e-mail para receber o link de recuperação"
              : "Sistema de Gestão de Emendas Parlamentares"
            }
          </p>
        </div>

        {/* Conteúdo do formulário */}
        <div className="login-content">
          {/* MODO NORMAL DE LOGIN */}
          {!modoEsqueciSenha && (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  E-mail
                </label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                    autoFocus
                    disabled={carregando}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="senha" className="form-label">
                  Senha
                </label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    id="senha"
                    type="password"
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    className="form-input"
                    disabled={carregando}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="login-options">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={lembrarEmail}
                    onChange={(e) => setLembrarEmail(e.target.checked)}
                    disabled={carregando}
                    className="checkbox-input"
                  />
                  <span className="checkbox-label">Lembrar e-mail</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setModoEsqueciSenha(true);
                    setEmailReset(email);
                    setErro("");
                  }}
                  className="link-button"
                  disabled={carregando}
                >
                  Esqueci minha senha
                </button>
              </div>

              <button
                type="submit"
                className="btn-login"
                disabled={carregando}
              >
                {carregando ? (
                  <>
                    <span className="spinner"></span>
                    Entrando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">login</span>
                    Entrar
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODO ESQUECI SENHA */}
          {modoEsqueciSenha && !sucessoReset && (
            <form onSubmit={handleEsqueciSenha} className="login-form">
              <div className="form-group">
                <label htmlFor="emailReset" className="form-label">
                  E-mail cadastrado
                </label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    id="emailReset"
                    type="email"
                    placeholder="Digite seu e-mail cadastrado"
                    value={emailReset}
                    onChange={(e) => setEmailReset(e.target.value)}
                    required
                    className="form-input"
                    autoFocus
                    disabled={carregando}
                  />
                </div>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  onClick={() => {
                    setModoEsqueciSenha(false);
                    setErro("");
                    setSucessoReset(false);
                  }}
                  className="btn-secondary"
                  disabled={carregando}
                >
                  <span className="material-symbols-outlined">arrow_back</span>
                  Voltar
                </button>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={carregando}
                >
                  {carregando ? (
                    <>
                      <span className="spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Enviar Link
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* SUCESSO NO RESET */}
          {sucessoReset && (
            <div className="success-container">
              <div className="success-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2 className="success-title">E-mail Enviado!</h2>
              <p className="success-text">
                Enviamos um link de recuperação para <strong>{emailReset}</strong>
              </p>
              <p className="success-hint">
                Verifique sua caixa de entrada e spam.
              </p>
              <button
                onClick={() => {
                  setModoEsqueciSenha(false);
                  setSucessoReset(false);
                  setErro("");
                  setEmailReset("");
                }}
                className="btn-login"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Voltar ao Login
              </button>
            </div>
          )}

          {/* MENSAGEM DE ERRO */}
          {erro && (
            <div className="error-message" role="alert">
              <span className="material-symbols-outlined">error</span>
              <span>{erro}</span>
            </div>
          )}
        </div>

        {/* Footer com dica */}
        <div className="login-footer">
          <div className="login-tip">
            <span className="material-symbols-outlined">lightbulb</span>
            <span>
              <strong>Dica:</strong> Se você é operador e não consegue fazer login,
              verifique se o administrador já configurou seu município/UF.
            </span>
          </div>
        </div>
      </div>

      <EnvironmentIndicator />

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: ${isDark
            ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)'
            : 'linear-gradient(135deg, #1A3A4A 0%, #2A5A6A 50%, #1A3A4A 100%)'
          };
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 80%, rgba(255,255,255,0.05) 0%, transparent 40%);
          pointer-events: none;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--theme-surface);
          border-radius: var(--border-radius-xl);
          box-shadow: var(--shadow-xl);
          overflow: hidden;
          position: relative;
          z-index: 1;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-header {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          padding: var(--space-8) var(--space-6);
          text-align: center;
          color: var(--white);
        }

        .login-logo-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          background: var(--white);
          border-radius: var(--border-radius-lg);
          padding: var(--space-3);
          margin-bottom: var(--space-4);
          box-shadow: var(--shadow-md);
        }

        .login-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .login-title {
          margin: 0 0 var(--space-2);
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          margin: 0;
          font-size: var(--font-size-sm);
          opacity: 0.9;
          font-weight: var(--font-weight-normal);
        }

        .login-content {
          padding: var(--space-6);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--theme-text);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: var(--space-3);
          color: var(--gray-400);
          font-size: 20px;
          pointer-events: none;
          transition: color var(--transition-fast);
        }

        .form-input {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          padding-left: calc(var(--space-3) + 28px);
          border: 2px solid var(--theme-border);
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-base);
          font-family: var(--font-family);
          background: var(--theme-input-bg);
          color: var(--theme-text);
          transition: all var(--transition-fast);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(26, 58, 74, 0.15);
        }

        .form-input:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: var(--primary);
        }

        .form-input::placeholder {
          color: var(--gray-400);
        }

        .form-input:disabled {
          background: var(--gray-100);
          cursor: not-allowed;
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: var(--space-2);
        }

        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          cursor: pointer;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
        }

        .checkbox-label {
          font-size: var(--font-size-sm);
          color: var(--theme-text-secondary);
        }

        .link-button {
          background: none;
          border: none;
          color: var(--primary);
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          cursor: pointer;
          padding: var(--space-1) 0;
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .link-button:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }

        .link-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          width: 100%;
          padding: var(--space-4);
          background: linear-gradient(135deg, var(--success) 0%, var(--success-dark) 100%);
          color: var(--white);
          border: none;
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          font-family: var(--font-family);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .btn-login:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-login:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-login .material-symbols-outlined {
          font-size: 20px;
        }

        .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          flex: 1;
          padding: var(--space-4);
          background: var(--gray-100);
          color: var(--theme-text);
          border: 2px solid var(--theme-border);
          border-radius: var(--border-radius-md);
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          font-family: var(--font-family);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--gray-200);
          border-color: var(--gray-300);
        }

        .btn-secondary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-secondary .material-symbols-outlined {
          font-size: 20px;
        }

        .button-group {
          display: flex;
          gap: var(--space-3);
        }

        .button-group .btn-login {
          flex: 1;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .success-container {
          text-align: center;
          padding: var(--space-4) 0;
        }

        .success-icon {
          margin-bottom: var(--space-4);
        }

        .success-icon .material-symbols-outlined {
          font-size: 64px;
          color: var(--success);
        }

        .success-title {
          margin: 0 0 var(--space-3);
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-semibold);
          color: var(--success);
        }

        .success-text {
          margin: 0 0 var(--space-2);
          font-size: var(--font-size-sm);
          color: var(--theme-text);
        }

        .success-hint {
          margin: 0 0 var(--space-6);
          font-size: var(--font-size-sm);
          color: var(--theme-text-secondary);
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: var(--danger-bg);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--border-radius-md);
          color: var(--error);
          font-size: var(--font-size-sm);
          margin-top: var(--space-4);
        }

        .error-message .material-symbols-outlined {
          font-size: 20px;
          flex-shrink: 0;
        }

        .login-footer {
          padding: var(--space-4) var(--space-6);
          background: var(--theme-surface-secondary);
          border-top: 1px solid var(--theme-border);
        }

        .login-tip {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--theme-text-secondary);
          line-height: var(--line-height-normal);
        }

        .login-tip .material-symbols-outlined {
          font-size: 18px;
          color: var(--warning);
          flex-shrink: 0;
          margin-top: 2px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Dark mode adjustments */
        ${isDark ? `
          .login-card {
            border: 1px solid var(--theme-border);
          }
          .form-input:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }
          .btn-login:hover:not(:disabled) {
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.2);
          }
        ` : ''}

        /* Responsividade */
        @media (max-width: 480px) {
          .login-container {
            padding: var(--space-3);
          }
          .login-card {
            border-radius: var(--border-radius-lg);
          }
          .login-header {
            padding: var(--space-6) var(--space-5);
          }
          .login-logo-wrapper {
            width: 64px;
            height: 64px;
          }
          .login-title {
            font-size: var(--font-size-xl);
          }
          .login-content {
            padding: var(--space-5);
          }
          .login-options {
            flex-direction: column;
            align-items: flex-start;
          }
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
